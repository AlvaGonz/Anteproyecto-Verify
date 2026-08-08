import '@testing-library/jest-dom';
import { vi } from 'vitest';

const createStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem(key: string) {
      return store[key] || null;
    },
    setItem(key: string, value: string) {
      store[key] = value.toString();
    },
    removeItem(key: string) {
      delete store[key];
    },
    clear() {
      store = {};
    },
  };
};

Object.defineProperty(window, 'localStorage', {
  value: createStorageMock(),
  writable: true
});

Object.defineProperty(window, 'sessionStorage', {
  value: createStorageMock(),
  writable: true
});

window.HTMLElement.prototype.scrollIntoView = vi.fn();
