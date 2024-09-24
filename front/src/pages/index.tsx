import { Layout } from "@/components/Layout";
import { LoginIcon } from "@/components/icons/LoginIcon";
import { SearchIcon } from "@/components/icons/SearchIcon";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

const HomePage = () => {
  return (
    <Layout>
      <Head>
        <title>Prehnite</title>
      </Head>
      <div className="px-8 pt-10">
        <div className="flex justify-center">
          <div
            className={`flex flex-col items-center justify-center bg-[url('/top/prehnite_theme.webp')] h-80 w-full bg-top bg-cover`}
          >
            <h1 className="text-green-400 text-6xl font-black">Prehnite</h1>
            <h3 className="text-lg mt-4 font-bold text-center">
              AIによる認知シャッフル睡眠法で
              <br />
              今日も快適な睡眠を…
            </h3>
            <Link href={"/search"}>
              <button className="mt-6 bg-green-600 hover:bg-green-500 font-bold px-12 py-4 rounded-md transition">
                <SearchIcon propClassName="w-7 h-7 stroke-2 inline mr-2"></SearchIcon>
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
          <div className="mt-4 xl:mr-4">
            <p>
              <span className="text-lg font-bold">認知シャッフル睡眠法</span>
              とは、以下の例のようにランダムな単語を次々に思い浮かべながら眠りにつく方法です。
            </p>
            <blockquote className="p-4 my-2 border-s-4 border-neutral-400 bg-neutral-700">
              <p className="text-center italic">
                チューリップ、ギター、飛行機…
              </p>
            </blockquote>
            <p>
              脈絡のない単語を思い浮かべることで、脳は考えることをやめ休息モードに切り替わるため、眠りやすくなります。
            </p>

            <p className="mt-4">
              <span className="text-xl font-bold">Prehnite</span>
              は、認知シャッフル睡眠法を行うための音声プレイヤーで、ランダムに単語を読み上げる音声を再生できます。
            </p>
          </div>
        </div>

        <h1 className="text-green-400 text-3xl font-black mt-10 text-center">
          Points
        </h1>
        <div className="flex flex-col items-center xl:flex-row-reverse xl:items-start">
          <Image
            src={"/top/prehnite_ai.webp"}
            alt="#"
            width={240}
            height={240}
            className="rounded-sm mt-4 xl:w-2/5"
          ></Image>
          <div className="mt-4 xl:mr-4">
            <h3 className="text-lg font-bold">
              AIが単語読み上げ音声を自動生成
            </h3>
            <p className="mt-2">
              毎日1回、AIがランダムに単語を生成し、それを読み上げる音声を作成します。
            </p>
            <p>
              日々違った音声を使うことで、効果の落ちにくい認知シャッフル睡眠法を実現できます。
            </p>
          </div>
        </div>
        <div className="mb-24 flex flex-col items-center xl:flex-row-reverse xl:items-start">
          <Image
            src={"/top/prehnite_summer.webp"}
            alt="#"
            width={240}
            height={240}
            className="rounded-sm mt-4 xl:w-2/5"
          ></Image>
          <div className="mt-4 xl:mr-4">
            <h3>
              <span className="rounded-md px-1 bg-green-900 text-green-100 border-green-100 border text-sm">
                要ログイン
              </span>
              <span className="text-lg font-bold ml-2">
                単語のテーマをリクエスト可能
              </span>
            </h3>
            <p className="mt-2">
              好きなテーマでの単語読み上げ音声をリクエストすることができます。
            </p>
            <p>例えば、「夏」というテーマでリクエストした場合、</p>
            <blockquote className="p-4 my-2 border-s-4 border-neutral-400 bg-neutral-700">
              <p className="text-center italic">海、花火、アイスクリーム、…</p>
            </blockquote>
            <p>というようにテーマに沿った単語が読み上げられます。</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
