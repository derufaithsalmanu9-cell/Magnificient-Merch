import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function isAdmin(request: NextRequest) {
  return !!request.cookies.get("magnificent_admin")?.value;
}

export async function POST(request: NextRequest) {
  try {
    if (!isAdmin(request)) {
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

    const { data, error } = await supabaseAdmin
      .from("products")
      .insert({
        id,
        name,
        description,
        price: Number(price || 0),
        stock: Number(stock || 0),
        image: image || null,
        active: active ?? true,
        sizes: sizes || [],
      })
      .select()
      .single();

    if (error) {
      console.error(error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      product: data,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Gagal menambahkan produk." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!isAdmin(request)) {
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
        { error: "ID produk tidak ditemukan." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("products")
      .update({
        name,
        description,
        price: Number(price || 0),
        stock: Number(stock || 0),
        image: image || null,
        active: active ?? true,
        sizes: sizes || [],
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      product: data,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Gagal memperbarui produk." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const id = request.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID produk tidak ditemukan." },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Gagal menghapus produk." },
      { status: 500 }
    );
  }
}