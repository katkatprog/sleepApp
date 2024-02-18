import React from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-full">
      <Header></Header>
      <main className="my-16">{children}</main>
      <Footer></Footer>
    </div>
  );
};
