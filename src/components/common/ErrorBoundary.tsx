import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled render error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 w-full">
          <div className="max-w-md w-full p-6 sm:p-8 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/80 dark:bg-rose-950/20 text-center shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>

            <h2 className="text-base sm:text-lg font-bold text-rose-900 dark:text-rose-100 tracking-tight">
              Đã xảy ra sự cố hiển thị
            </h2>

            <p className="text-xs sm:text-sm text-rose-700 dark:text-rose-300 mt-2 leading-relaxed">
              Thành phần này không thể hiển thị do lỗi cú pháp hoặc xung đột dữ liệu. Bạn có thể tải lại trang hoặc quay về trang chủ.
            </p>

            {this.state.error?.message && (
              <div className="mt-3 p-2.5 rounded-lg bg-rose-100/70 dark:bg-rose-900/30 text-[11px] font-mono text-rose-800 dark:text-rose-200 text-left overflow-x-auto max-h-24">
                {this.state.error.message}
              </div>
            )}

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Tải lại</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-[#18191e] text-rose-800 dark:text-rose-200 hover:bg-rose-100/50 dark:hover:bg-rose-900/40 text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Về trang chủ</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
