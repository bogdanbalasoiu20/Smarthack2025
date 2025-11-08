"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api/client";

interface Frame {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  background_color: string;
  background_image?: string;
  order_index: number;
}

interface Element {
  id: string;
  frame?: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  z_index: number;
  content: any;
}

interface Presentation {
  id: string;
  title: string;
  frames: Frame[];
  elements: Element[];
}

export default function PresentationViewPage() {
  const params = useParams();
  const router = useRouter();
  const presentationId = params.id as string;

  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    loadPresentation();
  }, [presentationId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        nextFrame();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevFrame();
      } else if (e.key === "Escape") {
        exitFullscreen();
      } else if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentFrameIndex, presentation]);

  const loadPresentation = async () => {
    try {
      const data = await api.getPresentation(presentationId);
      setPresentation(data);
    } catch (err) {
      console.error("Failed to load presentation:", err);
    } finally {
      setLoading(false);
    }
  };

  const nextFrame = () => {
    if (!presentation) return;
    if (currentFrameIndex < presentation.frames.length - 1) {
      setCurrentFrameIndex(currentFrameIndex + 1);
    }
  };

  const prevFrame = () => {
    if (currentFrameIndex > 0) {
      setCurrentFrameIndex(currentFrameIndex - 1);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const renderElement = (element: Element) => {
    const style: React.CSSProperties = {
      position: "absolute",
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      transform: `rotate(${element.rotation}deg)`,
      zIndex: element.z_index,
    };

    if (element.type === "text") {
      return (
        <div
          key={element.id}
          style={{
            ...style,
            fontSize: element.content.font_size || 16,
            color: element.content.color || "#000000",
            textAlign: element.content.align || "left",
            fontWeight: element.content.bold ? "bold" : "normal",
            fontStyle: element.content.italic ? "italic" : "normal",
            display: "flex",
            alignItems: "center",
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
          }}
        >
          {element.content.text || ""}
        </div>
      );
    }

    if (element.type === "image") {
      return (
        <img
          key={element.id}
          src={element.content.url}
          alt=""
          style={{
            ...style,
            objectFit: element.content.fit || "cover",
          }}
        />
      );
    }

    if (element.type === "shape") {
      const shapeType = element.content.shape_type || "rectangle";

      if (shapeType === "rectangle") {
        return (
          <div
            key={element.id}
            style={{
              ...style,
              backgroundColor: element.content.fill || "#3B82F6",
              border: `${element.content.stroke_width || 2}px solid ${element.content.stroke || "#1E40AF"}`,
              borderRadius: element.content.corner_radius || 0,
            }}
          />
        );
      }

      if (shapeType === "circle") {
        return (
          <div
            key={element.id}
            style={{
              ...style,
              backgroundColor: element.content.fill || "#3B82F6",
              border: `${element.content.stroke_width || 2}px solid ${element.content.stroke || "#1E40AF"}`,
              borderRadius: "50%",
            }}
          />
        );
      }
    }

    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading presentation...</div>
      </div>
    );
  }

  if (!presentation || presentation.frames.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <p className="text-white text-xl mb-4">No frames in this presentation</p>
          <button
            onClick={() => router.push(`/presentations/${presentationId}/edit`)}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
          >
            Edit Presentation
          </button>
        </div>
      </div>
    );
  }

  const currentFrame = presentation.frames.sort((a, b) => a.order_index - b.order_index)[currentFrameIndex];
  const frameElements = presentation.elements.filter((el) => el.frame === currentFrame.id);

  return (
    <div className="relative w-screen h-screen bg-gray-900 overflow-hidden">
      {/* Frame container */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="relative transition-all duration-500 ease-in-out"
          style={{
            width: currentFrame.width,
            height: currentFrame.height,
            backgroundColor: currentFrame.background_color,
            backgroundImage: currentFrame.background_image
              ? `url(${currentFrame.background_image})`
              : undefined,
            backgroundSize: "cover",
            transform: `rotate(${currentFrame.rotation}deg)`,
          }}
        >
          {frameElements.map(renderElement)}
        </div>
      </div>

      {/* Navigation controls */}
      {!isFullscreen && (
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-50">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push(`/presentations/${presentationId}/edit`)}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Exit
            </button>
            <h1 className="text-white text-xl font-semibold">{presentation.title}</h1>
          </div>

          <button
            onClick={toggleFullscreen}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Fullscreen (F)
          </button>
        </div>
      )}

      {/* Frame counter and navigation */}
      <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center space-x-6 z-50">
        <button
          onClick={prevFrame}
          disabled={currentFrameIndex === 0}
          className="p-3 bg-gray-800 hover:bg-gray-700 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="px-6 py-3 bg-gray-800 text-white rounded-lg">
          {currentFrameIndex + 1} / {presentation.frames.length}
        </div>

        <button
          onClick={nextFrame}
          disabled={currentFrameIndex === presentation.frames.length - 1}
          className="p-3 bg-gray-800 hover:bg-gray-700 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Keyboard shortcuts help */}
      {!isFullscreen && (
        <div className="absolute bottom-6 right-6 bg-gray-800 text-gray-300 text-xs px-4 py-3 rounded-lg z-50">
          <div className="space-y-1">
            <div><kbd className="bg-gray-700 px-2 py-1 rounded">→</kbd> or <kbd className="bg-gray-700 px-2 py-1 rounded">Space</kbd> Next</div>
            <div><kbd className="bg-gray-700 px-2 py-1 rounded">←</kbd> Previous</div>
            <div><kbd className="bg-gray-700 px-2 py-1 rounded">F</kbd> Fullscreen</div>
            <div><kbd className="bg-gray-700 px-2 py-1 rounded">Esc</kbd> Exit fullscreen</div>
          </div>
        </div>
      )}
    </div>
  );
}
