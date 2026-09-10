import ProductDetail from "@/components/ProductDetail";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/api/admin/products`,
    { cache: "no-store" },
  );

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  const products = Array.isArray(data) ? data : data.products ?? [];
  const product = products.find((item: { id: string }) => item.id === id);

  if (!product) {
    return null;
  }

  return <ProductDetail id={id} />;
}