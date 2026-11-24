'use client';

import React from 'react';

interface TopNavBarProps {
  currentScene: number; // 1 to 6
  totalScenes: number; // 6
  isEnvelopeOpen: boolean;
  isPlayingMusic: boolean;
  isAutoPlaying: boolean;
  sceneProgress: number; // 0 to 100
  onSelectScene: (scene: number) => void;
  onToggleMusic: () => void;
  onToggleAutoPlay: () => void;
  onBackToEnvelope: () => void;
}

export default function TopNavBar({
  currentScene,
  totalScenes,
  isEnvelopeOpen,
  isPlayingMusic,
  isAutoPlaying,
  sceneProgress,
  onSelectScene,
  onToggleMusic,
  onToggleAutoPlay,
  onBackToEnvelope,
}: TopNavBarProps) {
  if (!isEnvelopeOpen) return null;

  return (
    <header className="top-nav-bar" id="top-nav-bar">
      {/* Brand Monogram */}
      <div
        className="brand-monogram-small"
        onClick={onBackToEnvelope}
        title="Return to Envelope"
        tabIndex={0}
        role="button"
      >
        <img src="/assets/images/hc-monogram.svg" alt="H&C Monogram" />
        <span className="brand-names">H &amp; C</span>
      </div>

      {/* 6 Story-Style Progress Bars */}
      <nav className="story-progress-container" aria-label="Invitation Story Progress">
        {Array.from({ length: totalScenes }, (_, i) => {
          const sceneNum = i + 1;
          const isPast = sceneNum < currentScene;
          const isCurrent = sceneNum === currentScene;
          const fillWidth = isPast ? '100%' : isCurrent ? `${sceneProgress}%` : '0%';

          return (
            <div
              key={sceneNum}
              className={`story-bar-track ${isCurrent ? 'active' : ''}`}
              onClick={() => onSelectScene(sceneNum)}
              title={`Scene ${sceneNum}`}
              role="button"
              tabIndex={0}
            >
              <div
                className="story-bar-fill"
                style={{ width: fillWidth }}
              />
            </div>
          );
        })}
      </nav>

      {/* Action Controls */}
      <div className="top-nav-actions">
        {/* Auto-Play Toggle */}
        <button
          className={`control-pill-btn ${isAutoPlaying ? 'active-glow' : ''}`}
          onClick={onToggleAutoPlay}
          aria-label={isAutoPlaying ? 'Pause Auto-Play' : 'Start Auto-Play'}
          title={isAutoPlaying ? 'Pause Auto-Play' : 'Start Auto-Play'}
        >
          {isAutoPlaying ? (
            <svg viewBox="0 0 24 24" className="control-icon">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="control-icon">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
          <span className="control-label">{isAutoPlaying ? 'Auto' : 'Play'}</span>
        </button>

        {/* Music Toggle */}
        <button
          className="music-toggle-btn"
          onClick={onToggleMusic}
          aria-label={isPlayingMusic ? 'Mute Music' : 'Play Music'}
          title={isPlayingMusic ? 'Mute Music' : 'Play Music'}
        >
          <div className={`music-waves ${isPlayingMusic ? 'playing' : 'muted'}`}>
            <span />
            <span />
            <span />
            <span />
          </div>
        </button>
      </div>
    </header>
  );
}
