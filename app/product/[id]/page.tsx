import ProductDetail from "@/components/ProductDetail";
import { supabase } from "@/lib/supabase";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-red-600">
            Magnificent Merch
          </p>

          <h1 className="mt-4 text-4xl font-black">
            Produk Tidak Ditemukan
          </h1>

          <p className="mt-4 text-black/50">
            Produk tidak tersedia atau sudah dinonaktifkan.
          </p>

          <a
            href="/merch"
            className="mt-8 inline-block rounded-full bg-black px-7 py-4 text-sm font-bold text-white hover:bg-red-600"
          >
            ← Kembali ke Merchandise
          </a>
        </div>
      </main>
    );
  }

  return <ProductDetail product={product} />;
}