import { PlayButton } from "@/components/PlayButton";
import { secondFormat } from "@/utils/usefulFunctions";
import { GetServerSideProps } from "next";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { SoundInfo } from "@prisma/client";
import { Layout } from "@/components/Layout";

const PlayPage = ({ soundInfo }: SoundInfoProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [totalTime, setTotalTime] = useState("0:00");
  const [currentTime, setCurrentTime] = useState("0:00");

  // 音声の全体時間が明らかになったとき、ステートにセットする
  useEffect(() => {
    const strTotalTime = secondFormat(audioRef.current?.duration || 0);
    setTotalTime(strTotalTime);
  }, [audioRef.current?.duration]);

  return (
    <Layout>
      <div className="p-7">
        <div>
          <div className="flex items-center">
            <h1 className=" text-2xl font-bold mr-2">{soundInfo.name}</h1>
            {soundInfo.isMaleVoice !== null &&
              (soundInfo.isMaleVoice ? (
                <Image
                  alt="#"
                  src={"/male_icon.svg"}
                  width={32}
                  height={32}
                ></Image>
              ) : (
                <Image
                  alt="#"
                  src={"/female_icon.svg"}
                  width={32}
                  height={32}
                ></Image>
              ))}
          </div>
          <div className="flex justify-between mt-3">
            <p className="">
              {new Date(soundInfo.createdAt).toLocaleDateString()}
            </p>
            {soundInfo.requestedBy && (
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
          <p>{`${soundInfo.playCount} 回再生`}</p>
        </div>
        <div className="flex justify-center mt-8">
          <Image
            src={"/prehnite_icon.svg"}
            alt="#"
            width={"180"}
            height={"180"}
          ></Image>
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
            <p className="text-green-400 ml-6">{`${currentTime} / ${totalTime}`}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};
export default PlayPage;

export const getServerSideProps: GetServerSideProps<SoundInfoProps> = async (
  context,
) => {
  // APIから音声情報を取得
  const response = await fetch(
    `${process.env.API_URL}/sound-info/single/${context.params?.id}`,
  );
  const soundInfo: SoundInfo = await response.json();

  return {
    props: {
      soundInfo: {
        ...soundInfo,
        requestedBy: {
          userId: 1,
          userName: "Taro",
          image: "/image/1.jpg",
        },
      },
    },
  };
};

interface SoundInfoProps {
  soundInfo: {
    name: string;
    createdAt: Date;
    requestedBy:
      | {
          userId: number;
          userName: string;
          image: string;
        }
      | undefined;
    url: string | undefined;
    isMaleVoice: boolean | null;
    playCount: number;
  };
}
