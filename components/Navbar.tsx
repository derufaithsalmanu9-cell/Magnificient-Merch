"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const updateCart = () => {
    try {
      const cart = JSON.parse(
        localStorage.getItem("magnificent-cart") || "[]"
      );

      const count = cart.reduce(
        (total: number, item: any) =>
          total + Number(item.quantity || 0),
        0
      );

      setCartCount(count);
    } catch {
      setCartCount(0);
    }
  };

  useEffect(() => {
    updateCart();

    // Update ketika localStorage berubah dari tab lain
    window.addEventListener("storage", updateCart);

    // Update ketika komponen menerima event custom
    window.addEventListener("cart-updated", updateCart);

    // Update ketika kembali ke halaman
    window.addEventListener("focus", updateCart);

    return () => {
      window.removeEventListener("storage", updateCart);
      window.removeEventListener("cart-updated", updateCart);
      window.removeEventListener("focus", updateCart);
    };
  }, []);

  return (
    <header className="fixed left-0 right-0 top-0 z-50 px-3 pt-3 sm:px-6">
      <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-full border-4 border-[#d4ae72] bg-[#fff9e9]/95 px-4 py-3 shadow-xl backdrop-blur-md">

        {/* LOGO */}
        <Link
          href="/"
          className="flex items-center gap-2"
          onClick={() => setOpen(false)}
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#754321] text-xl text-white shadow-[0_3px_0_#3e2415]">
            ✦
          </div>

          <div className="leading-none">
            <div className="font-serif text-lg font-black text-[#754321]">
              MAGNIFICIENT
            </div>

            <div className="text-[8px] font-bold uppercase tracking-[.25em] text-[#754321]/50">
              Official Merch
            </div>
          </div>
        </Link>

        {/* DESKTOP MENU */}
        <div className="hidden items-center gap-1 md:flex">
          <Link href="/" className="nav-link">
            Beranda
          </Link>

          <Link href="/merch" className="nav-link">
            Merchandise
          </Link>

          <Link href="/status" className="nav-link">
            Cek Pesanan
          </Link>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2">

          {/* CART */}
          <Link
            href="/checkout"
            className="relative flex h-11 w-11 items-center justify-center rounded-full bg-[#4c83c7] text-lg text-white shadow-[0_3px_0_#285b92] transition hover:-translate-y-0.5"
            aria-label="Keranjang"
          >
            🛒

            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#b94432] px-1 text-[9px] font-black text-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          {/* ADMIN */}
          <Link
            href="/admin/login"
            className="hidden rounded-full border-2 border-[#754321] px-4 py-2 text-xs font-black text-[#754321] transition hover:bg-[#754321] hover:text-white sm:block"
          >
            Admin
          </Link>

          {/* MOBILE MENU */}
          <button
            onClick={() => setOpen(!open)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#754321] text-xl text-white md:hidden"
            aria-label="Menu"
          >
            {open ? "×" : "☰"}
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      {open && (
        <div className="mx-3 mt-2 rounded-3xl border-4 border-[#d4ae72] bg-[#fff9e9] p-3 shadow-xl md:hidden">

          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="mobile-nav-link"
          >
            🏠
            <span>Beranda</span>
          </Link>

          <Link
            href="/merch"
            onClick={() => setOpen(false)}
            className="mobile-nav-link"
          >
            🛍️
            <span>Merchandise</span>
          </Link>

          <Link
            href="/checkout"
            onClick={() => setOpen(false)}
            className="mobile-nav-link"
          >
            🛒
            <span>
              Keranjang
              {cartCount > 0 && ` (${cartCount})`}
            </span>
          </Link>

          <Link
            href="/status"
            onClick={() => setOpen(false)}
            className="mobile-nav-link"
          >
            📦
            <span>Cek Pesanan</span>
          </Link>

          <Link
            href="/admin/login"
            onClick={() => setOpen(false)}
            className="mobile-nav-link"
          >
            🔐
            <span>Login Admin</span>
          </Link>

        </div>
      )}
    </header>
  );
}