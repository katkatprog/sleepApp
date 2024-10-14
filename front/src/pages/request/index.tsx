import { Layout } from "@/components/Layout";
import { SoundReqQueue } from "@prisma/client";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

const RequestPage = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);
  const processRef = useRef(false);
  const router = useRouter();
  const [queueInfo, setQueueInfo] = useState<SoundReqQueue | null>(null);
  const [batchDate, setBatchDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    (async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sound-request`,
        {
          credentials: "include",
        },
      );

      if (res.status === 401) {
        router.push("/login?redirect_to=request");
        return;
      }

      const data: {
        queueInfo: SoundReqQueue | null;
        batchDate: string;
      } = await res.json();
      setQueueInfo(data.queueInfo);
      setBatchDate(data.batchDate);
      setIsLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Layout>
      <Head>
        <title>音声をリクエストする / Prehnite</title>
      </Head>
      {!isLoading && (
        <div className="px-8 pt-10">
          <div className="flex justify-center">
            <div className="flex-col max-w-xs w-full">
              {queueInfo ? (
                <>
                  <h1 className="text-2xl font-black">音声をリクエストする</h1>
                  <p>
                    すでに音声リクエスト済みです。
                    <br />
                    音声が作成されるまで新たなリクエストはできません。
                  </p>
                  <h2 className="text-lg font-black mt-4">リクエスト情報</h2>
                  <p>{`テーマ: ${queueInfo.theme}`}</p>
                  <p>{`ボイス: ${queueInfo.isMaleVoice ? "男性ボイス" : "女性ボイス"}`}</p>
                  <p>{`リクエスト日時: ${new Date(queueInfo.requestedAt).toLocaleString()}`}</p>

                  <h2 className="text-lg font-black mt-4">作成予定日</h2>
                  <p>{batchDate ? new Date(batchDate).toLocaleString() : ""}</p>
                </>
              ) : (
                <>
                  <h1 className="text-2xl font-black">音声をリクエストする</h1>
                  <form
                    onSubmit={async (e) => {
                      if (processRef.current) {
                        return;
                      }
                      processRef.current = true;

                      e.preventDefault();
                      if (
                        !inputRef.current?.value ||
                        !selectRef.current?.value
                      ) {
                        return;
                      }

                      try {
                        const res = await fetch(
                          `${process.env.NEXT_PUBLIC_API_URL}/sound-request`,
                          {
                            method: "POST",
                            body: JSON.stringify({
                              theme: inputRef.current.value,
                              isMaleVoice: Boolean(
                                parseInt(selectRef.current.value),
                              ),
                            }),
                            headers: {
                              "content-type": "application/json",
                            },
                            credentials: "include",
                          },
                        );

                        if (res.status === 200) {
                          router.reload();
                        } else if (
                          400 <= Math.floor(res.status) &&
                          Math.floor(res.status) < 500
                        ) {
                          toast.error(await res.text());
                        } else {
                          throw new Error();
                        }
                      } catch (error) {
                        toast.error(
                          "音声作成のリクエストに失敗しました。もう一度お試しください。",
                        );
                      } finally {
                        processRef.current = false;
                      }
                    }}
                  >
                    <p className="mt-4">テーマ</p>
                    <p>※最大10文字</p>
                    <input
                      ref={inputRef}
                      type="text"
                      className="h-10 bg-neutral-800 border-2 border-neutral-700 placeholder:text-gray-600 rounded-lg pl-2 outline-none w-full"
                      placeholder="例: 夏休み"
                      required={true}
                      maxLength={10}
                    />

                    <p className="mt-4">女性ボイス / 男性ボイス</p>
                    <select
                      ref={selectRef}
                      className="h-10 rounded-lg px-2 py-1 border-2 border-neutral-700 bg-neutral-800 outline-none"
                      defaultValue={0}
                    >
                      <option value={0}>女性ボイス</option>
                      <option value={1}>男性ボイス</option>
                    </select>

                    <h2 className="text-lg font-black mt-4">
                      作成予定日
                      <span className="text-base font-normal">
                        (リクエストを出した場合)
                      </span>
                    </h2>
                    <p>
                      {batchDate ? new Date(batchDate).toLocaleString() : ""}
                    </p>

                    <button
                      type="submit"
                      className="mt-6 bg-green-600 hover:bg-green-500 font-bold w-full py-2 rounded-md transition"
                    >
                      音声をリクエスト
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default RequestPage;
