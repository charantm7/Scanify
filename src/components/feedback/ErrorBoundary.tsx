"use client";

import React, {
    Component,
    ErrorInfo,
    ReactNode,
    ComponentType,
} from "react";

interface FallbackProps {
    error: Error | null;
}

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ComponentType<FallbackProps>;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<
    ErrorBoundaryProps,
    ErrorBoundaryState
> {
    constructor(props: ErrorBoundaryProps) {
        super(props);

        this.state = {
            hasError: false,
            error: null,
        };
    }

    static getDerivedStateFromError(
        error: Error
    ): ErrorBoundaryState {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(
        error: Error,
        errorInfo: ErrorInfo
    ) {
        console.error(
            "Error Boundary Caught:",
            error,
            errorInfo
        );
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                const FallbackComponent =
                    this.props.fallback;

                return (
                    <FallbackComponent
                        error={this.state.error}
                    />
                );
            }

            return (
                <div style={{ padding: "20px" }}>
                    <h2>Something went wrong.</h2>

                    <p>
                        {this.state.error?.message}
                    </p>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;