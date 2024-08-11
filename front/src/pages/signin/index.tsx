import { Layout } from "@/components/Layout";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useRef } from "react";
import { toast } from "react-toastify";

const SigninPage = () => {
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  return (
    <Layout>
      <div className="px-8 pt-10">
        <div className="flex justify-center">
          <div className="flex-col max-w-xs w-full">
            <h1 className="text-2xl font-black">Prehniteにログイン</h1>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const result = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/auth/signin`,
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
                  if (result.status === 200) {
                    router.push(`/search`);
                    toast.success("ログインしました。");
                  } else {
                    toast.error("ログインに失敗しました。再度お試しください。");
                  }
                } catch (error) {
                  toast.error("ログインに失敗しました。再度お試しください。");
                }
              }}
            >
              <p className="mt-4">メールアドレス</p>
              <input
                ref={emailRef}
                type="text"
                className="h-10 bg-neutral-800 border-2 border-neutral-700 placeholder:text-gray-600 rounded-lg pl-2 outline-neutral-500 w-full"
                placeholder="Input your email..."
              />

              <p className="mt-4">パスワード</p>
              <input
                ref={passwordRef}
                type="password"
                className="h-10 bg-neutral-800 border-2 border-neutral-700 placeholder:text-gray-600 rounded-lg pl-2 outline-neutral-500 w-full"
                placeholder="Input your password..."
              />

              <button className="mt-6 bg-green-600 hover:bg-green-500 font-bold w-full py-2 rounded-md transition">
                Signin
              </button>

              <Link href={"/signup"}>
                <p className="text-green-400 hover:text-green-300 mt-2">
                  アカウントをお持ちではない方
                </p>
              </Link>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SigninPage;
