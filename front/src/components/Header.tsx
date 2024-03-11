import Link from "next/link";
import React from "react";
import { MoonIcon } from "./icons/MoonIcon";

export const Header = () => {
  return (
    <header className="h-16 bg-neutral-800 border-gray-300 border-b flex items-center justify-center fixed w-full left-0 top-0">
      <Link href={"/"}>
        <MoonIcon propClassName="w-14 h-14 p-1 text-emerald-400 hover:bg-neutral-700 rounded-full transition"></MoonIcon>
      </Link>
    </header>
  );
};
