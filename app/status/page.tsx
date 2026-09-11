"use client";

import { useState } from "react";
import Link from "next/link";

type OrderItem = {
  name: string;
  quantity: number;
  size?: string;
  price: number;
};

type Order = {
  order_code: string;
  customer_name: string;
  class_name: string;
  items: OrderItem[];
  total: number;
  status: string;
  created_at: string;
};

const statuses = [
  "Menunggu Pembayaran",
  "Pembayaran Diterima",
  "Diproses",
  "Siap Diambil",
  "Selesai",
];

const statusIndex: Record<string, number> = {
  "Menunggu Pembayaran": 0,
  "Pembayaran Diterima": 1,
  Diproses: 2,
  "Siap Diambil": 3,
  Selesai: 4,
};

export default function StatusPage() {
  const [orderCode, setOrderCode] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function checkOrder() {
    setError("");
    setOrder(null);

    const code = orderCode.trim().toUpperCase();

    if (!code) {
      setError("Masukkan kode pesanan terlebih dahulu.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/orders/status?order_code=${encodeURIComponent(code)}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Pesanan tidak ditemukan."
        );
      }

      setOrder(data.order);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Gagal mengecek pesanan."
      );
    } finally {
      setLoading(false);
    }
  }

  const currentIndex = order
    ? statusIndex[order.status] ?? -1
    : -1;

  return (
    <main className="min-h-screen bg-[#f5f3ee] px-6 py-28 text-black">

      <div className="mx-auto max-w-3xl">

        {/* BACK */}

        <Link
          href="/merch"
          className="text-sm font-bold text-black/40 transition hover:text-red-600"
        >
          ← Kembali ke Merchandise
        </Link>

        {/* HEADER */}

        <div className="mt-10">

          <p className="text-sm font-bold uppercase tracking-[0.3em] text-red-600">
            Magnificent Order
          </p>

          <h1 className="mt-4 text-5xl font-black tracking-tight sm:text-6xl">
            CEK PESANAN.
          </h1>

          <p className="mt-5 max-w-xl text-black/50">
            Masukkan kode pesanan yang kamu dapatkan
            setelah melakukan checkout.
          </p>

        </div>

        {/* SEARCH */}

        <section className="mt-10 rounded-3xl bg-white p-6 sm:p-8">

          <label className="text-sm font-bold">
            Kode Pesanan
          </label>

          <input
            value={orderCode}
            onChange={(e) =>
              setOrderCode(
                e.target.value.toUpperCase()
              )
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                checkOrder();
              }
            }}
            placeholder="Contoh: MAG-A8K29X"
            className="mt-3 w-full rounded-xl border border-black/10 bg-[#f5f3ee] px-4 py-4 font-bold uppercase outline-none transition focus:border-black"
          />

          {error && (
            <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={checkOrder}
            disabled={loading}
            className="mt-5 w-full rounded-full bg-black px-7 py-4 text-sm font-bold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Mengecek..."
              : "Cek Status Pesanan →"}
          </button>

        </section>

        {/* RESULT */}

        {order && (
          <section className="mt-8 rounded-3xl bg-white p-6 sm:p-8">

            {/* ORDER HEADER */}

            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

              <div>

                <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/30">
                  Kode Pesanan
                </p>

                <h2 className="mt-1 text-3xl font-black">
                  {order.order_code}
                </h2>

                <p className="mt-2 text-sm text-black/50">
                  {order.customer_name}
                  {order.class_name &&
                    ` · ${order.class_name}`}
                </p>

              </div>

              <div className="w-fit rounded-full bg-red-50 px-4 py-2 text-xs font-bold text-red-600">
                {order.status}
              </div>

            </div>

            {/* STATUS */}

            <div className="mt-10 border-t border-black/10 pt-8">

              <p className="text-sm font-bold">
                Status Pesanan
              </p>

              <div className="mt-6">

                {order.status === "Dibatalkan" ? (

                  <div className="rounded-2xl bg-red-50 p-6">
                    <p className="font-black text-red-600">
                      Pesanan Dibatalkan
                    </p>

                    <p className="mt-2 text-sm text-red-600/70">
                      Silakan hubungi panitia untuk
                      informasi lebih lanjut.
                    </p>
                  </div>

                ) : (

                  <div className="space-y-6">

                    {statuses.map(
                      (status, index) => {

                        const completed =
                          index <= currentIndex;

                        const current =
                          index === currentIndex;

                        return (
                          <div
                            key={status}
                            className="flex items-start gap-4"
                          >

                            <div
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                                completed
                                  ? "bg-black text-white"
                                  : "bg-black/5 text-black/20"
                              }`}
                            >
                              {completed
                                ? "✓"
                                : index + 1}
                            </div>

                            <div className="pt-1">

                              <p
                                className={`font-bold ${
                                  current
                                    ? "text-red-600"
                                    : completed
                                      ? "text-black"
                                      : "text-black/25"
                                }`}
                              >
                                {status}
                              </p>

                              {current && (
                                <p className="mt-1 text-xs text-black/40">
                                  Status pesanan saat ini.
                                </p>
                              )}

                            </div>

                          </div>
                        );
                      }
                    )}

                  </div>

                )}

              </div>

            </div>

            {/* ITEMS */}

            <div className="mt-10 border-t border-black/10 pt-8">

              <p className="text-sm font-bold">
                Detail Pesanan
              </p>

              <div className="mt-5 space-y-4">

                {order.items?.map(
                  (item, index) => (
                    <div
                      key={index}
                      className="flex justify-between gap-5"
                    >

                      <div>

                        <p className="font-bold">
                          {item.name}
                        </p>

                        <p className="mt-1 text-xs text-black/40">
                          {item.size
                            ? `Ukuran ${item.size} · `
                            : ""}
                          {item.quantity} pcs
                        </p>

                      </div>

                      <p className="font-bold">
                        Rp
                        {(
                          Number(item.price) *
                          Number(item.quantity)
                        ).toLocaleString("id-ID")}
                      </p>

                    </div>
                  )
                )}

              </div>

              <div className="mt-6 flex justify-between border-t border-black/10 pt-5">

                <span className="text-black/50">
                  Total
                </span>

                <span className="text-xl font-black">
                  Rp
                  {Number(
                    order.total
                  ).toLocaleString("id-ID")}
                </span>

              </div>

            </div>

            {/* REFRESH */}

            <button
              type="button"
              onClick={checkOrder}
              disabled={loading}
              className="mt-8 w-full rounded-full border border-black/10 px-7 py-4 text-sm font-bold transition hover:bg-black hover:text-white disabled:opacity-50"
            >
              {loading
                ? "Memperbarui..."
                : "↻ Perbarui Status"}
            </button>

          </section>
        )}

      </div>

    </main>
  );
}