'use client';

import { useState, useEffect } from 'react';

export default function CrystalElements() {
  const [mounted, setMounted] = useState(false);
  const [crystals, setCrystals] = useState<Array<{
    size: number;
    left: number;
    top: number;
    delay: number;
    duration: number;
  }>>([]);

  useEffect(() => {
    // Only generate random values on client side
    setMounted(true);
    const crystalData = Array.from({ length: 15 }).map(() => ({
      size: Math.random() * 20 + 15,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 15 + Math.random() * 10,
    }));
    setCrystals(crystalData);
  }, []);

  if (!mounted) {
    return null; // Don't render on server to prevent hydration mismatch
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Small black crystal shapes scattered */}
      {crystals.map((crystal, i) => (
        <div
          key={i}
          className="absolute opacity-40"
          style={{
            left: `${crystal.left}%`,
            top: `${crystal.top}%`,
            width: `${crystal.size}px`,
            height: `${crystal.size}px`,
            animation: `crystalFloat ${crystal.duration}s ease-in-out infinite`,
            animationDelay: `${crystal.delay}s`,
          }}
        >
          <svg
            width={crystal.size}
            height={crystal.size}
            viewBox="0 0 40 40"
            className="text-gray-900"
          >
            <path
              d="M20 0 L30 15 L20 30 L10 15 Z"
              fill="currentColor"
              opacity="0.6"
            />
          </svg>
        </div>
      ))}
    </div>
  );
}

