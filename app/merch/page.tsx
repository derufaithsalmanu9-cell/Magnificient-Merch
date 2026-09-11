import Link from "next/link";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  image: string | null;
  active: boolean;
  created_at: string;
  sizes: {
    size: string;
    price: number;
    stock: number;
  }[];
};

export default async function MerchPage() {
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Gagal mengambil produk:", error);

    return (
      <main className="min-h-screen bg-[#f5f3ee] text-black">
        <Navbar />

        <section className="flex min-h-[70vh] items-center justify-center px-6 pt-28">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-red-600">
              Magnificent Merch
            </p>

            <h1 className="mt-4 text-4xl font-black">
              Gagal Memuat Produk
            </h1>

            <p className="mt-4 text-black/50">
              Silakan refresh halaman atau coba lagi nanti.
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f3ee] text-black">
      <Navbar />

      <section className="px-6 pb-20 pt-36">
        <div className="mx-auto max-w-7xl">

          {/* HEADER */}
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-red-600">
            Official Collection
          </p>

          <h1 className="mt-4 text-5xl font-black sm:text-7xl">
            MERCHANDISE.
          </h1>

          <p className="mt-6 max-w-xl text-black/60">
            Koleksi resmi Magnificent. Pilih merchandise
            favoritmu dan jadilah bagian dari momennya.
          </p>

          {/* PRODUCTS */}
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">

            {products?.map((product: Product) => {
              const totalStock =
                product.sizes?.length > 0
                  ? product.sizes.reduce(
                      (sum, size) => sum + Number(size.stock || 0),
                      0
                    )
                  : Number(product.stock || 0);

              return (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  className="group"
                >

                  {/* IMAGE */}
                  <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-3xl bg-white transition duration-300 group-hover:-translate-y-2 group-hover:shadow-xl">

                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <span className="text-4xl font-black tracking-tighter text-black/10">
                        MERCH
                      </span>
                    )}

                    {/* STOCK BADGE */}
                    {totalStock <= 0 && (
                      <div className="absolute right-4 top-4 rounded-full bg-black px-4 py-2 text-xs font-bold text-white">
                        STOK HABIS
                      </div>
                    )}

                  </div>

                  {/* INFO */}
                  <div className="mt-5 flex justify-between gap-4">

                    <div>
                      <h2 className="font-bold">
                        {product.name}
                      </h2>

                      <p className="mt-1 text-sm text-black/50">
                        {product.description || "Official Edition"}
                      </p>

                      {/* SIZE PREVIEW */}
                      {product.sizes?.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {product.sizes.map((size) => (
                            <span
                              key={size.size}
                              className="rounded-full bg-black/5 px-3 py-1 text-xs font-bold"
                            >
                              {size.size}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <p className="whitespace-nowrap font-bold">
                      Rp{Number(product.price).toLocaleString("id-ID")}
                    </p>

                  </div>

                </Link>
              );
            })}

          </div>

          {/* EMPTY STATE */}
          {(!products || products.length === 0) && (
            <div className="mt-16 rounded-3xl bg-white p-16 text-center">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-black/30">
                Magnificent Merch
              </p>

              <h2 className="mt-3 text-2xl font-black">
                Belum Ada Merchandise
              </h2>

              <p className="mt-2 text-black/40">
                Produk yang diaktifkan oleh admin akan muncul di sini.
              </p>
            </div>
          )}

        </div>
      </section>
    </main>
  );
}