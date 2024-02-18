import Image from "next/image";
import React from "react";

const Play = () => {
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
        <h1 className="text-gray-300 text-2xl font-bold">{soundInfo.name}</h1>
        <div className="flex justify-between mt-3">
          <p className="text-gray-300">
            {soundInfo.createdDate.toLocaleDateString()}
          </p>
          {soundInfo.requestedBy.userId && (
            <div className="flex">
              <p className="text-gray-300 mr-1">
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

      <div className="mt-10 flex justify-center">
        <audio controls src={soundInfo.url}></audio>
      </div>
    </div>
  );
};

export default Play;
