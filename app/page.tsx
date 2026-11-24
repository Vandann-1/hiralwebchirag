'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import RoyalEnvelope from '@/components/RoyalEnvelope';
import ParticleCanvas from '@/components/ParticleCanvas';
import FireworksCanvas from '@/components/FireworksCanvas';
import { WeddingAudioManager } from '@/lib/audio';

const TOTAL_SCENES = 6;

const SCENES_DATA = [
  { id: 1, title: 'Ganesh Stapan', image: '/assets/images/scene-1-ganesh.jpg' },
  { id: 2, title: 'Family Invitation', image: '/assets/images/scene-2-invitation.jpg' },
  { id: 3, title: 'Haldi Ceremony', image: '/assets/images/scene-3-haldi.jpg' },
  { id: 4, title: 'Mameru', image: '/assets/images/scene-4-mameru.jpg' },
  { id: 5, title: 'H&C Monogram Palace', image: '/assets/images/scene-5-hc-palace.jpg' },
  { id: 6, title: 'Hast Milap Lagan', image: '/assets/images/scene-6-hast-milap.jpg' },
];

export default function RoyalWeddingInvitation() {
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false);
  const [currentScene, setCurrentScene] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioManagerRef = useRef<WeddingAudioManager | null>(null);

  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);

  // Initialize Audio
  useEffect(() => {
    const manager = new WeddingAudioManager(audioRef.current, (playing) => {
      setIsPlayingMusic(playing);
    });
    audioManagerRef.current = manager;

    return () => {
      manager.pause();
    };
  }, []);

  // When H&C Badge on Envelope is tapped
  const handleOpenEnvelope = () => {
    if (audioManagerRef.current) {
      audioManagerRef.current.start();
    }
    setIsEnvelopeOpen(true);
    setCurrentScene(1);
  };

  // Replay from beginning (returns to Envelope)
  const handleReplay = () => {
    setIsEnvelopeOpen(false);
    setCurrentScene(1);
  };

  // Direct card navigation
  const goToScene = useCallback((targetIndex: number) => {
    if (isTransitioning) return;
    if (targetIndex < 1 || targetIndex > TOTAL_SCENES) return;
    if (targetIndex === currentScene) return;

    setIsTransitioning(true);
    setCurrentScene(targetIndex);

    setTimeout(() => {
      setIsTransitioning(false);
    }, 600);
  }, [currentScene, isTransitioning]);

  // 4 Seconds Automatic Scene Progression ("4, 4 auto all those")
  useEffect(() => {
    if (!isEnvelopeOpen) return;
    // When on Scene 6 finale, stay on finale with fireworks
    if (currentScene >= TOTAL_SCENES) return;

    const timer = setTimeout(() => {
      goToScene(currentScene + 1);
    }, 4000); // 4 seconds per scene

    return () => clearTimeout(timer);
  }, [isEnvelopeOpen, currentScene, goToScene]);

  const handlePrev = () => {
    if (currentScene > 1) {
      goToScene(currentScene - 1);
    }
  };

  const handleNext = () => {
    if (currentScene < TOTAL_SCENES) {
      goToScene(currentScene + 1);
    }
  };

  const handleToggleMusic = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioManagerRef.current) {
      audioManagerRef.current.toggle();
    }
  };

  // Tap navigation: Left half = Prev, Right half = Next
  const handleScreenTap = (e: React.MouseEvent) => {
    if (!isEnvelopeOpen) return;
    // Don't navigate if clicking action buttons or music toggle
    const target = e.target as HTMLElement;
    if (target.closest('.interactive-action') || target.closest('.minimal-music-btn')) {
      return;
    }

    const { clientX, currentTarget } = e;
    const rect = currentTarget.getBoundingClientRect();
    const clickX = clientX - rect.left;

    if (clickX < rect.width * 0.4) {
      handlePrev();
    } else {
      handleNext();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isEnvelopeOpen) {
        if (e.key === ' ' || e.key === 'Enter') handleOpenEnvelope();
        return;
      }

      if (e.key === 'ArrowRight' || e.key === ' ') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'm' || e.key === 'M') {
        if (audioManagerRef.current) audioManagerRef.current.toggle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEnvelopeOpen, currentScene, goToScene]);

  // Touch Swipe for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.changedTouches[0].screenX;
    touchStartYRef.current = e.changedTouches[0].screenY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].screenX;
    const touchEndY = e.changedTouches[0].screenY;
    const diffX = touchEndX - touchStartXRef.current;
    const diffY = touchEndY - touchStartYRef.current;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
      if (diffX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  // Calendar .ics download
  const handleDownloadCalendar = (e: React.MouseEvent) => {
    e.stopPropagation();
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Hiral and Chirag Wedding//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:ganesh-stapan-20270211@hiralxchirag.wedding',
      'DTSTART:20270211T023000Z',
      'DTEND:20270211T033000Z',
      'SUMMARY:Ganesh Stapan — Hiral & Chirag Wedding',
      'LOCATION:Residence, Laxmipura, Gujarat',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'BEGIN:VEVENT',
      'UID:haldi-ceremony-20270211@hiralxchirag.wedding',
      'DTSTART:20270211T053000Z',
      'DTEND:20270211T073000Z',
      'SUMMARY:Haldi Ceremony — Hiral & Chirag Wedding',
      'LOCATION:Residence Laxmipura, Gujarat',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'BEGIN:VEVENT',
      'UID:mameru-20270211@hiralxchirag.wedding',
      'DTSTART:20270211T094500Z',
      'DTEND:20270211T123000Z',
      'SUMMARY:Mameru — Hiral & Chirag Wedding',
      'LOCATION:Residence Laxmipura, Gujarat',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'BEGIN:VEVENT',
      'UID:hast-milap-20270212@hiralxchirag.wedding',
      'DTSTART:20270212T063000Z',
      'DTEND:20270212T080000Z',
      'SUMMARY:Hast Milap / Lagan — Hiral & Chirag Wedding',
      'LOCATION:Brahmin Samaj Vadi, Village Laxmipura, Taluka Khedbrahma, Gujarat',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'Hiral_and_Chirag_Wedding_Events.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Google Maps
  const handleOpenMaps = (e: React.MouseEvent) => {
    e.stopPropagation();
    const venueQuery = encodeURIComponent('Laxmipura, Khedbrahma, Gujarat');
    window.open(`https://www.google.com/maps/search/?api=1&query=${venueQuery}`, '_blank');
  };

  // WhatsApp Share
  const handleShareWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = encodeURIComponent(
      '✨ Royal Wedding Invitation ✨\n\n' +
      'Together with the blessings of our families, we joyfully invite you to celebrate the wedding of\n' +
      '👑 HIRAL & CHIRAGKUMAR 👑\n\n' +
      '📅 11th & 12th February 2027\n' +
      '📍 Laxmipura, Khedbrahma, Gujarat\n\n' +
      'Click to open our royal invitation envelope:\n' +
      window.location.href
    );
    window.open(`https://api.whatsapp.com/send?text=${shareText}`, '_blank');
  };

  return (
    <main
      id="invitation-app"
      role="region"
      aria-label="Hiral & Chirag Royal Wedding Invitation"
      onClick={handleScreenTap}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Floating Gold Dust Particles */}
      <ParticleCanvas currentScene={currentScene} />

      {/* ROYAL RED EMBOSSED ENVELOPE (PROPER OPENING) */}
      {!isEnvelopeOpen && (
        <RoyalEnvelope onOpen={handleOpenEnvelope} />
      )}

      {/* CLEAN INVITATION CARDS (SHOWN ONCE ENVELOPE OPENS) */}
      {isEnvelopeOpen && (
        <div className="cards-stage-container">

          {/* Minimal Floating Corner Music Toggle */}
          <button
            className="minimal-music-btn"
            onClick={handleToggleMusic}
            aria-label={isPlayingMusic ? 'Mute Music' : 'Play Music'}
            title={isPlayingMusic ? 'Mute Music' : 'Play Music'}
          >
            <div className={`music-bars ${isPlayingMusic ? 'is-playing' : 'is-muted'}`}>
              <span /><span /><span /><span />
            </div>
          </button>

          {/* Minimal Back Button (Left Arrow) */}
          {currentScene > 1 && (
            <button
              className="minimal-nav-arrow arrow-left"
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              aria-label="Previous Card"
            >
              <svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" /></svg>
            </button>
          )}

          {/* Minimal Next Button (Right Arrow) */}
          {currentScene < TOTAL_SCENES && (
            <button
              className="minimal-nav-arrow arrow-right"
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              aria-label="Next Card"
            >
              <svg viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" /></svg>
            </button>
          )}

          {/* 6 Clean Ceremony Cards */}
          <div className="clean-cards-slider">
            {SCENES_DATA.map((scene) => {
              const isActive = scene.id === currentScene;
              const isPast = scene.id < currentScene;

              return (
                <div
                  key={scene.id}
                  className={`invitation-card-slide ${
                    isActive ? 'slide-active' : isPast ? 'slide-past' : 'slide-future'
                  }`}
                  data-scene={scene.id}
                >
                  <img
                    src={scene.image}
                    alt={scene.title}
                    className="card-artwork-image"
                  />

                  {/* Scene 6 Finale Actions & Fireworks */}
                  {scene.id === 6 && (
                    <>
                      <FireworksCanvas active={isActive} />
                      <div className="finale-clean-actions interactive-action">
                        <button
                          className="clean-action-pill pill-replay"
                          onClick={(e) => { e.stopPropagation(); handleReplay(); }}
                          title="Replay Envelope"
                        >
                          <svg viewBox="0 0 24 24"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" /></svg>
                          Replay
                        </button>

                        <button
                          className="clean-action-pill"
                          onClick={handleDownloadCalendar}
                          title="Add to Calendar"
                        >
                          <svg viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" /></svg>
                          Calendar
                        </button>

                        <button
                          className="clean-action-pill"
                          onClick={handleOpenMaps}
                          title="Google Maps Location"
                        >
                          <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
                          Location
                        </button>

                        <button
                          className="clean-action-pill"
                          onClick={handleShareWhatsApp}
                          title="Share on WhatsApp"
                        >
                          <svg viewBox="0 0 24 24"><path d="M16.75 13.96c.25.13.41.2.46.3.06.11.04.61-.21 1.18-.25.56-1.23 1.1-1.74 1.12-.46.02-.91.01-2.96-.8-2.49-.99-4.08-3.52-4.2-3.69-.13-.16-1-1.33-1-2.54 0-1.21.63-1.81.86-2.05.23-.24.5-.3.67-.3.17 0 .34 0 .49.01.16.01.37-.06.57.44.22.53.74 1.82.81 1.95.07.13.11.29.02.47-.09.18-.14.29-.27.45-.14.15-.29.35-.41.47-.14.13-.28.27-.12.54.16.27.71 1.17 1.52 1.89 1.04.93 1.92 1.22 2.19 1.35.27.14.43.12.59-.07.16-.18.69-.8 88-1.08.18-.27.37-.23.62-.14zM12 2a10 10 0 0 0-8.6 15.09L2 22l5.05-1.33A10 10 0 1 0 12 2z" /></svg>
                          Share
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* Royal Wedding Soundtrack */}
      <audio
        ref={audioRef}
        loop
        preload="auto"
        playsInline
      >
        <source src="/assets/audio/wedding-soundtrack.m4a" type="audio/mp4" />
      </audio>
    </main>
  );
}
