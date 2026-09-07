import { ClientWidget } from "./client-widget";

export default function Home() {
  return (
    <main>
      <h1>Next.js 번들 액션 E2E</h1>
      <p>This route provides the base bundle snapshot.</p>
      <ClientWidget />
    </main>
  );
}
