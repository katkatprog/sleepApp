import { SoundInfo } from "@prisma/client";
import { GetServerSideProps } from "next";
import Link from "next/link";

const ExplorePage = ({ soundsList }: SoundsListProps) => {
  return (
    <>
      {soundsList.map((sound) => (
        <Link href={`/play/${sound.id}`} key={sound.id}>
          <div className="h-20 mx-4 border-b flex justify-between border-neutral-700">
            <h1 className="font-bold mt-4">{sound.name}</h1>
            <div className="mt-2">
              {sound.isMaleVoice !== null && (
                <span
                  className={`px-1 rounded-md font-semibold ${sound.isMaleVoice ? "bg-blue-600" : "bg-rose-500"}`}
                >
                  {sound.isMaleVoice ? "male" : "female"}
                </span>
              )}
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
