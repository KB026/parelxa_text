'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export function WhyParlexa3DLogo() {
  const logoSrc = '/press-kit/parlexa-logo-mark.png';

  return (
    <div className="relative w-full h-full flex items-center justify-center p-4">
      
      {/* Outer Continuous Ambient Rotation Wrapper (activates after 4-piece assembly) */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 26, ease: 'linear' }}
        className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center"
      >
        {/* Subtle Backdrop Radial Glow behind assembled logo */}
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/30 via-indigo-500/20 to-blue-600/30 rounded-full blur-2xl pointer-events-none" />

        {/* 4-Quadrant Assembly Grid Container */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
          className="relative w-56 h-56 sm:w-72 sm:h-72 grid grid-cols-2 grid-rows-2 drop-shadow-[0_0_35px_rgba(168,85,247,0.55)]"
        >
          {/* Top-Left Quadrant */}
          <div className="relative w-full h-full overflow-hidden">
            <motion.div
              variants={{
                hidden: { x: -80, y: -80, opacity: 0, rotate: -15, scale: 0.85 },
                visible: {
                  x: 0,
                  y: 0,
                  opacity: 1,
                  rotate: 0,
                  scale: 1,
                  transition: { duration: 0.95, delay: 0.0, ease: [0.16, 1, 0.3, 1] },
                },
              }}
              className="absolute top-0 left-0 w-[200%] h-[200%]"
            >
              <Image
                src={logoSrc}
                alt="Parlexa Logo Mark - Top Left"
                fill
                sizes="(max-width: 640px) 224px, 288px"
                priority
                className="object-contain"
              />
            </motion.div>
          </div>

          {/* Top-Right Quadrant */}
          <div className="relative w-full h-full overflow-hidden">
            <motion.div
              variants={{
                hidden: { x: 80, y: -80, opacity: 0, rotate: 15, scale: 0.85 },
                visible: {
                  x: 0,
                  y: 0,
                  opacity: 1,
                  rotate: 0,
                  scale: 1,
                  transition: { duration: 0.95, delay: 0.08, ease: [0.16, 1, 0.3, 1] },
                },
              }}
              className="absolute top-0 right-0 w-[200%] h-[200%]"
            >
              <Image
                src={logoSrc}
                alt="Parlexa Logo Mark - Top Right"
                fill
                sizes="(max-width: 640px) 224px, 288px"
                priority
                className="object-contain"
              />
            </motion.div>
          </div>

          {/* Bottom-Left Quadrant */}
          <div className="relative w-full h-full overflow-hidden">
            <motion.div
              variants={{
                hidden: { x: -80, y: 80, opacity: 0, rotate: 15, scale: 0.85 },
                visible: {
                  x: 0,
                  y: 0,
                  opacity: 1,
                  rotate: 0,
                  scale: 1,
                  transition: { duration: 0.95, delay: 0.16, ease: [0.16, 1, 0.3, 1] },
                },
              }}
              className="absolute bottom-0 left-0 w-[200%] h-[200%]"
            >
              <Image
                src={logoSrc}
                alt="Parlexa Logo Mark - Bottom Left"
                fill
                sizes="(max-width: 640px) 224px, 288px"
                priority
                className="object-contain"
              />
            </motion.div>
          </div>

          {/* Bottom-Right Quadrant */}
          <div className="relative w-full h-full overflow-hidden">
            <motion.div
              variants={{
                hidden: { x: 80, y: 80, opacity: 0, rotate: -15, scale: 0.85 },
                visible: {
                  x: 0,
                  y: 0,
                  opacity: 1,
                  rotate: 0,
                  scale: 1,
                  transition: { duration: 0.95, delay: 0.24, ease: [0.16, 1, 0.3, 1] },
                },
              }}
              className="absolute bottom-0 right-0 w-[200%] h-[200%]"
            >
              <Image
                src={logoSrc}
                alt="Parlexa Logo Mark - Bottom Right"
                fill
                sizes="(max-width: 640px) 224px, 288px"
                priority
                className="object-contain"
              />
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

    </div>
  );
}
