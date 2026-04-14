"use client";

import { useState } from "react";

interface StarRatingProps {
  value?: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

const SIZES = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

export function StarRating({
  value = 0,
  onChange,
  readonly = false,
  size = "md",
}: StarRatingProps) {
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? value;
  const sizeClass = SIZES[size];

  const handleClick = (starIndex: number, isLeft: boolean) => {
    if (readonly || !onChange) return;
    const rating = isLeft ? starIndex + 0.5 : starIndex + 1;
    // Toggle off if clicking the same rating
    onChange(rating === value ? 0 : rating);
  };

  return (
    <div
      className="inline-flex gap-0.5"
      onMouseLeave={() => !readonly && setHover(null)}
    >
      {[0, 1, 2, 3, 4].map((i) => {
        const filled = display >= i + 1;
        const half = !filled && display >= i + 0.5;

        return (
          <div key={i} className={`relative ${sizeClass} ${readonly ? "" : "cursor-pointer"}`}>
            {/* Left half (half star) */}
            {!readonly && (
              <div
                className="absolute inset-y-0 left-0 w-1/2 z-10"
                onMouseEnter={() => setHover(i + 0.5)}
                onClick={() => handleClick(i, true)}
              />
            )}
            {/* Right half (full star) */}
            {!readonly && (
              <div
                className="absolute inset-y-0 right-0 w-1/2 z-10"
                onMouseEnter={() => setHover(i + 1)}
                onClick={() => handleClick(i, false)}
              />
            )}
            <svg
              viewBox="0 0 24 24"
              className={`${sizeClass} transition-colors`}
            >
              <defs>
                <clipPath id={`half-${i}`}>
                  <rect x="0" y="0" width="12" height="24" />
                </clipPath>
              </defs>
              {/* Empty star background */}
              <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-border"
              />
              {/* Filled star */}
              {filled && (
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  fill="currentColor"
                  className="text-amber-400"
                />
              )}
              {/* Half star */}
              {half && (
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  fill="currentColor"
                  clipPath={`url(#half-${i})`}
                  className="text-amber-400"
                />
              )}
            </svg>
          </div>
        );
      })}
    </div>
  );
}
