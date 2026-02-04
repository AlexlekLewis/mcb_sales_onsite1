import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200">
                    <div className="flex items-center gap-2 mb-2 font-bold text-red-400">
                        <AlertTriangle size={20} />
                        <h3>Something went wrong</h3>
                    </div>
                    <p className="text-sm mb-4 opacity-80">
                        {this.state.error?.message || 'An unexpected error occurred.'}
                    </p>
                    <button
                        onClick={() => this.setState({ hasError: false })}
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-xs transition-colors"
                    >
                        <RefreshCcw size={14} />
                        Try again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
