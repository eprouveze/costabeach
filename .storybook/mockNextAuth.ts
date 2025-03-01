import React from "react";

// Create a mock session
export const mockSession = {
  data: {
    user: {
      name: "Test User",
      email: "test@example.com",
      image: "https://avatars.githubusercontent.com/u/1234567?v=4",
    },
    expires: "2099-10-10T00:00:00.000Z",
  },
  status: "authenticated",
};

// Mock the useSession hook
export function useSession() {
  return mockSession;
}

// Mock the SessionProvider component
export function SessionProvider({ children }: { children: React.ReactNode }) {
  return children;
}

// Mock the signIn function
export function signIn() {
  return Promise.resolve({ ok: true, error: null });
}

// Mock the signOut function
export function signOut() {
  return Promise.resolve({ ok: true });
}

// Mock the getCsrfToken function
export function getCsrfToken() {
  return Promise.resolve("mock-csrf-token");
}

// Mock the getProviders function
export function getProviders() {
  return Promise.resolve({
    google: {
      id: "google",
      name: "Google",
      type: "oauth",
      signinUrl: "http://localhost:3000/api/auth/signin/google",
      callbackUrl: "http://localhost:3000/api/auth/callback/google",
    },
  });
}

// Create a decorator that wraps stories with the SessionProvider
export const withSessionProvider = (Story: React.ComponentType) => {
  const StoryWithSession = () => {
    return React.createElement(Story, null);
  };
  return React.createElement(StoryWithSession, null);
}; 