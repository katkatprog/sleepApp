import { PlayButton } from "../../../components/PlayButton";
import { secondFormat } from "../../../utils/usefulFunctions";
import { GetServerSideProps } from "next";
import Image from "next/image";
import React, { useContext, useEffect, useRef, useState } from "react";
import { SoundInfo } from "@prisma/client";
import { LoginUserContext } from "../../_app";
import { useRouter } from "next/router";
import { HeartIcon } from "../../../components/icons/HeartIcon";
import { toast } from "react-toastify";
import Head from "next/head";

const PlayPage = ({ soundInfo }: SSRProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const rangeRef = useRef<HTMLInputElement>(null);
  const userCtx = useContext(LoginUserContext);
  const [isPlaying, setIsPlaying] = useState(false);
  const [totalTime, setTotalTime] = useState("0:00");
  const [currentTime, setCurrentTime] = useState("0:00");
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(soundInfo.favoriteCount); //いいね数はSSRで取得するが、いいねボタンを押した際変更されるので、stateでも保持する
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const processRef = useRef(false);

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
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sound-favorite/${router.query.id}/`,
        {
          credentials: "include",
        },
      );

      // ステータスが200の場合のみいいね状態をstateに格納、他のステータスの場合はそのまま(falseのまま)
      if (res.status === 200) {
        setIsFavorite((await res.json()).status as boolean);
      }
      setIsLoading(false);
    })();

    // 第2引数の配列
    // 別の音声再生ページに遷移したときに実行されるようにrouter.query.id（パスパラメータ）を指定
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.id]);

  return (
    <>
      <Head>
        <title>{`${soundInfo.name} / Prehnite`}</title>
      </Head>
      <div className="p-7">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h1 className=" text-2xl font-bold mr-2">{soundInfo.name}</h1>
            {soundInfo.isMaleVoice !== null &&
              (soundInfo.isMaleVoice ? (
                <Image
                  alt="#"
                  src={"/etc/male_icon.svg"}
                  width={32}
                  height={32}
                ></Image>
              ) : (
                <Image
                  alt="#"
                  src={"/etc/female_icon.svg"}
                  width={32}
                  height={32}
                ></Image>
              ))}
          </div>
        </div>
        <div className="flex justify-between mt-2">
          <p className="">
            {new Date(soundInfo.createdAt).toLocaleDateString()}
          </p>
          {soundInfo.requestedBy && (
            <p className=" mr-1">
              Requested by {soundInfo.requestedBy.userName}
            </p>
          )}
        </div>
        <div className="flex justify-between">
          <p>{`${soundInfo.playCount} 回再生`}</p>
          {!isLoading && (
            <button
              className="flex"
              onClick={async () => {
                if (processRef.current) {
                  return;
                }
                processRef.current = true;

                try {
                  if (userCtx.loginUser) {
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
                    toast.info("いいねするにはログインが必要です。");
                    router.push(`/login?redirect_to=${router.query.id}`);
                  }
                } catch (error) {
                  toast.info("いいねできませんでした。再度お試しください。");
                } finally {
                  processRef.current = false;
                }
              }}
            >
              <HeartIcon
                propClassName={`size-6 ${isFavorite && `text-pink-400`}`}
              ></HeartIcon>
              <span className="ml-1">{favoriteCount}</span>
            </button>
          )}
        </div>
        <div className="flex justify-center mt-2 max-w-full">
          <div className="flex flex-col items-center max-w-96 w-5/6">
            <Image
              src={soundInfo.imageUrl}
              alt="#"
              width={360}
              height={360}
              className="rounded-2xl"
            ></Image>
            <audio
              ref={audioRef}
              src={soundInfo.url}
              onTimeUpdate={() => {
                if (
                  !audioRef.current?.currentTime ||
                  !audioRef.current?.duration ||
                  !rangeRef.current
                ) {
                  return;
                }

                const strCurrentTime = secondFormat(
                  audioRef.current?.currentTime || 0,
                );
                setCurrentTime(strCurrentTime);

                // プログレスバーのサムの位置を更新
                rangeRef.current.value = Math.ceil(
                  (audioRef.current?.currentTime / audioRef.current.duration) *
                    3000,
                ).toString();
              }}
              onEnded={() => {
                setIsPlaying(false);
              }}
            ></audio>

            <input
              type="range"
              min={1}
              max={3000}
              defaultValue={1}
              ref={rangeRef}
              className="appearance-none w-full h-1 mt-6 border-none outline-none rounded-sm cursor-pointer bg-green-400 slider"
              onInput={() => {
                // プログレスバーを直接操作されたときの動作
                if (
                  !audioRef.current?.currentTime ||
                  !audioRef.current?.duration ||
                  !rangeRef.current?.value
                ) {
                  return;
                }

                audioRef.current.currentTime =
                  (audioRef.current.duration *
                    parseInt(rangeRef.current.value)) /
                  3000;
              }}
            />
            <div className="flex justify-between mt-2 w-full">
              <span className="text-green-400">{currentTime}</span>
              <span className="text-green-400">{totalTime}</span>
            </div>
            <div className="flex justify-center">
              <PlayButton
                audioRef={audioRef}
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
              ></PlayButton>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default PlayPage;

export const getServerSideProps: GetServerSideProps<SSRProps> = async (
  ssrCtx,
) => {
  // APIから音声情報を取得
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/sound-info/single/${ssrCtx.params?.id}`,
  );

  if (res.status === 404) {
    return { notFound: true };
  }
  if (res.status !== 200) {
    throw new Error("Something went wrong...");
  }

  const soundInfo: SoundInfo & {
    user: {
      id: number;
      name: string;
      image: string | null;
    } | null;
    SoundFavorite: { userId: number }[];
  } = await res.json();

  // 中央に表示する画像を決定
  let imageUrl: string;
  if (soundInfo.user?.image) {
    // リクエストされた音声で、なおかつ顔写真が設定されていたら、それを中央に表示する
    imageUrl = soundInfo.user.image;
  } else {
    // 上記以外の場合、予め用意した画像をランダムに表示する
    imageUrl = `/playing/${Math.floor(Math.random() * 3)}.webp`;
  }

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
            }
          : null,
        favoriteCount: soundInfo.SoundFavorite.length,
        imageUrl,
      },
    },
  };
};

interface SSRProps {
  soundInfo: {
    name: string;
    createdAt: Date;
    requestedBy: {
      userId: number;
      userName: string;
    } | null;
    url: string | undefined;
    isMaleVoice: boolean | null;
    playCount: number;
    favoriteCount: number;
    imageUrl: string;
  };
}
