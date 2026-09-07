import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Global error boundary. Catches any unhandled exception thrown during
 * rendering and shows a recovery screen so the user is never stuck on a
 * blank white page.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[Mindora] Uncaught error:", error, info.componentStack);
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
  };

  private handleGoHome = () => {
    // Navigate to the root — works with both hash and browser routers.
    window.location.hash = "/";
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#FFF8F0] p-6">
          <div className="w-full max-w-md space-y-6 rounded-3xl border-2 border-red-200 bg-white p-8 text-center shadow-xl">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-5xl">
              😟
            </div>

            <h1 className="text-2xl font-extrabold text-slate-800">
              Something went wrong
            </h1>
            <p className="text-lg font-semibold text-slate-500">
              Don&apos;t worry — your data is safe. Let&apos;s get you back on
              track.
            </p>

            <div className="flex flex-col gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleRetry}
                className="w-full cursor-pointer rounded-2xl bg-[#FF6584] px-6 py-4 text-lg font-extrabold text-white shadow-md transition-all hover:bg-[#e8506e] active:scale-[0.97]"
              >
                Try Again
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="w-full cursor-pointer rounded-2xl border-2 border-slate-200 bg-white px-6 py-4 text-lg font-extrabold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-[0.97]"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

