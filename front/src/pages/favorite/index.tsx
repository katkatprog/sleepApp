import { Layout } from "@/components/Layout";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { SoundInfo } from "@prisma/client";
import Image from "next/image";
import { ArrowLongLeftIcon } from "@/components/icons/ArrowLongLeftIcon";
import { ArrowLongRightIcon } from "@/components/icons/ArrowLongRightIcon";
import { useRouter } from "next/router";
import Head from "next/head";

const FavoritePage = () => {
  const router = useRouter();
  const currentPage = Number(router.query.page || 1);
  const [soundsList, setSoundsList] = useState<SoundInfo[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // async, awaitを使うため、即時実行関数の形にする
    (async () => {
      // ログインしているなら呼ぶ
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sound-favorite?page=${currentPage}`,
        {
          credentials: "include",
        },
      );

      if (res.status === 401) {
        router.push("/login?redirect_to=favorite");
        return;
      }

      const data = await res.json();
      setSoundsList(data.soundsList);
      setTotalPages(data.totalPages);
      setIsLoading(false);
    })();

    // 第2引数の配列
    // お気に入りのページが変わったとき(e.g. 1ページ目 → 2ページ目)に実行されるようにcurrentPageを指定
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  return (
    <Layout>
      <Head>
        <title>いいねした音声 / Prehnite</title>
      </Head>
      {!isLoading && (
        <>
          <h1 className="text-2xl font-black m-6">いいねした音声</h1>
          {soundsList.length === 0 ? (
            <h1 className="text-center">いいねした音声がありません</h1>
          ) : (
            soundsList.map((sound) => (
              <Link href={`/play/${sound.id}`} key={sound.id}>
                <div className="h-20 px-8 pt-2 border-b flex justify-between items-start border-neutral-700 hover:bg-neutral-700 transition">
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
      )}
    </Layout>
  );
};

export default FavoritePage;
