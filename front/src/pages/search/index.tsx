import { ArrowLongLeftIcon } from "@/components/icons/ArrowLongLeftIcon";
import { ArrowLongRightIcon } from "@/components/icons/ArrowLongRightIcon";
import { SearchIcon } from "@/components/icons/SearchIcon";
import { SoundInfo } from "@prisma/client";
import { GetServerSideProps } from "next";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useRef } from "react";

const SearchPage = (props: SoundsListProps) => {
  const router = useRouter();
  const currentPage = Number(router.query.page);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          inputRef.current?.blur();
          router.push(`/search?page=1&q=${inputRef.current?.value || ""}`);
        }}
        className="flex justify-center items-center mx-3 my-6"
      >
        <input
          ref={inputRef}
          type="text"
          className="h-10 bg-neutral-800 border border-neutral-700 placeholder:text-gray-600 rounded-l-lg pl-2 outline-neutral-500 w-full"
          placeholder="検索"
          defaultValue={router.query.q || ""}
        />
        <button className="h-10 px-4 bg-neutral-700 hover:bg-neutral-500 rounded-r-lg">
          <SearchIcon propClassName="w-5 h-5 stroke-2"></SearchIcon>
        </button>
      </form>
      {props.soundsList.map((sound) => (
        <Link href={`/play/${sound.id}`} key={sound.id}>
          <div className="h-20 px-4 border-b flex justify-between border-neutral-700 hover:bg-neutral-700 transition">
            <h1 className="font-bold mt-4">{sound.name}</h1>
            <div className="mt-2">
              {sound.isMaleVoice !== null &&
                (sound.isMaleVoice ? (
                  <Image
                    alt="#"
                    src={"/male_icon.svg"}
                    width={32}
                    height={32}
                  ></Image>
                ) : (
                  <Image
                    alt="#"
                    src={"/female_icon.svg"}
                    width={32}
                    height={32}
                  ></Image>
                ))}
              <p>{new Date(sound.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </Link>
      ))}
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
                  `/search?page=${currentPage - 1}&q=${router.query.q || ""}`,
                );
              }}
            >
              <ArrowLongLeftIcon propClassName=""></ArrowLongLeftIcon>
            </button>
          )}
          {`${currentPage} / ${props.totalPages}`}
          {currentPage < props.totalPages && (
            <button
              className="rounded-md px-2 py-2 border border-neutral-700 hover:bg-neutral-700 transition ml-4"
              onClick={() => {
                if (inputRef.current) {
                  inputRef.current.value = (router.query.q || "").toString();
                }
                router.push(
                  `/search?page=${currentPage + 1}&q=${router.query.q || ""}`,
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

export const getServerSideProps: GetServerSideProps<SoundsListProps> = async (
  context,
) => {
  // APIから音声リストを取得
  const response: SoundsListProps = await (
    await fetch(
      `${process.env.API_URL}/sound-info/search?page=${context.query?.page}&q=${context.query?.q || ""}`,
    )
  ).json();

  return {
    props: {
      soundsList: response.soundsList,
      totalPages: response.totalPages,
    },
  };
};

interface SoundsListProps {
  soundsList: SoundInfo[];
  totalPages: number;
}
