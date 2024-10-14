import Link from "next/link";
import React, { useContext } from "react";
import Image from "next/image";
import { UserIcon } from "./icons/UserIcon";
import { LoginUserContext } from "@/pages/_app";

export const Header = () => {
  const userCtx = useContext(LoginUserContext);

  return (
    <header className="h-16 bg-neutral-800 border-gray-300 border-b flex items-center justify-center fixed w-full left-0 top-0 lg:hidden">
      <div className="h-14 flex items-center justify-around max-w-xl w-full">
        {userCtx.loginUser ? (
          // ログイン状態
          <Link href={"/mypage"}>
            <UserIcon propClassName="w-7 h-7 text-neutral-800 bg-gray-300 rounded-full"></UserIcon>
          </Link>
        ) : (
          // 未ログイン時はダミー要素
          <div className="w-7"></div>
        )}
        <Link href={"/"}>
          <Image
            src={"/top/prehnite_icon.svg"}
            alt="#"
            width={"48"}
            height={"48"}
          ></Image>
        </Link>
        {/* ダミー要素 */}
        <div className="w-7"></div>
      </div>
    </header>
  );
};
