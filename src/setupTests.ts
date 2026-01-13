import "@testing-library/jest-dom";

// Recharts needs ResizeObserver in the test environment
class ResizeObserverMock {
  observe() {
    // no-op
  }
  unobserve() {
    // no-op
  }
  disconnect() {
    // no-op
  }
}

if (typeof window !== "undefined" && !window.ResizeObserver) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.ResizeObserver = ResizeObserverMock;
}
