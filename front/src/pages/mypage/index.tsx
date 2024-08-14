import { Layout } from "@/components/Layout";
import React, { useContext } from "react";
import { LoginUserContext } from "../_app";
import { EmailIcon } from "@/components/icons/EmailIcon";
import Link from "next/link";
import { LoginIcon } from "@/components/icons/LoginIcon";
import { UserIcon } from "@/components/icons/UserIcon";

const MyPage = () => {
  const context = useContext(LoginUserContext);

  return (
    <Layout>
      <div className="px-8 pt-10">
        <div className="flex justify-center">
          <div className="flex-col max-w-xs w-full">
            {context.loginUser ? (
              // ログイン状態
              <>
                <h1 className="text-2xl font-black">
                  {context.loginUser?.name}
                </h1>
                <div className="flex justify-center mt-4">
                  <UserIcon propClassName="w-32 h-32 text-neutral-800 bg-gray-300 rounded-full"></UserIcon>
                </div>
                <div className="flex mt-4">
                  <EmailIcon propClassName="w-6 h-6"></EmailIcon>
                  <p className="ml-2">{context.loginUser?.email}</p>
                </div>
              </>
            ) : (
              // 未ログイン状態
              <>
                <p>ログインしてください</p>
                <div className="flex items-center justify-center">
                  <Link href={"/login"}>
                    <button className="mt-6 bg-green-600 hover:bg-green-500 font-bold px-12 py-2 rounded-md transition">
                      <LoginIcon propClassName="w-7 h-7 stroke-2 inline-block mr-2"></LoginIcon>
                      ログイン
                    </button>
                  </Link>
                </div>
              </>
            )}{" "}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MyPage;
