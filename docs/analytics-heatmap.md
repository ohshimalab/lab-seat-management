# Analytics: Seat Heatmap / Occupancy Map

作成日: 2026-01-18

## 目的

Seat Heatmap は、選択した期間における座席ごとの累積利用量（滞在時間や利用回数）を視覚化し、利用の多いホットスポットや未活用エリアを素早く発見できるようにするツールです。運用者が配置・運用ポリシー・リマインダー設計などの意思決定を行うのに役立ちます。

---

## 機能要約

- 指定期間（今日／今週／カスタム）での座席別累積滞在時間を色で表示
- ツールチップで座席詳細（合計時間、セッション数、代表セッション）を表示
- クリックで `SessionsEditor` を該当座席・期間で開き、ドリルダウン可能
- 正規化オプション（絶対時間 / パーセンテージ / 分位点）と表示粒度（30 分/60 分/1 日）
- CSV エクスポート（seatId, seatLabel, totalHours, sessionCount）
- レンダリングは既存の座席レイアウトを再利用（`config/layout.ts`, `SeatGrid`）

---

## データモデルと集計ロジック

- データソース: ローカルストレージの `lab-stay-sessions`（各セッション: `userId`, `seatId`, `startedAt`, `endedAt` | null ）
- 基本メトリクス:
  - `totalOccupiedSeconds`：指定期間に交差するセッションの重複部分の合計秒数（主指標）
  - `sessionCount`：指定期間に交差したセッション数
  - `peakConcurrent`（オプション）：期間内の最大同時占有数
- 集計アルゴリズム（概略）:
  1. seatTotals = Map<seatId, {seconds:0, count:0}> を初期化
  2. 各セッションについて範囲との交差を計算:
     - intersectStart = max(session.start, range.start)
     - intersectEnd = min(session.end || now, range.end)
     - if intersectEnd > intersectStart:
       - seatTotals[seatId].seconds += (intersectEnd - intersectStart)
       - seatTotals[seatId].count += 1
  3. 必要に応じて時間を `hours` に変換して表示

簡潔な擬似コード:

```ts
function aggregateSeatTotals(sessions, range) {
  const totals = new Map();
  const now = Date.now();
  for (const s of sessions) {
    const start = Math.max(new Date(s.startedAt).getTime(), range.start);
    const end = Math.min(
      s.endedAt ? new Date(s.endedAt).getTime() : now,
      range.end
    );
    if (end > start) {
      const seconds = (end - start) / 1000;
      const cur = totals.get(s.seatId) ?? { seconds: 0, count: 0 };
      cur.seconds += seconds;
      cur.count += 1;
      totals.set(s.seatId, cur);
    }
  }
  return totals;
}
```

---

## カラースケールと正規化

- デフォルト: 線形スケール（hours）で色付け。低 → 高は淡色 → 濃色。例: `#f7fbff` → `#08306b`。
- 選択肢:
  - Absolute (hours)
  - Percent of max (0–100%)
  - Quantile / percentile (分位点) — 偏りが強いデータに有効
- レジェンドは常に表示し、閾値をクリックで調整可能にする

---

## UI モックアップ（ワイヤー）

（簡易テキストモックアップ。実装時は Tailwind + JSX + SVG/Div grid で再現）

[Header] Analytics > Seat Heatmap

Controls: [Date range selector] [Granularity: 30m ▼] [Normalization: Absolute ▼] [Export CSV]

Legend: [low] ■■■■■■■ [high]

Seat grid (positions from `config/layout.ts`):

+---------------------------------------------------------------+
| [seat A] [seat B] [seat C] [seat D] [seat E] [seat F] |
| 3.2h 0.5h 1.1h 6.7h 5.0h 0.0h |
| (tooltip on hover shows count, sessions) |
+---------------------------------------------------------------+

Tooltip (on hover):

- Seat: A (id: a01)
- Total: 3.2 hours
- Sessions: 5
- Sample: 2026-01-18 09:12–11:03 (User: Yamada)

Click seat → open `SessionsEditor` filtered by seatId + selected range

---

