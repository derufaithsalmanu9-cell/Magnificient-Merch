import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

function normalizeWhatsapp(value: string) {
  return value.replace(/\D/g, "");
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const orderCode = searchParams
      .get("code")
      ?.trim()
      .toUpperCase();

    const whatsapp = searchParams
      .get("whatsapp")
      ?.trim();

    if (!orderCode) {
      return NextResponse.json(
        {
          error: "Kode pesanan wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (!whatsapp) {
      return NextResponse.json(
        {
          error: "Nomor WhatsApp wajib diisi.",
        },
        { status: 400 }
      );
    }

    console.log(
      "Checking payment order:",
      orderCode
    );

    const { data: order, error } =
      await supabaseAdmin
        .from("orders")
        .select(`
          order_code,
          customer_name,
          whatsapp,
          total,
          payment_method,
          status,
          payment_proof
        `)
        .eq("order_code", orderCode)
        .maybeSingle();

    if (error) {
      console.error(
        "Payment order error:",
        error
      );

      return NextResponse.json(
        {
          error:
            "Gagal mengambil data pesanan.",
        },
        { status: 500 }
      );
    }

    if (!order) {
      return NextResponse.json(
        {
          error:
            "Kode pesanan tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    // =========================
    // VALIDASI WHATSAPP
    // =========================

    if (
      normalizeWhatsapp(order.whatsapp || "") !==
      normalizeWhatsapp(whatsapp)
    ) {
      return NextResponse.json(
        {
          error:
            "Nomor WhatsApp tidak sesuai dengan pesanan.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      order: {
        order_code: order.order_code,
        customer_name: order.customer_name,
        total: order.total,
        payment_method: order.payment_method,
        status: order.status,
        has_payment_proof:
          Boolean(order.payment_proof),
      },
    });

  } catch (error) {
    console.error(
      "Payment API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Terjadi kesalahan pada server.",
      },
      { status: 500 }
    );
  }
}