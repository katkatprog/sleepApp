import { Layout } from "@/components/Layout";
import { EyeIcon } from "@/components/icons/EyeIcon";
import { EyeSlashIcon } from "@/components/icons/EyeSlashIcon";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useContext, useRef, useState } from "react";
import { toast } from "react-toastify";
import { LoginUserContext } from "../_app";

const SignupPage = () => {
  const router = useRouter();
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const context = useContext(LoginUserContext);

  return (
    <Layout>
      <div className="px-8 pt-10">
        <div className="flex justify-center">
          <div className="flex-col max-w-xs w-full">
            <h1 className="text-2xl font-black">Prehniteに新規登録</h1>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const result = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/auth/signup`,
                    {
                      method: "POST",
                      body: JSON.stringify({
                        name: nameRef.current?.value,
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
                    toast.success("新規登録しました。どうぞお楽しみ下さい。", {
                      autoClose: 5000,
                    });
                    router.push(`/search`);
                  } else if (result.status === 400) {
                    toast.error(await result.text());
                  } else {
                    toast.error("新規登録に失敗しました。再度お試しください。");
                  }
                } catch (error) {
                  console.log(error);
                  toast.error("新規登録に失敗しました。再度お試しください。");
                }

                // ログインユーザーの情報を取得する
                try {
                  const result = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/login-user/`,
                    {
                      credentials: "include",
                    },
                  );
                  if (context.setLoginUser) {
                    context.setLoginUser(await result.json());
                  }
                } catch (error) {}
              }}
            >
              <p className="mt-4">お名前</p>
              <input
                ref={nameRef}
                type="text"
                className="h-10 bg-neutral-800 border-2 border-neutral-700 placeholder:text-gray-600 rounded-lg pl-2 outline-none w-full"
                placeholder="Input your name..."
                required={true}
              />

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
                  onChange={() => {
                    // 正規表現をRegExpの形で扱いたかったため(inputのpatternでは使えない)、onChangeでバリデーションを実装
                    const password = passwordRef.current?.value;
                    const exp =
                      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?`~])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?`~]+$/;
                    const result = exp.test(password || "");

                    if (result) {
                      // パスワードの形式が正しい場合、バリデーションのエラーを解除
                      passwordRef.current?.setCustomValidity("");
                    } else {
                      // パスワードの形式が正しくない場合、バリデーションのエラーメッセージを設定
                      passwordRef.current?.setCustomValidity(
                        "パスワードは半角英字、半角数字、記号を1つ以上含む必要があります。また半角英数字、記号以外は使用できません。※使用可能な記号は!@#$%^&*()_+-=[]{};':\"\\|,.<>/?`~のどれかです。",
                      );
                    }
                  }}
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  className="h-10 bg-neutral-800 border-2 border-neutral-700 border-l-0 placeholder:text-gray-600 rounded-r-lg rounded-l-none pr-2 outline-none text-center"
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
                新規登録
              </button>

              <Link href={"/login"}>
                <p className="text-green-400 hover:text-green-300 mt-2">
                  アカウントをお持ちの方はログイン
                </p>
              </Link>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SignupPage;
