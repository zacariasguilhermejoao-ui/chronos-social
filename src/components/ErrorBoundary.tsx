import { Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "@/lib/icons";

type Props = { children: ReactNode; fallback?: ReactNode; resetKey?: string };
type State = { hasError: boolean; error: Error | null; key: string | undefined };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null, key: this.props.resetKey };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null {
    if (props.resetKey !== state.key) {
      return { hasError: false, error: null, key: props.resetKey };
    }
    return null;
  }

  componentDidCatch(error: Error, info: unknown) {
    console.error("[ErrorBoundary]", error, info);
  }

  reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      const isChunk = /chunk|loading .*failed|dynamically imported/i.test(
        this.state.error?.message ?? "",
      );
      return (
        <div className="min-h-[60vh] grid place-items-center px-6">
          <div className="text-center max-w-sm">
            <div className="w-14 h-14 rounded-2xl bg-warning/15 grid place-items-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-warning" />
            </div>
            <h2 className="font-display font-bold text-xl mb-2">Algo correu mal</h2>
            <p className="text-sm text-muted-foreground mb-5">
              {isChunk
                ? "Falha ao carregar. Verifica a ligação e tenta novamente."
                : this.state.error?.message ?? "Erro inesperado ao carregar esta secção."}
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={this.reset} variant="outline">
                Tentar de novo
              </Button>
              {isChunk && (
                <Button onClick={() => window.location.reload()}>Recarregar</Button>
              )}
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
