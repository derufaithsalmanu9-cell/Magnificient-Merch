"use client";

import { useState } from "react";

type SizeOption =
  | string
  | {
      size: string;
      price?: number;
      stock?: number;
    };

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image?: string | null;
  sizes?: SizeOption[];
};

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  image?: string | null;
};

export default function ProductDetail({
  product,
}: {
  product: Product;
}) {
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product.sizes && product.sizes.length > 0
      ? typeof product.sizes[0] === "string"
        ? product.sizes[0]
        : product.sizes[0].size
      : undefined
  );

  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [adding, setAdding] = useState(false);

  const sizes = (product.sizes || []).map((item) => {
    if (typeof item === "string") {
      return {
        size: item,
        price: product.price,
        stock: product.stock,
      };
    }

    return {
      size: item.size,
      price: item.price ?? product.price,
      stock: item.stock ?? product.stock,
    };
  });

  const selectedSizeData = sizes.find(
    (item) => item.size === selectedSize
  );

  const currentPrice =
    selectedSizeData?.price ?? product.price;

  const currentStock =
    selectedSizeData?.stock ?? product.stock;

  const formatPrice = (price: number) =>
    `Rp${Number(price).toLocaleString("id-ID")}`;

  const validate = () => {
    if (currentStock <= 0) {
      setMessage("Produk sedang habis.");
      return false;
    }

    if (quantity > currentStock) {
      setMessage(`Stok hanya tersedia ${currentStock}.`);
      return false;
    }

    if (sizes.length > 0 && !selectedSize) {
      setMessage("Silakan pilih ukuran terlebih dahulu.");
      return false;
    }

    return true;
  };

  const handleAddToCart = () => {
    if (!validate()) return;

    setAdding(true);
    setMessage("");

    try {
      const existingCart: CartItem[] = JSON.parse(
        localStorage.getItem("magnificent-cart") || "[]"
      );

      const existingIndex = existingCart.findIndex(
        (item) =>
          item.id === product.id &&
          item.size === selectedSize
      );

      if (existingIndex >= 0) {
        const newQuantity =
          existingCart[existingIndex].quantity + quantity;

        if (newQuantity > currentStock) {
          setMessage(
            `Jumlah melebihi stok. Maksimal ${currentStock}.`
          );
          setAdding(false);
          return;
        }

        existingCart[existingIndex].quantity = newQuantity;
      } else {
        existingCart.push({
          id: product.id,
          name: product.name,
          price: currentPrice,
          quantity,
          size: selectedSize,
          image: product.image,
        });
      }

      localStorage.setItem(
        "magnificent-cart",
        JSON.stringify(existingCart)
      );

      // Memberi tahu Navbar bahwa isi keranjang berubah
      window.dispatchEvent(new Event("cart-updated"));

      setMessage("✓ Produk berhasil ditambahkan ke keranjang.");
    } catch (error) {
      console.error(error);
      setMessage("Gagal menambahkan produk ke keranjang.");
    }

    setAdding(false);
  };

  const handleBuyNow = () => {
    if (!validate()) return;

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
  };

  return (
    <main className="min-h-screen bg-[#f5f3ee] text-black">
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-6 py-24 lg:grid-cols-2">

        {/* IMAGE */}
        <div className="relative overflow-hidden rounded-[28px] bg-white">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="aspect-square h-full w-full object-cover"
            />
          ) : (
            <div className="flex aspect-square items-center justify-center">
              <span className="text-5xl font-black text-black/10">
                MERCH
              </span>
            </div>
          )}
        </div>

        {/* DETAIL */}
        <div className="flex flex-col">

          <p className="text-sm font-bold uppercase tracking-[0.3em] text-red-600">
            Official Merchandise
          </p>

          <h1 className="mt-4 text-5xl font-black tracking-tight sm:text-6xl">
            {product.name}
          </h1>

          <p className="mt-5 text-black/50">
            {product.description || "Official Edition"}
          </p>

          <p className="mt-8 text-3xl font-black">
            {formatPrice(currentPrice)}
          </p>

          <p className="mt-1 text-sm text-black/50">
            {currentStock} pcs tersedia
          </p>

          {/* SIZE */}
          {sizes.length > 0 && (
            <div className="mt-8">
              <p className="mb-3 text-sm font-bold">
                Ukuran
              </p>

              <div className="flex flex-wrap gap-2">
                {sizes.map((item) => (
                  <button
                    key={item.size}
                    type="button"
                    onClick={() => {
                      setSelectedSize(item.size);
                      setMessage("");
                    }}
                    className={`rounded-xl border-2 px-5 py-3 text-sm font-bold transition ${
                      selectedSize === item.size
                        ? "border-black bg-black text-white"
                        : "border-black/10 bg-white hover:border-black"
                    }`}
                  >
                    {item.size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* QUANTITY */}
          <div className="mt-8">
            <p className="mb-3 text-sm font-bold">
              Jumlah
            </p>

            <div className="flex w-fit items-center overflow-hidden rounded-xl border border-black/10 bg-white">
              <button
                type="button"
                onClick={() => {
                  setQuantity((q) => Math.max(1, q - 1));
                  setMessage("");
                }}
                className="flex h-12 w-12 items-center justify-center text-xl font-bold hover:bg-black/5"
              >
                −
              </button>

              <span className="flex h-12 w-12 items-center justify-center font-bold">
                {quantity}
              </span>

              <button
                type="button"
                onClick={() => {
                  setQuantity((q) =>
                    Math.min(currentStock, q + 1)
                  );
                  setMessage("");
                }}
                className="flex h-12 w-12 items-center justify-center text-xl font-bold hover:bg-black/5"
              >
                +
              </button>
            </div>
          </div>

          {/* TOTAL */}
          <div className="mt-8 border-t border-black/10 pt-7">
            <div className="flex items-center justify-between">
              <span className="text-black/50">
                Total
              </span>

              <span className="text-2xl font-black">
                {formatPrice(currentPrice * quantity)}
              </span>
            </div>
          </div>

          {/* MESSAGE */}
          {message && (
            <div className="mt-5 rounded-xl bg-white px-4 py-3 text-center text-sm font-bold">
              {message}
            </div>
          )}

          {/* BUTTONS */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={adding || currentStock <= 0}
              className="rounded-full border-2 border-black bg-white px-6 py-4 text-sm font-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {adding
                ? "Menambahkan..."
                : "🛒 Tambah ke Keranjang"}
            </button>

            <button
              type="button"
              onClick={handleBuyNow}
              disabled={currentStock <= 0}
              className="rounded-full bg-black px-6 py-4 text-sm font-black text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Beli Sekarang →
            </button>

          </div>

          <p className="mt-4 text-center text-xs text-black/40">
            Tambahkan ke keranjang untuk membeli beberapa
            merchandise sekaligus.
          </p>

        </div>
      </div>
    </main>
  );
}