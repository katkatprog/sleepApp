import { Layout } from "@/components/Layout";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ToastContainer } from "react-toastify";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      {/* Toastを全ページ、ページ遷移時も表示できるように当ファイルに記載 */}
      <ToastContainer
        autoClose={false}
        theme={"colored"}
        style={{ width: "500px" }}
      />
      <Component {...pageProps} />;
    </>
  );
}
