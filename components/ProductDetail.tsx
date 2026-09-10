"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type SizeOption = {
  size: string;
  price?: number;
  stock?: number;
};

type Product = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  image?: string | null;
  sizes?: unknown;
};

type ProductDetailProps = {
  id: string;
};

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  image?: string | null;
};

export default function ProductDetail({
  id,
}: ProductDetailProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedSize, setSelectedSize] = useState("-");
  const [quantity, setQuantity] = useState(1);

  const [adding, setAdding] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        const response = await fetch(
          `/api/products?id=${encodeURIComponent(id)}`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          setProduct(null);
          return;
        }

        const data = await response.json();

        setProduct(data.product ?? null);
      } catch (error) {
        console.error("Gagal mengambil produk:", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f3ee] px-6 py-32 text-black">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl bg-white p-10">
            <div className="h-8 w-40 animate-pulse rounded bg-black/10" />
            <div className="mt-6 h-12 w-72 animate-pulse rounded bg-black/10" />
            <div className="mt-4 h-6 w-96 max-w-full animate-pulse rounded bg-black/10" />
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f3ee] px-6 text-black">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-red-600">
            Magnificent Merch
          </p>

          <h1 className="mt-4 text-4xl font-black">
            Produk Tidak Ditemukan
          </h1>

          <Link
            href="/merch"
            className="mt-8 inline-block rounded-full bg-black px-7 py-4 text-sm font-bold text-white transition hover:bg-red-600"
          >
            ← Kembali ke Merchandise
          </Link>
        </div>
      </main>
    );
  }

  /*
   * Menormalisasi data sizes dari Supabase.
   *
   * Mendukung:
   * [
   *   { size: "S", price: 85000, stock: 10 },
   *   { size: "M", price: 90000, stock: 15 }
   * ]
   *
   * maupun:
   *
   * [
   *   "S",
   *   "M",
   *   "L"
   * ]
   */
  const normalizedSizes: SizeOption[] = Array.isArray(product.sizes)
    ? product.sizes.reduce<SizeOption[]>((acc, item) => {
        if (typeof item === "string") {
          acc.push({
            size: item,
            price: product.price,
            stock: product.stock,
          });
          return acc;
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

          const size = String(value.size ?? "").trim();
          if (!size) {
            return acc;
          }

          acc.push({
            size,
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

        return acc;
      }, [])
    : [];

  const hasSizes = normalizedSizes.length > 0;

  const currentSize =
    normalizedSizes.find(
      (item) => item.size === selectedSize
    ) ?? null;

  const currentPrice =
    currentSize?.price ?? product.price;

  const currentStock =
    currentSize?.stock ?? product.stock;

  function decreaseQuantity() {
    setQuantity((current) => Math.max(1, current - 1));
  }

  function increaseQuantity() {
    setQuantity((current) =>
      Math.min(currentStock, current + 1)
    );
  }

  function addToCart() {
    if (!product) {
      alert("Produk tidak tersedia.");
      return;
    }

    if (currentStock <= 0) {
      alert("Stok produk sedang habis.");
      return;
    }

    if (hasSizes && selectedSize === "-") {
      alert("Silakan pilih ukuran terlebih dahulu.");
      return;
    }

    if (quantity > currentStock) {
      alert("Jumlah melebihi stok yang tersedia.");
      return;
    }

    setAdding(true);

    try {
      const savedCart =
        localStorage.getItem("magnificent-cart");

      let cart: CartItem[] = [];

      if (savedCart) {
        try {
          const parsed = JSON.parse(savedCart);

          if (Array.isArray(parsed)) {
            cart = parsed;
          }
        } catch {
          cart = [];
        }
      }

      const cartKey = `${product.id}-${selectedSize}`;

      const existingIndex = cart.findIndex(
        (item) =>
          `${item.id}-${item.size}` === cartKey
      );

      if (existingIndex >= 0) {
        const existingItem = cart[existingIndex];

        const newQuantity =
          existingItem.quantity + quantity;

        if (newQuantity > currentStock) {
          alert(
            `Stok hanya tersedia ${currentStock} pcs.`
          );

          setAdding(false);
          return;
        }

        cart[existingIndex] = {
          ...existingItem,
          quantity: newQuantity,
          price: currentPrice,
        };
      } else {
        cart.push({
          id: product.id,
          name: product.name,
          price: currentPrice,
          quantity,
          size: selectedSize,
          image: product.image ?? null,
        });
      }

      localStorage.setItem(
        "magnificent-cart",
        JSON.stringify(cart)
      );

      window.location.href = "/checkout";
    } catch (error) {
      console.error("Cart error:", error);

      alert(
        "Gagal menambahkan produk ke keranjang."
      );

      setAdding(false);
    }
  }

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

        {/* PRODUCT */}
        <section className="mt-8 grid gap-10 lg:grid-cols-2">
          {/* IMAGE */}
          <div className="flex aspect-square items-center justify-center overflow-hidden rounded-3xl bg-white">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-5xl font-black tracking-tighter text-black/10">
                {product.name.toUpperCase()}
              </span>
            )}
          </div>

          {/* INFO */}
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
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold">
                    Pilih Ukuran
                  </label>

                  {selectedSize !== "-" && (
                    <span className="text-sm text-black/40">
                      Size {selectedSize}
                    </span>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-3">
                  {normalizedSizes.map((item) => {
                    const isSelected =
                      selectedSize === item.size;

                    const isOutOfStock =
                      (item.stock ?? 0) <= 0;

                    return (
                      <button
                        key={item.size}
                        type="button"
                        disabled={isOutOfStock}
                        onClick={() => {
                          setSelectedSize(item.size);
                          setQuantity(1);
                        }}
                        className={`min-w-14 rounded-xl border px-5 py-3 text-sm font-bold transition ${
                          isSelected
                            ? "border-black bg-black text-white"
                            : isOutOfStock
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
                  className="flex h-12 w-12 items-center justify-center text-xl font-bold transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
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
                    quantity >= currentStock ||
                    currentStock <= 0
                  }
                  className="flex h-12 w-12 items-center justify-center text-xl font-bold transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
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
              onClick={addToCart}
              disabled={
                adding ||
                currentStock <= 0 ||
                (hasSizes && selectedSize === "-")
              }
              className={`mt-6 w-full rounded-full px-7 py-4 text-sm font-bold transition ${
                adding ||
                currentStock <= 0 ||
                (hasSizes && selectedSize === "-")
                  ? "cursor-not-allowed bg-black/10 text-black/30"
                  : "bg-black text-white hover:bg-red-600"
              }`}
            >
              {adding
                ? "Membuka Checkout..."
                : currentStock <= 0
                  ? "Stok Habis"
                  : hasSizes && selectedSize === "-"
                    ? "Pilih Ukuran Dahulu"
                    : "Checkout Sekarang →"}
            </button>

            <p className="mt-4 text-center text-xs text-black/30">
              Produk akan ditambahkan ke keranjang sebelum
              checkout.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}