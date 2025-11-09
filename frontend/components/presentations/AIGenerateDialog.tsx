'use client';

import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { getStoredToken } from '@/lib/authToken';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";

interface AIGenerateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (presentationId: number) => void;
}

export default function AIGenerateDialog({ open, onOpenChange, onSuccess }: AIGenerateDialogProps) {
  const [prompt, setPrompt] = useState('');
  const [numSlides, setNumSlides] = useState<number | ''>('');

  useEffect(() => {
    if (open) {
      showDialog();
    }
  }, [open]);

  const showDialog = async () => {
    const { value: formValues } = await Swal.fire({
      title: '<div style="display: flex; align-items: center; gap: 8px;"><span>✨</span> Generate Presentation with AI</div>',
      html: `
        <div style="text-align: left; margin-bottom: 20px;">
          <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
            Describe what presentation you want and AI will create it for you with slides and content.
          </p>

          <div style="margin-bottom: 16px;">
            <label style="display: block; font-weight: 500; margin-bottom: 8px; text-align: left;">
              What presentation do you want to create?
            </label>
            <textarea
              id="swal-prompt"
              class="swal2-input"
              style="width: 100%; height: 100px; resize: none; margin: 0; padding: 10px;"
              placeholder="Example: Create a presentation about climate change solutions with focus on renewable energy..."
            ></textarea>
            <p style="color: #999; font-size: 12px; margin-top: 4px;">
              Be specific about the topic, audience, and key points you want to cover.
            </p>
          </div>

          <div style="margin-bottom: 16px;">
            <label style="display: block; font-weight: 500; margin-bottom: 8px; text-align: left;">
              Number of slides (optional)
            </label>
            <input
              id="swal-slides"
              type="number"
              class="swal2-input"
              style="width: 100%; margin: 0;"
              placeholder="Leave empty for AI to decide"
              min="3"
              max="20"
            />
            <p style="color: #999; font-size: 12px; margin-top: 4px;">
              If not specified, AI will create an appropriate number of slides (typically 5-10).
            </p>
          </div>

          <div style="margin-bottom: 16px;">
            <label style="display: block; font-weight: 500; margin-bottom: 8px; text-align: left;">
              Example prompts:
            </label>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <button
                type="button"
                onclick="document.getElementById('swal-prompt').value='Create a presentation about the benefits of remote work'"
                style="text-align: left; padding: 8px; border: none; background: #f0f0f0; border-radius: 4px; cursor: pointer; font-size: 13px;"
                onmouseover="this.style.background='#e0e0e0'"
                onmouseout="this.style.background='#f0f0f0'"
              >
                • Create a presentation about the benefits of remote work
              </button>
              <button
                type="button"
                onclick="document.getElementById('swal-prompt').value='Present our Q4 sales results and 2024 goals'"
                style="text-align: left; padding: 8px; border: none; background: #f0f0f0; border-radius: 4px; cursor: pointer; font-size: 13px;"
                onmouseover="this.style.background='#e0e0e0'"
                onmouseout="this.style.background='#f0f0f0'"
              >
                • Present our Q4 sales results and 2024 goals
              </button>
              <button
                type="button"
                onclick="document.getElementById('swal-prompt').value='Introduction to machine learning for beginners'"
                style="text-align: left; padding: 8px; border: none; background: #f0f0f0; border-radius: 4px; cursor: pointer; font-size: 13px;"
                onmouseover="this.style.background='#e0e0e0'"
                onmouseout="this.style.background='#f0f0f0'"
              >
                • Introduction to machine learning for beginners
              </button>
              <button
                type="button"
                onclick="document.getElementById('swal-prompt').value='Company onboarding for new employees'"
                style="text-align: left; padding: 8px; border: none; background: #f0f0f0; border-radius: 4px; cursor: pointer; font-size: 13px;"
                onmouseover="this.style.background='#e0e0e0'"
                onmouseout="this.style.background='#f0f0f0'"
              >
                • Company onboarding for new employees
              </button>
            </div>
          </div>

          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
            Tip: Press Cmd/Ctrl + Enter to generate
          </p>
        </div>
      `,
      width: 650,
      showCancelButton: true,
      confirmButtonText: '✨ Generate Presentation',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#8b5cf6',
      cancelButtonColor: '#6b7280',
      focusConfirm: false,
      didOpen: () => {
        const promptInput = document.getElementById('swal-prompt') as HTMLTextAreaElement;
        if (promptInput) {
          promptInput.focus();
          // Handle Ctrl/Cmd + Enter
          promptInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              Swal.clickConfirm();
            }
          });
        }
      },
      preConfirm: () => {
        const promptInput = document.getElementById('swal-prompt') as HTMLTextAreaElement;
        const slidesInput = document.getElementById('swal-slides') as HTMLInputElement;

        const promptValue = promptInput.value.trim();

        if (!promptValue) {
          Swal.showValidationMessage('Please describe what presentation you want to create');
          return false;
        }

        return {
          prompt: promptValue,
          numSlides: slidesInput.value ? parseInt(slidesInput.value) : null,
        };
      }
    });

    if (formValues) {
      await handleGenerate(formValues.prompt, formValues.numSlides);
    }

    // Close the dialog
    onOpenChange(false);
  };

  const handleGenerate = async (promptValue: string, numSlidesValue: number | null) => {
    // Show loading
    Swal.fire({
      title: 'Generating Presentation...',
      html: 'AI is creating your presentation. This may take 5-15 seconds.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const token = getStoredToken();

      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      const response = await fetch(`${API_BASE_URL}/ai/generate-full/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify({
          prompt: promptValue,
          num_slides: numSlidesValue,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate presentation');
      }

      const data = await response.json();

      // Close loading and show success
      await Swal.fire({
        title: 'Success!',
        html: `
          <p>AI-generated presentation created successfully!</p>
          <p style="margin-top: 10px;"><strong>${data.title}</strong></p>
          <p style="color: #666; font-size: 14px;">${data.num_frames} slides created</p>
        `,
        icon: 'success',
        confirmButtonText: 'Open Presentation',
        confirmButtonColor: '#8b5cf6',
      });

      // Notify parent component
      onSuccess(data.presentation_id);

    } catch (err: any) {
      // Show error
      await Swal.fire({
        title: 'Error',
        text: err.message || 'An error occurred while generating the presentation',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ef4444',
      });
    }
  };

  return null; // Component doesn't render anything, uses SweetAlert2 dialogs
}
