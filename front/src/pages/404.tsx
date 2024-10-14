import Image from "next/image";
import React from "react";

const Custom404 = () => {
  return (
    <div className="px-8 pt-10">
      <div className="flex justify-center">
        <div className="flex-col max-w-xs w-full">
          <h1 className="text-2xl font-black mb-2">404 Not Found</h1>
          <p>このページは存在しません。</p>
          <p>URLにお間違いがないかご確認ください。</p>
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

export default Custom404;
