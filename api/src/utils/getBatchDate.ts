// 次回バッチが実行される日程を取得する
// ・hour：バッチが実行される時間（◯時）
// ・batchCycle：バッチ実行時刻を求めたいリクエストが、何回後のバッチで処理されるか（次回：0, 次回の次：1, ...）
export const getBatchDate = (hour: number, batchCycle: number) => {
  const batchDate = new Date();
  batchDate.setUTCMinutes(0);
  batchDate.setUTCSeconds(0);
  batchDate.setUTCMilliseconds(0);

  if (batchDate.getHours() < hour) {
    // <batchCycle>日後の<hour>:00 がバッチ実行時刻
    batchDate.setUTCHours(24 * batchCycle + hour);
  } else {
    // <batchCycle+1>日後の<hour>:00 がバッチ実行時刻
    batchDate.setUTCHours(24 * (batchCycle + 1) + hour);
  }
  return batchDate;
};
