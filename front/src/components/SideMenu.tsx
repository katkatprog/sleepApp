import Link from "next/link";
import React, { useContext } from "react";
import { SearchIcon } from "./icons/SearchIcon";
import { PlusIcon } from "./icons/PlusIcon";
import { HeartIcon } from "./icons/HeartIcon";
import { LoginIcon } from "./icons/LoginIcon";
import { LoginUserContext } from "../pages/_app";
import Image from "next/image";
import { UserIcon } from "./icons/UserIcon";
import { LogoutButton } from "./LogoutButton";

export const SideMenu = () => {
  const userCtx = useContext(LoginUserContext);

  return (
    <aside className="flex-col items-start justify-between border-gray-300 border-r hidden lg:flex lg:min-w-48 h-screen sticky top-0">
      {!userCtx.isLoading && (
        <>
          <div className="mt-5">
            <Link href={"/"} className="flex items-center">
              <Image
                src={"/top/prehnite_icon.svg"}
                alt="#"
                width={"32"}
                height={"32"}
              ></Image>
              <h1 className="text-green-300 text-2xl font-black ml-2">
                Prehnite
              </h1>
            </Link>
            <Link href={"/search/1"} className="mt-4 flex items-center">
              <SearchIcon propClassName="w-9 h-9 p-1 rounded-full stroke-2"></SearchIcon>
              <p>音声を探す</p>
            </Link>
            {userCtx.loginUser && (
              <>
                <Link href={"/request"} className="mt-4 flex items-center">
                  <PlusIcon prosClassName="w-9 h-9 p-1 rounded-full stroke-2"></PlusIcon>
                  <p>音声をリクエスト</p>
                </Link>
                <Link href={"/favorite/1"} className="mt-4 flex items-center">
                  <HeartIcon propClassName="w-9 h-9 p-1 rounded-full stroke-2"></HeartIcon>
                  <p>いいねした音声</p>
                </Link>
              </>
            )}
            {userCtx.loginUser ? (
              // ログイン状態
              <LogoutButton></LogoutButton>
            ) : (
              // 未ログイン状態
              <Link href={"/login"} className="mt-4 flex items-center">
                <LoginIcon propClassName="w-9 h-9 p-1 rounded-full stroke-2"></LoginIcon>
                <p>ログイン</p>
              </Link>
            )}
          </div>

          <div className="flex mb-10">
            {userCtx.loginUser ? (
              // ログイン状態
              <Link href={"/mypage"} className="flex items-center mt-48">
                <UserIcon propClassName="w-7 h-7 text-neutral-800 bg-gray-300 rounded-full"></UserIcon>
                <p className="ml-2">{userCtx.loginUser.name}</p>
              </Link>
            ) : (
              // 未ログイン時はダミー要素
              <div className="w-7"></div>
            )}
          </div>
        </>
      )}
    </aside>
  );
};
