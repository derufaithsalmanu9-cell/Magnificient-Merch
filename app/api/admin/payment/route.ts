import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

const BUCKET = "payment-proofs";

function checkAdmin(request: NextRequest) {
  const cookie =
    request.cookies.get("magnificent_admin");

  return Boolean(cookie?.value);
}

export async function GET(request: NextRequest) {
  try {
    if (!checkAdmin(request)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: orders, error } =
      await supabaseAdmin
        .from("orders")
        .select(
          `
          id,
          order_code,
          customer_name,
          whatsapp,
          class_name,
          address,
          total,
          payment_method,
          payment_proof,
          payment_verified_at,
          payment_rejected_at,
          payment_rejection_note,
          status,
          created_at
          `
        )
        .not("payment_proof", "is", null)
        .order("created_at", {
          ascending: false,
        });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    const result = [];

    for (const order of orders || []) {
      let proofUrl = null;

      if (order.payment_proof) {
        const { data: signedData } =
          await supabaseAdmin.storage
            .from(BUCKET)
            .createSignedUrl(
              order.payment_proof,
              60 * 60
            );

        proofUrl =
          signedData?.signedUrl || null;
      }

      result.push({
        ...order,
        proof_url: proofUrl,
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Gagal mengambil bukti pembayaran.",
      },
      { status: 500 }
    );
  }
}

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
      action,
      rejection_note,
    } = body;

    if (!id) {
      return NextResponse.json(
        {
          error: "ID pesanan wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (
      action !== "verify" &&
      action !== "reject"
    ) {
      return NextResponse.json(
        {
          error:
            "Action harus verify atau reject.",
        },
        { status: 400 }
      );
    }

    if (action === "verify") {
      const { data, error } =
        await supabaseAdmin
          .from("orders")
          .update({
            status: "Pembayaran Diterima",
            payment_verified_at:
              new Date().toISOString(),
            payment_rejected_at: null,
            payment_rejection_note: null,
          })
          .eq("id", id)
          .select()
          .single();

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        order: data,
      });
    }

    const { data, error } =
      await supabaseAdmin
        .from("orders")
        .update({
          status: "Menunggu Pembayaran",
          payment_rejected_at:
            new Date().toISOString(),
          payment_rejection_note:
            rejection_note?.trim() ||
            "Bukti pembayaran ditolak.",
        })
        .eq("id", id)
        .select()
        .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      order: data,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Gagal memperbarui pembayaran.",
      },
      { status: 500 }
    );
  }
}