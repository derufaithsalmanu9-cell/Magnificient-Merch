"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type CartItem = {
  id: string;
  name: string;
  price: number;
  size: string;
  quantity: number;
};

export default function Cart() {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem("magnificent-cart");

    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const updateCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("magnificent-cart", JSON.stringify(newCart));
  };

  const increase = (index: number) => {
    const newCart = [...cart];
    newCart[index].quantity += 1;
    updateCart(newCart);
  };

  const decrease = (index: number) => {
    const newCart = [...cart];

    if (newCart[index].quantity > 1) {
      newCart[index].quantity -= 1;
    } else {
      newCart.splice(index, 1);
    }

    updateCart(newCart);
  };

  const removeItem = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    updateCart(newCart);
  };

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div>
      {cart.length === 0 ? (
        <div className="rounded-3xl bg-white px-6 py-20 text-center">
          <h2 className="text-3xl font-black">
            KERANJANG KOSONG.
          </h2>

          <p className="mt-4 text-black/50">
            Kamu belum memilih merchandise.
          </p>

          <Link
            href="/merch"
            className="mt-8 inline-block rounded-full bg-black px-7 py-4 text-sm font-bold text-white transition hover:bg-red-600"
          >
            Lihat Merchandise →
          </Link>
        </div>
      ) : (
        <div className="grid gap-10 lg:grid-cols-[1fr_380px]">

          {/* ITEMS */}
          <div className="space-y-5">
            {cart.map((item, index) => (
              <div
                key={`${item.id}-${item.size}`}
                className="flex gap-5 rounded-3xl bg-white p-5"
              >
                <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl bg-[#f5f3ee]">
                  <span className="text-xs font-black text-black/10">
                    {item.id.toUpperCase()}
                  </span>
                </div>

                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <div className="flex justify-between gap-4">
                      <h2 className="font-bold">
                        {item.name}
                      </h2>

                      <button
                        onClick={() => removeItem(index)}
                        className="text-sm text-black/40 hover:text-red-600"
                      >
                        Hapus
                      </button>
                    </div>

                    <p className="mt-1 text-sm text-black/50">
                      {item.size !== "-" &&
                        `Size ${item.size} · `}
                      Rp{item.price.toLocaleString("id-ID")}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex h-9 items-center rounded-lg border border-black/10">
                      <button
                        onClick={() => decrease(index)}
                        className="px-3"
                      >
                        −
                      </button>

                      <span className="w-8 text-center text-sm font-bold">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => increase(index)}
                        className="px-3"
                      >
                        +
                      </button>
                    </div>

                    <p className="font-bold">
                      Rp
                      {(item.price * item.quantity).toLocaleString(
                        "id-ID"
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* SUMMARY */}
          <div className="h-fit rounded-3xl bg-black p-7 text-white">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-white/40">
              Order Summary
            </p>

            <h2 className="mt-4 text-3xl font-black">
              TOTAL
            </h2>

            <div className="mt-8 flex justify-between border-t border-white/10 pt-6">
              <span className="text-white/50">
                Subtotal
              </span>

              <span className="font-bold">
                Rp{total.toLocaleString("id-ID")}
              </span>
            </div>

            <Link
              href="/checkout"
              className="mt-8 block rounded-full bg-white px-6 py-4 text-center text-sm font-bold text-black transition hover:bg-red-500 hover:text-white"
            >
              Lanjut Checkout →
            </Link>
          </div>

        </div>
      )}
    </div>
  );
}