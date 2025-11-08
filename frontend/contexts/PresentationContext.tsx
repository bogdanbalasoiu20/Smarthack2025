'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { getStoredToken } from '@/lib/authToken';

interface Frame {
  id: number;
  title: string;
  position: string;
  position_parsed: {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
  };
  background_color: string;
  background_image: string;
  order: number;
  elements: Element[];
}

interface Element {
  id: number;
  element_type: string;
  position: string;
  position_parsed: {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    z_index: number;
  };
  content: string;
  content_parsed: any;
  link_url: string;
  frame?: number;
  created_at?: string;
  updated_at?: string;
}

interface Presentation {
  id: number;
  title: string;
  description: string;
  canvas_settings: string;
  canvas_settings_parsed: {
    zoom: number;
    viewport: { x: number; y: number };
    background: string;
  };
  frames: Frame[];
  brand_kit_data: any;
  current_user_permission: string;
}

interface PresentationContextType {
  presentation: Presentation | null;
  loading: boolean;
  selectedFrame: Frame | null;
  selectedElement: Element | null;
  setSelectedFrame: (frame: Frame | null) => void;
  setSelectedElement: (element: Element | null) => void;
  updateFrame: (frameId: number, data: Partial<Frame>) => Promise<void>;
  updateElement: (
    elementId: number,
    data: Partial<Element>,
    options?: ElementUpdateOptions
  ) => Promise<void>;
  createFrame: (data: Partial<Frame>) => Promise<void>;
  createElement: (frameId: number, data: Partial<Element>) => Promise<void>;
  deleteFrame: (frameId: number) => Promise<void>;
  deleteElement: (elementId: number) => Promise<void>;
  refreshPresentation: () => Promise<void>;
  canEdit: boolean;
}

interface ElementUpdateOptions {
  optimistic?: boolean;
  emit?: boolean;
  persist?: boolean;
}

const PresentationContext = createContext<PresentationContextType | undefined>(undefined);

