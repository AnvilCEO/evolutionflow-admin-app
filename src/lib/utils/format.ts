/**
 * Formats a date string or Date object to "YYYY. MM. DD" format.
 */
export function formatDate(dateString: string | Date | undefined): string {
  if (!dateString) return "-";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return String(dateString);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}. ${month}. ${day}`;
}
