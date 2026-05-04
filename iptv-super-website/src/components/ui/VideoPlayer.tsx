// src/components/ui/VideoPlayer.tsx
'use client';

import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface VideoPlayerProps {
  src: string;
}

export default function VideoPlayer({ src }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let hls: Hls | null = null;
    let onLoadedMetadata: (() => void) | null = null;

    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play();
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      onLoadedMetadata = () => {
        video.play();
      };
      video.addEventListener('loadedmetadata', onLoadedMetadata);
    }

    return () => {
      if (onLoadedMetadata) {
        video.removeEventListener('loadedmetadata', onLoadedMetadata);
      }

      if (hls) {
        hls.destroy();
      }
    };
  }, [src]);

  return <video ref={videoRef} controls width="100%" height="100%" />;
}
