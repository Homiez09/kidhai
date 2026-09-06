export interface HistoryEntry {
  id: string;
  createdAt: string;
  kind: "person" | "card" | "file";
  title: string;
  count: number;
  data?: unknown;
}

const KEY = "dataforge_history_v1";
const MAX_ENTRIES = 30;

export function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function addHistoryEntry(entry: Omit<HistoryEntry, "id" | "createdAt">) {
  if (typeof window === "undefined") return;
  const list = getHistory();
  const next: HistoryEntry = {
    ...entry,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  list.unshift(next);
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX_ENTRIES)));
  } catch {
    // เกิน quota ของ localStorage ก็แค่ข้าม ไม่กระทบการทำงานหลัก
  }
}

export function removeHistoryEntry(id: string) {
  const list = getHistory().filter((e) => e.id !== id);
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function clearHistory() {
  localStorage.removeItem(KEY);
}
