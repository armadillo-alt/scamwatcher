import { Component, type ErrorInfo, type ReactNode } from "react";

/**
 * Last-resort guard so a single render error shows a plain message with a way out,
 * instead of React unmounting to a blank white page.
 */
export class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("ScamGuard hit an unexpected error:", error, info);
  }

  render(): ReactNode {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="empty" style={{ margin: "72px auto", maxWidth: 520 }}>
        <h3>Something went wrong on this screen.</h3>
        <p>Reloading usually fixes it. Your saved reviews are safe.</p>
        <div className="btn-row">
          <button className="btn btn-primary" onClick={() => location.reload()}>
            Reload
          </button>
          <a className="btn btn-quiet" href="/app/settings">
            Open Settings
          </a>
        </div>
      </div>
    );
  }
}
