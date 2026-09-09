import { ProductActions } from "./product-actions";

export function generateStaticParams() {
  return [{ slug: "starter" }, { slug: "pro" }];
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <main>
      <h1>Product: {slug}</h1>
      <ProductActions slug={slug} />
    </main>
  );
}
