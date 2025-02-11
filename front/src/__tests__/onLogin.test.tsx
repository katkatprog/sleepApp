import { render, screen } from "@testing-library/react";
import { SideMenu } from "@/components/SideMenu";
import { LoginUserContext } from "@/pages/_app";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

jest.mock("next/router", () => ({ useRouter: jest.fn() }));

describe("🧪ログイン時の表示テスト", () => {
  const ctxValue = {
    isLoading: false,
    loginUser: {
      id: 1,
      name: "testuser",
      email: "test@example.com",
      image: null,
    },
    setLoginUser: jest.fn(),
  };

  it("🟢SideMenuがログイン時の表示になっていること", () => {
    render(
      <LoginUserContext.Provider value={ctxValue}>
        <SideMenu></SideMenu>
      </LoginUserContext.Provider>,
    );

    // ログイン時に表示される項目
    expect(screen.getByText("Prehnite")).toBeInTheDocument();
    expect(screen.getByText("音声を探す")).toBeInTheDocument();
    expect(screen.getByText("音声をリクエスト")).toBeInTheDocument();
    expect(screen.getByText("いいねした音声")).toBeInTheDocument();
    expect(screen.getByText("ログアウト")).toBeInTheDocument();
    expect(screen.getByText("testuser")).toBeInTheDocument();
    // ログイン時に表示されない項目
    expect(screen.queryByText("ログイン")).toBeNull();
  });

  it("🟢Footerがログイン時の表示になっていること", () => {
    render(
      <LoginUserContext.Provider value={ctxValue}>
        <Footer></Footer>
      </LoginUserContext.Provider>,
    );

    // ログイン時に表示される項目
    const linkList = screen.getAllByRole("link");
    expect(linkList.length).toBe(3);
    expect(linkList[0]).toHaveAttribute("href", "/search/1"); // 検索ページへのリンク
    expect(linkList[1]).toHaveAttribute("href", "/request"); // 音声リクエストページへのリンク
    expect(linkList[2]).toHaveAttribute("href", "/favorite/1"); // いいね一覧ページへのリンク
    expect(screen.getByRole("button")); //ログアウトボタン
  });

  it("🟢Headerがログイン時の表示になっていること", () => {
    render(
      <LoginUserContext.Provider value={ctxValue}>
        <Header></Header>
      </LoginUserContext.Provider>,
    );

    // ログイン時に表示される項目
    const linkList = screen.getAllByRole("link");
    expect(linkList.length).toBe(2); // リンクは下記以外に無いことの確認
    expect(linkList[0]).toHaveAttribute("href", "/mypage"); // マイページへのリンク
    expect(linkList[1]).toHaveAttribute("href", "/"); // トップページへのリンク
  });
});
