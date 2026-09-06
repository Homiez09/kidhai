export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pick<T>(arr: readonly T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

export function randomDigits(length: number): string {
  let s = "";
  for (let i = 0; i < length; i++) s += randInt(0, 9);
  return s;
}

export function randomHex(length: number): string {
  const chars = "0123456789abcdef";
  let s = "";
  for (let i = 0; i < length; i++) s += chars[randInt(0, 15)];
  return s;
}

export function randomAlphaNumeric(length: number, upper = false): string {
  const chars = upper
    ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    : "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let s = "";
  for (let i = 0; i < length; i++) s += chars[randInt(0, chars.length - 1)];
  return s;
}

export function uuidV4(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

export function pad(n: number, width: number): string {
  return String(n).padStart(width, "0");
}
