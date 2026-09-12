"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type OrderData = {
  orderCode: string;
  payment: string;
};

export default function SuccessPage() {
  const [orderCode, setOrderCode] = useState("");
  const [payment, setPayment] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("magnificent-order");

    if (saved) {
      try {
        const order: OrderData = JSON.parse(saved);

        setOrderCode(order.orderCode || "");
        setPayment(order.payment || "");
      } catch {
        setOrderCode("");
        setPayment("");
      }
    }
  }, []);

  const isTransfer = payment === "Transfer";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f3ee] px-6 py-10">
      <div className="w-full max-w-xl rounded-3xl bg-white p-8 text-center shadow-sm sm:p-10">

        {/* ICON */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-3xl">
          ✓
        </div>

        {/* HEADER */}
        <p className="mt-8 text-sm font-bold uppercase tracking-[0.3em] text-red-600">
          Order Received
        </p>

        <h1 className="mt-4 text-4xl font-black sm:text-5xl">
          PESANAN BERHASIL
        </h1>

        <p className="mt-5 text-black/50">
          Pesanan kamu sudah dibuat. Screenshoot atau simpan kode pesanan
          berikut untuk proses selanjutnya.
        </p>

        {/* DEADLINE */}
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-500">
            Batas Pembayaran
          </p>

          <p className="mt-2 text-lg font-black text-red-700">
            21 September pukul 10.15
          </p>
        </div>

        {/* ORDER CODE */}
        <div className="mt-6 rounded-2xl bg-[#f5f3ee] p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/40">
            Order Code
          </p>

          <p className="mt-2 text-3xl font-black tracking-wider">
            {orderCode || "MAG-XXXXXX"}
          </p>
        </div>

        {/* PAYMENT INFO */}
        {payment && (
          <div className="mt-4 rounded-2xl border border-black/10 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/40">
              Metode Pembayaran
            </p>

            <p className="mt-2 font-black">
              {payment === "Transfer" ? "🏦 Transfer" : "💵 Cash"}
            </p>
          </div>
        )}

        {/* TRANSFER ONLY */}
        {isTransfer && (
          <Link
            href={`/payment?code=${encodeURIComponent(orderCode)}`}
            className="mt-6 block w-full rounded-full bg-black px-6 py-4 text-center text-sm font-bold text-white transition hover:bg-red-600"
          >
            Upload Bukti Transfer →
          </Link>
        )}

        {/* CASH INFO */}
        {payment === "Cash" && (
          <div className="mt-6 rounded-2xl bg-green-50 p-5 text-left">
            <p className="font-black text-green-700">
              💵 Pembayaran Cash
            </p>

            <p className="mt-2 text-sm leading-6 text-green-700/70">
              Kamu tidak perlu mengupload bukti transfer.
              Silakan melakukan pembayaran cash sesuai ketentuan
              yang telah ditentukan.
            </p>
          </div>
        )}

        {/* BUTTONS */}
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

        {/* STATUS */}
        <Link
          href="/status"
          className="mt-4 block text-sm font-bold text-black/50 transition hover:text-black"
        >
          Cek Status Pesanan →
        </Link>

      </div>
    </main>
  );
}