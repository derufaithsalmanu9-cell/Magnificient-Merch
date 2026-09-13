"use client";

import PaymentVerification from "./PaymentVerification";
import { useEffect, useMemo, useState, type ReactElement } from "react";

type PaymentVerificationProps = {
  order: Order;
  onUpdated: () => Promise<void>;
};

const PaymentVerificationUI =
  PaymentVerification as unknown as (
    props: PaymentVerificationProps
  ) => ReactElement;

type ProductSize = {
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
  active: boolean;
  sizes: ProductSize[];
  created_at?: string;
};

type OrderItem = {
  id?: string;
  name: string;
  price: number;
  size?: string;
  quantity: number;
};

type Order = {
  id?: string;
  order_code: string;
  customer_name: string;
  whatsapp: string;
  class_name: string;
  note?: string | null;
  payment_method?: string | null;
  items: OrderItem[];
  total: number;
  status: string;
  created_at?: string;
};

type ApiResult = {
  success?: boolean;
  error?: string;
  products?: Product[];
  orders?: Order[];
  product?: Product;
  url?: string;
};

/* =========================================================
   API HELPER
========================================================= */

async function apiRequest(
  url: string,
  options?: RequestInit
): Promise<ApiResult> {
  const response = await fetch(url, {
    ...options,
    credentials: "include",
  });

  const text = await response.text();

  let data: ApiResult;

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    console.error("RAW SERVER RESPONSE:", text);

    throw new Error(
      `Server mengembalikan response yang bukan JSON.\n\n` +
        `Status: ${response.status}\n\n` +
        `Response:\n${text.substring(0, 500)}`
    );
  }

  if (!response.ok) {
    throw new Error(
      data.error ||
        `Request gagal dengan status ${response.status}.`
    );
  }

  return data;
}

