import Link from "next/link";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";

export default async function MerchPage() {
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
  }

  return (
    <main className="min-h-screen bg-[#f5f3ee] text-black">
      <Navbar />

      <section className="px-6 pb-20 pt-36">
        <div className="mx-auto max-w-7xl">

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

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">

            {products?.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="group"
              >
                <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-3xl bg-white transition duration-300 group-hover:-translate-y-2 group-hover:shadow-xl">

                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-black tracking-tighter text-black/10">
                      MERCH
                    </span>
                  )}

                  {product.stock <= 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <span className="rounded-full bg-white px-5 py-2 text-sm font-bold">
                        HABIS
                      </span>
                    </div>
                  )}

                </div>

                <div className="mt-5 flex justify-between gap-4">
                  <div>
                    <h2 className="font-bold">
                      {product.name}
                    </h2>

                    <p className="mt-1 text-sm text-black/50">
                      {product.description}
                    </p>

                    {product.sizes?.length > 0 && (
                      <p className="mt-2 text-xs text-black/40">
                        Ukuran tersedia:{" "}
                        {product.sizes
                          .map((item: any) =>
                            typeof item === "string"
                              ? item
                              : item.size
                          )
                          .join(", ")}
                      </p>
                    )}
                  </div>

                  <p className="font-bold whitespace-nowrap">
                    Rp{Number(product.price).toLocaleString("id-ID")}
                  </p>
                </div>
              </Link>
            ))}

          </div>

          {(!products || products.length === 0) && (
            <div className="mt-16 rounded-3xl bg-white p-12 text-center">
              <p className="font-bold">
                Belum ada merchandise tersedia.
              </p>
            </div>
          )}

        </div>
      </section>
    </main>
  );
}