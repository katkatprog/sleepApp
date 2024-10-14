import { Layout } from "@/components/Layout";
import React, { useContext, useEffect, useRef, useState } from "react";
import { LoginUserContext } from "../_app";
import { EmailIcon } from "@/components/icons/EmailIcon";
import { UserIcon } from "@/components/icons/UserIcon";
import { toast } from "react-toastify";
import { User } from "@prisma/client";
import { EyeSlashIcon } from "@/components/icons/EyeSlashIcon";
import { EyeIcon } from "@/components/icons/EyeIcon";
import { useRouter } from "next/router";
import Head from "next/head";

const MyPage = () => {
  const userCtx = useContext(LoginUserContext);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [mode, setMode] = useState<"normal" | "edit" | "delete">("normal");
  const [showPassword, setShowPassword] = useState(false);
  const processRef = useRef(false);

  useEffect(() => {
    if (!userCtx.isLoading && !userCtx.loginUser) {
      // 未ログイン（ユーザー情報取得が完了、かつその結果が空）の場合、ログインページに移動
      router.push("login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userCtx.isLoading]);

  return (
    <Layout>
      <Head>
        <title>マイページ / Prehnite</title>
      </Head>
      <div className="px-8 pt-10">
        <div className="flex justify-center">
          <div className="flex-col max-w-xs w-full">
            {!userCtx.isLoading && userCtx.loginUser && (
              <>
                {mode === "normal" && (
                  <>
                    <h1 className="text-2xl font-black">
                      {userCtx.loginUser?.name}
                    </h1>
                    <div className="flex justify-center mt-4">
                      <UserIcon propClassName="w-32 h-32 text-neutral-800 bg-gray-300 rounded-full"></UserIcon>
                    </div>
                    <div className="flex mt-4">
                      <EmailIcon propClassName="w-6 h-6"></EmailIcon>
                      <p className="ml-2">{userCtx.loginUser?.email}</p>
                    </div>
                    {userCtx.loginUser.email !==
                      (process.env.NEXT_PUBLIC_GUEST_EMAIL ||
                        "guest@example.com") && (
                      <button
                        className="mt-6 border-green-400 border-2 text-green-400 hover:bg-neutral-700 font-bold px-12 py-2 rounded-md transition w-full"
                        onClick={() => {
                          setMode("edit");
                        }}
                      >
                        プロフィールを編集する
                      </button>
                    )}
                    <button
                      className="mt-6 border-green-400 border-2 text-green-400 hover:bg-neutral-700 font-bold px-12 py-2 rounded-md transition w-full"
                      onClick={async () => {
                        if (processRef.current) {
                          return;
                        }
                        processRef.current = true;

                        try {
                          const result = await fetch(
                            `${process.env.NEXT_PUBLIC_API_URL}/auth/logout/`,
                            {
                              method: "POST",
                              headers: {
                                "content-type": "application/json",
                              },
                              credentials: "include",
                            },
                          );
                          if (result.status === 200) {
                            router.push("/");
                            toast.success("ログアウトしました。", {
                              autoClose: 5000,
                            });
                            // userCtxのloginUserをnullに設定
                            if (userCtx.setLoginUser) {
                              userCtx.setLoginUser(null);
                            }
                          } else {
                            throw new Error();
                          }
                        } catch (error) {
                          processRef.current = false;
                          toast.error(
                            "ログアウトに失敗しました。再度お試しください。",
                          );
                        }
                      }}
                    >
                      ログアウト
                    </button>
                    {userCtx.loginUser.email !==
                      (process.env.NEXT_PUBLIC_GUEST_EMAIL ||
                        "guest@example.com") && (
                      <button
                        className="mt-12 border-red-400 border-2 text-red-400 hover:bg-neutral-700 font-bold px-12 py-2 rounded-md transition w-full"
                        onClick={() => {
                          setMode("delete");
                        }}
                      >
                        退会する
                      </button>
                    )}
                  </>
                )}
                {mode === "edit" && (
                  <>
                    <form
                      onSubmit={async (e) => {
                        if (processRef.current) {
                          return;
                        }
                        processRef.current = true;

                        e.preventDefault();

                        if (!userCtx.loginUser || !userCtx.setLoginUser) {
                          // userCtxの読み込みが完了していない場合は途中終了（特にエラーメッセージ等は出さない）
                          return;
                        }

                        try {
                          const result = await fetch(
                            `${process.env.NEXT_PUBLIC_API_URL}/login-user`,
                            {
                              method: "PUT",
                              credentials: "include",
                              headers: {
                                "content-type": "application/json",
                              },
                              body: JSON.stringify({
                                name: nameRef.current?.value,
                                email: emailRef.current?.value,
                              }),
                            },
                          );
                          if (result.status === 200) {
                            // 編集モードの終了、userCtxを最新のログインユーザー情報で書き換える
                            toast.success("プロフィールを編集しました。", {
                              autoClose: 5000,
                            });
                            setMode("normal");
                            userCtx.setLoginUser(
                              (await result.json()) as LoginUser | null,
                            );
                          } else if (Math.floor(result.status / 100) === 4) {
                            // 400番台エラーなら、返ってきたメッセージをそのまま表示
                            toast.error(await result.text());
                          } else {
                            throw new Error();
                          }
                        } catch (error) {
                          toast.error(
                            "プロフィール編集できませんでした。もう一度お試しください。",
                          );
                        } finally {
                          processRef.current = false;
                        }
                      }}
                    >
                      <h1 className="text-2xl font-black">
                        プロフィールを編集
                      </h1>
                      <p className="mt-4">お名前</p>
                      <input
                        ref={nameRef}
                        type="text"
                        className="h-10 bg-neutral-800 border-2 border-neutral-700 placeholder:text-gray-600 rounded-lg pl-2 outline-none w-full"
                        placeholder="Input your name..."
                        required={true}
                        defaultValue={userCtx.loginUser.name}
                      />

                      <p className="mt-4">メールアドレス</p>
                      <input
                        ref={emailRef}
                        type="email"
                        className="h-10 bg-neutral-800 border-2 border-neutral-700 placeholder:text-gray-600 rounded-lg pl-2 outline-none w-full"
                        placeholder="Input your email..."
                        required={true}
                        defaultValue={userCtx.loginUser.email}
                      />
                      <button
                        className="mt-6 bg-green-600 hover:bg-green-500 font-bold w-full py-2 rounded-md transition"
                        type="submit"
                      >
                        保存
                      </button>
                    </form>
                    <button
                      className="mt-6 border-green-400 border-2 text-green-400 hover:bg-neutral-700 font-bold px-12 py-2 rounded-md transition w-full"
                      onClick={() => {
                        setMode("normal");
                      }}
                    >
                      戻る
                    </button>
                  </>
                )}
                {mode === "delete" && (
                  <>
                    <h1 className="text-2xl font-black">退会しますか？</h1>
                    <p>退会すると、アカウントを復元することはできません。</p>
                    <p>
                      また、音声リクエスト中の場合、そのリクエストは無効になります。
                    </p>

                    <p className="mt-10 mb-2 font-bold">
                      よろしければ、パスワードを入力の上、
                      <br /> 「退会する」をクリックしてください。
                    </p>
                    <form
                      onSubmit={async (e) => {
                        if (processRef.current) {
                          return;
                        }
                        processRef.current = true;

                        e.preventDefault();

                        if (!userCtx.loginUser || !userCtx.setLoginUser) {
                          // userCtxの読み込みが完了していない場合は途中終了（特にエラーメッセージ等は出さない）
                          return;
                        }

                        try {
                          const result = await fetch(
                            `${process.env.NEXT_PUBLIC_API_URL}/login-user`,
                            {
                              method: "DELETE",
                              credentials: "include",
                              headers: {
                                "content-type": "application/json",
                              },
                              body: JSON.stringify({
                                password: passwordRef.current?.value,
                              }),
                            },
                          );
                          if (result.status === 200) {
                            // userCtxをクリア、トップページに移動
                            toast.success(
                              "退会しました。またのご利用をお待ちしております。",
                              {
                                autoClose: 5000,
                              },
                            );
                            userCtx.setLoginUser(null);
                            router.push("/");
                          } else if (Math.floor(result.status / 100) === 4) {
                            // 400番台エラーなら、返ってきたメッセージをそのまま表示
                            processRef.current = false;
                            toast.error(await result.text());
                          } else {
                            throw new Error();
                          }
                        } catch (error) {
                          processRef.current = false;
                          toast.error(
                            "退会できませんでした。もう一度お試しください。",
                          );
                        }
                      }}
                    >
                      <div className="flex">
                        <input
                          ref={passwordRef}
                          type="password"
                          className="h-10 bg-neutral-800 border-2 border-neutral-700 border-r-0 placeholder:text-gray-600 rounded-l-lg rounded-r-none pl-2 outline-none w-full"
                          placeholder="Input your password..."
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
                        className="mt-6 bg-red-500 hover:bg-red-400 font-bold w-full py-2 rounded-md transition"
                        type="submit"
                      >
                        退会する
                      </button>
                    </form>
                    <button
                      className="mt-6 border-green-400 border-2 text-green-400 hover:bg-neutral-700 font-bold px-12 py-2 rounded-md transition w-full"
                      onClick={() => {
                        setMode("normal");
                      }}
                    >
                      戻る
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MyPage;

type LoginUser = Omit<User, "hashedPassword">;
