/**
 * Formats a date string or Date object to "YYYY. MM. DD" format.
 */
export function formatDate(dateString: string | Date | undefined): string {
  if (!dateString) return "-";

  if (dateString instanceof Date) {
    if (isNaN(dateString.getTime())) return String(dateString);
    return formatYmd(
      dateString.getFullYear(),
      dateString.getMonth() + 1,
      dateString.getDate(),
    );
  }

  const raw = dateString.trim();
  if (!raw) return "-";

  // Prefer raw date prefix to avoid timezone drift on ISO datetime strings.
  const ymdMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})(?:$|[T\s].*)/);
  if (ymdMatch) {
    const year = Number(ymdMatch[1]);
    const month = Number(ymdMatch[2]);
    const day = Number(ymdMatch[3]);

    if (isValidYmd(year, month, day)) {
      return formatYmd(year, month, day);
    }

    return raw;
  }

  const date = new Date(raw);
  if (isNaN(date.getTime())) return raw;

  return formatYmd(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

function formatYmd(year: number, month: number, day: number): string {
  return `${year}. ${String(month).padStart(2, "0")}. ${String(day).padStart(2, "0")}`;
}

function isValidYmd(year: number, month: number, day: number): boolean {
  const utcDate = new Date(Date.UTC(year, month - 1, day));
  return (
    utcDate.getUTCFullYear() === year
    && utcDate.getUTCMonth() === month - 1
    && utcDate.getUTCDate() === day
  );
}
