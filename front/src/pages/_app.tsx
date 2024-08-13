import { Layout } from "@/components/Layout";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ToastContainer } from "react-toastify";
import { User } from "@prisma/client";
import { createContext, useEffect, useState } from "react";

export const LoginUserContext = createContext<LoginUser | null>(null);

export default function App({ Component, pageProps }: AppProps) {
  // 画面ロード時にログインユーザーを取得し、設定する
  const [loginUser, setLoginUser] = useState<LoginUser | null>(null);
  useEffect(() => {
    // useEffect内でasync関数を実行するため、即時実行の形にしている
    (async () => {
      const result = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/login-user/`,
        {
          credentials: "include",
        },
      );
      setLoginUser(await result.json());
    })();
  }, []);

  return (
    <>
      {/* Toastを全ページ、ページ遷移時も表示できるように当ファイルに記載 */}
      <ToastContainer
        autoClose={false}
        theme={"colored"}
        style={{ width: "500px" }}
      />
      {/* Layoutで囲われている全ページでLoginUserをグローバル的に使えるように設定 */}
      <LoginUserContext.Provider value={loginUser}>
        <Component {...pageProps} />
      </LoginUserContext.Provider>
    </>
  );
}

type LoginUser = Omit<User, "hashedPassword">;
