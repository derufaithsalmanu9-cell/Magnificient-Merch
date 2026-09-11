import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID produk tidak ditemukan." },
        { status: 400 }
      );
    }

    const { data: product, error } =
      await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .eq("active", true)
        .single();

    if (error || !product) {
      return NextResponse.json(
        { error: "Produk tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      product,
    });
  } catch (error) {
    console.error(
      "Product API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Terjadi kesalahan server.",
      },
      { status: 500 }
    );
  }
}