export function PresentationProvider({
  children,
  presentationId,
}: {
  children: React.ReactNode;
  presentationId: string;
}) {
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFrame, setSelectedFrame] = useState<Frame | null>(null);
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);

  const token = getStoredToken();
  const mergeElementData = (element: Element, changes: Partial<Element>): Element => {
    const next: Element = { ...element, ...changes };

    if (typeof changes.position === 'string') {
      try {
        next.position_parsed = JSON.parse(changes.position);
      } catch {
        // ignor�? parsing errors, p�?str�? vechiul parsed
      }
    }

    if (typeof changes.content === 'string') {
      try {
        next.content_parsed = JSON.parse(changes.content);
      } catch {
        // leave previous parsed content
      }
    }

    return next;
  };

  const applyElementChangesLocal = useCallback((elementId: number, changes: Partial<Element>) => {
    setPresentation((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        frames: prev.frames.map((frame) => {
          if (!frame.elements?.some((el) => el.id === elementId)) {
            return frame;
          }

          return {
            ...frame,
            elements: frame.elements.map((el) =>
              el.id === elementId ? mergeElementData(el, changes) : el
            ),
          };
        }),
      };
    });

    setSelectedFrame((prevFrame) => {
      if (!prevFrame) return prevFrame;
      if (!prevFrame.elements?.some((el) => el.id === elementId)) {
        return prevFrame;
      }

      return {
        ...prevFrame,
        elements: prevFrame.elements.map((el) =>
          el.id === elementId ? mergeElementData(el, changes) : el
        ),
      };
    });

    setSelectedElement((prev) =>
      prev?.id === elementId ? mergeElementData(prev, changes) : prev
    );
  }, [mergeElementData]);

  const addElementLocal = useCallback((frameId: number, element: Element) => {
    setPresentation((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        frames: prev.frames.map((frame) =>
          frame.id === frameId
            ? {
                ...frame,
                elements: [...(frame.elements || []), element],
              }
            : frame
        ),
      };
    });

    setSelectedFrame((prevFrame) => {
      if (!prevFrame || prevFrame.id !== frameId) {
        return prevFrame;
      }

      return {
        ...prevFrame,
        elements: [...(prevFrame.elements || []), element],
      };
    });

    setSelectedElement(element);
  }, []);

  const removeElementLocal = useCallback((elementId: number) => {
    setPresentation((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        frames: prev.frames.map((frame) => {
          if (!frame.elements?.some((el) => el.id === elementId)) {
            return frame;
          }

          return {
            ...frame,
            elements: frame.elements.filter((el) => el.id !== elementId),
          };
        }),
      };
    });

    setSelectedFrame((prevFrame) => {
      if (!prevFrame) return prevFrame;
      if (!prevFrame.elements?.some((el) => el.id === elementId)) {
        return prevFrame;
      }

      return {
        ...prevFrame,
        elements: prevFrame.elements.filter((el) => el.id !== elementId),
      };
    });

    setSelectedElement((prev) => (prev?.id === elementId ? null : prev));
  }, []);

  // WebSocket pentru colaborare
  const { sendMessage } = useWebSocket(
    `ws://localhost:8000/ws/presentations/${presentationId}/`,
    {
      onMessage: (data) => {
        handleWebSocketMessage(data);
      },
    }
  );

  const canEdit = presentation?.current_user_permission === 'OWNER' ||
                  presentation?.current_user_permission === 'EDITOR';

  const fetchPresentation = useCallback(async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/presentations/${presentationId}/`,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPresentation(data);
        if (data.frames && data.frames.length > 0 && !selectedFrame) {
          setSelectedFrame(data.frames[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching presentation:', error);
    } finally {
      setLoading(false);
    }
  }, [presentationId, token, selectedFrame]);

  useEffect(() => {
    fetchPresentation();
  }, [fetchPresentation]);

  const handleWebSocketMessage = (data: any) => {
    // Procesează mesaje de la alți colaboratori
    switch (data.type) {
      case 'element_update':
        if (data.element_id && data.changes) {
          applyElementChangesLocal(data.element_id, data.changes);
        }
        break;

      case 'element_create':
        if (data.element) {
          addElementLocal(data.element.frame, data.element);
        }
        break;

      case 'element_delete':
        if (data.element_id) {
          removeElementLocal(data.element_id);
        }
        break;

      case 'frame_update':
        setPresentation((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            frames: prev.frames.map((frame) =>
              frame.id === data.frame_id ? { ...frame, ...data.changes } : frame
            ),
          };
        });
        break;

      case 'user_joined':
        console.log(`${data.username} joined`);
        break;

      case 'user_left':
        console.log(`${data.username} left`);
        break;
    }
  };

  const updateFrame = async (frameId: number, data: Partial<Frame>) => {
    if (!canEdit) return;

    try {
      const response = await fetch(
        `http://localhost:8000/api/frames/${frameId}/`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );

      if (response.ok) {
        // Broadcast prin WebSocket
        sendMessage({
          type: 'frame_update',
          frame_id: frameId,
          changes: data,
        });

        // Actualizează local
        setPresentation((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            frames: prev.frames.map((frame) =>
              frame.id === frameId ? { ...frame, ...data } : frame
            ),
          };
        });
      }
    } catch (error) {
      console.error('Error updating frame:', error);
    }
  };

  const updateElement = async (
    elementId: number,
    data: Partial<Element>,
    options: ElementUpdateOptions = {}
  ) => {
    if (!canEdit) return;

    const {
      optimistic = true,
      emit = true,
      persist = true,
    } = options;

    if (optimistic) {
      applyElementChangesLocal(elementId, data);
    }

    if (emit) {
      sendMessage({
        type: 'element_update',
        element_id: elementId,
        changes: data,
      });
    }

    if (!persist) {
      return;
    }

    try {
      await fetch(`http://localhost:8000/api/elements/${elementId}/`, {
        method: 'PATCH',
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Error updating element:', error);
    }
  };

  const createFrame = async (data: Partial<Frame>) => {
    if (!canEdit) return;

    try {
      const response = await fetch('http://localhost:8000/api/frames/', {
        method: 'POST',
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          presentation: presentationId,
          ...data,
        }),
      });

      if (response.ok) {
        await fetchPresentation();
      }
    } catch (error) {
      console.error('Error creating frame:', error);
    }
  };

  const createElement = async (frameId: number, data: Partial<Element>) => {
    if (!canEdit) {
      console.warn('Cannot create element: no edit permission');
      return;
    }

    console.log('Creating element:', { frameId, data });

    try {
      const payload = {
        frame: frameId,
        ...data,
      };

      console.log('Sending payload:', payload);

      const response = await fetch('http://localhost:8000/api/elements/', {
        method: 'POST',
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      console.log('Response status:', response.status);
      console.log('Response text:', responseText);

      if (response.ok) {
        const element = JSON.parse(responseText);
        console.log('Element created successfully:', element);
        const targetFrameId = element.frame || frameId;
        addElementLocal(targetFrameId, element);
        sendMessage({
          type: 'element_create',
          element,
        });
      } else {
        console.error('Failed to create element:', response.status, responseText);
      }
    } catch (error) {
      console.error('Error creating element:', error);
    }
  };

  const deleteFrame = async (frameId: number) => {
    if (!canEdit) return;

    try {
      await fetch(`http://localhost:8000/api/frames/${frameId}/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      await fetchPresentation();
    } catch (error) {
      console.error('Error deleting frame:', error);
    }
  };

  const deleteElement = async (elementId: number) => {
    if (!canEdit) return;

    removeElementLocal(elementId);
    sendMessage({
      type: 'element_delete',
      element_id: elementId,
    });

    try {
      await fetch(`http://localhost:8000/api/elements/${elementId}/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Token ${token}`,
        },
      });
    } catch (error) {
      console.error('Error deleting element:', error);
    }
  };

  return (
    <PresentationContext.Provider
      value={{
        presentation,
        loading,
        selectedFrame,
        selectedElement,
        setSelectedFrame,
        setSelectedElement,
        updateFrame,
        updateElement,
        createFrame,
        createElement,
        deleteFrame,
        deleteElement,
        refreshPresentation: fetchPresentation,
        canEdit,
      }}
    >
      {children}
    </PresentationContext.Provider>
  );
}

export function usePresentation() {
  const context = useContext(PresentationContext);
  if (!context) {
    throw new Error('usePresentation must be used within PresentationProvider');
  }
  return context;
}
