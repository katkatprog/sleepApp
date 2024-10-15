import React, { useEffect, useState } from "react";
import Link from "next/link";
import { SoundInfo } from "@prisma/client";
import Image from "next/image";
import { ArrowLongLeftIcon } from "../../../components/icons/ArrowLongLeftIcon";
import { ArrowLongRightIcon } from "../../../components/icons/ArrowLongRightIcon";
import { useRouter } from "next/router";
import Head from "next/head";
import { toast } from "react-toastify";
import Custom404 from "../../404";
import { Loading } from "../../../components/Loading";

const FavoritePage = () => {
  const router = useRouter();
  const [soundsList, setSoundsList] = useState<SoundInfo[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    // async, awaitを使うため、即時実行関数の形にする
    (async () => {
      if (!router.isReady) return;
      setSoundsList([]);
      setIsLoading(true);
      setIsNotFound(false);

      // ログインしているなら呼ぶ
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sound-favorite?page=${router.query.page}`,
        {
          credentials: "include",
        },
      );

      if (res.status === 200) {
        const data = await res.json();
        setSoundsList(data.soundsList);
        setTotalPages(data.totalPages);
      } else if (res.status === 401) {
        toast.info("ログインが必要です。");
        router.push("/login?redirect_to=favorite");
      } else if (res.status === 404 || res.status === 400) {
        setIsNotFound(true);
      }
      setIsLoading(false);
    })();

    // お気に入りのページが変わったとき(e.g. 1ページ目 → 2ページ目)に実行されるように第2引数の配列を指定
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.page]);

  if (isLoading) {
    return <Loading></Loading>;
  }

  if (isNotFound) {
    return <Custom404></Custom404>;
  }

  return (
    <>
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
              {Number(router.query.page) > 1 && (
                <button
                  className="rounded-md px-2 py-2 border border-neutral-700 hover:bg-neutral-700 transition mr-4"
                  onClick={() => {
                    router.push(`/favorite/${Number(router.query.page) - 1}`);
                  }}
                >
                  <ArrowLongLeftIcon propClassName=""></ArrowLongLeftIcon>
                </button>
              )}
              {`${router.query.page} / ${totalPages}`}
              {Number(router.query.page) < totalPages && (
                <button
                  className="rounded-md px-2 py-2 border border-neutral-700 hover:bg-neutral-700 transition ml-4"
                  onClick={() => {
                    router.push(`/favorite/${Number(router.query.page) + 1}`);
                  }}
                >
                  <ArrowLongRightIcon propClassName=""></ArrowLongRightIcon>
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default FavoritePage;
