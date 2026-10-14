/**
 * VitaScan AI — Centralized Date & Time Synchronization Utility
 *
 * Requirements:
 * 1. Persisted timestamps are stored in UTC.
 * 2. All displays convert to Asia/Kolkata (IST, UTC+05:30) consistently.
 * 3. Handles both ISO strings with timezone (e.g. '2026-10-12T01:46:24Z')
 *    and naive backend strings without 'Z' by treating naive timestamps as UTC.
 * 4. Deterministic formatting across all browsers and operating systems.
 */

export const IST_TIMEZONE = "Asia/Kolkata";

/**
 * Parses any date representation (ISO string, Date, timestamp number) into a valid UTC Date.
 * If given a naive ISO string like "2026-10-12T01:46:24", appends 'Z' to ensure it is
 * parsed as UTC rather than the browser's local timezone.
 */
export function parseDateUTC(
  dateInput: string | Date | number | null | undefined
): Date | null {
  if (!dateInput) return null;
  if (dateInput instanceof Date) {
    return isNaN(dateInput.getTime()) ? null : dateInput;
  }
  if (typeof dateInput === "number") {
    const d = new Date(dateInput);
    return isNaN(d.getTime()) ? null : d;
  }

  let str = String(dateInput).trim();
  if (!str) return null;

  // If format is naive "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm:ss..." without timezone offset (Z, +HH:MM, -HH:MM)
  if (/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2})?(\.\d+)?$/.test(str)) {
    str = str.replace(" ", "T") + "Z";
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    str = str + "T00:00:00Z";
  }

  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

export interface ISTParts {
  day: string;
  month: string;
  year: string;
  hour: string;
  minute: string;
  second: string;
  dayPeriod: string;
  monthNumeric: number;
  yearNumeric: number;
  date: Date;
}

/**
 * Extracts individual date and time components converted into Asia/Kolkata (IST).
 */
export function getISTParts(
  dateInput: string | Date | number | null | undefined
): ISTParts | null {
  const date = parseDateUTC(dateInput);
  if (!date) return null;

  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: IST_TIMEZONE,
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    const parts = formatter.formatToParts(date);
    const getPart = (type: string) => parts.find((p) => p.type === type)?.value || "";

    const day = getPart("day");
    const month = getPart("month");
    const year = getPart("year");
    const hour = getPart("hour");
    const minute = getPart("minute");
    const second = getPart("second");
    const dayPeriod = getPart("dayPeriod").toUpperCase();

    // Also get numeric month for comparisons
    const numFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: IST_TIMEZONE,
      year: "numeric",
      month: "numeric",
    });
    const numParts = numFormatter.formatToParts(date);
    const monthNumeric = parseInt(numParts.find((p) => p.type === "month")?.value || "1", 10);
    const yearNumeric = parseInt(numParts.find((p) => p.type === "year")?.value || "1970", 10);

    return {
      day,
      month,
      year,
      hour,
      minute,
      second,
      dayPeriod,
      monthNumeric,
      yearNumeric,
      date,
    };
  } catch (err) {
    console.error("Error formatting IST date parts:", err);
    return null;
  }
}

/**
 * Formats full Date & Time in IST with timezone suffix.
 * Example: "12 Oct 2026, 07:16 AM IST"
 */
export function formatISTDateTime(
  dateInput: string | Date | number | null | undefined
): string {
  const parts = getISTParts(dateInput);
  if (!parts) return "N/A";
  return `${parts.day} ${parts.month} ${parts.year}, ${parts.hour}:${parts.minute} ${parts.dayPeriod} IST`;
}

/**
 * Formats full Date & Time with seconds in IST.
 * Example: "12 Oct 2026, 07:16:24 AM IST"
 */
export function formatISTDateTimeWithSeconds(
  dateInput: string | Date | number | null | undefined
): string {
  const parts = getISTParts(dateInput);
  if (!parts) return "N/A";
  return `${parts.day} ${parts.month} ${parts.year}, ${parts.hour}:${parts.minute}:${parts.second} ${parts.dayPeriod} IST`;
}

/**
 * Formats compact Date & Time in IST (ideal for table columns).
 * Example: "12 Oct 2026, 07:16 AM"
 */
export function formatISTDateTimeCompact(
  dateInput: string | Date | number | null | undefined
): string {
  const parts = getISTParts(dateInput);
  if (!parts) return "N/A";
  return `${parts.day} ${parts.month} ${parts.year}, ${parts.hour}:${parts.minute} ${parts.dayPeriod}`;
}

/**
 * Formats date only in IST.
 * Example: "12 Oct 2026"
 */
export function formatISTDate(
  dateInput: string | Date | number | null | undefined
): string {
  const parts = getISTParts(dateInput);
  if (!parts) return "N/A";
  return `${parts.day} ${parts.month} ${parts.year}`;
}

/**
 * Formats time only in IST with timezone indicator.
 * Example: "07:16 AM IST"
 */
export function formatISTTime(
  dateInput: string | Date | number | null | undefined
): string {
  const parts = getISTParts(dateInput);
  if (!parts) return "N/A";
  return `${parts.hour}:${parts.minute} ${parts.dayPeriod} IST`;
}

/**
 * Returns current timestamp formatted in Asia/Kolkata (IST).
 * Used for "Report Generated At" in PDFs and exports.
 */
export function getCurrentISTDateTime(): string {
  return formatISTDateTime(new Date());
}

/**
 * Checks whether a given timestamp falls in the current month according to Asia/Kolkata (IST).
 */
export function isCurrentISTMonth(
  dateInput: string | Date | number | null | undefined
): boolean {
  const target = getISTParts(dateInput);
  const now = getISTParts(new Date());
  if (!target || !now) return false;
  return (
    target.monthNumeric === now.monthNumeric &&
    target.yearNumeric === now.yearNumeric
  );
}
