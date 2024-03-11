import React from "react";
import { PlayIcon } from "./icons/PlayIcon";
import { PauseIcon } from "./icons/PauseIcon";

export const PlayButton = ({
  audioRef,
  isPlaying,
  setIsPlaying,
}: {
  audioRef: React.RefObject<HTMLAudioElement>;
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <button
      className="border-4 border-emerald-400 h-16 w-16 rounded-full flex justify-center items-center hover:bg-neutral-700"
      onClick={() => {
        if (isPlaying) {
          audioRef.current?.pause();
          setIsPlaying(false);
        } else {
          audioRef.current?.play();
          setIsPlaying(true);
        }
      }}
    >
      {isPlaying ? (
        <PauseIcon propClassName="w-10 h-10 text-emerald-400 stroke-2"></PauseIcon>
      ) : (
        <PlayIcon prosClassName="w-10 h-10 text-emerald-400 stroke-2"></PlayIcon>
      )}
    </button>
  );
};
