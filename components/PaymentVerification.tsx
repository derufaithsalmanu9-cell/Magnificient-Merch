"use client";

import { useEffect, useState } from "react";

type PaymentOrder = {
  id: string;
  order_code: string;
  customer_name: string;
  whatsapp: string;
  class_name: string;
  address: string | null;
  total: number;
  payment_method: string;
  payment_proof: string;
  payment_verified_at: string | null;
  payment_rejected_at: string | null;
  payment_rejection_note: string | null;
  status: string;
  created_at: string;
  proof_url: string | null;
};

export default function PaymentVerification() {
  const [orders, setOrders] =
    useState<PaymentOrder[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [processingId, setProcessingId] =
    useState<string | null>(null);

  async function loadPayments() {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/admin/payment",
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Gagal mengambil pembayaran."
        );
      }

      const data = await response.json();

      setOrders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPayments();
  }, []);

  async function verifyPayment(id: string) {
    if (
      !confirm(
        "Yakin ingin memverifikasi pembayaran ini?"
      )
    ) {
      return;
    }

    setProcessingId(id);

    try {
      const response = await fetch(
        "/api/admin/payment",
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            id,
            action: "verify",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Gagal memverifikasi pembayaran."
        );
      }

      await loadPayments();
    } catch (error: any) {
      alert(
        error.message ||
          "Gagal memverifikasi pembayaran."
      );
    } finally {
      setProcessingId(null);
    }
  }

  async function rejectPayment(id: string) {
    const note = prompt(
      "Alasan penolakan bukti pembayaran:"
    );

    if (note === null) return;

    setProcessingId(id);

    try {
      const response = await fetch(
        "/api/admin/payment",
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            id,
            action: "reject",
            rejection_note:
              note.trim() ||
              "Bukti pembayaran tidak valid.",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Gagal menolak pembayaran."
        );
      }

      await loadPayments();
    } catch (error: any) {
      alert(
        error.message ||
          "Gagal menolak pembayaran."
      );
    } finally {
      setProcessingId(null);
    }
  }

  if (loading) {
    return (
      <section className="rounded-3xl bg-white p-8">
        <p className="font-bold">
          Memuat bukti pembayaran...
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-6">

      <div>
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-red-600">
          Payment Verification
        </p>

        <h2 className="mt-2 text-3xl font-black">
          VERIFIKASI PEMBAYARAN
        </h2>

        <p className="mt-2 text-sm text-black/50">
          Periksa bukti transfer sebelum pesanan
          diproses.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-3xl bg-white p-10 text-center">
          <div className="text-4xl">
            ✓
          </div>

          <p className="mt-4 font-bold">
            Tidak ada pembayaran yang menunggu
            pemeriksaan.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">

          {orders.map((order) => (
            <div
              key={order.id}
              className="overflow-hidden rounded-3xl bg-white shadow-sm"
            >

              <div className="grid gap-0 lg:grid-cols-[280px_1fr]">

                {/* BUKTI */}
                <div className="bg-[#f5f3ee] p-5">

                  {order.proof_url ? (
                    <a
                      href={order.proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block overflow-hidden rounded-2xl bg-white"
                    >
                      <img
                        src={order.proof_url}
                        alt={`Bukti ${order.order_code}`}
                        className="aspect-square w-full object-cover transition hover:scale-105"
                      />
                    </a>
                  ) : (
                    <div className="flex aspect-square items-center justify-center rounded-2xl bg-black/5 text-sm text-black/40">
                      Bukti tidak tersedia
                    </div>
                  )}

                  {order.proof_url && (
                    <a
                      href={order.proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 block text-center text-xs font-bold underline"
                    >
                      Buka Bukti Ukuran Penuh
                    </a>
                  )}

                </div>

                {/* DETAIL */}
                <div className="p-7">

                  <div className="flex flex-wrap items-start justify-between gap-4">

                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/40">
                        Kode Pesanan
                      </p>

                      <h3 className="mt-1 text-2xl font-black">
                        {order.order_code}
                      </h3>
                    </div>

                    <span
                      className={`rounded-full px-4 py-2 text-xs font-black ${
                        order.status ===
                        "Bukti Dikirim"
                          ? "bg-yellow-100 text-yellow-800"
                          : order.status ===
                              "Pembayaran Diterima"
                            ? "bg-green-100 text-green-800"
                            : "bg-black/5 text-black/60"
                      }`}
                    >
                      {order.status}
                    </span>

                  </div>

                  <div className="mt-7 grid gap-5 sm:grid-cols-2">

                    <div>
                      <p className="text-xs text-black/40">
                        Pemesan
                      </p>

                      <p className="mt-1 font-bold">
                        {order.customer_name}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-black/40">
                        WhatsApp
                      </p>

                      <p className="mt-1 font-bold">
                        {order.whatsapp}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-black/40">
                        Kelas / Status
                      </p>

                      <p className="mt-1 font-bold">
                        {order.class_name}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-black/40">
                        Metode
                      </p>

                      <p className="mt-1 font-bold">
                        {order.payment_method}
                      </p>
                    </div>

                  </div>

                  <div className="mt-6 rounded-2xl bg-[#f5f3ee] p-5">

                    <p className="text-xs text-black/40">
                      Total Pembayaran
                    </p>

                    <p className="mt-1 text-2xl font-black">
                      Rp
                      {Number(
                        order.total
                      ).toLocaleString("id-ID")}
                    </p>

                  </div>

                  {order.address && (
                    <div className="mt-5">
                      <p className="text-xs text-black/40">
                        Alamat
                      </p>

                      <p className="mt-1 text-sm font-medium">
                        {order.address}
                      </p>
                    </div>
                  )}

                  {/* ACTION */}
                  {order.status ===
                    "Bukti Dikirim" && (
                    <div className="mt-7 grid gap-3 sm:grid-cols-2">

                      <button
                        type="button"
                        disabled={
                          processingId ===
                          order.id
                        }
                        onClick={() =>
                          verifyPayment(
                            order.id
                          )
                        }
                        className="rounded-full bg-black px-6 py-4 text-sm font-black text-white transition hover:bg-green-600 disabled:opacity-50"
                      >
                        {processingId ===
                        order.id
                          ? "Memproses..."
                          : "✓ Verifikasi Pembayaran"}
                      </button>

                      <button
                        type="button"
                        disabled={
                          processingId ===
                          order.id
                        }
                        onClick={() =>
                          rejectPayment(
                            order.id
                          )
                        }
                        className="rounded-full border-2 border-red-500 px-6 py-4 text-sm font-black text-red-600 transition hover:bg-red-500 hover:text-white disabled:opacity-50"
                      >
                        ✕ Tolak Bukti
                      </button>

                    </div>
                  )}

                  {order.payment_rejection_note && (
                    <div className="mt-5 rounded-2xl bg-red-50 p-4">
                      <p className="text-xs font-bold text-red-600">
                        Alasan Penolakan
                      </p>

                      <p className="mt-1 text-sm text-red-800">
                        {
                          order.payment_rejection_note
                        }
                      </p>
                    </div>
                  )}

                </div>

              </div>

            </div>
          ))}

        </div>
      )}

    </section>
  );
}