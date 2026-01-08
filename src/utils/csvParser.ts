import type { TrainTime, Destination } from "../data/timetableTypes";

// CSVの1行を解析してTrainTime型にする関数
export const parseCSV = (csvContent: string): TrainTime[] => {
  const lines = csvContent.trim().split("\n");
  const timetable: TrainTime[] = [];

  lines.forEach((line) => {
    // 空行やコメント行(#始まり)はスキップ
    if (!line || line.startsWith("#")) return;

    const parts = line.split(",");
    if (parts.length < 3) return; // データ不足ならスキップ

    const hour = parseInt(parts[0].trim(), 10);
    const minute = parseInt(parts[1].trim(), 10);
    const destRaw = parts[2].trim();

    // 行き先のバリデーション
    let dest: Destination;
    if (destRaw === "谷上" || destRaw === "新神戸") {
      dest = destRaw;
    } else {
      return; // 未知の行き先ならスキップ
    }

    if (!isNaN(hour) && !isNaN(minute)) {
      timetable.push({ hour, minute, dest });
    }
  });

  return timetable;
};
