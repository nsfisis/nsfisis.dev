export type Date = {
  year: number;
  month: number;
  day: number;
};

export function stringToDate(s: string): Date {
  const match = s.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (match === null) {
    throw new Error();
  }
  const [_, y, m, d] = match;
  return { year: parseInt(y), month: parseInt(m), day: parseInt(d) };
}

export function dateToString(date: Date): string {
  const y = `${date.year}`.padStart(4, "0");
  const m = `${date.month}`.padStart(2, "0");
  const d = `${date.day}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export type Revision = {
  number: number;
  date: Date;
  remark: string;
};
