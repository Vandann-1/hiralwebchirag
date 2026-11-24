'use client';

import React from 'react';

interface PalaceGateOverlayProps {
  show: boolean;
  isOpen: boolean;
}

export default function PalaceGateOverlay({ show, isOpen }: PalaceGateOverlayProps) {
  if (!show) return null;

  return (
    <div
      id="palace-gate-overlay"
      className={`palace-gate-overlay ${isOpen ? 'is-open' : 'is-closed'}`}
      aria-hidden="true"
    >
      {/* Divine Golden Light Burst */}
      <div className={`gate-light-burst ${isOpen ? 'flare-active' : ''}`} />

      {/* Left Carved Wooden & Gold Palace Door */}
      <div className={`gate-door gate-door-left ${isOpen ? 'open-left' : ''}`}>
        <div className="door-shadow-inner" />
      </div>

      {/* Right Carved Wooden & Gold Palace Door */}
      <div className={`gate-door gate-door-right ${isOpen ? 'open-right' : ''}`}>
        <div className="door-shadow-inner" />
      </div>

      {/* Center Ornate Door Seam / Brass Arch Accent */}
      <div className={`gate-center-seam ${isOpen ? 'seam-vanish' : ''}`} />
    </div>
  );
}
