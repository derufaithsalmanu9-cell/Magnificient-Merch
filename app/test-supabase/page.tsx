import { supabase } from "@/lib/supabase";

export default async function TestSupabase() {
  const { data, error } = await supabase
    .from("products")
    .select("*");

  return (
    <main className="min-h-screen p-10">

      <h1 className="text-3xl font-black">
        Supabase Test
      </h1>

      {error ? (
        <pre className="mt-8 rounded-xl bg-red-100 p-5 text-red-600">
          {error.message}
        </pre>
      ) : (
        <pre className="mt-8 rounded-xl bg-black p-5 text-white">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}

    </main>
  );
}