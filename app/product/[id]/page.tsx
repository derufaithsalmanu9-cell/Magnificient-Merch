import ProductDetail from "@/components/ProductDetail";
import { supabase } from "@/lib/supabase";

type ProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { id } = await params;

  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("active", true)
    .single();

  if (error || !product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f3ee] px-6 text-black">
        <div className="max-w-md text-center">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-red-600">
            Magnificent Merch
          </p>

          <h1 className="mt-4 text-4xl font-black">
            Produk Tidak Ditemukan
          </h1>

          <p className="mt-4 text-black/50">
            Produk yang kamu cari mungkin sudah tidak tersedia.
          </p>

          <a
            href="/merch"
            className="mt-8 inline-block rounded-full bg-black px-6 py-3 text-sm font-bold text-white transition hover:bg-red-600"
          >
            ← Kembali ke Merchandise
          </a>
        </div>
      </main>
    );
  }

  return <ProductDetail product={product} />;
}