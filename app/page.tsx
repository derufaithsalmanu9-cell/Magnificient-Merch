import Link from "next/link";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false });

  return (
    <main className="lumina-page min-h-screen overflow-hidden">
      <Navbar />

      {/* HERO */}
      <section className="lumina-hero relative px-5 pb-16 pt-28 sm:px-8 lg:px-12">
        <div className="forest-decoration forest-left" />
        <div className="forest-decoration forest-right" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="grid items-center gap-10 lg:grid-cols-2">

            {/* TEXT */}
            <div className="text-center lg:text-left">
              <div className="lumina-label mx-auto lg:mx-0">
                ✦ OFFICIAL COLLECTION ✦
              </div>

              <h1 className="lumina-title mt-5">
                Magnificent
                <br />
                <span>Merch</span>
              </h1>

              <p className="mx-auto mt-6 max-w-lg text-base leading-7 text-[#493521]/75 sm:text-lg lg:mx-0">
                Koleksi resmi Magnificent untuk menjadi bagian
                dari momen spesial kita bersama.
              </p>

              <Link
                href="/merch"
                className="wood-button mt-8 inline-flex items-center gap-3"
              >
                Lihat Merchandise
                <span>→</span>
              </Link>
            </div>

            {/* ILLUSTRATION */}
            <div className="relative mx-auto h-[350px] w-full max-w-[520px] sm:h-[450px]">

              <div className="cloud cloud-1" />
              <div className="cloud cloud-2" />

              {/* PRODUCT MOCKUP */}
              <div className="product-hero product-blue">
                <div className="product-shirt-design">
                  <span>MAGNIFICENT</span>
                  <strong>24</strong>
                </div>
              </div>

              <div className="product-hero product-white">
                <div className="product-shirt-design white-design">
                  <span>MAGNIFICENT</span>
                  <strong>∞</strong>
                </div>
              </div>

              {/* MASCOT */}
              <div className="mascot mascot-main">
                <div className="mascot-ear left" />
                <div className="mascot-ear right" />
                <div className="mascot-face">
                  <div className="eye left-eye" />
                  <div className="eye right-eye" />
                  <div className="nose" />
                </div>
                <div className="mascot-body" />
              </div>

              <div className="sparkle sparkle-1">✦</div>
              <div className="sparkle sparkle-2">✦</div>
              <div className="sparkle sparkle-3">✧</div>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="relative bg-[#f8f1df] px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">

          <div className="mb-10 text-center">
            <div className="lumina-label mx-auto">
              ✦ COLLECTION ✦
            </div>

            <h2 className="lumina-section-title mt-4">
              Produk Unggulan
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm text-[#493521]/60">
              Pilih merchandise favoritmu dan bawa pulang
              bagian dari cerita Magnificent.
            </p>
          </div>

          {products && products.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.slice(0, 6).map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  className="product-card group"
                >
                  {/* IMAGE */}
                  <div className="product-image-box">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-contain p-5 transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="text-5xl font-black text-[#8d6845]/20">
                          M
                        </span>
                      </div>
                    )}

                    {product.stock <= 0 && (
                      <div className="absolute left-3 top-3 rounded-full bg-[#7d2f24] px-3 py-1 text-xs font-bold text-white">
                        HABIS
                      </div>
                    )}
                  </div>

                  {/* INFO */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-black text-[#493521]">
                          {product.name}
                        </h3>

                        <p className="mt-1 text-sm text-[#493521]/55">
                          {product.description || "Official Edition"}
                        </p>
                      </div>

                      <div className="product-arrow">
                        →
                      </div>
                    </div>

                    <div className="mt-5 flex items-end justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-[#493521]/40">
                          Mulai dari
                        </p>

                        <p className="mt-1 text-xl font-black text-[#754321]">
                          Rp{product.price.toLocaleString("id-ID")}
                        </p>
                      </div>

                      <p className="text-xs text-[#493521]/45">
                        {product.stock > 0
                          ? `${product.stock} tersedia`
                          : "Stok habis"}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-products">
              <div className="text-5xl">🌿</div>
              <h3 className="mt-4 text-xl font-black">
                Merchandise segera hadir
              </h3>
              <p className="mt-2 text-sm text-black/50">
                Belum ada produk aktif saat ini.
              </p>
            </div>
          )}

          {products && products.length > 6 && (
            <div className="mt-10 text-center">
              <Link
                href="/merch"
                className="wood-button inline-flex"
              >
                Lihat Semua Merchandise →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-[#4c83c7] px-5 py-16 text-center sm:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#f8f1df] text-4xl shadow-xl">
            ✦
          </div>

          <h2 className="mt-6 text-3xl font-black text-white sm:text-5xl">
            Sudah pesan?
          </h2>

          <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-white/80 sm:text-base">
            Cek perkembangan pesananmu menggunakan kode
            pesanan yang kamu dapatkan setelah checkout.
          </p>

          <Link
            href="/status"
            className="cream-button mt-7 inline-flex"
          >
            Cek Pesanan →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#493521] px-5 py-10 text-center text-[#f8f1df]">
        <p className="text-xl font-black">
          MAGNIFICIENT
        </p>

        <p className="mt-2 text-xs text-white/50">
          Official Merchandise Store
        </p>

        <p className="mt-6 text-[10px] uppercase tracking-[0.3em] text-white/30">
          Made with ✦ for Magnificent
        </p>
      </footer>
    </main>
  );
}