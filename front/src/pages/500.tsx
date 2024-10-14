import Image from "next/image";
import React from "react";

const Custom500 = () => {
  return (
    <div className="px-8 pt-10">
      <div className="flex justify-center">
        <div className="flex-col max-w-xs w-full">
          <h1 className="text-2xl font-black mb-2">500 Internal Server Error</h1>
          <p>申し訳ございません。</p>
          <p>何らかのエラーが発生しました。再度お試しください。</p>
          <Image
            src="/error/prehnite_error.webp"
            alt="#"
            width={320}
            height={320}
            className="rounded-2xl mt-4"
          ></Image>
        </div>
      </div>
    </div>
  );
};

export default Custom500;
