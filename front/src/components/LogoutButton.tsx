import { useRouter } from "next/router";
import React, { useContext, useRef } from "react";
import { toast } from "react-toastify";
import { LoginUserContext } from "../pages/_app";
import { LogoutIcon } from "./icons/LogoutIcon";

export const LogoutButton = () => {
  const userCtx = useContext(LoginUserContext);
  const router = useRouter();
  const processRef = useRef(false);

  return (
    <button
      className="flex items-center lg:mt-4"
      onClick={async () => {
        if (processRef.current) {
          return;
        }
        processRef.current = true;

        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/logout/`,
            {
              method: "POST",
              headers: {
                "content-type": "application/json",
              },
              credentials: "include",
            },
          );
          if (res.status === 200) {
            router.push("/");
            toast.success("ログアウトしました。", { autoClose: 5000 });
            // userCtxのloginUserをnullに設定
            if (userCtx.setLoginUser) {
              userCtx.setLoginUser(null);
            }
          } else {
            throw new Error();
          }
        } catch (error) {
          processRef.current = false;
          toast.error("ログアウトに失敗しました。再度お試しください。");
        }
      }}
    >
      <LogoutIcon propClassName="w-9 h-9 p-1 rounded-full stroke-2"></LogoutIcon>
      <p className="hidden lg:inline">ログアウト</p>
    </button>
  );
};
