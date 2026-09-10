import Navbar from "@/components/Navbar";
import Cart from "@/components/Cart";

export default function CartPage() {
  return (
    <main className="min-h-screen bg-[#f5f3ee] text-black">
      <Navbar />

      <section className="px-6 pb-20 pt-36">
        <div className="mx-auto max-w-7xl">

          <p className="text-sm font-bold uppercase tracking-[0.3em] text-red-600">
            Your Selection
          </p>

          <h1 className="mt-4 text-5xl font-black sm:text-7xl">
            YOUR CART.
          </h1>

          <p className="mt-6 max-w-xl text-black/60">
            Periksa merchandise yang kamu pilih sebelum melanjutkan
            ke checkout.
          </p>

          <div className="mt-16">
            <Cart />
          </div>

        </div>
      </section>
    </main>
  );
}