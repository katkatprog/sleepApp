import { Layout } from "@/components/Layout";
import React from "react";
import Link from "next/link";
import { SoundInfo } from "@prisma/client";
import Image from "next/image";
import { ArrowLongLeftIcon } from "@/components/icons/ArrowLongLeftIcon";
import { ArrowLongRightIcon } from "@/components/icons/ArrowLongRightIcon";
import { useRouter } from "next/router";
import Head from "next/head";
import { GetServerSideProps } from "next";

const FavoritePage = ({ soundsList, totalPages }: SSRProps) => {
  const router = useRouter();
  const currentPage = Number(router.query.page || 1);

  return (
    <Layout>
      <Head>
        <title>いいねした音声 / Prehnite</title>
      </Head>
      <h1 className="text-2xl font-black m-6">いいねした音声</h1>
      {soundsList.length === 0 ? (
        <h1 className="text-center">いいねした音声がありません</h1>
      ) : (
        soundsList.map((sound: SoundInfo) => (
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
    </Layout>
  );
};

export default FavoritePage;

export const getServerSideProps: GetServerSideProps<SSRProps> = async (
  context,
) => {
  // APIから音声リストを取得
  const result = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/sound-favorite?page=${context.query.page || 1}`,
    {
      headers: {
        Cookie: `token=${context.req.cookies.token}`,
      },
    },
  );

  if (result.status === 200) {
    // ログインかつ正常終了
    const response = await result.json();
    return {
      props: {
        soundsList: response.soundsList,
        totalPages: response.totalPages,
      },
    };
  } else if (result.status === 404) {
    // ログインしているがページが見つからない場合
    return { notFound: true };
  } else if (result.status === 401) {
    // 未ログイン状態
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  } else {
    throw new Error("Something went wrong...");
  }
};

interface SSRProps {
  soundsList: SoundInfo[];
  totalPages: number;
}
