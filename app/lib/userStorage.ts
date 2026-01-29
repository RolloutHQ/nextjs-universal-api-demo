import { UserProfile } from "@/types/resources";

export interface UserStorage {
  users: UserProfile[];
  activeUserId: string | null;
}

const STORAGE_KEY = 'rollout-users';

export function getAllUsers(): UserProfile[] {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  const data: UserStorage = JSON.parse(stored);
  return data.users || [];
}

export function getActiveUser(): UserProfile | null {
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  const data: UserStorage = JSON.parse(stored);
  return data.users.find(u => u.id === data.activeUserId) || null;
}

export function setActiveUser(userId: string): void {
  if (typeof window === 'undefined') return;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return;
  const data: UserStorage = JSON.parse(stored);
  data.activeUserId = userId;

  // Update lastUsed timestamp
  const user = data.users.find(u => u.id === userId);
  if (user) {
    user.lastUsed = new Date().toISOString();
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function createUser(name: string, email?: string): UserProfile {
  if (typeof window === 'undefined') {
    throw new Error('Cannot create user on server');
  }

  const newUser: UserProfile = {
    id: crypto.randomUUID(),
    name,
    email,
    createdAt: new Date().toISOString(),
    lastUsed: new Date().toISOString(),
  };

  const stored = localStorage.getItem(STORAGE_KEY);
  const data: UserStorage = stored
    ? JSON.parse(stored)
    : { users: [], activeUserId: null };

  data.users.push(newUser);
  data.activeUserId = newUser.id;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return newUser;
}

export function updateUserCredential(userId: string, credentialId: string): void {
  if (typeof window === 'undefined') return;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return;
  const data: UserStorage = JSON.parse(stored);

  const user = data.users.find(u => u.id === userId);
  if (user) {
    user.credentialId = credentialId;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}

export function deleteUser(userId: string): void {
  if (typeof window === 'undefined') return;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return;
  const data: UserStorage = JSON.parse(stored);

  data.users = data.users.filter(u => u.id !== userId);

  // If deleted user was active, set first user as active or null
  if (data.activeUserId === userId) {
    data.activeUserId = data.users.length > 0 ? data.users[0].id : null;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Migration function for existing users
export function migrateExistingUser(): void {
  if (typeof window === 'undefined') return;

  const oldUserId = localStorage.getItem('userId');
  if (!oldUserId) return;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return; // Already migrated

  const newUser: UserProfile = {
    id: oldUserId,
    name: 'Default User',
    createdAt: new Date().toISOString(),
    lastUsed: new Date().toISOString(),
  };

  const data: UserStorage = {
    users: [newUser],
    activeUserId: oldUserId,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  localStorage.removeItem('userId'); // Clean up old key
}
