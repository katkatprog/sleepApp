import Link from "next/link";
import React, { useContext } from "react";
import { SearchIcon } from "./icons/SearchIcon";
import { LoginIcon } from "./icons/LoginIcon";
import { LoginUserContext } from "@/pages/_app";
import { PlusIcon } from "./icons/PlusIcon";
import { HeartIcon } from "./icons/HeartIcon";
import { LogoutButton } from "./LogoutButton";

export const Footer = () => {
  const context = useContext(LoginUserContext);

  return (
    <footer className="h-20 bg-neutral-800 border-gray-300 border-t fixed w-full left-0 bottom-0 flex justify-center lg:hidden">
      <div className="h-14 flex items-center justify-around max-w-xl w-full">
        {!context.isLoading && (
          <>
            <Link href={"/search"}>
              <SearchIcon propClassName="w-9 h-9 p-1 rounded-full stroke-2"></SearchIcon>
            </Link>
            {context.loginUser && (
              <>
                <Link href={"/request"}>
                  <PlusIcon prosClassName="w-9 h-9 p-1 rounded-full stroke-2"></PlusIcon>
                </Link>
                <Link href={"/favorite"}>
                  <HeartIcon propClassName="w-9 h-9 p-1 rounded-full stroke-2"></HeartIcon>
                </Link>
              </>
            )}
            {context.loginUser ? (
              // ログイン状態
              <LogoutButton></LogoutButton>
            ) : (
              // 未ログイン状態
              <Link href={"/login"}>
                <LoginIcon propClassName="w-9 h-9 p-1 rounded-full stroke-2"></LoginIcon>
              </Link>
            )}
          </>
        )}
      </div>
    </footer>
  );
};
