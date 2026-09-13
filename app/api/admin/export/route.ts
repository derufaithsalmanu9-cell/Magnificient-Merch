import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const XLSX = require("xlsx") as any;

export const runtime = "nodejs";

function checkAdmin(request: NextRequest) {
  const cookie =
    request.cookies.get("magnificent_admin");

  return Boolean(cookie?.value);
}

export async function GET(
  request: NextRequest
) {
  try {
    // =========================
    // ADMIN AUTH
    // =========================

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

    // =========================
    // AMBIL DATA ORDER
    // =========================

    const {
      data: orders,
      error,
    } = await supabaseAdmin
      .from("orders")
      .select(`
        id,
        order_code,
        customer_name,
        whatsapp,
        class_name,
        payment_method,
        total,
        status,
        items,
        note,
        created_at
      `)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "EXPORT SUPABASE ERROR:",
        error
      );

      return NextResponse.json(
        {
          error:
            "Gagal mengambil data pesanan.",
        },
        {
          status: 500,
        }
      );
    }

    // =========================
    // FORMAT DATA EXCEL
    // =========================

    const rows = (orders || []).map(
      (order) => {

        let products = "";

        if (
          Array.isArray(order.items)
        ) {
          products = order.items
            .map((item: any) => {
              const name =
                item?.name || "-";

              const size =
                item?.size || "-";

              const quantity =
                item?.quantity || 0;

              return `${name} (${size}) x${quantity}`;
            })
            .join(" | ");
        }

        return {
          Kode:
            order.order_code || "",

          Nama:
            order.customer_name || "",

          WhatsApp:
            order.whatsapp || "",

          Kelas:
            order.class_name || "",

          Pembayaran:
            order.payment_method || "",

          Total:
            Number(order.total || 0),

          Status:
            order.status || "",

          Produk:
            products,

          Catatan:
            order.note || "",

          Tanggal:
            order.created_at
              ? new Date(
                  order.created_at
                ).toLocaleString(
                  "id-ID",
                  {
                    timeZone:
                      "Asia/Jakarta",
                  }
                )
              : "",
        };
      }
    );

    // =========================
    // WORKSHEET
    // =========================

    const worksheet =
      XLSX.utils.json_to_sheet(
        rows
      );

    // =========================
    // ATUR LEBAR KOLOM
    // =========================

    worksheet["!cols"] = [
      { wch: 18 }, // Kode
      { wch: 28 }, // Nama
      { wch: 18 }, // WhatsApp
      { wch: 12 }, // Kelas
      { wch: 18 }, // Pembayaran
      { wch: 15 }, // Total
      { wch: 25 }, // Status
      { wch: 60 }, // Produk
      { wch: 40 }, // Catatan
      { wch: 24 }, // Tanggal
    ];

    // =========================
    // FREEZE HEADER
    // =========================

    worksheet["!freeze"] = {
      xSplit: 0,
      ySplit: 1,
    };

    // =========================
    // WORKBOOK
    // =========================

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Data Pesanan"
    );

    // =========================
    // GENERATE XLSX
    // =========================

    const buffer =
      XLSX.write(workbook, {
        type: "buffer",
        bookType: "xlsx",
      });

    // =========================
    // RESPONSE
    // =========================

    return new NextResponse(
      buffer,
      {
        status: 200,

        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

          "Content-Disposition":
            `attachment; filename="DATA-PO-MAGNIFICIENT-${new Date()
              .toISOString()
              .slice(0, 10)}.xlsx"`,

          "Cache-Control":
            "no-store, max-age=0",
        },
      }
    );

  } catch (error) {

    console.error(
      "EXPORT EXCEL ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Terjadi kesalahan saat membuat file Excel.",
      },
      {
        status: 500,
      }
    );
  }
}