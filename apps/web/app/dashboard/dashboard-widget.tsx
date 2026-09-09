"use client";

import { useState } from "react";

const DASHBOARD_SERIES = [12, 18, 15, 24, 31, 29, 38];

export function DashboardWidget() {
  const [range, setRange] = useState<"week" | "month">("week");
  const total = DASHBOARD_SERIES.reduce((sum, value) => sum + value, 0);

  return (
    <section>
      <p>
        {range} total: {total}
      </p>
      <button
        type="button"
        onClick={() =>
          setRange((value) => (value === "week" ? "month" : "week"))
        }
      >
        Toggle range
      </button>
    </section>
  );
}
