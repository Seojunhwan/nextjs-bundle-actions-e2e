"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const LazyPanel = dynamic(() => import("./lazy-panel"), {
  loading: () => <p>Loading deferred bundle details…</p>,
});

export function LazyPanelLoader() {
  const [visible, setVisible] = useState(false);

  return (
    <section>
      <button type="button" onClick={() => setVisible((value) => !value)}>
        {visible ? "Hide" : "Load"} bundle details
      </button>
      {visible && <LazyPanel />}
    </section>
  );
}
