import { Component, ReactNode } from "react";

type Props = { children: ReactNode; resetKey?: string; fallback?: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidUpdate(prev: Props) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-[40vh] grid place-items-center p-6 text-center">
          <div className="max-w-sm space-y-3">
            <p className="font-display font-bold text-lg">Algo correu mal</p>
            <p className="text-sm text-muted-foreground">{this.state.error.message}</p>
            <button
              onClick={() => this.setState({ error: null })}
              className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-bold"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
