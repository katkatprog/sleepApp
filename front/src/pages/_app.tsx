import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ToastContainer } from "react-toastify";
import { User } from "@prisma/client";
import {
  Dispatch,
  SetStateAction,
  createContext,
  useEffect,
  useState,
} from "react";

export const LoginUserContext = createContext<{
  loginUser: LoginUser | null;
  setLoginUser: Dispatch<SetStateAction<LoginUser | null>> | null;
  isLoading: boolean;
}>({ loginUser: null, setLoginUser: null, isLoading: true });

export default function App({ Component, pageProps }: AppProps) {
  // 画面ロード時にログインユーザーを取得し、設定する
  const [loginUser, setLoginUser] = useState<LoginUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    // useEffect内でasync関数を実行するため、即時実行の形にしている
    (async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/login-user/`,
          {
            credentials: "include",
          },
        );
        setLoginUser(await res.json());
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return (
    <>
      {/* Toastを全ページ、ページ遷移時も表示できるように当ファイルに記載 */}
      <ToastContainer
        autoClose={false}
        theme={"colored"}
        style={{ width: "100%", maxWidth: "500px" }}
      />
      {/* Layoutで囲われている全ページでLoginUserをグローバル的に使えるように設定 */}
      <LoginUserContext.Provider value={{ loginUser, setLoginUser, isLoading }}>
        <Component {...pageProps} />
      </LoginUserContext.Provider>
    </>
  );
}

type LoginUser = Omit<User, "hashedPassword">;
