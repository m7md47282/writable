import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
  usePathname: () => '/',
}))

// Mock Next.js image component
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => {
    const React = require('react')
    return React.createElement('img', { src, alt, ...props })
  },
}))

// Global test setup
beforeEach(() => {
  // Clear all mocks before each test
  vi.clearAllMocks()
})
