// 入力された時間(秒)を、h:m:ssもしくはm:ssの単位に変換
export const secondFormat = (wholeSecond: number) => {
  // 全体の秒から、表示用の秒、分、時間を計算
  let sec = Math.floor(wholeSecond % 60).toString();
  let min = Math.floor((wholeSecond / 60) % 60).toString();
  const hour = Math.floor(wholeSecond / 3600).toString();

  // 秒を0埋め
  sec = `00${sec}`.slice(-2);
  // 1時間を越える場合、分も0埋め
  if (wholeSecond >= 3600) {
    min = `00${min}`.slice(-2);
  }

  if (hour === "0") {
    return `${min}:${sec}`;
  } else {
    return `${hour}:${min}:${sec}`;
  }
};
