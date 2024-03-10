import Link from "next/link";

const HomePage = () => {
  return (
    <>
      <div className="px-8 pt-10">
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-emerald-400 text-6xl font-black">Prehnite</h1>
          <h3 className="text-lg mt-4 font-bold">
            新しい認知シャッフル睡眠法で、
          </h3>
          <h3 className="text-lg font-bold">昨日と違う入眠を...</h3>
          <Link href={"/explore"}>
            <button className="mt-6 bg-emerald-600 hover:bg-emerald-500 font-bold px-12 py-4 rounded-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-7 h-7 stroke-2 inline mr-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
              音声を探す
            </button>
          </Link>
        </div>

        <h1 className="text-emerald-400 text-2xl font-black mt-10">
          Prehniteとは？
        </h1>
        <h3 className="mt-4">
          Prehnite(プレナイト)は、認知シャッフル睡眠法を行うためのアプリです。
        </h3>
        <h3 className="mt-4">
          認知シャッフル睡眠法とは、入眠の際、ランダムに単語を思い浮かべる動作を繰り返す睡眠方法です。
          <br />
          それを行うことで、眠りにつきやすくなります。
        </h3>
        <h3 className="mt-4">
          Prehniteは、認知シャッフル睡眠法のための、単語を読み上げる音声を提供します。
          <br />
          音声は毎日自動生成されるため、日々違った音声で認知シャッフル睡眠法を行うことができます。
        </h3>

        <h1 className="text-emerald-400 text-2xl font-black mt-10">
          ログインすると？
        </h1>
        <h3 className="mt-4">
          ログインすることで、以下のことを行うことができ、アプリを使いこなせるようになります。
        </h3>
        <h3 className="mt-4">
          <li>自分の好きなテーマの音声作成をリクエスト</li>
          <li>音声のいいね</li>
        </h3>

        <div className="flex items-center justify-center">
          <button className="mt-6 bg-emerald-600 hover:bg-emerald-500 font-bold px-12 py-4 rounded-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-7 h-7 stroke-2 inline-block mr-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
              />
            </svg>
            ログイン / 新規登録
          </button>
        </div>
      </div>
    </>
  );
};

export default HomePage;
