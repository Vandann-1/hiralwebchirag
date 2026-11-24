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

    // After flap opens and card slides up smoothly, enter card viewing mode
    setTimeout(() => {
      onOpen();
    }, 1500);
  };

  return (
    <div
      className={`royal-envelope-screen ${isOpening ? 'is-opening' : ''}`}
      onClick={handleOpen}
      role="button"
      tabIndex={0}
      aria-label="Tap to open royal invitation envelope"
    >
      <div className="envelope-3d-wrapper">
        {/* Back Wall / Inside Lining of the Envelope */}
        <div className="envelope-inside-lining" />

        {/* The Royal Invitation Card Inside that Slides Up */}
        <div className={`envelope-sliding-card ${isOpening ? 'card-slides-up' : ''}`}>
          <img
            src="/assets/images/scene-1-ganesh.jpg"
            alt="Ganesh Stapan Invitation"
            className="sliding-card-img"
          />
        </div>

        {/* Lower Envelope Body & Flaps */}
        <div className="envelope-lower-body">
          <img
            src="/assets/images/royal-envelope-clean-base.jpg"
            alt="Royal Red Envelope"
            className="envelope-img"
          />
        </div>

        {/* Top Triangular Flap that Folds Open Upwards */}
        <div className={`envelope-top-flap ${isOpening ? 'flap-folded-open' : ''}`}>
          <img
            src="/assets/images/royal-envelope-clean-base.jpg"
            alt="Envelope Flap"
            className="envelope-img"
          />
        </div>

        {/* Official H&C Center Medallion Badge */}
        <div
          className={`envelope-badge-trigger ${isOpening ? 'badge-activated' : ''}`}
          onClick={handleOpen}
          title="Tap H&C Badge to Open"
        >
          <img
            src="/assets/images/envelope-badge.png"
            alt="H&C Royal Monogram Badge"
            className="envelope-center-badge-img"
          />
          <div className="badge-gold-aura" />
        </div>

        {/* Simple Direct Floating Tap Prompt */}
        {!isOpening && (
          <div className="envelope-tap-pill">
            <span className="tap-icon">👆</span>
            <span>Tap H&amp;C Badge to Open</span>
          </div>
        )}
      </div>
    </div>
  );
}
