import { render, screen } from "@testing-library/react";
import { SideMenu } from "@/components/SideMenu";
import { LoginUserContext } from "@/pages/_app";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

jest.mock("next/router", () => ({ useRouter: jest.fn() }));

describe("🧪未ログイン時の表示テスト", () => {
  const ctxValue = {
    isLoading: false,
    loginUser: null,
    setLoginUser: jest.fn(),
  };

  it("🟢SideMenuが未ログイン時の表示になっていること", () => {
    render(
      <LoginUserContext.Provider value={ctxValue}>
        <SideMenu></SideMenu>
      </LoginUserContext.Provider>,
    );

    // 未ログイン時に表示される項目
    expect(screen.getByText("Prehnite")).toBeInTheDocument();
    expect(screen.getByText("音声を探す")).toBeInTheDocument();
    expect(screen.getByText("ログイン")).toBeInTheDocument();
    // 未ログイン時に表示されない項目
    expect(screen.queryByText("音声をリクエスト")).toBeNull();
    expect(screen.queryByText("いいねした音声")).toBeNull();
    expect(screen.queryByText("ログアウト")).toBeNull();
    expect(screen.queryByText("testuser")).toBeNull();
  });

  it("🟢Footerが未ログイン時の表示になっていること", () => {
    render(
      <LoginUserContext.Provider value={ctxValue}>
        <Footer></Footer>
      </LoginUserContext.Provider>,
    );

    // 未ログイン時に表示される項目
    const linkList = screen.getAllByRole("link");
    expect(linkList.length).toBe(2); // リンクは下記以外に無いことの確認
    expect(linkList[0]).toHaveAttribute("href", "/search/1"); // 検索ページへのリンク
    expect(linkList[1]).toHaveAttribute("href", "/login"); // ログインページへのリンク
  });

  it("🟢Headerが未ログイン時の表示になっていること", () => {
    render(
      <LoginUserContext.Provider value={ctxValue}>
        <Header></Header>
      </LoginUserContext.Provider>,
    );

    // 未ログイン時に表示される項目
    expect(screen.getByRole("link")).toHaveAttribute("href", "/");
  });
});