/* =========================================================
   COMPONENT
========================================================= */

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showProductForm, setShowProductForm] =
    useState(false);

  const [editingId, setEditingId] = useState<string | null>(
    null
  );

  const [search, setSearch] = useState("");

  /* =========================================================
     PRODUCT FORM
  ========================================================= */

  const [name, setName] = useState("");
  const [description, setDescription] =
    useState("");

  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  const [image, setImage] = useState("");
  const [imageFile, setImageFile] =
    useState<File | null>(null);

  const [active, setActive] = useState(true);

  const [sizes, setSizes] = useState<ProductSize[]>([]);

  /* =========================================================
     LOAD DATA
  ========================================================= */

  async function loadData() {
    try {
      setLoading(true);

      const data = await apiRequest(
        "/api/admin/data"
      );

      setProducts(data.products || []);
      setOrders(data.orders || []);
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Gagal mengambil data dashboard."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  /* =========================================================
     RESET FORM
  ========================================================= */

  function resetForm() {
    setEditingId(null);

    setName("");
    setDescription("");

    setPrice("");
    setStock("");

    setImage("");
    setImageFile(null);

    setActive(true);

    setSizes([]);

    setShowProductForm(false);
  }

  /* =========================================================
     EDIT PRODUCT
  ========================================================= */

  function editProduct(product: Product) {
    setEditingId(product.id);

    setName(product.name);
    setDescription(product.description || "");

    setPrice(String(product.price));
    setStock(String(product.stock));

    setImage(product.image || "");
    setImageFile(null);

    setActive(product.active);

    setSizes(
      Array.isArray(product.sizes)
        ? product.sizes
        : []
    );

    setShowProductForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* =========================================================
     ADD SIZE
  ========================================================= */

  function addSize() {
    setSizes([
      ...sizes,
      {
        size: "",
        price: Number(price) || 0,
        stock: 0,
      },
    ]);
  }

  /* =========================================================
     UPDATE SIZE
  ========================================================= */

  function updateSize(
    index: number,
    field: keyof ProductSize,
    value: string
  ) {
    const newSizes = [...sizes];

    if (field === "size") {
      newSizes[index].size = value;
    }

    if (field === "price") {
      newSizes[index].price =
        Number(value) || 0;
    }

    if (field === "stock") {
      newSizes[index].stock =
        Number(value) || 0;
    }

    setSizes(newSizes);
  }

  /* =========================================================
     REMOVE SIZE
  ========================================================= */

  function removeSize(index: number) {
    setSizes(
      sizes.filter((_, i) => i !== index)
    );
  }

  /* =========================================================
     UPLOAD IMAGE
  ========================================================= */

  async function uploadImage() {
    if (!imageFile) {
      return image || null;
    }

    const formData = new FormData();

    formData.append("file", imageFile);

    const response = await fetch(
      "/api/admin/upload",
      {
        method: "POST",
        body: formData,
        credentials: "include",
      }
    );

    const text = await response.text();

    let data: ApiResult;

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      console.error(
        "UPLOAD RAW RESPONSE:",
        text
      );

      throw new Error(
        `Upload server tidak mengembalikan JSON.\n\n${text.substring(
          0,
          500
        )}`
      );
    }

    if (!response.ok) {
      throw new Error(
        data.error ||
          "Upload gambar gagal."
      );
    }

    return data.url || null;
  }

  /* =========================================================
     SAVE PRODUCT
  ========================================================= */

  async function saveProduct() {
    if (!name.trim()) {
      alert("Nama produk wajib diisi.");
      return;
    }

    setSaving(true);

    try {
      /* Upload gambar kalau ada */
      let imageUrl = image.trim() || null;

      if (imageFile) {
        imageUrl = await uploadImage();
      }

      const productId =
        editingId ||
        name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "") +
          "-" +
          Date.now();

      const productData = {
        id: productId,
        name: name.trim(),
        description:
          description.trim() || null,

        price:
          Number(price) || 0,

        stock:
          Number(stock) || 0,

        image: imageUrl,

        active,

        sizes: sizes.filter(
          (item) => item.size.trim() !== ""
        ),
      };

      const method = editingId
        ? "PUT"
        : "POST";

      const result = await apiRequest(
        "/api/admin/products",
        {
          method,
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(
            productData
          ),
        }
      );

      console.log(
        "PRODUCT RESPONSE:",
        result
      );

      alert(
        editingId
          ? "Produk berhasil diperbarui."
          : "Produk berhasil ditambahkan."
      );

      resetForm();

      await loadData();
    } catch (error) {
      console.error(
        "SAVE PRODUCT ERROR:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan produk."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =========================================================
     DELETE PRODUCT
  ========================================================= */

  async function deleteProduct(id: string) {
    const confirmed = confirm(
      "Yakin ingin menghapus produk ini?"
    );

    if (!confirmed) return;

    try {
      await apiRequest(
        `/api/admin/products?id=${encodeURIComponent(
          id
        )}`,
        {
          method: "DELETE",
        }
      );

      alert("Produk berhasil dihapus.");

      await loadData();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Gagal menghapus produk."
      );
    }
  }

  /* =========================================================
     TOGGLE PRODUCT
  ========================================================= */

  async function toggleProduct(
    product: Product
  ) {
    try {
      await apiRequest(
        "/api/admin/products",
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            ...product,
            active: !product.active,
          }),
        }
      );

      await loadData();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Gagal mengubah status produk."
      );
    }
  }

  /* =========================================================
     UPDATE ORDER STATUS
  ========================================================= */

  async function updateOrderStatus(
    order: Order,
    status: string
  ) {
    try {
      await apiRequest(
        "/api/admin/orders",
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            id: order.id,
            order_code:
              order.order_code,
            status,
          }),
        }
      );

      await loadData();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Gagal mengubah status pesanan."
      );
    }
  }

  /* =========================================================
     SEARCH
  ========================================================= */

  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      product.name
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [products, search]);

  /* =========================================================
     STATISTICS
  ========================================================= */

  const totalRevenue = orders.reduce(
    (sum, order) =>
      sum + Number(order.total || 0),
    0
  );

  const waitingOrders = orders.filter(
    (order) =>
      order.status ===
      "Menunggu Pembayaran"
  ).length;

  const completedOrders = orders.filter(
    (order) =>
      order.status === "Selesai"
  ).length;

  /* =========================================================
     CSV EXPORT
  ========================================================= */

  function downloadCSV(
    filename: string,
    rows: Record<string, any>[]
  ) {
    if (!rows.length) {
      alert("Tidak ada data untuk diekspor.");
      return;
    }

    const headers = Object.keys(
      rows[0]
    );

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        headers
          .map((header) => {
            const value =
              row[header] ?? "";

            return `"${String(value)
              .replace(/"/g, '""')
              .replace(/\n/g, " ")}"`;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob(
      ["\ufeff" + csv],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download = filename;

    link.click();

    URL.revokeObjectURL(url);
  }

  function exportProducts() {
    downloadCSV(
      "magnificent-products.csv",
      products.map((product) => ({
        ID: product.id,
        Produk: product.name,
        Deskripsi:
          product.description || "",
        Harga: product.price,
        Stok: product.stock,
        Aktif: product.active
          ? "Ya"
          : "Tidak",
        Ukuran: product.sizes
          .map(
            (size) =>
              `${size.size} - Rp${size.price} - stok ${size.stock}`
          )
          .join(" | "),
      }))
    );
  }

  function exportOrders() {
    downloadCSV(
      "magnificent-orders.csv",
      orders.map((order) => ({
        Kode: order.order_code,
        Nama: order.customer_name,
        WhatsApp: order.whatsapp,
        Kelas: order.class_name,
        Pembayaran:
          order.payment_method || "",
        Total: order.total,
        Status: order.status,
        Produk: order.items
          ?.map(
            (item) =>
              `${item.name} (${item.size || "-"}) x${item.quantity}`
          )
          .join(" | "),
        Catatan: order.note || "",
        Tanggal:
          order.created_at || "",
      }))
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-black/10 border-t-black" />

          <p className="mt-4 text-sm text-black/50">
            Memuat dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">

      {/* HEADER */}

      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-red-600">
            Magnificent Admin
          </p>

          <h1 className="mt-3 text-5xl font-black tracking-tight">
            DASHBOARD.
          </h1>

          <p className="mt-3 text-black/50">
            Kelola merchandise dan pesanan.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowProductForm(true);
          }}
          className="rounded-full bg-black px-6 py-3 text-sm font-bold text-white transition hover:bg-red-600"
        >
          + Tambah Produk
        </button>
      </div>

      {/* STATS */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <div className="rounded-3xl bg-white p-6">
          <p className="text-sm text-black/50">
            Total Produk
          </p>

          <p className="mt-2 text-4xl font-black">
            {products.length}
          </p>
        </div>

        <div className="rounded-3xl bg-white p-6">
          <p className="text-sm text-black/50">
            Total Pesanan
          </p>

          <p className="mt-2 text-4xl font-black">
            {orders.length}
          </p>
        </div>

        <div className="rounded-3xl bg-white p-6">
          <p className="text-sm text-black/50">
            Menunggu
          </p>

          <p className="mt-2 text-4xl font-black text-red-600">
            {waitingOrders}
          </p>
        </div>

        <div className="rounded-3xl bg-white p-6">
          <p className="text-sm text-black/50">
            Pendapatan
          </p>

          <p className="mt-2 text-2xl font-black">
            Rp
            {totalRevenue.toLocaleString(
              "id-ID"
            )}
          </p>
        </div>

      </div>

      {/* PRODUCT FORM */}

      {showProductForm && (
        <section className="rounded-3xl bg-black p-6 text-white md:p-10">

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-500">
                Product Manager
              </p>

              <h2 className="mt-2 text-3xl font-black">
                {editingId
                  ? "EDIT PRODUK"
                  : "TAMBAH PRODUK"}
              </h2>
            </div>

            <button
              onClick={resetForm}
              className="rounded-full border border-white/20 px-4 py-2 text-sm"
            >
              Tutup
            </button>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">

            {/* NAME */}

            <div>
              <label className="text-sm font-bold">
                Nama Produk
              </label>

              <input
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="Contoh: Magnificent T-Shirt"
                className="mt-2 w-full rounded-xl bg-white px-4 py-3 text-black outline-none"
              />
            </div>

            {/* DESCRIPTION */}

            <div>
              <label className="text-sm font-bold">
                Deskripsi
              </label>

              <input
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
                placeholder="Official Edition"
                className="mt-2 w-full rounded-xl bg-white px-4 py-3 text-black outline-none"
              />
            </div>

            {/* PRICE */}

            <div>
              <label className="text-sm font-bold">
                Harga Dasar
              </label>

              <input
                type="number"
                value={price}
                onChange={(e) =>
                  setPrice(e.target.value)
                }
                placeholder="85000"
                className="mt-2 w-full rounded-xl bg-white px-4 py-3 text-black outline-none"
              />
            </div>

            {/* STOCK */}

            <div>
              <label className="text-sm font-bold">
                Stok Dasar
              </label>

              <input
                type="number"
                value={stock}
                onChange={(e) =>
                  setStock(e.target.value)
                }
                placeholder="100"
                className="mt-2 w-full rounded-xl bg-white px-4 py-3 text-black outline-none"
              />
            </div>

            {/* IMAGE */}

            <div className="lg:col-span-2">

              <label className="text-sm font-bold">
                Gambar Produk
              </label>

              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) =>
                  setImageFile(
                    e.target.files?.[0] ||
                      null
                  )
                }
                className="mt-2 block w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm"
              />

              <p className="mt-2 text-xs text-white/40">
                Pilih gambar langsung dari komputer.
                Maksimal 5 MB.
              </p>

              {image && !imageFile && (
                <img
                  src={image}
                  alt={name}
                  className="mt-4 h-32 w-32 rounded-2xl object-cover"
                />
              )}

              {imageFile && (
                <p className="mt-3 text-sm text-green-400">
                  ✓ {imageFile.name}
                </p>
              )}

            </div>

            {/* SIZES */}

            <div className="lg:col-span-2">

              <div className="flex items-center justify-between">

                <div>
                  <label className="text-sm font-bold">
                    Ukuran & Harga
                  </label>

                  <p className="mt-1 text-xs text-white/40">
                    Setiap ukuran dapat memiliki harga
                    dan stok berbeda.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addSize}
                  className="rounded-full bg-white px-4 py-2 text-xs font-bold text-black"
                >
                  + Tambah Ukuran
                </button>

              </div>

              <div className="mt-4 space-y-3">

                {sizes.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-white/20 p-6 text-center text-sm text-white/40">
                    Belum ada ukuran.
                  </div>
                )}

                {sizes.map(
                  (size, index) => (
                    <div
                      key={index}
                      className="grid gap-3 rounded-2xl bg-white/10 p-4 md:grid-cols-[1fr_1fr_1fr_auto]"
                    >

                      <input
                        value={size.size}
                        onChange={(e) =>
                          updateSize(
                            index,
                            "size",
                            e.target.value
                          )
                        }
                        placeholder="S / M / L / XL"
                        className="rounded-xl bg-white px-4 py-3 text-black"
                      />

                      <input
                        type="number"
                        value={size.price}
                        onChange={(e) =>
                          updateSize(
                            index,
                            "price",
                            e.target.value
                          )
                        }
                        placeholder="Harga"
                        className="rounded-xl bg-white px-4 py-3 text-black"
                      />

                      <input
                        type="number"
                        value={size.stock}
                        onChange={(e) =>
                          updateSize(
                            index,
                            "stock",
                            e.target.value
                          )
                        }
                        placeholder="Stok"
                        className="rounded-xl bg-white px-4 py-3 text-black"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removeSize(index)
                        }
                        className="rounded-xl bg-red-600 px-4 py-3 text-sm font-bold"
                      >
                        Hapus
                      </button>

                    </div>
                  )
                )}

              </div>
            </div>

            {/* ACTIVE */}

            <div className="lg:col-span-2">

              <label className="flex cursor-pointer items-center gap-3">

                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) =>
                    setActive(
                      e.target.checked
                    )
                  }
                  className="h-5 w-5"
                />

                <span className="text-sm font-bold">
                  Produk aktif dan tampil di
                  merchandise
                </span>

              </label>

            </div>

          </div>

          {/* SAVE */}

          <div className="mt-8 flex gap-3">

            <button
              onClick={saveProduct}
              disabled={saving}
              className="rounded-full bg-red-600 px-7 py-3 text-sm font-bold transition hover:bg-red-500 disabled:opacity-50"
            >
              {saving
                ? "Menyimpan..."
                : editingId
                ? "Simpan Perubahan"
                : "Simpan Produk"}
            </button>

            <button
              onClick={resetForm}
              disabled={saving}
              className="rounded-full border border-white/20 px-7 py-3 text-sm font-bold"
            >
              Batal
            </button>

          </div>

        </section>
      )}

      {/* PRODUCTS */}

      <section>

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

          <div>
            <h2 className="text-3xl font-black">
              PRODUK
            </h2>

            <p className="mt-1 text-sm text-black/50">
              Kelola semua merchandise.
            </p>
          </div>

          <div className="flex gap-3">

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Cari produk..."
              className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm outline-none"
            />

            <button
              onClick={exportProducts}
              className="rounded-full bg-white px-5 py-3 text-sm font-bold"
            >
              Export CSV
            </button>

          </div>

        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">

          {filteredProducts.map(
            (product) => (
              <div
                key={product.id}
                className="overflow-hidden rounded-3xl bg-white"
              >

                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="aspect-square w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-square items-center justify-center bg-black/5">
                    <span className="text-5xl font-black text-black/10">
                      MERCH
                    </span>
                  </div>
                )}

                <div className="p-6">

                  <div className="flex items-start justify-between gap-3">

                    <div>
                      <h3 className="font-black">
                        {product.name}
                      </h3>

                      <p className="mt-1 text-sm text-black/50">
                        {product.description}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        product.active
                          ? "bg-green-100 text-green-700"
                          : "bg-black/10 text-black/40"
                      }`}
                    >
                      {product.active
                        ? "Aktif"
                        : "Nonaktif"}
                    </span>

                  </div>

                  <p className="mt-5 text-xl font-black">
                    Rp
                    {Number(
                      product.price
                    ).toLocaleString(
                      "id-ID"
                    )}
                  </p>

                  <p className="mt-1 text-sm text-black/50">
                    Stok: {product.stock}
                  </p>

                  {product.sizes?.length >
                    0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {product.sizes.map(
                        (size) => (
                          <span
                            key={size.size}
                            className="rounded-full bg-[#f5f3ee] px-3 py-1 text-xs font-bold"
                          >
                            {size.size} · Rp
                            {size.price.toLocaleString(
                              "id-ID"
                            )}
                          </span>
                        )
                      )}
                    </div>
                  )}

                  <div className="mt-6 grid grid-cols-3 gap-2">

                    <button
                      onClick={() =>
                        editProduct(
                          product
                        )
                      }
                      className="rounded-xl bg-black px-3 py-3 text-xs font-bold text-white"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        toggleProduct(
                          product
                        )
                      }
                      className="rounded-xl bg-black/5 px-3 py-3 text-xs font-bold"
                    >
                      {product.active
                        ? "Nonaktifkan"
                        : "Aktifkan"}
                    </button>

                    <button
                      onClick={() =>
                        deleteProduct(
                          product.id
                        )
                      }
                      className="rounded-xl bg-red-50 px-3 py-3 text-xs font-bold text-red-600"
                    >
                      Hapus
                    </button>

                  </div>

                </div>

              </div>
            )
          )}

        </div>

        {filteredProducts.length ===
          0 && (
          <div className="mt-6 rounded-3xl bg-white p-12 text-center">
            <p className="text-black/40">
              Belum ada produk.
            </p>
          </div>
        )}

      </section>

      {/* ORDERS */}

      <section>

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

          <div>
            <h2 className="text-3xl font-black">
              PESANAN
            </h2>

            <p className="mt-1 text-sm text-black/50">
              Kelola status pesanan pelanggan.
            </p>
          </div>

          <button
            onClick={exportOrders}
            className="rounded-full bg-white px-5 py-3 text-sm font-bold"
          >
            Export Data Pesanan
          </button>

        </div>

        <div className="mt-6 overflow-hidden rounded-3xl bg-white">

          {orders.length === 0 ? (
            <div className="p-12 text-center text-black/40">
              Belum ada pesanan.
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[900px] text-left text-sm">

                <thead>
                  <tr className="border-b border-black/10">
                    <th className="px-6 py-5">
                      Pesanan
                    </th>

                    <th className="px-6 py-5">
                      Pelanggan
                    </th>

                    <th className="px-6 py-5">
                      Produk
                    </th>

                    <th className="px-6 py-5">
                      Total
                    </th>

                    <th className="px-6 py-5">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {orders.map(
                    (order) => (
                      <tr
                        key={
                          order.id ||
                          order.order_code
                        }
                        className="border-b border-black/5 last:border-0"
                      >

                        <td className="px-6 py-5">

                          <p className="font-black">
                            {order.order_code}
                          </p>

                          <p className="mt-1 text-xs text-black/40">
                            {order.created_at
                              ? new Date(
                                  order.created_at
                                ).toLocaleString(
                                  "id-ID"
                                )
                              : "-"}
                          </p>

                        </td>

                        <td className="px-6 py-5">

                          <p className="font-bold">
                            {
                              order.customer_name
                            }
                          </p>

                          <p className="text-xs text-black/50">
                            {order.whatsapp}
                          </p>

                          <p className="text-xs text-black/50">
                            {order.class_name}
                          </p>

                        </td>

                        <td className="px-6 py-5">

                          <div className="space-y-1">

                            {order.items?.map(
                              (
                                item,
                                index
                              ) => (
                                <p
                                  key={
                                    index
                                  }
                                  className="text-xs"
                                >
                                  {item.name}{" "}
                                  ×{" "}
                                  {
                                    item.quantity
                                  }

                                  {item.size &&
                                    ` (${item.size})`}
                                </p>
                              )
                            )}

                          </div>

                        </td>

                        <td className="px-6 py-5 font-black">

                          Rp
                          {Number(
                            order.total
                          ).toLocaleString(
                            "id-ID"
                          )}

                        </td>

                        <td className="px-6 py-5">
  <div className="space-y-3">

    {/* STATUS */}
    <select
      value={order.status}
      onChange={(e) =>
        updateOrderStatus(
          order,
          e.target.value
        )
      }
      className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-bold outline-none"
    >
      <option>Menunggu Pembayaran</option>
      <option>Menunggu Verifikasi</option>
      <option>Pembayaran Diterima</option>
      <option>Pembayaran Ditolak</option>
      <option>Diproses</option>
      <option>Siap Diambil</option>
      <option>Selesai</option>
      <option>Dibatalkan</option>
    </select>

    {/* VERIFIKASI BUKTI TRANSFER */}
    <PaymentVerificationUI
      order={order}
      onUpdated={loadData}
    />

  </div>
</td><td className="px-6 py-5">

                          <select
                            value={
                              order.status
                            }
                            onChange={(e) =>
                              updateOrderStatus(
                                order,
                                e.target
                                  .value
                              )
                            }
                            className="rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-bold outline-none"
                          >

                            <option>
                              Menunggu Pembayaran
                            </option>

                            <option>
                              Pembayaran Diterima
                            </option>

                            <option>
                              Diproses
                            </option>

                            <option>
                              Siap Diambil
                            </option>

                            <option>
                              Selesai
                            </option>

                            <option>
                              Dibatalkan
                            </option>

                          </select>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </section>

    </div>
  );
}

async function exportOrders() {
  try {
    const response = await fetch(
      "/api/admin/orders/export",
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const text = await response.text();

      let message = "Gagal melakukan export data pesanan.";

      try {
        const data = JSON.parse(text);
        message = data.error || message;
      } catch {
        if (text) {
          message = text.substring(0, 300);
        }
      }

      throw new Error(message);
    }

    const blob = await response.blob();

    if (!blob.size) {
      throw new Error(
        "File CSV yang diterima kosong."
      );
    }

    const url =
      window.URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      `DATA-PESANAN-MAGNIFICIENT-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

    document.body.appendChild(link);

    link.click();

    link.remove();

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error(
      "EXPORT ORDERS ERROR:",
      error
    );

    alert(
      error instanceof Error
        ? error.message
        : "Gagal export data pesanan."
    );
  }
}

