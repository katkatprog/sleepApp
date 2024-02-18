import { PlayButton } from "@/components/PlayButton";
import { secondFormat } from "@/utils/usefulFunctions";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

const Play = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState("0:00");
  const [currentTime, setCurrentTime] = useState("0:00");

  // 音声の全体時間が明らかになったとき、ステートにセットする
  useEffect(() => {
    const strDuration = secondFormat(audioRef.current?.duration || 0);
    setDuration(strDuration);
  }, [audioRef.current?.duration]);

  const soundInfo = {
    name: "本日の音声",
    createdDate: new Date("2024/1/1"),
    requestedBy: {
      userId: 1,
      userName: "Taro",
      image: "/image/1.jpg",
    },
    url: "/sound/test.mp3",
  };

  return (
    <div className="p-7">
      <div>
        <h1 className=" text-2xl font-bold">{soundInfo.name}</h1>
        <div className="flex justify-between mt-3">
          <p className="">{soundInfo.createdDate.toLocaleDateString()}</p>
          {soundInfo.requestedBy.userId && (
            <div className="flex">
              <p className=" mr-1">
                Requested by {soundInfo.requestedBy.userName}
              </p>
              <Image
                src={soundInfo.requestedBy.image}
                width={30}
                height={30}
                alt=""
                className="rounded-full"
              ></Image>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center mt-8">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-40 h-40 text-emerald-400"
        >
          <path
            fillRule="evenodd"
            d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      <audio
        ref={audioRef}
        src={soundInfo.url}
        onTimeUpdate={() => {
          const strCurrentTime = secondFormat(
            audioRef.current?.currentTime || 0,
          );
          setCurrentTime(strCurrentTime);
        }}
        onEnded={() => {
          setIsPlaying(false);
        }}
      ></audio>

      <div className="flex justify-center">
        <div className="h-20 mt-10 flex justify-between items-center w-60">
          <PlayButton
            audioRef={audioRef}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
          ></PlayButton>
          <p className="text-emerald-400 ml-6">{`${currentTime} / ${duration}`}</p>
        </div>
      </div>
    </div>
  );
};

export default Play;
