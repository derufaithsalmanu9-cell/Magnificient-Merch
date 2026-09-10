import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f5f3ee] text-black">

      <Navbar />

      <section className="flex min-h-screen items-center justify-center px-6 pt-20">

        <div className="text-center">

          <p className="mb-6 text-sm font-bold uppercase tracking-[0.3em] text-red-600">
            Official Merchandise
          </p>

          <h1 className="text-6xl font-black tracking-[-0.05em] sm:text-8xl">
            MAKE IT
            <br />
            <span className="text-red-600">
              MAGNIFICENT.
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-xl text-base leading-7 text-black/60 sm:text-lg">
            Official merchandise untuk merayakan momen
            spesial HUT sekolah.
          </p>

          <div className="mt-10 flex justify-center gap-4">

            <a
              href="/merch"
              className="rounded-full bg-black px-7 py-4 text-sm font-bold text-white transition hover:bg-red-600"
            >
              Lihat Merchandise →
            </a>

            <a
              href="#event"
              className="rounded-full border border-black/20 px-7 py-4 text-sm font-bold transition hover:border-black"
            >
              Tentang Event
            </a>

          </div>

        </div>

      </section>

      <section
        id="event"
        className="bg-black px-6 py-32 text-white"
      >
        <div className="mx-auto max-w-6xl">

          <p className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-red-500">
            The Event
          </p>

          <h2 className="text-5xl font-black sm:text-7xl">
            MORE THAN
            <br />
            AN EVENT.
          </h2>

          <p className="mt-8 max-w-2xl text-lg leading-8 text-white/60">
            Sebuah perayaan momen, kreativitas, persahabatan,
            dan perjalanan bersama seluruh warga sekolah.
          </p>

        </div>
      </section>

      <footer className="bg-[#f5f3ee] px-6 py-10 text-center text-sm text-black/50">
        © 2026 Magnificent — Official Merchandise
      </footer>

    </main>
  );
}