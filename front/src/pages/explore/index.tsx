import { SoundInfo } from "@prisma/client";
import { GetServerSideProps } from "next";
import Image from "next/image";
import Link from "next/link";

const ExplorePage = ({ soundsList }: SoundsListProps) => {
  return (
    <>
      {soundsList.map((sound) => (
        <Link href={`/play/${sound.id}`} key={sound.id}>
          <div className="h-20 px-4 border-b flex justify-between border-neutral-700 hover:bg-neutral-700 transition">
            <h1 className="font-bold mt-4">{sound.name}</h1>
            <div className="mt-2">
              {sound.isMaleVoice !== null &&
                (sound.isMaleVoice ? (
                  <Image
                    alt="#"
                    src={"male_icon.svg"}
                    width={32}
                    height={32}
                  ></Image>
                ) : (
                  <Image
                    alt="#"
                    src={"female_icon.svg"}
                    width={32}
                    height={32}
                  ></Image>
                ))}
              <p>{new Date(sound.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </Link>
      ))}
    </>
  );
};

export default ExplorePage;

export const getServerSideProps: GetServerSideProps<SoundsListProps> = async (
  context,
) => {
  // APIから音声リストを取得
  const response = await fetch(`${process.env.API_URL}/sound-info`);
  const soundsList: Omit<SoundInfo, "url">[] = await response.json();

  return {
    props: {
      soundsList,
    },
  };
};

interface SoundsListProps {
  soundsList: Omit<SoundInfo, "url">[];
}
