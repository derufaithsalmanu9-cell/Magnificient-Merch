"use client";

import Link from "next/link";

export default function ProductDetail({ id }: { id: string }) {
  return (
    <main className="min-h-screen bg-[#f5f3ee] px-6 py-32 text-black">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/merch"
          className="text-sm font-bold text-black/50 hover:text-red-600"
        >
          ← Kembali ke Merchandise
        </Link>

        <div className="mt-10 rounded-3xl bg-white p-10">
          <p className="text-sm uppercase tracking-widest text-red-600">
            Product
          </p>

          <h1 className="mt-4 text-5xl font-black">
            {id.toUpperCase()}
          </h1>

          <p className="mt-4 text-black/50">
            Halaman detail produk Magnificent.
          </p>
        </div>
      </div>
    </main>
  );
}