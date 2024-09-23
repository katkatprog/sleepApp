import React from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import "react-toastify/dist/ReactToastify.css";
import { SideMenu } from "./SideMenu";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-full">
      <Header></Header>
      <main className="flex justify-center">
        <SideMenu></SideMenu>
        <div className="w-full max-w-xl xl:max-w-3xl my-16 lg:my-0">
          {children}
        </div>
        <aside className="hidden lg:block lg:w-48">{/* ダミー要素 */}</aside>
      </main>
      <Footer></Footer>
    </div>
  );
};
