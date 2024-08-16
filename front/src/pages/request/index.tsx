import { Layout } from "@/components/Layout";
import React, { useRef } from "react";
import { toast } from "react-toastify";

const RequestPage = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);
  return (
    <Layout>
      <div className="px-8 pt-10">
        <div className="flex justify-center">
          <div className="flex-col max-w-xs w-full">
            <h1 className="text-2xl font-black">音声をリクエストする</h1>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!inputRef.current?.value || !selectRef.current?.value) {
                  return;
                }

                try {
                  const result = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/sound-request`,
                    {
                      method: "POST",
                      body: JSON.stringify({
                        theme: inputRef.current.value,
                        isMaleVoice: Boolean(parseInt(selectRef.current.value)),
                      }),
                      headers: {
                        "content-type": "application/json",
                      },
                      credentials: "include",
                    },
                  );

                  if (result.status === 200) {
                    toast.success("音声作成をリクエストしました。", {
                      autoClose: 5000,
                    });
                  } else if (Math.floor(result.status / 100) === 4) {
                    toast.error(await result.text());
                  } else {
                    toast.error(
                      "音声作成のリクエストに失敗しました。もう一度お試しください。",
                    );
                  }
                } catch (error) {
                  toast.error(
                    "音声作成のリクエストに失敗しました。もう一度お試しください。",
                  );
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

              <button
                type="submit"
                className="mt-6 bg-green-600 hover:bg-green-500 font-bold w-full py-2 rounded-md transition"
              >
                音声をリクエスト
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RequestPage;