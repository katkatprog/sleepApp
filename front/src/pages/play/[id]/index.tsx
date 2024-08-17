import { PlayButton } from "@/components/PlayButton";
import { secondFormat } from "@/utils/usefulFunctions";
import { GetServerSideProps } from "next";
import Image from "next/image";
import React, { useContext, useEffect, useRef, useState } from "react";
import { SoundInfo } from "@prisma/client";
import { Layout } from "@/components/Layout";
import { UserIcon } from "@/components/icons/UserIcon";
import { LoginUserContext } from "@/pages/_app";
import { useRouter } from "next/router";
import { HeartIcon } from "@/components/icons/HeartIcon";
import { toast } from "react-toastify";

const PlayPage = ({ soundInfo }: SoundInfoProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const context = useContext(LoginUserContext);
  const [isPlaying, setIsPlaying] = useState(false);
  const [totalTime, setTotalTime] = useState("0:00");
  const [currentTime, setCurrentTime] = useState("0:00");
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(soundInfo.favoriteCount); //いいね数はSSRで取得するが、いいねボタンを押した際変更されるので、stateでも保持する
  const [imageUrl, setImageUrl] = useState("");
  const router = useRouter();

  // 中央に表示する画像を決定
  useEffect(() => {
    if (soundInfo.requestedBy?.image) {
      // リクエストされた音声で、なおかつ顔写真が設定されていたら、それを中央に表示する
      setImageUrl(soundInfo.requestedBy.image);
    } else {
      // 上記以外の場合、予め用意した画像をランダムに表示する
      setImageUrl(`/playing/${Math.floor(Math.random() * 3)}.webp`);
    }
    // 別ページに移った際、表示画像の決め直しを行う
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.id]);

  // 音声の全体時間が明らかになったとき、ステートにセットする
  useEffect(() => {
    const strTotalTime = secondFormat(audioRef.current?.duration || 0);
    setTotalTime(strTotalTime);
  }, [audioRef.current?.duration]);

  // いいね状態を取得する
  useEffect(() => {
    // async, awaitを使うため、即時実行関数の形にする
    (async () => {
      // ログインしているなら呼ぶ
      if (context.loginUser) {
        const result = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/sound-favorite/${router.query.id}/`,
          {
            credentials: "include",
          },
        );
        setIsFavorite((await result.json()).status as boolean);
      }
    })();

    // 第2引数の配列
    // リロード時を考え、ログインユーザーがセットされたときに実行されるようにcontext.loginUserを指定
    // また、別の音声再生ページに遷移したときに実行されるようにrouter.query.id（パスパラメータ）を指定
  }, [context.loginUser, router.query.id]);

  return (
    <Layout>
      <div className="p-7">
        <div>
          <div className="flex items-center justify-between">
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
            <button
              className="flex"
              onClick={async () => {
                try {
                  if (context.loginUser) {
                    await fetch(
                      `${process.env.NEXT_PUBLIC_API_URL}/sound-favorite/${router.query.id}/`,
                      {
                        method: "POST",
                        credentials: "include",
                        headers: {
                          "content-type": "application/json",
                        },
                      },
                    );
                    setFavoriteCount(
                      () => favoriteCount + (isFavorite ? -1 : 1),
                    );
                    setIsFavorite(() => !isFavorite);
                  } else {
                    toast.info("いいねするにはログインしてください。");
                  }
                } catch (error) {
                  toast.info("いいねできませんでした。再度お試しください。");
                }
              }}
            >
              <HeartIcon
                propClassName={`size-6 ${isFavorite && `text-pink-400`}`}
              ></HeartIcon>
              <span className="ml-1">{favoriteCount}</span>
            </button>
          </div>
          <div className="flex justify-between mt-3">
            <p className="">
              {new Date(soundInfo.createdAt).toLocaleDateString()}
            </p>
            {soundInfo.requestedBy && (
              <p className=" mr-1">
                Requested by {soundInfo.requestedBy.userName}
              </p>
            )}
          </div>
          <p>{`${soundInfo.playCount} 回再生`}</p>
        </div>
        <div className="flex justify-center mt-8">
          <Image
            src={imageUrl}
            alt="#"
            width={"320"}
            height={"320"}
            className="rounded-2xl"
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
  const result = await fetch(
    `${process.env.API_URL}/sound-info/single/${context.params?.id}`,
  );

  if (result.status === 404) {
    return { notFound: true };
  }
  if (result.status !== 200) {
    throw new Error("Something went wrong...");
  }

  const soundInfo: SoundInfo & {
    user: {
      id: number;
      name: string;
      image: string | null;
    } | null;
    SoundFavorite: { userId: number }[];
  } = await result.json();

  return {
    props: {
      soundInfo: {
        name: soundInfo.name,
        createdAt: soundInfo.createdAt,
        url: soundInfo.url,
        isMaleVoice: soundInfo.isMaleVoice,
        playCount: soundInfo.playCount,
        requestedBy: soundInfo.user
          ? {
              userId: soundInfo.user.id,
              userName: soundInfo.user.name,
              image: soundInfo.user.image,
            }
          : null,
        favoriteCount: soundInfo.SoundFavorite.length,
      },
    },
  };
};

interface SoundInfoProps {
  soundInfo: {
    name: string;
    createdAt: Date;
    requestedBy: {
      userId: number;
      userName: string;
      image: string | null;
    } | null;
    url: string | undefined;
    isMaleVoice: boolean | null;
    playCount: number;
    favoriteCount: number;
  };
}
