"use client";

import Link from "next/link";
import { useState } from "react";

type SizeOption = {
  size: string;
  price: number;
  stock: number;
};

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  image: string | null;
  sizes: unknown;
};

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  image: string | null;
};

export default function ProductDetail({
  product,
}: {
  product: Product;
}) {
  const [selectedSize, setSelectedSize] = useState("-");
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  // =========================
  // NORMALIZE SIZE
  // =========================

  const sizes: SizeOption[] = [];

  if (Array.isArray(product.sizes)) {
    for (const item of product.sizes) {
      if (typeof item === "string") {
        sizes.push({
          size: item,
          price: product.price,
          stock: product.stock,
        });

        continue;
      }

      if (
        typeof item === "object" &&
        item !== null &&
        "size" in item
      ) {
        const value = item as {
          size?: unknown;
          price?: unknown;
          stock?: unknown;
        };

        if (typeof value.size !== "string") {
          continue;
        }

        sizes.push({
          size: value.size,
          price:
            typeof value.price === "number"
              ? value.price
              : product.price,
          stock:
            typeof value.stock === "number"
              ? value.stock
              : product.stock,
        });
      }
    }
  }

  const hasSizes = sizes.length > 0;

  const selectedSizeData =
    sizes.find(
      (item) => item.size === selectedSize
    ) ?? null;

  const currentPrice =
    selectedSizeData?.price ?? product.price;

  const currentStock =
    selectedSizeData?.stock ?? product.stock;

  // =========================
  // QUANTITY
  // =========================

  function decreaseQuantity() {
    setQuantity((value) =>
      Math.max(1, value - 1)
    );
  }

  function increaseQuantity() {
    setQuantity((value) =>
      Math.min(currentStock, value + 1)
    );
  }

  // =========================
  // CHECKOUT
  // =========================

  function handleCheckout() {
    if (hasSizes && selectedSize === "-") {
      alert("Silakan pilih ukuran terlebih dahulu.");
      return;
    }

    if (currentStock <= 0) {
      alert("Stok produk sedang habis.");
      return;
    }

    if (quantity > currentStock) {
      alert(
        `Stok hanya tersedia ${currentStock} pcs.`
      );
      return;
    }

    setAdding(true);

    const cartItem: CartItem = {
      id: product.id,
      name: product.name,
      price: currentPrice,
      quantity,
      size: selectedSize,
      image: product.image,
    };

    localStorage.setItem(
      "magnificent-cart",
      JSON.stringify([cartItem])
    );

    window.location.href = "/checkout";
  }

  // =========================
  // UI
  // =========================

  return (
    <main className="min-h-screen bg-[#f5f3ee] px-6 py-28 text-black">
      <div className="mx-auto max-w-6xl">

        {/* BACK */}
        <Link
          href="/merch"
          className="text-sm font-bold text-black/50 transition hover:text-red-600"
        >
          ← Kembali ke Merchandise
        </Link>

        <section className="mt-8 grid gap-10 lg:grid-cols-2">

          {/* IMAGE */}
          <div className="flex aspect-square items-center justify-center overflow-hidden rounded-3xl bg-white">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover object-center"
              />
            ) : (
              <span className="px-10 text-center text-5xl font-black tracking-tighter text-black/10">
                {product.name.toUpperCase()}
              </span>
            )}
          </div>

          {/* INFORMATION */}
          <div className="flex flex-col justify-center">

            <p className="text-sm font-bold uppercase tracking-[0.3em] text-red-600">
              Official Merchandise
            </p>

            <h1 className="mt-4 text-5xl font-black tracking-tight sm:text-6xl">
              {product.name}
            </h1>

            {product.description && (
              <p className="mt-5 max-w-xl text-base leading-7 text-black/50">
                {product.description}
              </p>
            )}

            {/* PRICE */}
            <div className="mt-8">
              <p className="text-3xl font-black">
                Rp{currentPrice.toLocaleString("id-ID")}
              </p>

              <p className="mt-2 text-sm text-black/40">
                {currentStock > 0
                  ? `${currentStock} pcs tersedia`
                  : "Stok habis"}
              </p>
            </div>

            {/* SIZE */}
            {hasSizes && (
              <div className="mt-8">
                <label className="text-sm font-bold">
                  Pilih Ukuran
                </label>

                <div className="mt-3 flex flex-wrap gap-3">
                  {sizes.map((item) => {
                    const selected =
                      selectedSize === item.size;

                    const outOfStock =
                      item.stock <= 0;

                    return (
                      <button
                        key={item.size}
                        type="button"
                        disabled={outOfStock}
                        onClick={() => {
                          setSelectedSize(item.size);
                          setQuantity(1);
                        }}
                        className={`rounded-xl border px-5 py-3 text-sm font-bold transition ${
                          selected
                            ? "border-black bg-black text-white"
                            : outOfStock
                              ? "cursor-not-allowed border-black/5 bg-black/5 text-black/20"
                              : "border-black/10 bg-white hover:border-black"
                        }`}
                      >
                        {item.size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* QUANTITY */}
            <div className="mt-8">
              <label className="text-sm font-bold">
                Jumlah
              </label>

              <div className="mt-3 flex w-fit items-center overflow-hidden rounded-xl border border-black/10 bg-white">

                <button
                  type="button"
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                  className="flex h-12 w-12 items-center justify-center text-xl font-bold hover:bg-black hover:text-white disabled:opacity-30"
                >
                  −
                </button>

                <span className="flex h-12 w-14 items-center justify-center font-bold">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={increaseQuantity}
                  disabled={
                    quantity >= currentStock
                  }
                  className="flex h-12 w-12 items-center justify-center text-xl font-bold hover:bg-black hover:text-white disabled:opacity-30"
                >
                  +
                </button>

              </div>
            </div>

            {/* TOTAL */}
            <div className="mt-8 flex items-center justify-between border-t border-black/10 pt-6">

              <span className="text-black/50">
                Total
              </span>

              <span className="text-2xl font-black">
                Rp
                {(
                  currentPrice * quantity
                ).toLocaleString("id-ID")}
              </span>

            </div>

            {/* CHECKOUT */}
            <button
              type="button"
              onClick={handleCheckout}
              disabled={
                adding ||
                currentStock <= 0 ||
                (hasSizes &&
                  selectedSize === "-")
              }
              className={`mt-6 w-full rounded-full px-7 py-4 text-sm font-bold transition ${
                adding ||
                currentStock <= 0 ||
                (hasSizes &&
                  selectedSize === "-")
                  ? "cursor-not-allowed bg-black/10 text-black/30"
                  : "bg-black text-white hover:bg-red-600"
              }`}
            >
              {adding
                ? "Membuka Checkout..."
                : currentStock <= 0
                  ? "Stok Habis"
                  : hasSizes &&
                      selectedSize === "-"
                    ? "Pilih Ukuran Dahulu"
                    : "Checkout Sekarang →"}
            </button>

            <p className="mt-4 text-center text-xs text-black/30">
              Produk akan langsung dibawa ke halaman checkout.
            </p>

          </div>
        </section>
      </div>
    </main>
  );
}