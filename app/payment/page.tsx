"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type Order = {
  order_code: string;
  customer_name: string;
  total: number;
  payment_method: string;
  status: string;
  has_payment_proof: boolean;
};

export default function PaymentPage() {
  const searchParams = useSearchParams();

  const [orderCode, setOrderCode] = useState(
    searchParams.get("code") || ""
  );

  const [whatsapp, setWhatsapp] = useState("");

  const [order, setOrder] =
    useState<Order | null>(null);

  const [file, setFile] =
    useState<File | null>(null);

  const [loadingOrder, setLoadingOrder] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  async function checkOrder() {
    setError("");
    setMessage("");
    setOrder(null);

    if (!orderCode.trim()) {
      setError("Kode pesanan wajib diisi.");
      return;
    }

    if (!whatsapp.trim()) {
      setError("Nomor WhatsApp wajib diisi.");
      return;
    }

    setLoadingOrder(true);

    try {
      const response = await fetch(
        `/api/payment?code=${encodeURIComponent(
          orderCode.trim()
        )}&whatsapp=${encodeURIComponent(
          whatsapp.trim()
        )}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Pesanan tidak ditemukan."
        );
      }

      setOrder(data.order);
    } catch (error: any) {
      setError(
        error.message ||
          "Gagal mengambil data pesanan."
      );
    } finally {
      setLoadingOrder(false);
    }
  }

  async function handleUpload() {
    setError("");
    setMessage("");

    if (!order) {
      setError(
        "Cari pesanan terlebih dahulu."
      );
      return;
    }

    if (!file) {
      setError(
        "Pilih bukti transfer terlebih dahulu."
      );
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();

      formData.append(
        "order_code",
        order.order_code
      );

      formData.append(
        "whatsapp",
        whatsapp.trim()
      );

      formData.append("file", file);

      const response = await fetch(
        "/api/payment/proof",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Upload gagal."
        );
      }

      setMessage(
        "✓ Bukti transfer berhasil dikirim. Pesanan sedang menunggu verifikasi admin."
      );

      setFile(null);

      setOrder({
        ...order,
        status: "Bukti Dikirim",
        has_payment_proof: true,
      });
    } catch (error: any) {
      setError(
        error.message ||
          "Gagal mengirim bukti transfer."
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f3ee] px-5 py-24 text-black">
      <div className="mx-auto max-w-2xl">

        {/* HEADER */}
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-red-600">
            Payment Confirmation
          </p>

          <h1 className="mt-4 text-4xl font-black sm:text-6xl">
            BUKTI TRANSFER.
          </h1>

          <p className="mx-auto mt-5 max-w-lg text-black/50">
            Masukkan kode pesanan dan nomor WhatsApp,
            kemudian upload bukti pembayaran.
          </p>
        </div>

        {/* SEARCH */}
        <div className="mt-12 rounded-3xl bg-white p-7 shadow-sm sm:p-10">

          <div className="space-y-5">

            <div>
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
                placeholder="MAG-XXXXXX"
                className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="text-sm font-bold">
                Nomor WhatsApp
              </label>

              <input
                type="tel"
                value={whatsapp}
                onChange={(e) =>
                  setWhatsapp(e.target.value)
                }
                placeholder="08xxxxxxxxxx"
                className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-black"
              />
            </div>

            <button
              type="button"
              onClick={checkOrder}
              disabled={loadingOrder}
              className="w-full rounded-full bg-black px-6 py-4 text-sm font-bold text-white transition hover:bg-red-600 disabled:opacity-50"
            >
              {loadingOrder
                ? "Mencari Pesanan..."
                : "Cek Pesanan →"}
            </button>

          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mt-5 rounded-2xl bg-red-50 p-5 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        {/* SUCCESS */}
        {message && (
          <div className="mt-5 rounded-2xl bg-green-50 p-5 text-sm font-bold text-green-700">
            {message}
          </div>
        )}

        {/* ORDER */}
        {order && (
          <div className="mt-8 rounded-3xl bg-black p-7 text-white sm:p-10">

            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/40">
                  Order
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  {order.order_code}
                </h2>
              </div>

              <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-bold">
                {order.status}
              </span>
            </div>

            <div className="mt-8 border-t border-white/10 pt-7">

              <p className="text-sm text-white/40">
                Pemesan
              </p>

              <p className="mt-1 font-bold">
                {order.customer_name}
              </p>

              <p className="mt-6 text-sm text-white/40">
                Total Pembayaran
              </p>

              <p className="mt-1 text-3xl font-black">
                Rp
                {Number(order.total).toLocaleString(
                  "id-ID"
                )}
              </p>

              <p className="mt-2 text-sm text-white/40">
                Metode: {order.payment_method}
              </p>

            </div>

            {/* UPLOAD */}
            {!order.has_payment_proof &&
              order.status !==
                "Pembayaran Diterima" && (
                <div className="mt-8 border-t border-white/10 pt-7">

                  <p className="font-bold">
                    Upload Bukti Transfer
                  </p>

                  <p className="mt-2 text-sm text-white/40">
                    JPG, PNG, atau WEBP • Maksimal
                    5 MB
                  </p>

                  <label className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/20 px-5 py-10 text-center transition hover:border-white/50">

                    <span className="text-3xl">
                      📷
                    </span>

                    <span className="mt-3 text-sm font-bold">
                      {file
                        ? file.name
                        : "Pilih Bukti Transfer"}
                    </span>

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) =>
                        setFile(
                          e.target.files?.[0] ||
                            null
                        )
                      }
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={
                      uploading || !file
                    }
                    className="mt-5 w-full rounded-full bg-white px-6 py-4 text-sm font-black text-black transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {uploading
                      ? "Mengirim Bukti..."
                      : "Kirim Bukti Pembayaran →"}
                  </button>

                </div>
              )}

            {order.has_payment_proof && (
              <div className="mt-8 rounded-2xl bg-white/10 p-5">
                <p className="font-bold">
                  ✓ Bukti pembayaran sudah dikirim
                </p>

                <p className="mt-2 text-sm text-white/40">
                  Silakan tunggu verifikasi dari
                  admin.
                </p>
              </div>
            )}

          </div>
        )}

        {/* BACK */}
        <div className="mt-8 text-center">
          <Link
            href="/status"
            className="text-sm font-bold text-black/50 hover:text-black"
          >
            ← Cek Status Pesanan
          </Link>
        </div>

      </div>
    </main>
  );
}