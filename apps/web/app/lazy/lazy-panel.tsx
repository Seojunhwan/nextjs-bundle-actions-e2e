"use client";

const DYNAMIC_IMPORT_E2E_SENTINEL = "DYNAMIC_IMPORT_E2E_SENTINEL_v1";
const PANEL_ROWS = [
  "acquisition:organic-search",
  "acquisition:product-referral",
  "activation:first-project",
  "activation:first-deployment",
  "retention:weekly-builder",
  "retention:monthly-builder",
  "revenue:team-upgrade",
  "revenue:enterprise-upgrade",
];

export default function LazyPanel() {
  return (
    <aside aria-label="Dynamically imported bundle details">
      <h2>Deferred bundle details</h2>
      <ul>
        {PANEL_ROWS.map((row) => (
          <li key={row}>{row}</li>
        ))}
      </ul>
      <span hidden>{DYNAMIC_IMPORT_E2E_SENTINEL}</span>
    </aside>
  );
}
