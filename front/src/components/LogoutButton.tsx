import { useRouter } from "next/router";
import React, { useContext } from "react";
import { toast } from "react-toastify";
import { LoginUserContext } from "../pages/_app";
import { LogoutIcon } from "./icons/LogoutIcon";

export const LogoutButton = () => {
  const context = useContext(LoginUserContext);
  const router = useRouter();

  return (
    <button
      className="flex items-center lg:mt-4"
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
      <p className="hidden lg:inline">ログアウト</p>
    </button>
  );
};
