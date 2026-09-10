import Navbar from "@/components/Navbar";
import Checkout from "@/components/Checkout";

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-[#f5f3ee] text-black">
      <Navbar />

      <section className="px-6 pb-20 pt-36">
        <div className="mx-auto max-w-7xl">

          <p className="text-sm font-bold uppercase tracking-[0.3em] text-red-600">
            Complete Order
          </p>

          <h1 className="mt-4 text-5xl font-black sm:text-7xl">
            CHECKOUT.
          </h1>

          <p className="mt-6 max-w-xl text-black/60">
            Lengkapi data pemesan sebelum membuat pesanan.
          </p>

          <div className="mt-16">
            <Checkout />
          </div>

        </div>
      </section>
    </main>
  );
}