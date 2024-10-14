import { Layout } from "@/components/Layout";
import Link from "next/link";
import { useRouter } from "next/router";
import { EyeSlashIcon } from "@/components/icons/EyeSlashIcon";
import { EyeIcon } from "@/components/icons/EyeIcon";
import React, { useContext, useRef, useState } from "react";
import { toast } from "react-toastify";
import { LoginUserContext } from "../_app";
import Head from "next/head";

const LoginPage = () => {
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const userCtx = useContext(LoginUserContext);
  const processRef = useRef(false);

  return (
    <Layout>
      <Head>
        <title>ログイン / Prehnite</title>
      </Head>
      <div className="px-8 pt-10">
        <div className="flex justify-center">
          <div className="flex-col max-w-xs w-full">
            <h1 className="text-2xl font-black">Prehniteにログイン</h1>
            <form
              onSubmit={async (e) => {
                if (processRef.current) {
                  return;
                }
                processRef.current = true;

                e.preventDefault();
                try {
                  const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
                    {
                      method: "POST",
                      body: JSON.stringify({
                        email: emailRef.current?.value,
                        password: passwordRef.current?.value,
                      }),
                      headers: {
                        "content-type": "application/json",
                      },
                      credentials: "include",
                    },
                  );

                  if (res.status === 400) {
                    processRef.current = false;
                    toast.error(await res.text());
                    return;
                  } else if (res.status !== 200) {
                    throw new Error();
                  }

                  // ログインユーザーの情報を取得する
                  const res2 = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/login-user/`,
                    {
                      credentials: "include",
                    },
                  );
                  if (userCtx.setLoginUser) {
                    userCtx.setLoginUser(await res2.json());
                  }

                  if (
                    typeof router.query.redirect_to === "string" &&
                    !isNaN(Number(router.query.redirect_to))
                  ) {
                    // redirect_toが数値の場合、音声再生ページに移動
                    router.push(`/play/${router.query.redirect_to}`);
                  } else if (typeof router.query.redirect_to === "string") {
                    // redirect_toで指定されたページに移動
                    router.push(router.query.redirect_to);
                  } else {
                    // redirect_toの指定が無ければ検索ページに移動
                    router.push(`search`);
                  }
                  toast.success("ログインしました。", { autoClose: 5000 });
                } catch (error) {
                  processRef.current = false;
                  toast.error("ログインに失敗しました。再度お試しください。");
                }
              }}
            >
              <p className="mt-4">メールアドレス</p>
              <input
                ref={emailRef}
                type="email"
                className="h-10 bg-neutral-800 border-2 border-neutral-700 placeholder:text-gray-600 rounded-lg pl-2 outline-none w-full"
                placeholder="Input your email..."
                required={true}
              />

              <p className="mt-4">パスワード</p>
              <div className="flex">
                <input
                  ref={passwordRef}
                  type="password"
                  className="h-10 bg-neutral-800 border-2 border-neutral-700 border-r-0 placeholder:text-gray-600 rounded-l-lg rounded-r-none pl-2 outline-none w-full"
                  placeholder="Input your password..."
                  required={true}
                />
                <button
                  type="button"
                  className="h-10 bg-neutral-800 border-2 border-neutral-700 border-l-0 placeholder:text-gray-600 rounded-r-lg rounded-l-none pr-2 outline-none"
                  onClick={() => {
                    setShowPassword(!showPassword);
                    if (passwordRef.current?.type) {
                      if (passwordRef.current.type === "password") {
                        passwordRef.current.type = "text";
                      } else {
                        passwordRef.current.type = "password";
                      }
                    }
                  }}
                >
                  {showPassword ? (
                    <EyeSlashIcon propClassName=""></EyeSlashIcon>
                  ) : (
                    <EyeIcon propClassName=""></EyeIcon>
                  )}
                </button>
              </div>

              <button
                type="submit"
                className="mt-6 bg-green-600 hover:bg-green-500 font-bold w-full py-2 rounded-md transition"
              >
                ログイン
              </button>
            </form>
            <Link href={"/signup"}>
              <p className="text-green-400 hover:text-green-300 mt-2">
                アカウントをお持ちではない方
              </p>
            </Link>
            <button
              type="submit"
              className="mt-12 bg-blue-600 hover:bg-blue-500 font-bold w-full py-2 rounded-md transition"
              onClick={async () => {
                if (processRef.current) {
                  return;
                }
                processRef.current = true;

                try {
                  const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/auth/guest-login`,
                    {
                      method: "POST",
                      headers: {
                        "content-type": "application/json",
                      },
                      credentials: "include",
                    },
                  );
                  if (res.status !== 200) {
                    throw new Error();
                  }

                  // ログインユーザーの情報を取得する
                  const res2 = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/login-user/`,
                    {
                      credentials: "include",
                    },
                  );
                  if (userCtx.setLoginUser) {
                    userCtx.setLoginUser(await res2.json());
                  }

                  if (
                    typeof router.query.redirect_to === "string" &&
                    !isNaN(Number(router.query.redirect_to))
                  ) {
                    // redirect_toが数値の場合、音声再生ページに移動
                    router.push(`/play/${router.query.redirect_to}`);
                  } else if (typeof router.query.redirect_to === "string") {
                    // redirect_toで指定されたページに移動
                    router.push(router.query.redirect_to);
                  } else {
                    // redirect_toの指定が無ければ検索ページに移動
                    router.push(`search`);
                  }
                  toast.success("ゲストログインしました。", {
                    autoClose: 5000,
                  });
                } catch (error) {
                  processRef.current = false;
                  toast.error(
                    "ゲストログインに失敗しました。再度お試しください。",
                  );
                }
              }}
            >
              ゲストログイン
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;
