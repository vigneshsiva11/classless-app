import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Simple in-memory cache with TTL
type CacheEntry<T> = { value: T; expiresAt: number }
const memoryCache: Record<string, CacheEntry<unknown>> = {}

export function cacheGet<T>(key: string): T | null {
  const entry = memoryCache[key]
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    delete memoryCache[key]
    return null
  }
  return entry.value as T
}

export function cacheSet<T>(key: string, value: T, ttlMs: number) {
  memoryCache[key] = { value, expiresAt: Date.now() + ttlMs }
}
