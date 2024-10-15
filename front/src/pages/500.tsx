import Head from "next/head";
import Image from "next/image";
import React from "react";

const Custom500 = () => {
  return (
    <>
      <Head>
        <title>{`500 Internal Server Error / Prehnite`}</title>
      </Head>
      <div className="px-8 pt-10">
        <div className="flex justify-center">
          <div className="flex-col max-w-xs w-full">
            <h1 className="text-2xl font-black mb-2">
              500 Internal Server Error
            </h1>
            <p>申し訳ございません。</p>
            <p>何らかのエラーが発生しました。再度お試しください。</p>
            <div className="flex justify-center">
              <Image
                src="/error/prehnite_error.webp"
                alt="#"
                width={270}
                height={270}
                className="rounded-2xl mt-4"
              ></Image>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Custom500;
