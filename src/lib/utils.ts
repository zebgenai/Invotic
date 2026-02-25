import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isValid } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safely format a date string or Date object using date-fns.
 * Returns a fallback string if the date is invalid.
 */
export function safeFormatDate(
  dateInput: string | Date | null | undefined,
  formatStr: string,
  fallback: string = "—"
): string {
  if (!dateInput) return fallback;
  try {
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    if (!isValid(date)) return fallback;
    return format(date, formatStr);
  } catch {
    return fallback;
  }
}
