'use client';

import React from 'react';

interface BottomNavBarProps {
  currentScene: number;
  totalScenes: number;
  isEnvelopeOpen: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export default function BottomNavBar({
  currentScene,
  totalScenes,
  isEnvelopeOpen,
  onPrev,
  onNext,
}: BottomNavBarProps) {
  if (!isEnvelopeOpen) return null;

  const progressPercent = (currentScene / totalScenes) * 100;

  return (
    <>
      <footer className="bottom-nav-bar" id="bottom-nav-bar">
        {/* Back Arrow */}
        <button
          className={`nav-arrow-btn ${currentScene === 1 ? 'disabled' : ''}`}
          onClick={onPrev}
          disabled={currentScene === 1}
          aria-label="Previous Scene"
          title="Previous Scene"
        >
          <svg viewBox="0 0 24 24">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
        </button>

        {/* Scene Counter Badge */}
        <div className="scene-counter-badge" id="scene-counter-text">
          SCENE {currentScene} OF {totalScenes}
        </div>

        {/* Next Arrow */}
        <button
          className={`nav-arrow-btn ${currentScene === totalScenes ? 'disabled' : ''}`}
          onClick={onNext}
          disabled={currentScene === totalScenes}
          aria-label="Next Scene"
          title="Next Scene"
        >
          <svg viewBox="0 0 24 24">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
          </svg>
        </button>
      </footer>

      {/* Global Progress Line */}
      <div className="bottom-progress-track">
        <div
          className="bottom-progress-fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </>
  );
}
