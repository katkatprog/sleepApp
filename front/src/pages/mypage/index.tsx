import React, { useContext, useEffect, useRef, useState } from "react";
import { LoginUserContext } from "../_app";
import { EmailIcon } from "../../components/icons/EmailIcon";
import { toast } from "react-toastify";
import { User } from "@prisma/client";
import { EyeSlashIcon } from "../../components/icons/EyeSlashIcon";
import { EyeIcon } from "../../components/icons/EyeIcon";
import { useRouter } from "next/router";
import Head from "next/head";
import { Loading } from "../../components/Loading";
import Image from "next/image";

const MyPage = () => {
  const userCtx = useContext(LoginUserContext);
  const profileRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLImageElement>(null);
  const router = useRouter();
  const [mode, setMode] = useState<"normal" | "edit" | "delete">("normal");
  const [showPassword, setShowPassword] = useState(false);
  const processRef = useRef(false);

  useEffect(() => {
    if (!userCtx.isLoading && !userCtx.loginUser) {
      // 未ログイン（ユーザー情報取得が完了、かつその結果が空）の場合、ログインページに移動
      toast.info("ログインが必要です。");
      router.push("/login?redirect_to=mypage");
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userCtx.isLoading]);

  if (userCtx.isLoading) {
    return <Loading></Loading>;
  }

  return (
    <>
      <Head>
        <title>マイページ / Prehnite</title>
      </Head>
      <div className="px-8 pt-10">
        <div className="flex justify-center">
          <div className="flex-col max-w-xs w-full">
            <>
              {mode === "normal" && (
                <>
                  <h1 className="text-2xl font-black">
                    {userCtx.loginUser?.name}
                  </h1>
                  <div className="flex justify-center mt-4">
                    <div className="relative w-32 h-32">
                      <Image
                        src={
                          userCtx.loginUser?.image || "/etc/defaultProfile.jpg"
                        }
                        alt=""
                        className="rounded-full object-cover"
                        fill
                      ></Image>
                    </div>
                  </div>
                  <div className="flex mt-4">
                    <EmailIcon propClassName="w-6 h-6"></EmailIcon>
                    <p className="ml-2">{userCtx.loginUser?.email}</p>
                  </div>
                  {userCtx.loginUser!.email !==
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
                        const res = await fetch(
                          `${process.env.NEXT_PUBLIC_API_URL}/auth/logout/`,
                          {
                            method: "POST",
                            headers: {
                              "content-type": "application/json",
                            },
                            credentials: "include",
                          },
                        );
                        if (res.status === 200) {
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
                  {userCtx.loginUser!.email !==
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
                        // プロフィール編集用のAPI呼び出しを準備
                        const promiseList = [
                          fetch(
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
                          ),
                        ];

                        // 画像が指定されていれば、画像アップロード用のAPI呼び出しも準備
                        if (
                          profileRef.current &&
                          profileRef.current.files &&
                          profileRef.current.files.length > 0
                        ) {
                          const formdata = new FormData();
                          formdata.append(
                            "profile-img",
                            profileRef.current.files[0],
                            profileRef.current.files[0].name,
                          );
                          promiseList.push(
                            fetch(
                              `${process.env.NEXT_PUBLIC_API_URL}/login-user/upload-image`,
                              {
                                method: "POST",
                                credentials: "include",
                                headers: new Headers(),
                                body: formdata,
                              },
                            ),
                          );
                        }

                        // APIを並列で呼び出し
                        // ※uploadResは、画像アップロード用のAPI(promiseListの2番目要素)があればレスポンス、無ければundefinedとなる
                        const [editRes, uploadRes] =
                          await Promise.all(promiseList);

                        if (editRes.status === 200 && !uploadRes) {
                          // 処理成功（プロフィール編集のみ場合）
                          // 編集モードの終了、userCtxを最新のログインユーザー情報で書き換える
                          toast.success("プロフィールを編集しました。", {
                            autoClose: 5000,
                          });
                          setMode("normal");
                          userCtx.setLoginUser(
                            (await editRes.json()) as LoginUser,
                          );
                        } else if (
                          editRes.status === 200 &&
                          uploadRes &&
                          uploadRes.status === 200
                        ) {
                          // 処理成功（プロフィール編集、画像アップロード両方を実行した場合）
                          // 編集モードの終了、userCtxを最新のログインユーザー情報、画像情報で書き換える
                          toast.success("プロフィールを編集しました。", {
                            autoClose: 5000,
                          });
                          setMode("normal");
                          const updatedUserInfo =
                            (await editRes.json()) as LoginUser;
                          updatedUserInfo.image = (await uploadRes.json())
                            .image as string;
                          userCtx.setLoginUser(updatedUserInfo);
                        } else if (Math.floor(editRes.status / 100) === 4) {
                          // 400番台エラー（プロフィール編集）
                          // 返ってきたメッセージをそのまま表示
                          toast.error(await editRes.text());
                        } else if (
                          uploadRes &&
                          Math.floor(uploadRes.status / 100) === 4
                        ) {
                          // 400番台エラー（画像アップロード）
                          // 返ってきたメッセージをそのまま表示
                          toast.error(await uploadRes.text());
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
                    <h1 className="text-2xl font-black">プロフィールを編集</h1>
                    <div className="m-4 flex justify-between items-center">
                      {/* // 画像ファイルの選択に合わせて表示画像を変える必要があるため、Imageでなくimgにしている */}
                      {
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={
                            userCtx?.loginUser?.image ||
                            "/etc/defaultProfile.jpg"
                          }
                          alt=""
                          className="h-32 w-32 rounded-full object-cover"
                          ref={previewRef}
                        ></img>
                      }
                      <label
                        htmlFor="profile-img"
                        className="px-4 py-2 rounded-lg border-2 border-neutral-700 hover:cursor-pointer"
                      >
                        画像を選択
                      </label>
                      <input
                        type="file"
                        id="profile-img"
                        name="profile-img"
                        accept="image/png, image/jpeg, image/webp"
                        className="hidden"
                        ref={profileRef}
                        onChange={(e) => {
                          // プロフィール画像 プレビュー機能
                          // [参考]https://developer.mozilla.org/ja/docs/Web/API/FileReader/readAsDataURL
                          e.preventDefault();
                          if (
                            !(
                              e.target &&
                              e.target.files &&
                              e.target.files.length > 0 &&
                              profileRef.current &&
                              profileRef.current.files &&
                              profileRef.current.files.length > 0
                            )
                          ) {
                            return;
                          }
                          const file = e.target.files[0];

                          if (
                            !["image/png", "image/jpeg", "image/webp"].includes(
                              file.type,
                            )
                          ) {
                            toast.error(
                              "画像ファイルはjpg, png, webpである必要があります。",
                            );
                            profileRef.current.value = ""; //クリア
                            return;
                          }

                          if (file.size > 10000000) {
                            toast.error(
                              "画像ファイルは10MG以下である必要があります。",
                            );
                            profileRef.current.value = ""; //クリア
                            return;
                          }

                          const reader = new FileReader();
                          reader.onload = () => {
                            if (
                              !(
                                typeof reader.result === "string" &&
                                previewRef.current
                              )
                            ) {
                              return;
                            }
                            // 画像ファイルを base64 文字列に変換
                            previewRef.current.src = reader.result;
                          };
                          // 指定されたFileの内容を読み込む処理。これが無いとプレビューに反映されない
                          reader.readAsDataURL(file);
                        }}
                      ></input>
                    </div>
                    <p className="mt-4">お名前</p>
                    <input
                      ref={nameRef}
                      type="text"
                      className="h-10 bg-neutral-800 border-2 border-neutral-700 placeholder:text-gray-600 rounded-lg pl-2 outline-none w-full"
                      placeholder="Input your name..."
                      required={true}
                      defaultValue={userCtx.loginUser!.name}
                    />

                    <p className="mt-4">メールアドレス</p>
                    <input
                      ref={emailRef}
                      type="email"
                      className="h-10 bg-neutral-800 border-2 border-neutral-700 placeholder:text-gray-600 rounded-lg pl-2 outline-none w-full"
                      placeholder="Input your email..."
                      required={true}
                      defaultValue={userCtx.loginUser!.email}
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
                        const res = await fetch(
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
                        if (res.status === 200) {
                          // userCtxをクリア、トップページに移動
                          toast.success(
                            "退会しました。またのご利用をお待ちしております。",
                            {
                              autoClose: 5000,
                            },
                          );
                          userCtx.setLoginUser(null);
                          router.push("/");
                        } else if (Math.floor(res.status / 100) === 4) {
                          // 400番台エラーなら、返ってきたメッセージをそのまま表示
                          processRef.current = false;
                          toast.error(await res.text());
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
          </div>
        </div>
      </div>
    </>
  );
};

export default MyPage;

type LoginUser = Omit<User, "hashedPassword">;
