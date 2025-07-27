export const initcap = (str: string): string =>
  str.toLowerCase().replace(/\b[a-z]/g, (char: string) => char.toUpperCase());

export function formatTodayDate(): string {
  const date = new Date();

  const day = date.getDate();
  const month = date.toLocaleString("default", { month: "long" });
  const year = date.getFullYear();

  // Add ordinal suffix: st, nd, rd, th
  const getOrdinal = (n: number): string => {
    const s = ["th", "st", "nd", "rd"],
      v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  return `${getOrdinal(day)} ${month} ${year}`;
}
