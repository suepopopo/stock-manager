// "YYYY-MM" から、その月の開始日（含む）と翌月の開始日（含まない）を求める。
// stock_itemsの月次集計（要件定義書 §3.9）で日付範囲の絞り込みに使う。

const YEAR_MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

export type MonthRange = {
  start: string;
  end: string;
};

export function isValidYearMonth(yearMonth: string): boolean {
  return YEAR_MONTH_PATTERN.test(yearMonth);
}

export function monthRange(yearMonth: string): MonthRange {
  if (!isValidYearMonth(yearMonth)) {
    throw new Error(`invalid yearMonth: ${yearMonth}`);
  }

  const [yearStr, monthStr] = yearMonth.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);

  const start = `${yearStr}-${monthStr}-01`;
  const nextYear = month === 12 ? year + 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  const end = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;

  return { start, end };
}
