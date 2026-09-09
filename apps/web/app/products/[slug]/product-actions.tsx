"use client";

import { useState } from "react";

export function ProductActions({ slug }: { slug: string }) {
  const [selected, setSelected] = useState(false);

  return (
    <button type="button" onClick={() => setSelected((value) => !value)}>
      {selected ? "Remove" : "Add"} {slug}
    </button>
  );
}
