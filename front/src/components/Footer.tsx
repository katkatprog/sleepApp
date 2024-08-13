import Link from "next/link";
import React, { useContext } from "react";
import { SearchIcon } from "./icons/SearchIcon";
import { SettingIcon } from "./icons/SettingIcon";
import { LoginIcon } from "./icons/LoginIcon";
import { LoginUserContext } from "@/pages/_app";
import { LogoutIcon } from "./icons/LogoutIcon";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

export const Footer = () => {
  const router = useRouter();
  const context = useContext(LoginUserContext);

  return (
    <footer className="h-20 bg-neutral-800 border-gray-300 border-t fixed w-full left-0 bottom-0 flex justify-center">
      <div className="h-14 flex items-center justify-around max-w-2xl w-full">
        <Link href={"/search"}>
          <SearchIcon propClassName="w-9 h-9 p-1 rounded-full stroke-2 hover:bg-neutral-700 transition"></SearchIcon>
        </Link>
        <SettingIcon propClassName="w-9 h-9 p-1 rounded-full stroke-2 hover:bg-neutral-700 transition"></SettingIcon>
        {context.loginUser ? (
          // ログイン状態
          <button
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
          </button>
        ) : (
          // 未ログイン状態
          <Link href={"/login"}>
            <LoginIcon propClassName="w-9 h-9 p-1 rounded-full stroke-2 hover:bg-neutral-700 transition"></LoginIcon>
          </Link>
        )}
      </div>
    </footer>
  );
};
