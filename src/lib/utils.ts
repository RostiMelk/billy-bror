import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function pluralize(count: number, singular: string, plural: string) {
  return count === 1 ? singular : plural;
}

export function hashEmail(email?: string): string {
  if (!email) return "";
  return Buffer.from(email).toString("base64").replace(/[+/=]/g, "");
}

export function firstName(name?: string): string {
  if (!name) return "";
  return (
    name.split(" ")[0].charAt(0).toUpperCase() + name.split(" ")[0].slice(1)
  );
}

export function humanJoin(arr?: string[]): string {
  if (!arr || arr.length === 0) return "";
  if (arr.length === 1) return arr[0];
  if (arr.length === 2) return `${arr[0]} og ${arr[1]}`;
  return `${arr.slice(0, -1).join(", ")}, og ${arr[arr.length - 1]}`;
}
