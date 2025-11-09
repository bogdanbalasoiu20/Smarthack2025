'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { getStoredToken } from '@/lib/authToken';
import { API_BASE_URL, WS_BASE_URL } from '@/lib/api';

type TransitionSettings = {
  type: 'none' | 'fade' | 'slide' | 'zoom' | 'spin';
  direction?: 'left' | 'right' | 'up' | 'down' | 'none';
  duration: number;
  delay: number;
};

type AnimationSettings = {
  type: 'fade' | 'slide' | 'zoom' | 'bounce';
  direction?: 'left' | 'right' | 'up' | 'down' | 'none';
  duration: number;
  delay: number;
  easing: string;
};

const DEFAULT_TRANSITION_SETTINGS: TransitionSettings = {
  type: 'fade',
  direction: 'none',
  duration: 0.8,
  delay: 0,
};

const DEFAULT_ANIMATION_SETTINGS: AnimationSettings = {
  type: 'fade',
  direction: 'up',
  duration: 0.8,
  delay: 0,
  easing: 'easeInOut',
};

interface RemoteUserState {
  userId: number;
  username: string;
  color: string;
  elementId: number | null;
  frameId: number | null;
  lastActive: number;
}

const USER_COLORS = ['#f87171', '#fb923c', '#facc15', '#34d399', '#38bdf8', '#a78bfa', '#f472b6'];
const colorForUser = (userId: number) => USER_COLORS[userId % USER_COLORS.length];

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
  transition_settings?: string;
  transition_settings_parsed?: TransitionSettings;
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
  animation_settings?: string;
  animation_settings_parsed?: AnimationSettings;
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
  remoteUsers: RemoteUserState[];
  announceSelection: (frameId: number | null, elementId: number | null) => void;
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
  const [remoteUsersMap, setRemoteUsersMap] = useState<Record<number, RemoteUserState>>({});

  const token = getStoredToken();
  useEffect(() => {
    setRemoteUsersMap({});
  }, [presentationId]);
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

    if (typeof changes.animation_settings === 'string') {
      try {
        next.animation_settings_parsed = JSON.parse(changes.animation_settings);
      } catch {
        next.animation_settings_parsed = DEFAULT_ANIMATION_SETTINGS;
      }
    } else if (typeof changes.animation_settings === 'object' && changes.animation_settings) {
      next.animation_settings_parsed = changes.animation_settings as AnimationSettings;
    }

    return next;
  };

  const mergeFrameData = useCallback((frame: Frame, changes: Partial<Frame>): Frame => {
    const next: Frame = { ...frame, ...changes };

    if (typeof changes.position === 'string') {
      try {
        next.position_parsed = JSON.parse(changes.position);
      } catch {
        // keep previous parsed
      }
    }

    if (typeof changes.transition_settings === 'string') {
      try {
        next.transition_settings_parsed = JSON.parse(changes.transition_settings);
      } catch {
        next.transition_settings_parsed = DEFAULT_TRANSITION_SETTINGS;
      }
    } else if (typeof changes.transition_settings === 'object' && changes.transition_settings) {
      next.transition_settings_parsed = changes.transition_settings as TransitionSettings;
    }

    return next;
  }, []);

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

  const registerRemoteUser = useCallback((userId: number, username: string) => {
    setRemoteUsersMap((prev) => {
      const existing = prev[userId];
      if (existing) {
        if (existing.username === username) {
          return prev;
        }
        return {
          ...prev,
          [userId]: {
            ...existing,
            username,
          },
        };
      }
      return {
        ...prev,
        [userId]: {
          userId,
          username,
          color: colorForUser(userId),
          elementId: null,
          frameId: null,
          lastActive: Date.now(),
        },
      };
    });
  }, []);

  const removeRemoteUser = useCallback((userId: number) => {
    setRemoteUsersMap((prev) => {
      if (!(userId in prev)) return prev;
      const next = { ...prev };
      delete next[userId];
      return next;
    });
  }, []);

  const addElementLocal = useCallback((frameId: number, element: Element) => {
    const hydrated: Element = {
      ...element,
      animation_settings_parsed:
        element.animation_settings_parsed ??
        (element.animation_settings
          ? (() => {
              try {
                return JSON.parse(element.animation_settings);
              } catch {
                return DEFAULT_ANIMATION_SETTINGS;
              }
            })()
          : DEFAULT_ANIMATION_SETTINGS),
    };

    setPresentation((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        frames: prev.frames.map((frame) =>
          frame.id === frameId
            ? {
                ...frame,
                elements: [...(frame.elements || []), hydrated],
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
        elements: [...(prevFrame.elements || []), hydrated],
      };
    });

    setSelectedElement(hydrated);
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
    `${WS_BASE_URL}/ws/presentations/${presentationId}/`,
    {
      onMessage: (data) => {
        handleWebSocketMessage(data);
      },
    }
  );

  const announceSelection = useCallback(
    (frameId: number | null, elementId: number | null) => {
      sendMessage({
        type: 'user_selection',
        frame_id: frameId,
        element_id: elementId,
      });
    },
    [sendMessage]
  );

  const canEdit = presentation?.current_user_permission === 'OWNER' ||
                  presentation?.current_user_permission === 'EDITOR';

  const fetchPresentation = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/presentations/${presentationId}/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

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
              frame.id === data.frame_id ? mergeFrameData(frame, data.changes) : frame
            ),
          };
        });
        setSelectedFrame((prev) => {
          if (!prev || prev.id !== data.frame_id) return prev;
          return mergeFrameData(prev, data.changes);
        });
        break;

      case 'user_joined':
        if (data.user_id && data.username) {
          registerRemoteUser(data.user_id, data.username);
        }
        break;

      case 'user_left':
        if (data.user_id) {
          removeRemoteUser(data.user_id);
        }
        break;

      case 'user_selection':
        if (data.user_id) {
          registerRemoteUser(data.user_id, data.username || 'Guest');
          setRemoteUsersMap((prev) => {
            const existing = prev[data.user_id] || {
              userId: data.user_id,
              username: data.username || 'Guest',
              color: colorForUser(data.user_id),
              elementId: null,
              frameId: null,
              lastActive: Date.now(),
            };
            return {
              ...prev,
              [data.user_id]: {
                ...existing,
                username: data.username || existing.username,
                elementId: data.element_id ?? null,
                frameId: data.frame_id ?? null,
                lastActive: Date.now(),
              },
            };
          });
        }
        break;
    }
  };

  const updateFrame = async (frameId: number, data: Partial<Frame>) => {
    if (!canEdit) return;

    try {
      const payload = { ...data };
      const response = await fetch(`${API_BASE_URL}/frames/${frameId}/`, {
        method: 'PATCH',
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        sendMessage({
          type: 'frame_update',
          frame_id: frameId,
          changes: payload,
        });

        setPresentation((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            frames: prev.frames.map((frame) =>
              frame.id === frameId ? mergeFrameData(frame, payload) : frame
            ),
          };
        });

        setSelectedFrame((prev) => {
          if (!prev || prev.id !== frameId) return prev;
          return mergeFrameData(prev, payload);
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
      await fetch(`${API_BASE_URL}/elements/${elementId}/`, {
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
      const payload: Record<string, unknown> = {
        presentation: presentationId,
        ...data,
      };
      if (!payload.transition_settings) {
        payload.transition_settings = JSON.stringify(DEFAULT_TRANSITION_SETTINGS);
      }
      const response = await fetch(`${API_BASE_URL}/frames/`, {
        method: 'POST',
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
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

    try {
      const payload: Record<string, unknown> = {
        frame: frameId,
        ...data,
      };

      if (!payload.animation_settings) {
        payload.animation_settings = JSON.stringify(DEFAULT_ANIMATION_SETTINGS);
      }

      const response = await fetch(`${API_BASE_URL}/elements/`, {
        method: 'POST',
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const element = await response.json();
        const targetFrameId = element.frame || frameId;
        addElementLocal(targetFrameId, element);
        announceSelection(targetFrameId, element.id);
        sendMessage({
          type: 'element_create',
          element,
        });
      } else {
        const responseText = await response.text();
        console.error('Failed to create element:', response.status, responseText);
      }
    } catch (error) {
      console.error('Error creating element:', error);
    }
  };

  const deleteFrame = async (frameId: number) => {
    if (!canEdit) return;

    try {
      await fetch(`${API_BASE_URL}/frames/${frameId}/`, {
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
      await fetch(`${API_BASE_URL}/elements/${elementId}/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Token ${token}`,
        },
      });
    } catch (error) {
      console.error('Error deleting element:', error);
    }
  };

  const remoteUsers = useMemo(() => Object.values(remoteUsersMap), [remoteUsersMap]);

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
        remoteUsers,
        announceSelection,
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
