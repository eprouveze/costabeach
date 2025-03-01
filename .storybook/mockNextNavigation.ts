// Mock implementation of next/navigation for Storybook
export function useRouter() {
  return {
    push: (url: string) => {
      console.log(`[Mock Router] Navigating to: ${url}`);
    },
    replace: (url: string) => {
      console.log(`[Mock Router] Replacing with: ${url}`);
    },
    back: () => {
      console.log(`[Mock Router] Going back`);
    },
    forward: () => {
      console.log(`[Mock Router] Going forward`);
    },
    refresh: () => {
      console.log(`[Mock Router] Refreshing`);
    },
    prefetch: (url: string) => {
      console.log(`[Mock Router] Prefetching: ${url}`);
    }
  };
}

export function useSearchParams() {
  return {
    get: (key: string) => null,
    getAll: (key: string) => [],
    has: (key: string) => false,
    forEach: () => {},
    entries: () => [],
    keys: () => [],
    values: () => [],
    toString: () => "",
  };
}

export function usePathname() {
  return "/";
}

export function useParams() {
  return {};
} 