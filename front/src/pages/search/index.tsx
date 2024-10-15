import { ArrowLongLeftIcon } from "@/components/icons/ArrowLongLeftIcon";
import { ArrowLongRightIcon } from "@/components/icons/ArrowLongRightIcon";
import { SearchIcon } from "@/components/icons/SearchIcon";
import { SoundInfo } from "@prisma/client";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useRef } from "react";

const SearchPage = ({ soundsList, totalPages }: SSRProps) => {
  const router = useRouter();
  const currentPage = Number(router.query.page || 1);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  return (
    <>
      <Head>
        <title>{`${router.query.q ? `${router.query.q} - ` : ""} 検索 / Prehnite`}</title>
      </Head>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          inputRef.current?.blur();
          router.push(
            `/search?q=${inputRef.current?.value || ""}&sort=${selectRef.current?.value}`,
          );
        }}
        className="flex justify-center items-center my-6 mx-3 lg:mx-8"
      >
        <input
          ref={inputRef}
          type="text"
          className="h-10 bg-neutral-800 border-2 border-neutral-700 placeholder:text-gray-600 rounded-l-lg rounded-r-none pl-2 outline-neutral-500 w-full"
          placeholder="検索"
          defaultValue={router.query.q || ""}
        />
        <button className="h-10 px-4 bg-neutral-700 hover:bg-neutral-500 rounded-r-lg rounded-l-none transition">
          <SearchIcon propClassName="w-5 h-5 stroke-2"></SearchIcon>
        </button>

        <select
          ref={selectRef}
          name="sort"
          className="h-10 ml-2 rounded-lg px-2 py-1 border-2 border-neutral-700 bg-neutral-800"
          onChange={() => {
            selectRef.current?.blur();
            router.push(
              `/search?q=${inputRef.current?.value || ""}&sort=${selectRef.current?.value}`,
            );
          }}
          defaultValue={router.query.sort || "created"}
        >
          <option value="created">新着順</option>
          <option value="count">再生数順</option>
        </select>
      </form>

      {soundsList.length === 0 ? (
        <h1 className="text-center">該当する結果が見つかりませんでした。</h1>
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
                if (inputRef.current) {
                  inputRef.current.value = (router.query.q || "").toString();
                }
                router.push(
                  `/search?page=${currentPage - 1}&q=${router.query.q || ""}&sort=${router.query.sort || "created"}`,
                );
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
                if (inputRef.current) {
                  inputRef.current.value = (router.query.q || "").toString();
                }
                router.push(
                  `/search?page=${currentPage + 1}&q=${router.query.q || ""}&sort=${router.query.sort || "created"}`,
                );
              }}
            >
              <ArrowLongRightIcon propClassName=""></ArrowLongRightIcon>
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default SearchPage;

export const getServerSideProps: GetServerSideProps<SSRProps> = async (
  ssrCtx,
) => {
  // APIから音声リストを取得
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/sound-info/search?page=${ssrCtx.query?.page || 1}&q=${ssrCtx.query?.q || ""}&sort=${ssrCtx.query?.sort || "created"}`,
  );

  if (res.status === 404) {
    return { notFound: true };
  }
  if (res.status !== 200) {
    throw new Error("Something went wrong...");
  }

  const data: SSRProps = await res.json();

  return {
    props: {
      soundsList: data.soundsList,
      totalPages: data.totalPages,
    },
  };
};

interface SSRProps {
  soundsList: SoundInfo[];
  totalPages: number;
}
