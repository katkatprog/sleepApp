import React from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-full">
      <Header></Header>
      <main className="flex justify-center">
        <div className="my-16 max-w-2xl w-full">{children}</div>
      </main>
      <Footer></Footer>
    </div>
  );
};
