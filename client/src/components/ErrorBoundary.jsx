import { Component } from 'react';
export default class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <main className="min-h-screen flex items-center justify-center p-6 bg-gray-50"><div className="max-w-md space-y-4"><h1 className="text-2xl font-bold">This page could not load</h1><p className="text-gray-600">Reload the page to try again. Your saved cart will still be here.</p><button className="btn btn-primary" onClick={() => window.location.reload()}>Reload page</button></div></main>;
    return this.props.children;
  }
}