<button
  type="button"
  onClick={exportExcel}
  className="rounded-full bg-green-600 px-5 py-3 text-sm font-black text-white transition hover:bg-green-700"
>
  ↓ Export Excel PO
</button>

async function exportExcel() {
  try {
    const response = await fetch(
      "/api/admin/export",
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const text = await response.text();

      let message = "Gagal melakukan export.";

      try {
        const data = JSON.parse(text);
        message = data.error || message;
      } catch {
        if (text) {
          message = text.substring(0, 300);
        }
      }

      throw new Error(message);
    }

    const blob = await response.blob();

    if (!blob.size) {
      throw new Error(
        "File Excel yang diterima kosong."
      );
    }

    const url =
      window.URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      `DATA-PO-MAGNIFICIENT-${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;

    document.body.appendChild(link);

    link.click();

    link.remove();

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error(
      "EXPORT EXCEL ERROR:",
      error
    );

    alert(
      error instanceof Error
        ? error.message
        : "Gagal export Excel."
    );
  }
}

<div className="flex flex-wrap gap-3">

  <button
    type="button"
    onClick={exportOrders}
    className="rounded-full bg-white px-5 py-3 text-sm font-bold transition hover:bg-black hover:text-white"
  >
    Export CSV
  </button>

  <button
    type="button"
    onClick={exportExcel}
    className="rounded-full bg-green-600 px-5 py-3 text-sm font-black text-white transition hover:bg-green-700"
  >
    ↓ Export Excel PO
  </button>

</div>