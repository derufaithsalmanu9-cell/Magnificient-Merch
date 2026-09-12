"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function SuccessPage() {
  const [orderCode, setOrderCode] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("magnificent-order");

    if (saved) {
      const order = JSON.parse(saved);
      setOrderCode(order.orderCode);
    }
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f3ee] px-6">

      <div className="w-full max-w-xl rounded-3xl bg-white p-10 text-center">

        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-3xl">
          ✓
        </div>

        <p className="mt-8 text-sm font-bold uppercase tracking-[0.3em] text-red-600">
          Order Received
        </p>

        <h1 className="mt-4 text-5xl font-black">
          PESANAN BERHASIL
          batas pembayaran 21 Sept pukul 10.15.
        </h1>

        <p className="mt-5 text-black/50">
          Pesanan kamu sudah dibuat. Screenshoot atau Simpan kode pesanan
          berikut untuk proses selanjutnya.
        </p>

        <div className="mt-8 rounded-2xl bg-[#f5f3ee] p-6">

          <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/40">
            Order Code
          </p>

          <p className="mt-2 text-3xl font-black tracking-wider">
            {orderCode || "MAG-XXXXXX"}
          </p>

        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">

          <Link
            href="/merch"
            className="flex-1 rounded-full bg-black px-6 py-4 text-sm font-bold text-white transition hover:bg-red-600"
          >
            Belanja Lagi
          </Link>

          <Link
            href="/"
            className="flex-1 rounded-full border border-black/10 px-6 py-4 text-sm font-bold transition hover:border-black"
          >
            Kembali ke Home
          </Link>

        </div>

      </div>

    </main>
  );
}