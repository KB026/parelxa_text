"use client";

import React, { useEffect, useState, useRef } from "react";

interface DynamicBackgroundProps {
  type: "hero" | "footer";
}

export function DynamicBackground({ type }: DynamicBackgroundProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const requestRef = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }

      requestRef.current = requestAnimationFrame(() => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        });
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  const gradientStyle =
    type === "hero"
      ? {
          background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(99, 102, 241, 0.08), transparent 40%)`,
        }
      : {
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(245, 158, 11, 0.06), rgba(99, 102, 241, 0.04), transparent 50%)`,
        };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-300"
      style={gradientStyle}
    />
  );
}
