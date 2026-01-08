// カテゴリーの定義
export type UserCategory = "Staff" | "D" | "M" | "B" | "Other";

// ユーザーの型
export interface User {
  id: string;
  name: string;
  category: UserCategory;
}

// 座席の型
export interface SeatData {
  id: string;
  row: string;
  userId: string | null;
}

// レイアウト定義用の型
export interface SeatLayout {
  rowId: string;
  seats: string[];
}
