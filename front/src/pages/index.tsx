import { CircleIcon } from "@/components/icons/CircleIcon";
import { SearchIcon } from "../components/icons/SearchIcon";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const HomePage = () => {
  const [isMovingToSearch, setIsMovingToSearch] = useState(false);

  return (
    <>
      <Head>
        <title>Prehnite</title>
      </Head>
      <div className="px-8 pt-10">
        <div className="flex justify-center">
          <div
            className={`flex flex-col items-center justify-center bg-[url('/top/prehnite_theme.webp')] h-80 w-full bg-top bg-cover`}
          >
            <h1 className="text-green-400 text-6xl font-black">Prehnite</h1>
            <h3 className="text-lg mt-6 font-bold text-center">
              AIによる認知シャッフル睡眠法で
              <br />
              今日も快適な睡眠を…
            </h3>
            <Link href={"/search/1"}>
              <button
                className="mt-6 bg-green-600 hover:bg-green-500 font-bold px-12 py-4 rounded-md transition"
                onClick={() => {
                  setIsMovingToSearch(true);
                }}
              >
                {isMovingToSearch ? (
                  <CircleIcon propClassName="w-7 h-7 stroke-2 inline mr-2 animate-spin"></CircleIcon>
                ) : (
                  <SearchIcon propClassName="w-7 h-7 stroke-2 inline mr-2"></SearchIcon>
                )}
                音声を探す
              </button>
            </Link>
          </div>
        </div>

        <h1 className="text-green-400 text-3xl font-black mt-10 text-center">
          About
        </h1>
        <div className="flex flex-col items-center xl:flex-row-reverse xl:items-start">
          <Image
            src={"/top/prehnite_about.webp"}
            alt="#"
            width={240}
            height={240}
            className="rounded-sm mt-4 xl:w-2/5"
          ></Image>
          <div className="mt-4 max-w-sm xl:mr-4">
            <p>
              <span className="text-lg font-bold">認知シャッフル睡眠法</span>
              とは、ランダムな単語を次々に思い浮かべながら眠る方法です。
            </p>
            <blockquote className="p-4 my-2 border-s-4 border-neutral-400 bg-neutral-700">
              <p>
                <span>例:</span>
                <span className="text-center italic ml-2">
                  チューリップ、ギター、飛行機…
                </span>
              </p>
            </blockquote>
            <p>
              これによって脳が自然と休息モードに切り替わり、眠りにつきやすくなります。
            </p>
            <br />
            <p>
              <span className="text-lg font-bold">Prehnite</span>
              は、認知シャッフル睡眠法のための単語読み上げ音声を再生できるサービスです。
            </p>
          </div>
        </div>

        <h1 className="text-green-400 text-3xl font-black mt-10 text-center">
          Points
        </h1>
        <h3 className="text-lg font-bold text-center mt-4 xl:text-start xl:ml-6 mb-4 xl:mb-2">
          AIによる単語読み上げ音声
        </h3>
        <div className="flex flex-col items-center xl:flex-row-reverse xl:items-start">
          <Image
            src={"/top/prehnite_ai.webp"}
            alt="#"
            width={240}
            height={240}
            className="rounded-sm mb-4 xl:w-2/5"
          ></Image>
          <div className="max-w-sm xl:mr-4">
            <p>Prehniteでは、認知シャッフル睡眠法用の音声をAIが作成します。</p>
            <p>どういった単語が登場するかは、音声が作られるまでお楽しみ…</p>
          </div>
        </div>

        <h3 className="text-lg font-bold text-center mt-6 xl:text-start xl:ml-6 mb-4 xl:mb-2">
          日次の音声自動作成
        </h3>
        <div className="flex flex-col items-center xl:flex-row-reverse xl:items-start">
          <Image
            src={"/top/prehnite_daily.webp"}
            alt="#"
            width={240}
            height={240}
            className="rounded-sm mb-4 xl:w-2/5"
          ></Image>
          <div className="max-w-sm xl:mr-4">
            <p>単語読み上げ音声は毎日21:00に自動作成されます。</p>
            <p>
              日々違った音声を使うことで、効果の落ちにくい認知シャッフル睡眠法を実現できます。
            </p>
          </div>
        </div>

        <h3 className="text-center mt-6 xl:text-start xl:ml-6 mb-4 xl:mb-2">
          <span className="rounded-md px-1 bg-green-900 text-green-100 border-green-100 border text-sm">
            要ログイン
          </span>
          <span className="text-lg font-bold ml-2">単語テーマのリクエスト</span>
        </h3>
        <div className="mb-24 flex flex-col items-center xl:flex-row-reverse xl:items-start">
          <Image
            src={"/top/prehnite_summer.webp"}
            alt="#"
            width={240}
            height={240}
            className="rounded-sm mb-4 xl:w-2/5"
          ></Image>
          <div className="max-w-sm xl:mr-4">
            <p>
              好きなテーマでの単語読み上げ音声をリクエストすることができます。
            </p>
            <blockquote className="p-4 my-2 border-s-4 border-neutral-400 bg-neutral-700">
              <p className="">例:「夏」</p>
              <p className="text-center italic">海、花火、アイスクリーム、…</p>
            </blockquote>
            <p>※1度に出せるリクエストは1つまでです</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;
