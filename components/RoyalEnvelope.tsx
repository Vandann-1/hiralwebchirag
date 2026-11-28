'use client';

import React, { useState } from 'react';

interface RoyalEnvelopeProps {
  onOpen: () => void;
}

export default function RoyalEnvelope({ onOpen }: RoyalEnvelopeProps) {
  const [isOpening, setIsOpening] = useState(false);

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOpening) return;
    setIsOpening(true);

    // Give ample time for 4 flaps to unfold outward and card to elevate with gold glow
    setTimeout(() => {
      onOpen();
    }, 1800);
  };

  return (
    <div
      className={`royal-envelope-screen ${isOpening ? 'is-opening' : ''}`}
      onClick={handleOpen}
      role="button"
      tabIndex={0}
      aria-label="Tap to open royal 4-sided invitation envelope"
    >
      <div className="envelope-3d-wrapper">
        {/* Back Wall / Inside Velvet Lining of the Envelope */}
        <div className="envelope-inside-lining">
          <div className="envelope-lining-pattern" />
          <div className="envelope-lining-gold-border" />
        </div>

        {/* The Royal Invitation Card Inside that Reveals and Elevates */}
        <div className={`envelope-sliding-card ${isOpening ? 'card-slides-up' : ''}`}>
          <img
            src="/assets/images/scene-1-ganesh.jpg"
            alt="Ganesh Stapan Invitation"
            className="sliding-card-img"
          />
          <div className="card-ambient-glow" />
        </div>

        {/* 4-SIDE ROYAL FLAPS (All 4 unfold outward in 3D perspective) */}

        {/* 1. Left Flap (Folds left) */}
        <div className={`envelope-flap envelope-flap-left ${isOpening ? 'flap-open' : ''}`}>
          <img
            src="/assets/images/royal-envelope-clean-base.jpg"
            alt="Royal Envelope Left Flap"
            className="envelope-img"
          />
          <div className="flap-gold-edge-left" />
        </div>

        {/* 2. Right Flap (Folds right) */}
        <div className={`envelope-flap envelope-flap-right ${isOpening ? 'flap-open' : ''}`}>
          <img
            src="/assets/images/royal-envelope-clean-base.jpg"
            alt="Royal Envelope Right Flap"
            className="envelope-img"
          />
          <div className="flap-gold-edge-right" />
        </div>

        {/* 3. Bottom Flap (Folds down) */}
        <div className={`envelope-flap envelope-flap-bottom ${isOpening ? 'flap-open' : ''}`}>
          <img
            src="/assets/images/royal-envelope-clean-base.jpg"
            alt="Royal Envelope Bottom Flap"
            className="envelope-img"
          />
          <div className="flap-gold-edge-bottom" />
        </div>

        {/* 4. Top Flap (Folds up) */}
        <div className={`envelope-flap envelope-flap-top ${isOpening ? 'flap-open' : ''}`}>
          <img
            src="/assets/images/royal-envelope-clean-base.jpg"
            alt="Royal Envelope Top Flap"
            className="envelope-img"
          />
          <div className="flap-gold-edge-top" />
        </div>

        {/* Diagonal Gold Seam Crease Lines across the 4 Flaps */}
        <div className={`envelope-crease-lines ${isOpening ? 'creases-hidden' : ''}`} />

        {/* Official H&C Center Medallion Royal Seal */}
        <div
          className={`envelope-badge-trigger ${isOpening ? 'badge-activated' : ''}`}
          onClick={handleOpen}
          title="Tap Royal Seal to Open"
        >
          <img
            src="/assets/images/envelope-badge.png"
            alt="H&C Royal Monogram Badge"
            className="envelope-center-badge-img"
          />
          <div className="badge-gold-aura" />
          <div className="badge-shimmer-ring" />
        </div>

        {/* Elegant Tap Instruction Pill */}
        {!isOpening && (
          <div className="envelope-tap-pill">
            <span className="tap-icon">✨</span>
            <span>Tap Royal Seal to Open</span>
          </div>
        )}
      </div>
    </div>
  );
}
