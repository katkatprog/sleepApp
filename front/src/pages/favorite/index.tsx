import { Layout } from "@/components/Layout";
import React, { useContext, useEffect, useState } from "react";
import { LoginUserContext } from "../_app";
import Link from "next/link";
import { LoginIcon } from "@/components/icons/LoginIcon";
import { SoundInfo } from "@prisma/client";
import Image from "next/image";
import { ArrowLongLeftIcon } from "@/components/icons/ArrowLongLeftIcon";
import { ArrowLongRightIcon } from "@/components/icons/ArrowLongRightIcon";
import { useRouter } from "next/router";
import Head from "next/head";
import { Loading } from "@/components/Loading";

const FavoritePage = () => {
  const router = useRouter();
  const context = useContext(LoginUserContext);
  const currentPage = Number(router.query.page || 1);
  const [soundsList, setSoundsList] = useState<SoundInfo[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // async, awaitを使うため、即時実行関数の形にする
    (async () => {
      // ログインしているなら呼ぶ
      if (context.loginUser) {
        const result = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/sound-favorite?page=${currentPage}`,
          {
            credentials: "include",
          },
        );

        const resultJson = await result.json();
        setSoundsList(resultJson.soundsList);
        setTotalPages(resultJson.totalPages);
      }
      setIsLoading(false);
    })();

    // 第2引数の配列
    // リロード時を考え、ログインユーザーがセットされたときに実行されるようにcontext.loginUserを指定
    // お気に入りのページが変わったとき(e.g. 1ページ目 → 2ページ目)に実行されるようにcurrentPageを指定
  }, [context.loginUser, currentPage]);

  return (
    <Loading isLoading={isLoading}>
      <Layout>
        <Head>
          <title>いいねした音声 / Prehnite</title>
        </Head>
        {context.loginUser ? (
          // ログイン状態
          <>
            <h1 className="text-2xl font-black m-6">いいねした音声</h1>
            {soundsList.length === 0 ? (
              <h1 className="text-center">いいねした音声がありません</h1>
            ) : (
              soundsList.map((sound) => (
                <Link href={`/play/${sound.id}`} key={sound.id}>
                  <div className="h-20 px-4 pt-2 border-b flex justify-between items-start border-neutral-700 hover:bg-neutral-700 transition">
                    <div className="flex pt-2">
                      <h1 className="font-bold mr-2">{sound.name}</h1>
                      {sound.isMaleVoice !== null &&
                        (sound.isMaleVoice ? (
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
                    <div>
                      <p>{new Date(sound.createdAt).toLocaleDateString()}</p>
                      <p>{sound.playCount} 回再生</p>
                    </div>
                  </div>
                </Link>
              ))
            )}
            <div className="h-28 pt-4 flex items-start justify-center">
              <div className="flex items-center">
                {currentPage > 1 && (
                  <button
                    className="rounded-md px-2 py-2 border border-neutral-700 hover:bg-neutral-700 transition mr-4"
                    onClick={() => {
                      router.push(`/favorite?page=${currentPage - 1}`);
                    }}
                  >
                    <ArrowLongLeftIcon propClassName=""></ArrowLongLeftIcon>
                  </button>
                )}
                {`${currentPage} / ${totalPages}`}
                {currentPage < totalPages && (
                  <button
                    className="rounded-md px-2 py-2 border border-neutral-700 hover:bg-neutral-700 transition ml-4"
                    onClick={() => {
                      router.push(`/favorite?page=${currentPage + 1}`);
                    }}
                  >
                    <ArrowLongRightIcon propClassName=""></ArrowLongRightIcon>
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          // 未ログイン状態
          <>
            <div className="mt-10 flex justify-center">
              <p className="max-w-xs w-full">ログインしてください</p>
            </div>
            <div className="flex items-center justify-center">
              <Link href={"/login"}>
                <button className="mt-6 bg-green-600 hover:bg-green-500 font-bold px-12 py-2 rounded-md transition">
                  <LoginIcon propClassName="w-7 h-7 stroke-2 inline-block mr-2"></LoginIcon>
                  ログイン
                </button>
              </Link>
            </div>
          </>
        )}
      </Layout>
    </Loading>
  );
};

export default FavoritePage;
