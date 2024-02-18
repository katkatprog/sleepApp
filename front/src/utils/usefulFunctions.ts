// 入力された時間(秒)を、h:m:ssもしくはm:ssの単位に変換
export const secondFormat = (wholeSecond: number) => {
  // 全体の秒から、表示用の秒、分、時間を計算
  const sec = Math.floor(wholeSecond % 60);
  const min = Math.floor((wholeSecond / 60) % 60);
  const hour = Math.floor(wholeSecond / 3600);

  // 0埋め(秒だけ)
  const secWith0 = `00${sec}`.slice(-2);

  if (hour === 0) {
    return `${min}:${secWith0}`;
  } else {
    return `${hour}:${min}:${secWith0}`;
  }
};
