'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getStoredToken } from '@/lib/authToken';
import { ChevronLeft, ChevronRight, X, Maximize, Minimize } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api';

interface Element {
  id: number;
  element_type: string;
  position: any;
  content: any;
  animation_settings?: any;
}

interface Frame {
  id: number;
  title: string;
  order: number;
  background_color: string;
  background_image?: string;
  position: any;
  transition_settings?: any;
  elements: Element[];
}

interface Presentation {
  id: number;
  title: string;
  description: string;
  presentation_path: number[];
  frames: Frame[];
}

export default function PresentModePage() {
  const params = useParams();
  const router = useRouter();
  const presentationId = params.id as string;

  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);

  // Hide controls after 3 seconds of inactivity
  useEffect(() => {
    const timer = setTimeout(() => setShowControls(false), 3000);

    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timer);
      setTimeout(() => setShowControls(false), 3000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Fetch presentation data
  useEffect(() => {
    const fetchPresentation = async () => {
      const token = getStoredToken();
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/presentations/${presentationId}/`, {
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to load presentation');
        }

        const data = await response.json();

        // Parse JSON fields
        if (data.frames) {
          data.frames = data.frames.map((frame: any) => ({
            ...frame,
            position: typeof frame.position === 'string' ? JSON.parse(frame.position) : frame.position,
            transition_settings: typeof frame.transition_settings === 'string' ? JSON.parse(frame.transition_settings) : frame.transition_settings,
            elements: frame.elements.map((el: any) => ({
              ...el,
              position: typeof el.position === 'string' ? JSON.parse(el.position) : el.position,
              content: typeof el.content === 'string' ? JSON.parse(el.content) : el.content,
              animation_settings: typeof el.animation_settings === 'string' ? JSON.parse(el.animation_settings) : el.animation_settings,
            }))
          }));
        }

        setPresentation(data);
      } catch (error) {
        console.error('Error fetching presentation:', error);
        router.push('/presentations');
      } finally {
        setLoading(false);
      }
    };

    fetchPresentation();
  }, [presentationId, router]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!presentation) return;

      const totalFrames = presentation.frames.length;

      switch (e.key) {
        case 'ArrowRight':
        case ' ':
        case 'PageDown':
          e.preventDefault();
          setCurrentFrameIndex((prev) => Math.min(prev + 1, totalFrames - 1));
          break;
        case 'ArrowLeft':
        case 'PageUp':
        case 'Backspace':
          e.preventDefault();
          setCurrentFrameIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Home':
          e.preventDefault();
          setCurrentFrameIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setCurrentFrameIndex(totalFrames - 1);
          break;
        case 'Escape':
          e.preventDefault();
          exitPresentation();
          break;
        case 'f':
        case 'F':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            toggleFullscreen();
          }
          break;
      }
    },
    [presentation]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Auto-enter fullscreen on mount
  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } catch (err) {
        console.log('Fullscreen not available or denied');
      }
    };

    enterFullscreen();
  }, []);

  // Fullscreen management
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const exitPresentation = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    router.push(`/presentations/${presentationId}`);
  };

  const goToNext = () => {
    if (presentation && currentFrameIndex < presentation.frames.length - 1) {
      setCurrentFrameIndex(currentFrameIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentFrameIndex > 0) {
      setCurrentFrameIndex(currentFrameIndex - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading presentation...</div>
      </div>
    );
  }

  if (!presentation || presentation.frames.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <p className="text-xl mb-4">No frames to present</p>
          <button
            onClick={() => router.push(`/presentations/${presentationId}`)}
            className="rounded-lg bg-indigo-600 px-6 py-3 hover:bg-indigo-700 transition"
          >
            Back to Editor
          </button>
        </div>
      </div>
    );
  }

  const currentFrame = presentation.frames[currentFrameIndex];
  const totalFrames = presentation.frames.length;

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      {/* Main slide display - centered with aspect ratio */}
      <div className="flex h-full w-full items-center justify-center p-8">
        <div
          className="relative shadow-2xl"
          style={{
            width: '100%',
            maxWidth: '1920px',
            aspectRatio: '16/9',
            backgroundColor: currentFrame.background_color || '#ffffff'
          }}
        >
          {/* Background image */}
          {currentFrame.background_image && (
            <img
              src={currentFrame.background_image}
              alt="Background"
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}

          {/* Elements - rendered at their exact positions */}
          {currentFrame.elements && currentFrame.elements.map((element) => {
            if (!element.position || !element.content) return null;

            const pos = element.position;

            return (
              <div
                key={element.id}
                className="absolute animate-fadeIn"
                style={{
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  width: `${pos.width}px`,
                  height: `${pos.height}px`,
                  transform: `rotate(${pos.rotation || 0}deg)`,
                  zIndex: pos.z_index || 1,
                }}
              >
                {/* TEXT element */}
                {element.element_type === 'TEXT' && (
                  <div
                    className="w-full h-full flex items-center"
                    style={{
                      fontSize: `${element.content.fontSize || 24}px`,
                      fontFamily: element.content.fontFamily || 'Arial, sans-serif',
                      color: element.content.color || '#000000',
                      textAlign: (element.content.align || 'left') as any,
                      fontWeight: element.content.fontWeight || 'normal',
                      lineHeight: '1.4',
                      wordWrap: 'break-word',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {element.content.text}
                  </div>
                )}

                {/* SHAPE element */}
                {element.element_type === 'SHAPE' && (
                  <div
                    className="w-full h-full"
                    style={{
                      backgroundColor: element.content.fill || '#818cf8',
                      border: `${element.content.strokeWidth || 2}px solid ${element.content.stroke || '#6366f1'}`,
                      borderRadius: element.content.shape === 'circle' ? '50%' : '0',
                    }}
                  />
                )}

                {/* IMAGE element */}
                {element.element_type === 'IMAGE' && element.content.url && (
                  <img
                    src={element.content.url}
                    alt=""
                    className="w-full h-full"
                    style={{
                      objectFit: element.content.objectFit || 'contain',
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation controls - only show when mouse moves */}
      <div
        className={`absolute bottom-8 left-0 right-0 flex items-center justify-center gap-4 px-8 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <button
          onClick={goToPrevious}
          disabled={currentFrameIndex === 0}
          className="rounded-full bg-black/60 p-4 text-white backdrop-blur-md transition hover:bg-black/80 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={28} />
        </button>

        <div className="rounded-full bg-black/60 px-8 py-4 text-white backdrop-blur-md text-lg font-semibold">
          <span className="text-white">{currentFrameIndex + 1}</span>
          <span className="mx-3 text-white/60">/</span>
          <span className="text-white/80">{totalFrames}</span>
        </div>

        <button
          onClick={goToNext}
          disabled={currentFrameIndex === totalFrames - 1}
          className="rounded-full bg-black/60 p-4 text-white backdrop-blur-md transition hover:bg-black/80 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight size={28} />
        </button>
      </div>

      {/* Top controls */}
      <div
        className={`absolute top-8 left-8 right-8 flex items-center justify-between transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="rounded-full bg-black/60 px-6 py-3 text-base text-white backdrop-blur-md font-medium">
          {currentFrame.title || `Slide ${currentFrameIndex + 1}`}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleFullscreen}
            className="rounded-full bg-black/60 p-3 text-white backdrop-blur-md transition hover:bg-black/80"
            title={isFullscreen ? 'Exit fullscreen (F)' : 'Enter fullscreen (F)'}
          >
            {isFullscreen ? <Minimize size={22} /> : <Maximize size={22} />}
          </button>

          <button
            onClick={exitPresentation}
            className="rounded-full bg-black/60 p-3 text-white backdrop-blur-md transition hover:bg-red-600/80"
            title="Exit presentation (Esc)"
          >
            <X size={22} />
          </button>
        </div>
      </div>

      {/* Keyboard hints - bottom right */}
      <div
        className={`absolute bottom-8 right-8 rounded-lg bg-black/70 px-4 py-3 text-xs text-white/80 backdrop-blur-md transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="space-y-1">
          <div>← → Space: Navigate</div>
          <div>F: Fullscreen</div>
          <div>Esc: Exit</div>
        </div>
      </div>

      {/* Add fade-in animation */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
