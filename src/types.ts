// カテゴリーの定義
export type UserCategory = "Staff" | "D" | "M" | "B" | "Other";

// ユーザーの型
export interface User {
  id: string;
  name: string;
  category: UserCategory;
}

export type SeatStatus = "present" | "away";

export interface SeatState {
  userId: string | null;
  status: SeatStatus;
  startedAt: number | null;
}

export interface StaySession {
  userId: string;
  seatId: string;
  start: number;
  end: number | null;
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
