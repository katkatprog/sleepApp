import { LoginIcon } from "@/components/icons/LoginIcon";
import { SearchIcon } from "@/components/icons/SearchIcon";
import Link from "next/link";

const HomePage = () => {
  return (
    <>
      <div className="px-8 pt-10">
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-emerald-400 text-6xl font-black">Prehnite</h1>
          <h3 className="text-lg mt-4 font-bold text-center">
            新しい認知シャッフル睡眠法で、
            <br />
            今日も快適な睡眠を...
          </h3>
          <Link href={"/explore"}>
            <button className="mt-6 bg-emerald-600 hover:bg-emerald-500 font-bold px-12 py-4 rounded-md transition">
              <SearchIcon propClassName="w-7 h-7 stroke-2 inline mr-2"></SearchIcon>
              音声を探す
            </button>
          </Link>
        </div>

        <h1 className="text-emerald-400 text-2xl font-black mt-10">
          Prehniteとは？
        </h1>
        <h3 className="mt-4">
          Prehnite(プレナイト)は、
          <b>認知シャッフル睡眠法</b>
          を行うための音声プレイヤーで、ランダムに単語を読み上げる音声を再生できます。
          <br />
          音声は毎日自動生成されるため、
          <b>日々異なる音声による効果の落ちにくい</b>
          認知シャッフル睡眠法を実現できます。
        </h3>

        <h1 className="text-emerald-400 text-2xl font-black mt-10">
          認知シャッフル睡眠法とは？
        </h1>
        <h3 className="mt-4">
          認知シャッフル睡眠法とは、
          <b>ランダムに単語を思い浮かべる動作を繰り返しながら</b>
          眠りにつく方法です。
          <br />
          それを行うことで、
          <b>眠りに入りやすくなります。</b>
        </h3>

        <h1 className="text-emerald-400 text-2xl font-black mt-10">
          ログインすると？
        </h1>
        <h3 className="mt-4">
          ログインすることで、以下のことを行うことができ、より快適にアプリを使うことができます。
        </h3>
        <h3 className="mt-4">
          <li>自分の好きなテーマの音声作成をリクエスト</li>
          <li>音声のいいね</li>
        </h3>

        <div className="flex items-center justify-center">
          <button className="mt-6 bg-emerald-600 hover:bg-emerald-500 font-bold px-12 py-4 rounded-md transition">
            <LoginIcon propClassName="w-7 h-7 stroke-2 inline-block mr-2"></LoginIcon>
            ログイン / 新規登録
          </button>
        </div>
      </div>
    </>
  );
};

export default HomePage;
