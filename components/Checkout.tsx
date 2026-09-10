"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type CartItem = {
  id: string;
  name: string;
  price: number;
  size: string;
  quantity: number;
};

export default function Checkout() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [className, setClassName] = useState("");
  const [note, setNote] = useState("");
  const [payment, setPayment] = useState("Transfer");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem("magnificent-cart");

    if (!savedCart) return;

    try {
      const parsedCart = JSON.parse(savedCart);
      setCart(parsedCart);
    } catch {
      setCart([]);
    }
  }, []);

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (cart.length === 0) {
      alert("Keranjang masih kosong.");
      return;
    }

    if (!name.trim()) {
      alert("Nama lengkap wajib diisi.");
      return;
    }

    if (!whatsapp.trim()) {
      alert("Nomor WhatsApp wajib diisi.");
      return;
    }

    if (!className.trim()) {
      alert("Kelas / status wajib diisi.");
      return;
    }

    setLoading(true);

    const orderCode =
      "MAG-" +
      Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

    const { error } = await supabase
      .from("orders")
      .insert({
        order_code: orderCode,
        customer_name: name.trim(),
        whatsapp: whatsapp.trim(),
        class_name: className.trim(),
        note: note.trim() || null,
        payment_method: payment,
        items: cart,
        total: total,
        status: "Menunggu Pembayaran",
      });

    if (error) {
      console.error("Supabase error:", error);

      setLoading(false);

      alert(
        "Pesanan gagal dibuat.\n\n" +
          error.message
      );

      return;
    }

    const orderData = {
      orderCode,
      customerName: name.trim(),
      whatsapp: whatsapp.trim(),
      className: className.trim(),
      note: note.trim(),
      payment,
      items: cart,
      total,
    };

    localStorage.setItem(
      "magnificent-order",
      JSON.stringify(orderData)
    );

    localStorage.removeItem("magnificent-cart");

    window.location.href = "/success";
  }

  if (cart.length === 0) {
    return (
      <div className="rounded-3xl bg-white p-12 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#f5f3ee] text-3xl">
          🛒
        </div>

        <h2 className="mt-6 text-3xl font-black">
          KERANJANG KOSONG.
        </h2>

        <p className="mt-4 text-black/50">
          Tambahkan merchandise terlebih dahulu.
        </p>

        <Link
          href="/merch"
          className="mt-8 inline-block rounded-full bg-black px-7 py-4 text-sm font-bold text-white transition hover:bg-red-600"
        >
          Kembali ke Merchandise →
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-10 lg:grid-cols-[1fr_400px]"
    >
      {/* =========================
          FORM PEMESAN
      ========================== */}

      <div className="rounded-3xl bg-white p-7 sm:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-red-600">
          Customer Information
        </p>

        <h2 className="mt-3 text-3xl font-black">
          DATA PEMESAN
        </h2>

        <div className="mt-10 space-y-6">

          {/* NAMA */}
          <div>
            <label
              htmlFor="name"
              className="text-sm font-bold"
            >
              Nama Lengkap
            </label>

            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Masukkan nama lengkap"
              className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 outline-none transition focus:border-black"
            />
          </div>

          {/* WHATSAPP */}
          <div>
            <label
              htmlFor="whatsapp"
              className="text-sm font-bold"
            >
              Nomor WhatsApp
            </label>

            <input
              id="whatsapp"
              type="tel"
              value={whatsapp}
              onChange={(event) =>
                setWhatsapp(event.target.value)
              }
              placeholder="08xxxxxxxxxx"
              className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 outline-none transition focus:border-black"
            />

            <p className="mt-2 text-xs text-black/40">
              Digunakan untuk informasi pesanan.
            </p>
          </div>

          {/* KELAS */}
          <div>
            <label
              htmlFor="className"
              className="text-sm font-bold"
            >
              Kelas / Status
            </label>

            <input
              id="className"
              type="text"
              value={className}
              onChange={(event) =>
                setClassName(event.target.value)
              }
              placeholder="Contoh: XI-F5"
              className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 outline-none transition focus:border-black"
            />
          </div>

          {/* PEMBAYARAN */}
          <div>
            <label
              htmlFor="payment"
              className="text-sm font-bold"
            >
              Metode Pembayaran
            </label>

            <select
              id="payment"
              value={payment}
              onChange={(event) =>
                setPayment(event.target.value)
              }
              className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-black"
            >
              <option value="Transfer">
                Transfer
              </option>

              <option value="Cash">
                Cash
              </option>
            </select>
          </div>

          {/* CATATAN */}
          <div>
            <label
              htmlFor="note"
              className="text-sm font-bold"
            >
              Catatan
            </label>

            <textarea
              id="note"
              value={note}
              onChange={(event) =>
                setNote(event.target.value)
              }
              placeholder="Catatan pesanan (opsional)"
              rows={4}
              className="mt-2 w-full resize-none rounded-xl border border-black/10 bg-white px-4 py-3 outline-none transition focus:border-black"
            />
          </div>

        </div>
      </div>

      {/* =========================
          ORDER SUMMARY
      ========================== */}

      <div className="h-fit rounded-3xl bg-black p-7 text-white">

        <p className="text-sm font-bold uppercase tracking-[0.25em] text-white/40">
          Order Summary
        </p>

        <h2 className="mt-4 text-3xl font-black">
          PESANAN
        </h2>

        <div className="mt-8 space-y-5">
          {cart.map((item) => (
            <div
              key={`${item.id}-${item.size}`}
              className="border-b border-white/10 pb-5"
            >
              <div className="flex justify-between gap-4">

                <div>
                  <p className="font-bold">
                    {item.name}
                  </p>

                  <p className="mt-1 text-sm text-white/40">
                    {item.size !== "-"
                      ? `Size ${item.size} · `
                      : ""}
                    {item.quantity} pcs
                  </p>
                </div>

                <p className="font-bold whitespace-nowrap">
                  Rp
                  {(
                    item.price * item.quantity
                  ).toLocaleString("id-ID")}
                </p>

              </div>
            </div>
          ))}
        </div>

        {/* TOTAL */}

        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-6">
          <span className="text-white/50">
            Total
          </span>

          <span className="text-2xl font-black">
            Rp{total.toLocaleString("id-ID")}
          </span>
        </div>

        {/* SUBMIT */}

        <button
          type="submit"
          disabled={loading}
          className={`mt-8 w-full rounded-full px-6 py-4 text-sm font-bold transition ${
            loading
              ? "cursor-not-allowed bg-white/30 text-white/50"
              : "bg-white text-black hover:bg-red-500 hover:text-white"
          }`}
        >
          {loading
            ? "Memproses Pesanan..."
            : "Buat Pesanan →"}
        </button>

        <p className="mt-4 text-center text-xs leading-5 text-white/30">
          Dengan membuat pesanan, pastikan data yang
          kamu masukkan sudah benar.
        </p>

      </div>
    </form>
  );
}