"use client";

import { useAudio } from '@/components/shared/audio-utils';
import { FaVolumeHigh, FaVolumeLow } from 'react-icons/fa6';

type AudioPlayerProps = {
  audioUrl: string;
};

export default function AudioPlayer({ audioUrl }: AudioPlayerProps) {
  const { isPlaying, toggle, audio } = useAudio(audioUrl);
  const isMuted = audio?.muted || false;

  const handleMuteToggle = () => {
    if (audio) {
      audio.muted = !audio.muted;
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={toggle}
        className="text-blue-500 hover:text-blue-700 focus:outline-none"
      >
        {isPlaying ? "Пауза" : "Слушать"}
      </button>
      <button
        onClick={handleMuteToggle}
        className="text-gray-500 hover:text-gray-700 focus:outline-none"
      >
        {isMuted ? <FaVolumeLow /> : <FaVolumeHigh />}
      </button>
    </div>
  );
} 