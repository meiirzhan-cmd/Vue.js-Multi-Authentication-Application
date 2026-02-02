import { vi, beforeEach } from "vitest";
import { config } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";

// Mock localStorage
const localStorageMock = {
  store: {} as Record<string, string>,
  getItem: vi.fn((key: string) => localStorageMock.store[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageMock.store[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete localStorageMock.store[key];
  }),
  clear: vi.fn(() => {
    localStorageMock.store = {};
  }),
};

Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
});

// Mock window.location
const locationMock = {
  href: "",
  assign: vi.fn(),
  replace: vi.fn(),
  reload: vi.fn(),
};

Object.defineProperty(globalThis, "location", {
  value: locationMock,
  writable: true,
});

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  localStorageMock.store = {};
  locationMock.href = "";
  setActivePinia(createPinia());
});

// Configure Vue Test Utils defaults
config.global.stubs = {
  teleport: true,
  transition: false,
};

export { localStorageMock, locationMock };
