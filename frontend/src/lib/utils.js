import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

export const cn = (...inputs) => twMerge(clsx(inputs));

export const formatDate = (date, pattern = "d MMM yyyy, h:mm a") => {
  if (!date) return "-";
  try {
    return format(new Date(date), pattern);
  } catch {
    return "-";
  }
};

export const timeAgo = (date) => {
  if (!date) return "-";
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return "-";
  }
};

export const initials = (firstName = "", lastName = "") =>
  `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();

export const currency = (value = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
