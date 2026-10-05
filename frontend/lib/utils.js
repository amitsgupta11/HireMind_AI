import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Merge conditional class names + resolve Tailwind conflicts.
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
