"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { toast } from "react-toastify";
import { useI18n } from "@/lib/i18n/client";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  translate?: (key: string) => string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    const errorMessage = this.props.translate ? 
      this.props.translate("toast.auth.unexpectedError") : 
      "An unexpected error occurred";
    toast.error(errorMessage);
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Oops! Something went wrong
            </h2>
            <p className="text-gray-600 mb-4">
              We apologize for the inconvenience. Please try refreshing the page or
              contact support if the problem persists.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper component that provides translation to the class component
export function ErrorBoundaryWithI18n({ children, fallback, onError }: Omit<Props, 'translate'>) {
  const { t } = useI18n();
  
  return (
    <ErrorBoundary
      translate={t}
      fallback={fallback}
      onError={onError}
    >
      {children}
    </ErrorBoundary>
  );
} 