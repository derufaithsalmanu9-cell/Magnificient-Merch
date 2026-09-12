import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const orderCode = (
      searchParams.get("code") || ""
    )
      .trim()
      .toUpperCase();

    const whatsapp = (
      searchParams.get("whatsapp") || ""
    ).trim();

    if (!orderCode) {
      return NextResponse.json(
        { error: "Kode pesanan wajib diisi." },
        { status: 400 }
      );
    }

    const { data: order, error } =
      await supabaseAdmin
        .from("orders")
        .select(
          `
          order_code,
          customer_name,
          whatsapp,
          total,
          payment_method,
          status,
          payment_proof
          `
        )
        .eq("order_code", orderCode)
        .single();

    if (error || !order) {
      return NextResponse.json(
        { error: "Pesanan tidak ditemukan." },
        { status: 404 }
      );
    }

    // Jika WhatsApp dikirim, verifikasi
    if (whatsapp) {
      const normalize = (value: string) =>
        value.replace(/\D/g, "");

      if (
        normalize(order.whatsapp) !==
        normalize(whatsapp)
      ) {
        return NextResponse.json(
          {
            error:
              "Nomor WhatsApp tidak sesuai.",
          },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      order: {
        order_code: order.order_code,
        customer_name: order.customer_name,
        total: order.total,
        payment_method: order.payment_method,
        status: order.status,
        has_payment_proof: Boolean(
          order.payment_proof
        ),
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Gagal mengambil pesanan." },
      { status: 500 }
    );
  }
}