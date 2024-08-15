import { Layout } from "@/components/Layout";
import React from "react";

const RequestPage = () => {
  return (
    <Layout>
      <div className="px-8 pt-10">
        <div className="flex justify-center">
          <div className="flex-col max-w-xs w-full">
            <h1 className="text-2xl font-black">音声をリクエストする</h1>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RequestPage;
