import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: NextRequest) {
  try {
    const cookie = request.cookies.get("magnificent_admin");

    if (!cookie?.value) {
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
        { error: "Nama dan harga wajib diisi." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("products")
      .insert({
        name,
        description: description || "",
        price: Number(price),
        stock: Number(stock || 0),
        image: image || null,
        active: active ?? true,
        sizes: sizes || [],
      })
      .select()
      .single();

    if (error) {
      console.error("CREATE PRODUCT ERROR:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Gagal membuat produk." },
      { status: 500 }
    );
  }
}