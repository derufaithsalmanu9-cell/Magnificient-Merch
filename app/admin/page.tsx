import AdminDashboard from "@/components/AdminDashboard";

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-[#f5f3ee] px-6 py-12 text-black">
      <div className="mx-auto max-w-7xl">
        <AdminDashboard />
      </div>
    </main>
  );
}