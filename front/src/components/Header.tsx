import Link from "next/link";
import React from "react";
import Image from "next/image";

export const Header = () => {
  return (
    <header className="h-16 bg-neutral-800 border-gray-300 border-b flex items-center justify-center fixed w-full left-0 top-0">
      <Link href={"/"}>
        <Image
          src={"/prehnite_icon.svg"}
          alt="#"
          width={"48"}
          height={"48"}
        ></Image>
      </Link>
    </header>
  );
};
