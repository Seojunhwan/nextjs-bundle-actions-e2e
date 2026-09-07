"use client";

import { useState } from "react";

import { FEATURE_PAYLOAD } from "./feature-payload";
import { EXTRA_PAYLOAD } from "./extra-payload";

export function ClientWidget() {
  const [count, setCount] = useState(0);

  return (
    <button type="button" onClick={() => setCount((value) => value + 1)}>
      E2E clicks: {count}
      <span hidden>{FEATURE_PAYLOAD[count % FEATURE_PAYLOAD.length]}</span>
      <span hidden>{EXTRA_PAYLOAD[count % EXTRA_PAYLOAD.length]}</span>
    </button>
  );
}
