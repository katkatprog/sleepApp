import Link from "next/link";
import React, { useContext } from "react";
import { SearchIcon } from "./icons/SearchIcon";
import { SettingIcon } from "./icons/SettingIcon";
import { LoginIcon } from "./icons/LoginIcon";
import { LoginUserContext } from "@/pages/_app";
import { LogoutIcon } from "./icons/LogoutIcon";

export const Footer = () => {
  const loginUser = useContext(LoginUserContext);

  return (
    <footer className="h-20 bg-neutral-800 border-gray-300 border-t fixed w-full left-0 bottom-0 flex justify-center">
      <div className="h-14 flex items-center justify-around max-w-2xl w-full">
        <Link href={"/search"}>
          <SearchIcon propClassName="w-9 h-9 p-1 rounded-full stroke-2 hover:bg-neutral-700 transition"></SearchIcon>
        </Link>
        <SettingIcon propClassName="w-9 h-9 p-1 rounded-full stroke-2 hover:bg-neutral-700 transition"></SettingIcon>
        {loginUser ? (
          // ログイン状態
          <LogoutIcon propClassName="w-9 h-9 p-1 rounded-full stroke-2 hover:bg-neutral-700 transition"></LogoutIcon>
        ) : (
          // 未ログイン状態
          <Link href={"/signin"}>
            <LoginIcon propClassName="w-9 h-9 p-1 rounded-full stroke-2 hover:bg-neutral-700 transition"></LoginIcon>
          </Link>
        )}
      </div>
    </footer>
  );
};
