import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "~/components/ui/button";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Erro ao renderizar componente Puck:", error, info);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-6 text-center text-destructive"
        >
          <p className="text-sm font-medium">
            Não foi possível renderizar este bloco.
          </p>
          {this.state.error?.message ? (
            <pre className="max-w-full overflow-x-auto text-xs opacity-80">
              {this.state.error.message}
            </pre>
          ) : null}
          <Button variant="outline" size="sm" onClick={this.handleReset}>
            Tentar novamente
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
