"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";

interface LottiePlayerProps {
  src: string;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
  width?: number;
  height?: number;
}

export default function LottiePlayer({
  src,
  loop = true,
  autoplay = true,
  className,
  width = 200,
  height = 200,
}: LottiePlayerProps) {
  return (
    <div
      className={className}
      style={{ width, height }}
    >
      <DotLottieReact
        src={src}
        loop={loop}
        autoplay={autoplay}
      />
    </div>
  );
}
