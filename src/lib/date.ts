import { format, isValid } from "date-fns";

export function formatDate(value?: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  return isValid(date) ? format(date, "yyyy.MM.dd") : null;
}
