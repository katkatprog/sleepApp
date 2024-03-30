import { ArrowLongLeftIcon } from "@/components/icons/ArrowLongLeftIcon";
import { ArrowLongRightIcon } from "@/components/icons/ArrowLongRightIcon";
import { SoundInfo } from "@prisma/client";
import { GetServerSideProps } from "next";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

const SearchPage = (props: SoundsListProps) => {
  const router = useRouter();
  const currentPage = Number(router.query.page);

  return (
    <>
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
            <Link href={`/search?page=${currentPage - 1}`}>
              <button className="rounded-md px-2 py-2 border border-neutral-700 hover:bg-neutral-700 transition mr-4">
                <ArrowLongLeftIcon propClassName=""></ArrowLongLeftIcon>
              </button>
            </Link>
          )}
          {`${currentPage} / ${props.totalPages}`}
          {currentPage < props.totalPages && (
            <Link href={`/search?page=${currentPage + 1}`}>
              <button className="rounded-md px-2 py-2 border border-neutral-700 hover:bg-neutral-700 transition ml-4">
                <ArrowLongRightIcon propClassName=""></ArrowLongRightIcon>
              </button>
            </Link>
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
  const response = await Promise.all([
    fetch(
      `${process.env.API_URL}/sound-info/search?page=${context.query?.page}`,
    ),
    fetch(`${process.env.API_URL}/sound-info/total-search-result-pages`),
  ]);
  const soundsList: SoundInfo[] = await response[0].json();
  const totalPages: number = await response[1].json();

  return {
    props: {
      soundsList,
      totalPages,
    },
  };
};

interface SoundsListProps {
  soundsList: SoundInfo[];
  totalPages: number;
}
