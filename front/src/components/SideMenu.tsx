import Link from "next/link";
import React, { useContext } from "react";
import { SearchIcon } from "./icons/SearchIcon";
import { PlusIcon } from "./icons/PlusIcon";
import { HeartIcon } from "./icons/HeartIcon";
import { LogoutIcon } from "./icons/LogoutIcon";
import { LoginIcon } from "./icons/LoginIcon";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { LoginUserContext } from "@/pages/_app";
import Image from "next/image";
import { UserIcon } from "./icons/UserIcon";

export const SideMenu = () => {
  const router = useRouter();
  const context = useContext(LoginUserContext);

  return (
    <aside className="flex-col items-start justify-between border-gray-300 border-r hidden lg:flex lg:min-w-48 h-screen sticky top-0">
      <div className="mt-5">
        <Link href={"/"} className="flex items-center">
          <Image
            src={"/top/prehnite_icon.svg"}
            alt="#"
            width={"32"}
            height={"32"}
          ></Image>
          <h1 className="text-green-300 text-2xl font-black ml-2">Prehnite</h1>
        </Link>
        <Link href={"/search"} className="mt-4 flex items-center">
          <SearchIcon propClassName="w-9 h-9 p-1 rounded-full stroke-2 hover:bg-neutral-700 transition"></SearchIcon>
          <p>音声を探す</p>
        </Link>
        {context.loginUser && (
          <>
            <Link href={"/request"} className="mt-4 flex items-center">
              <PlusIcon prosClassName="w-9 h-9 p-1 rounded-full stroke-2 hover:bg-neutral-700 transition"></PlusIcon>
              <p>音声をリクエスト</p>
            </Link>
            <Link href={"/favorite"} className="mt-4 flex items-center">
              <HeartIcon propClassName="w-9 h-9 p-1 rounded-full stroke-2 hover:bg-neutral-700 transition"></HeartIcon>
              <p>いいねした音声</p>
            </Link>
          </>
        )}
        {context.loginUser ? (
          // ログイン状態
          <button
            className="mt-4 flex items-center"
            onClick={async () => {
              try {
                const result = await fetch(
                  `${process.env.NEXT_PUBLIC_API_URL}/auth/logout/`,
                  {
                    method: "POST",
                    headers: {
                      "content-type": "application/json",
                    },
                    credentials: "include",
                  },
                );
                if (result.status === 200) {
                  router.push("/");
                  toast.success("ログアウトしました。", { autoClose: 5000 });
                  // contextのloginUserをnullに設定
                  if (context.setLoginUser) {
                    context.setLoginUser(null);
                  }
                } else {
                  toast.error("ログアウトに失敗しました。再度お試しください。");
                }
              } catch (error) {
                toast.error("ログアウトに失敗しました。再度お試しください。");
              }
            }}
          >
            <LogoutIcon propClassName="w-9 h-9 p-1 rounded-full stroke-2 hover:bg-neutral-700 transition"></LogoutIcon>
            <p>ログアウト</p>
          </button>
        ) : (
          // 未ログイン状態
          <Link href={"/login"} className="mt-4 flex items-center">
            <LoginIcon propClassName="w-9 h-9 p-1 rounded-full stroke-2 hover:bg-neutral-700 transition"></LoginIcon>
            <p>ログイン</p>
          </Link>
        )}
      </div>

      <div className="flex mb-10">
        {context.loginUser ? (
          // ログイン状態
          <Link href={"/mypage"} className="flex items-center mt-48">
            <UserIcon propClassName="w-7 h-7 text-neutral-800 bg-gray-300 rounded-full"></UserIcon>
            <p className="ml-2">{context.loginUser.name}</p>
          </Link>
        ) : (
          // 未ログイン時はダミー要素
          <div className="w-7"></div>
        )}
      </div>
    </aside>
  );
};
