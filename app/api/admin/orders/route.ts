import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

function checkAdmin(request: NextRequest) {
  const cookie = request.cookies.get(
    "magnificent_admin"
  );

  return Boolean(cookie?.value);
}

/*
=========================================================
PUT
UPDATE STATUS PESANAN
=========================================================
*/

export async function PUT(
  request: NextRequest
) {
  try {
    // ================================================
    // CEK ADMIN
    // ================================================

    if (!checkAdmin(request)) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    // ================================================
    // BACA BODY
    // ================================================

    const body = await request.json();

    const {
      id,
      order_code,
      status,
    } = body;

    // ================================================
    // VALIDASI
    // ================================================

    if (!id && !order_code) {
      return NextResponse.json(
        {
          error:
            "ID atau kode pesanan wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    if (!status) {
      return NextResponse.json(
        {
          error:
            "Status pesanan wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    const allowedStatuses = [
      "Menunggu Pembayaran",
      "Bukti Dikirim",
      "Menunggu Verifikasi",
      "Pembayaran Diterima",
      "Pembayaran Ditolak",
      "Diproses",
      "Siap Diambil",
      "Selesai",
      "Dibatalkan",
    ];

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        {
          error:
            "Status pesanan tidak valid.",
        },
        {
          status: 400,
        }
      );
    }

    // ================================================
    // UPDATE BERDASARKAN ID
    // ================================================

    let query =
      supabaseAdmin
        .from("orders")
        .update({
          status,
        });

    if (id) {
      query = query.eq("id", id);
    } else {
      query = query.eq(
        "order_code",
        String(order_code)
          .trim()
          .toUpperCase()
      );
    }

    const {
      data,
      error,
    } = await query
      .select()
      .single();

    // ================================================
    // ERROR DATABASE
    // ================================================

    if (error) {
      console.error(
        "UPDATE ORDER STATUS ERROR:",
        error
      );

      return NextResponse.json(
        {
          error:
            "Gagal mengubah status pesanan.",
          detail: error.message,
        },
        {
          status: 500,
        }
      );
    }

    // ================================================
    // BERHASIL
    // ================================================

    return NextResponse.json({
      success: true,
      message:
        "Status pesanan berhasil diperbarui.",
      order: data,
    });

  } catch (error) {
    console.error(
      "ADMIN ORDERS PUT ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Terjadi kesalahan pada server.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
=========================================================
GET
AMBIL SEMUA PESANAN
=========================================================
*/

export async function GET(
  request: NextRequest
) {
  try {
    // ================================================
    // CEK ADMIN
    // ================================================

    if (!checkAdmin(request)) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    // ================================================
    // AMBIL PESANAN
    // ================================================

    const {
      data,
      error,
    } = await supabaseAdmin
      .from("orders")
      .select(`
        id,
        order_code,
        customer_name,
        whatsapp,
        class_name,
        address,
        items,
        total,
        payment_method,
        payment_proof,
        payment_verified_at,
        payment_rejected_at,
        payment_rejection_note,
        status,
        note,
        created_at
      `)
      .order("created_at", {
        ascending: false,
      });

    // ================================================
    // ERROR DATABASE
    // ================================================

    if (error) {
      console.error(
        "GET ORDERS ERROR:",
        error
      );

      return NextResponse.json(
        {
          error:
            "Gagal mengambil data pesanan.",
          detail: error.message,
        },
        {
          status: 500,
        }
      );
    }

    // ================================================
    // RESPONSE
    // ================================================

    return NextResponse.json({
      success: true,
      orders: data || [],
    });

  } catch (error) {
    console.error(
      "ADMIN ORDERS GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Terjadi kesalahan pada server.",
      },
      {
        status: 500,
      }
    );
  }
}