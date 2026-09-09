import { LazyPanelLoader } from "./lazy-panel-loader";

export default function LazyPage() {
  return (
    <main>
      <h1>Dynamic import route</h1>
      <p>The details component is loaded only after interaction.</p>
      <LazyPanelLoader />
    </main>
  );
}
