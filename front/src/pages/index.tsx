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
              新しい認知シャッフル睡眠法で、
              <br />
              今日も快適な睡眠を...
            </h3>
            <Link href={"/search"}>
              <button className="mt-6 bg-green-600 hover:bg-green-500 font-bold px-12 py-4 rounded-md transition">
                <SearchIcon propClassName="w-7 h-7 stroke-2 inline mr-2"></SearchIcon>
                音声を探す
              </button>
            </Link>
          </div>
        </div>

        <h1 className="text-green-400 text-2xl font-black mt-10 text-center">About</h1>
        <div className="flex flex-col lg:flex-row-reverse items-center">
          <Image
            src={"/top/prehnite_about.webp"}
            alt="#"
            width={240}
            height={240}
            className="rounded-sm lg:w-2/5 mt-4"
          ></Image>
          <div className="lg:mr-4">
            <h3 className="mt-4">
              <b className="text-lg">認知シャッフル睡眠法</b>
              とは、ランダムな単語を次々に思い浮かべながら眠りにつく方法です。
              <br />
              脈絡のない単語を思い浮かべることで、脳は考えることをやめ休息モードに切り替わるため、眠りやすくなります。
            </h3>
            <h3 className="mt-4">
              <b className="text-xl">Prehnite</b>
              は、認知シャッフル睡眠法を行うための音声プレイヤーで、ランダムに単語を読み上げる音声を再生できます。
            </h3>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
