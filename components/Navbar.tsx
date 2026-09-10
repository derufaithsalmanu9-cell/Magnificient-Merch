import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-black/10 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

        <Link
          href="/"
          className="text-xl font-black tracking-tight"
        >
          MAGNIFICIENT<span className="text-red-600">.</span>
        </Link>

        <div className="hidden items-center gap-8 text-sm font-medium md:flex">
          <Link href="/" className="hover:text-red-600">
            Home
          </Link>

          <Link href="/merch" className="hover:text-red-600">
            Merch
          </Link>

          <Link href="/#event" className="hover:text-red-600">
            Event
          </Link>
        </div>

        <Link
          href="/merch"
          className="rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600"
        >
          Order Merch
        </Link>

      </div>
    </nav>
  );
}