import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function pluralize(count: number, singular: string, plural: string) {
  return count === 1 ? singular : plural;
}

export function hashEmail(email: string): string {
  return Buffer.from(email).toString("base64").replace(/[+/=]/g, "");
}
