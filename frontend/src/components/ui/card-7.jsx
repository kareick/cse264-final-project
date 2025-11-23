"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function InteractiveProductCard({
  className,
  imageUrl,
  title,
  description,
  price,
  ...props
}) {
  const cardRef = React.useRef(null);
  const [style, setStyle] = React.useState({});

  // --- MOUSE MOVE HANDLER ---
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;

    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;

    const rotateX = ((y - height / 2) / (height / 2)) * -6;
    const rotateY = ((x - width / 2) / (width / 2)) * 6;

    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.04, 1.04, 1.04)`,
      transition: "transform 0.1s ease-out",
    });
  };

  // --- MOUSE LEAVE HANDLER ---
  const handleMouseLeave = () => {
    setStyle({
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
      transition: "transform 0.4s ease-in-out",
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={style}
      className={cn(
        // FINAL PERFECT SIZE:
        "relative w-full h-full aspect-[6/4] rounded-3xl bg-card shadow-xl",
        "transform-style-3d overflow-hidden",
        className
      )}
      {...props}
    >
      {/* Background Image */}
      <img
        src={imageUrl}
        alt={title}
        className="absolute inset-0 h-full w-full object-cover"
        style={{
          transform: "translateZ(-30px) scale(1.1)",
        }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />

      {/* Foreground Content */}
      <div
        className="absolute inset-0 p-4 flex flex-col"
        style={{ transform: "translateZ(40px)" }}
      >
        {/* Header Glass Card */}
        <div className="flex items-start justify-between rounded-xl border border-white/20 bg-black/60 p-3 backdrop-blur-md shadow-lg">
          <div className="flex flex-col">
            <h3 className="text-lg font-bold text-white drop-shadow-lg">{title}</h3>
            <p className="text-xs text-white/90 drop-shadow-md">{description}</p>
          </div>
        </div>

        {/* Price */}
        <div className="absolute top-[95px] left-4">
          <div className="rounded-full bg-black/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm shadow-lg border border-white/20">
            {price}
          </div>
        </div>

        {/* Pagination Dots */}
        <div className="mt-auto flex w-full justify-center gap-1 pb-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                i === 0 ? "bg-white" : "bg-white/30"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
