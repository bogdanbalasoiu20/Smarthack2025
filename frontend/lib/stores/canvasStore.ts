import { create } from 'zustand';

export interface Element {
  id: string;
  frame?: string;
  presentation: string;
  type: 'text' | 'image' | 'video' | 'shape' | 'line' | 'arrow' | 'icon';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scale_x: number;
  scale_y: number;
  z_index: number;
  content: any;
  style: any;
  locked: boolean;
}

export interface Frame {
  id: string;
  presentation: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  z_index: number;
  background_color: string;
  background_image?: string;
  border_style: any;
  order_index: number;
  elements?: Element[];
}

export interface Presentation {
  id: string;
  title: string;
  description: string;
  canvas_config: {
    width: number;
    height: number;
    background: string;
  };
  viewport_state: {
    zoom: number;
    pan_x: number;
    pan_y: number;
  };
  frames: Frame[];
  elements: Element[];
}

interface CanvasState {
  // Data
  presentation: Presentation | null;
  frames: Frame[];
  elements: Element[];

  // Viewport
  zoom: number;
  panX: number;
  panY: number;

  // Selection
  selectedElementIds: string[];
  selectedFrameId: string | null;

  // UI State
  tool: 'select' | 'text' | 'shape' | 'image' | 'frame';
  isLoading: boolean;

  // Actions
  setPresentation: (presentation: Presentation) => void;
  updatePresentation: (updates: Partial<Presentation>) => void;

  // Frames
  addFrame: (frame: Frame) => void;
  updateFrame: (id: string, updates: Partial<Frame>) => void;
  deleteFrame: (id: string) => void;

  // Elements
  addElement: (element: Element) => void;
  updateElement: (id: string, updates: Partial<Element>) => void;
  deleteElement: (id: string) => void;
  bulkUpdateElements: (updates: Array<{ id: string } & Partial<Element>>) => void;

  // Viewport
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  resetViewport: () => void;

  // Selection
  selectElement: (id: string, multi?: boolean) => void;
  selectFrame: (id: string) => void;
  deselectAll: () => void;

  // Tools
  setTool: (tool: 'select' | 'text' | 'shape' | 'image' | 'frame') => void;

  // Loading
  setLoading: (loading: boolean) => void;
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  // Initial state
  presentation: null,
  frames: [],
  elements: [],
  zoom: 1,
  panX: 0,
  panY: 0,
  selectedElementIds: [],
  selectedFrameId: null,
  tool: 'select',
  isLoading: false,

  // Actions
  setPresentation: (presentation) => set({
    presentation,
    frames: presentation.frames || [],
    elements: presentation.elements || [],
    zoom: presentation.viewport_state?.zoom || 1,
    panX: presentation.viewport_state?.pan_x || 0,
    panY: presentation.viewport_state?.pan_y || 0,
  }),

  updatePresentation: (updates) => set((state) => ({
    presentation: state.presentation ? { ...state.presentation, ...updates } : null,
  })),

  addFrame: (frame) => set((state) => ({
    frames: [...state.frames, frame],
  })),

  updateFrame: (id, updates) => set((state) => ({
    frames: state.frames.map(f => f.id === id ? { ...f, ...updates } : f),
  })),

  deleteFrame: (id) => set((state) => ({
    frames: state.frames.filter(f => f.id !== id),
    elements: state.elements.filter(e => e.frame !== id),
    selectedFrameId: state.selectedFrameId === id ? null : state.selectedFrameId,
  })),

  addElement: (element) => set((state) => ({
    elements: [...state.elements, element],
  })),

  updateElement: (id, updates) => set((state) => ({
    elements: state.elements.map(el => el.id === id ? { ...el, ...updates } : el),
  })),

  deleteElement: (id) => set((state) => ({
    elements: state.elements.filter(el => el.id !== id),
    selectedElementIds: state.selectedElementIds.filter(eid => eid !== id),
  })),

  bulkUpdateElements: (updates) => set((state) => {
    const updateMap = new Map(updates.map(u => [u.id, u]));
    return {
      elements: state.elements.map(el => {
        const update = updateMap.get(el.id);
        return update ? { ...el, ...update } : el;
      }),
    };
  }),

  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(5, zoom)) }),

  setPan: (panX, panY) => set({ panX, panY }),

  resetViewport: () => set({ zoom: 1, panX: 0, panY: 0 }),

  selectElement: (id, multi = false) => set((state) => {
    if (multi) {
      const selected = state.selectedElementIds.includes(id)
        ? state.selectedElementIds.filter(eid => eid !== id)
        : [...state.selectedElementIds, id];
      return { selectedElementIds: selected };
    }
    return { selectedElementIds: [id], selectedFrameId: null };
  }),

  selectFrame: (id) => set({
    selectedFrameId: id,
    selectedElementIds: [],
  }),

  deselectAll: () => set({
    selectedElementIds: [],
    selectedFrameId: null,
  }),

  setTool: (tool) => set({ tool }),

  setLoading: (isLoading) => set({ isLoading }),
}));
