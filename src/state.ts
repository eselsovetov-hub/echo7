import { CONFIG } from './config';

const QUEST_KEYS = ['q0', 'q2a', 'q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8'] as const;
const DATA_PREFIX = 'data_';
const NOTIF_PREFIX = 'notif_';

export function isDone(quest: string): boolean {
  return localStorage.getItem(quest) === 'true';
}

export function markDone(quest: string): void {
  localStorage.setItem(quest, 'true');
}

export function requireDone(quest: string, redirect = '/dashboard'): boolean {
  if (CONFIG.openAccess) return true;
  if (isDone(quest)) return true;
  window.location.href = redirect;
  return false;
}

export function setData(key: string, value: string): void {
  localStorage.setItem(DATA_PREFIX + key, value);
}

export function getData(key: string): string | null {
  return localStorage.getItem(DATA_PREFIX + key);
}

export function markNotifShown(id: string): void {
  localStorage.setItem(NOTIF_PREFIX + id, 'shown');
}

export function isNotifShown(id: string): boolean {
  return localStorage.getItem(NOTIF_PREFIX + id) === 'shown';
}

export function resetProgress(): void {
  QUEST_KEYS.forEach(k => localStorage.removeItem(k));
  CONFIG.notifications.forEach(n => localStorage.removeItem(NOTIF_PREFIX + n.id));
  Object.keys(localStorage).forEach(k => {
    if (k.startsWith(DATA_PREFIX)) localStorage.removeItem(k);
  });
}

export function jumpToQuest(quest: string): void {
  const questOrder = ['q0', 'q2a', 'q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8'];
  const idx = questOrder.indexOf(quest);
  for (let i = 0; i <= idx; i++) {
    markDone(questOrder[i]);
  }
}

export function getFirstUnshownNotif() {
  return CONFIG.notifications.find(n => isDone(n.after) && !isNotifShown(n.id));
}

export function getAllPendingNotifs() {
  return CONFIG.notifications.filter(n => isDone(n.after) && !isNotifShown(n.id));
}