## インタラクション詳細

- Hover: show tooltip with totalHours, sessionCount, top 3 sessions
- Click: open `SessionsEditor` for seat and range
- Date range: presets（Today / This week / Last 7 days）＋カレンダー選択
- Granularity: 30m（デフォルト）／1h／1d（ただし heatmap は集約結果のみ使用）
- Export CSV: `seatId,seatLabel,totalHours,sessionCount`

---

## パフォーマンス設計

- 集計は `useMemo` でセッション配列＋レンジをキーにキャッシュ
- セッション数が非常に多い場合は Web Worker に集計処理を移行
- 描画は DOM 要素（div grid）か SVG を選択。座席数が数百規模なら div grid で十分。
- 更新トリガ: `lab-stay-sessions` の変更、または UI のレンジ変更のみで再計算

---

## アクセシビリティ

- 色以外に数値ラベルを各タイルに表示（スクリーンリーダー向けに要約のテキストビューを提供）
- カラーパレットは高コントラストを用意
- キーボードで座席をフォーカス可能にし、Enter で `SessionsEditor` を開く

---

## テスト仕様（受け入れ基準とテストケース）

### 受け入れ基準（MVP）

- 指定期間の集計値が生データと一致している
- Heatmap の各タイルに表示される値が `aggregateSeatTotals` の出力に基づく
- ホバーで表示される合計時間とセッション数が正しい
- タイルをクリックすると `SessionsEditor` がその座席のセッションにフィルタされて開く
- CSV エクスポートに `seatId,seatLabel,totalHours,sessionCount` が含まれる

### 単体テスト（aggregation）

1. 単純セッション 1 件: 完全に範囲内 → 合計がセッション長
2. 範囲外セッション: 合計に含めない
3. 範囲と部分交差するセッション: 交差部分のみ集計
4. 終了時刻無し（ongoing）セッション: `now` で範囲内の交差を計算
5. 同一座席に複数セッションがある場合の合算
6. 複数座席のセッションが混在する場合の seatId 別集計

### コンポーネントテスト（UI）

- `SeatHeatmap` が正しい数のタイルを描画する
- カラースケールが値の大小に応じて変わる
- ツールチップがホバーで出る（モックセッションを使用）

### E2E テスト（Playwright）

1. 開発サーバー起動 → Analytics パネルを開く
2. 既知のテストデータをロード（fixture）
3. 日付範囲を選択 → heatmap のトップ座席の値が期待値と一致
4. タイルをクリック → `SessionsEditor` が開き、表示されるセッションの開始/終了が fixture と一致
5. CSV エクスポート → ダウンロードファイルの 1 行目が `seatId,seatLabel,totalHours,sessionCount`

---

## 実装ステップ（小さく始める順序）

1. `src/hooks/useAnalytics.ts` を追加（または `useStayTracking` を拡張）して `getSeatTotals(range)` を実装
   - エクスポート関数: `getSeatTotals(sessions, range): Record<string, {seconds:number, count:number}>`
2. `src/components/Analytics/SeatHeatmap.tsx` を作成
   - Controls: date picker, granularity, normalization, export
   - レイアウト: `config/layout.ts` を参照して座席の位置を配置
   - 描画: 各座席を色付けした `div` または `svg rect` で表示
3. `MainPanels.tsx` に Analytics エントリを追加して表示可能にする
4. CSV エクスポート、ツールチップ、クリックハンドラ（`SessionsEditor` を開く）を実装
5. 単体テストと E2E テストを追加

---

## CSV 出力例

```
seatId,seatLabel,totalHours,sessionCount
A01,Front Left 1,12.5,7
B02,Front Right 2,3.0,2
...
```

---

## 備考・拡張案

- 時間帯別（hour-of-week）ヒートマップを追加して、曜日 × 時間別のパターン分析を行う
- 複数期間の比較（今週 vs 先週）を並べて表示
- 定期レポート（PDF/CSV）生成とスケジューリング（将来的にサーバーがある場合）

---

ファイル: [docs/analytics-heatmap.md](docs/analytics-heatmap.md)
