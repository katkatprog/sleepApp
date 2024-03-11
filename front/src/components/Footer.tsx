import Link from "next/link";
import React from "react";
import { SearchIcon } from "./icons/SearchIcon";
import { SettingIcon } from "./icons/SettingIcon";
import { LoginIcon } from "./icons/LoginIcon";

export const Footer = () => {
  return (
    <footer className="h-20 bg-neutral-800 border-gray-300 border-t fixed w-full left-0 bottom-0">
      <div className="h-14 flex items-center justify-around">
        <Link href={"/explore"}>
          <SearchIcon propClassName="w-9 h-9 p-1 rounded-full stroke-2 hover:bg-neutral-700 transition"></SearchIcon>
        </Link>
        <SettingIcon propClassName="w-9 h-9 p-1 rounded-full stroke-2 hover:bg-neutral-700 transition"></SettingIcon>
        <LoginIcon propClassName="w-9 h-9 p-1 rounded-full stroke-2 hover:bg-neutral-700 transition"></LoginIcon>
      </div>
    </footer>
  );
};
