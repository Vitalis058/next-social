import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDate, formatDistanceToNowStrict } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

//func to format the date
export function formatRelativeDate(from: Date) {
  const currentDate = new Date();

  if (currentDate.getTime() - from.getTime() < 24 * 60 * 60 * 1000) {
    return formatDistanceToNowStrict(from, { addSuffix: true });
  } else {
    if (currentDate.getFullYear() === from.getFullYear()) {
      return formatDate(from, "d/MM");
    } else {
      return formatDate(from, "d MM, yyy");
    }
  }
}

//for large hashtags
export function formatNumber(n: number): string {
  return Intl.NumberFormat("en-us", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}
