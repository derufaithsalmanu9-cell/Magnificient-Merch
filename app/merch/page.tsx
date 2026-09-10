import Link from "next/link";
import Navbar from "@/components/Navbar";

const products = [
  {
    id: "shirt",
    name: "Magnificent T-Shirt",
    price: 85000,
    description: "Official Edition",
  },
  {
    id: "hoodie",
    name: "Magnificent Hoodie",
    price: 150000,
    description: "Limited Edition",
  },
  {
    id: "totebag",
    name: "Magnificent Tote Bag",
    price: 45000,
    description: "Everyday Edition",
  },
];

export default function MerchPage() {
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

            {products.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="group"
              >

                <div className="flex aspect-square items-center justify-center rounded-3xl bg-white transition duration-300 group-hover:-translate-y-2 group-hover:shadow-xl">

                  <span className="text-4xl font-black tracking-tighter text-black/10">
                    {product.id.toUpperCase()}
                  </span>

                </div>

                <div className="mt-5 flex justify-between gap-4">

                  <div>
                    <h2 className="font-bold">
                      {product.name}
                    </h2>

                    <p className="mt-1 text-sm text-black/50">
                      {product.description}
                    </p>
                  </div>

                  <p className="font-bold">
                    Rp{product.price.toLocaleString("id-ID")}
                  </p>

                </div>

              </Link>
            ))}

          </div>

        </div>

      </section>

    </main>
  );
}