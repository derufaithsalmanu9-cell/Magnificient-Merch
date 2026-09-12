import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const orderCode = searchParams
      .get("order_code")
      ?.trim()
      .toUpperCase();

    if (!orderCode) {
      return NextResponse.json(
        {
          error: "Kode pesanan wajib diisi.",
        },
        { status: 400 }
      );
    }

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select(
        `
        order_code,
        customer_name,
        class_name,
        items,
        total,
        status,
        payment_method,
        created_at
        `
      )
      .eq("order_code", orderCode)
      .maybeSingle();

    if (error) {
      console.error("Supabase error:", error);

      return NextResponse.json(
        {
          error: "Gagal mengambil data pesanan.",
        },
        { status: 500 }
      );
    }

    if (!order) {
      return NextResponse.json(
        {
          error: "Kode pesanan tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      order,
    });
  } catch (error) {
    console.error("Status API error:", error);

    return NextResponse.json(
      {
        error: "Terjadi kesalahan pada server.",
      },
      { status: 500 }
    );
  }
}