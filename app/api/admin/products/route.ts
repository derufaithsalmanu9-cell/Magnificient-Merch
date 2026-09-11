import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

/* =========================================
   CHECK ADMIN
========================================= */

function checkAdmin(request: NextRequest) {
  const cookie = request.cookies.get("magnificent_admin");

  if (!cookie?.value) {
    return false;
  }

  return true;
}

/* =========================================
   POST
   TAMBAH PRODUK
========================================= */

export async function POST(request: NextRequest) {
  try {
    if (!checkAdmin(request)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      name,
      description,
      price,
      stock,
      image,
      active,
      sizes,
    } = body;

    if (!name || price === undefined) {
      return NextResponse.json(
        {
          error: "Nama dan harga wajib diisi.",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("products")
      .insert({
        name: String(name).trim(),
        description: description || "",
        price: Number(price),
        stock: Number(stock || 0),
        image: image || null,
        active: active ?? true,
        sizes: Array.isArray(sizes) ? sizes : [],
      })
      .select()
      .single();

    if (error) {
      console.error("CREATE PRODUCT ERROR:", error);

      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(data, {
      status: 201,
    });
  } catch (error) {
    console.error("POST PRODUCT ERROR:", error);

    return NextResponse.json(
      {
        error: "Gagal membuat produk.",
      },
      { status: 500 }
    );
  }
}

/* =========================================
   PUT
   EDIT PRODUK / AKTIF-NONAKTIF
========================================= */

export async function PUT(request: NextRequest) {
  try {
    if (!checkAdmin(request)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      id,
      name,
      description,
      price,
      stock,
      image,
      active,
      sizes,
    } = body;

    if (!id) {
      return NextResponse.json(
        {
          error: "ID produk wajib diisi.",
        },
        { status: 400 }
      );
    }

    const updateData: Record<string, any> = {};

    if (name !== undefined) {
      updateData.name = String(name).trim();
    }

    if (description !== undefined) {
      updateData.description = description || "";
    }

    if (price !== undefined) {
      updateData.price = Number(price);
    }

    if (stock !== undefined) {
      updateData.stock = Number(stock);
    }

    if (image !== undefined) {
      updateData.image = image || null;
    }

    if (active !== undefined) {
      updateData.active = Boolean(active);
    }

    if (sizes !== undefined) {
      updateData.sizes = Array.isArray(sizes)
        ? sizes
        : [];
    }

    const { data, error } = await supabaseAdmin
      .from("products")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("UPDATE PRODUCT ERROR:", error);

      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(data, {
      status: 200,
    });
  } catch (error) {
    console.error("PUT PRODUCT ERROR:", error);

    return NextResponse.json(
      {
        error: "Gagal memperbarui produk.",
      },
      { status: 500 }
    );
  }
}

/* =========================================
   DELETE
   HAPUS PRODUK
========================================= */

export async function DELETE(request: NextRequest) {
  try {
    if (!checkAdmin(request)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    let id: string | null = null;

    // Coba ambil ID dari query
    const { searchParams } = new URL(request.url);
    id = searchParams.get("id");

    // Kalau tidak ada, coba ambil dari body
    if (!id) {
      try {
        const body = await request.json();
        id = body.id;
      } catch {
        // body kosong
      }
    }

    if (!id) {
      return NextResponse.json(
        {
          error: "ID produk wajib diisi.",
        },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("DELETE PRODUCT ERROR:", error);

      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Produk berhasil dihapus.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);

    return NextResponse.json(
      {
        error: "Gagal menghapus produk.",
      },
      { status: 500 }
    );
  }
}