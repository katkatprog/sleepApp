import Head from "next/head";
import React from "react";
import { CircleIcon } from "./icons/CircleIcon";

export const Loading = () => {
  return (
    <>
      <Head>
        <title>Prehnite</title>
      </Head>
      <div className="flex justify-center items-center w-full h-80">
        <CircleIcon propClassName="animate-spin w-12 h-12"></CircleIcon>
      </div>
    </>
  );
};
