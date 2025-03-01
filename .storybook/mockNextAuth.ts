import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import React from "react";

// Create a mock session
export const mockSession: Session = {
  user: {
    name: "Test User",
    email: "test@example.com",
    image: "https://avatars.githubusercontent.com/u/1234567?v=4",
  },
  expires: "2099-10-10T00:00:00.000Z",
};

// Create a decorator that wraps stories with the SessionProvider
export const withSessionProvider = (Story: React.ComponentType) => (
  <SessionProvider session={mockSession}>
    <Story />
  </SessionProvider>
); 