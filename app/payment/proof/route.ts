import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

const BUCKET_NAME = "payment-proofs";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

function getExtension(type: string) {
  switch (type) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return null;
  }
}

function normalizeWhatsapp(value: string) {
  return value.replace(/\D/g, "");
}

export async function POST(request: NextRequest) {
  let uploadedPath: string | null = null;

  try {
    const formData = await request.formData();

    const orderCode = String(
      formData.get("order_code") || ""
    )
      .trim()
      .toUpperCase();

    const whatsapp = String(
      formData.get("whatsapp") || ""
    ).trim();

    const file = formData.get("file");

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

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          error: "File bukti pembayaran wajib diupload.",
        },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Format file harus JPG, PNG, atau WEBP.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error:
            "Ukuran file maksimal 5 MB.",
        },
        { status: 400 }
      );
    }

    const { data: order, error: orderError } =
      await supabaseAdmin
        .from("orders")
        .select(
          `
          id,
          order_code,
          whatsapp,
          payment_method,
          status,
          payment_proof
          `
        )
        .eq("order_code", orderCode)
        .maybeSingle();

    if (orderError) {
      console.error(orderError);

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

    // CASH TIDAK BOLEH UPLOAD BUKTI TRANSFER
    if (order.payment_method !== "Transfer") {
      return NextResponse.json(
        {
          error:
            "Pesanan ini menggunakan pembayaran Cash dan tidak memerlukan bukti transfer.",
        },
        { status: 400 }
      );
    }

    // VALIDASI WHATSAPP
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

    // CEGAH UPLOAD ULANG JIKA SUDAH DITERIMA
    if (
      order.status === "Pembayaran Diterima" ||
      order.status === "Diproses" ||
      order.status === "Siap Diambil" ||
      order.status === "Selesai"
    ) {
      return NextResponse.json(
        {
          error:
            "Pembayaran untuk pesanan ini sudah diproses.",
        },
        { status: 400 }
      );
    }

    // Jika sudah ada bukti sebelumnya, izinkan upload ulang
    // hanya jika status masih Menunggu Pembayaran/Bukti Dikirim.
    const extension = getExtension(file.type);

    if (!extension) {
      return NextResponse.json(
        {
          error: "Format file tidak didukung.",
        },
        { status: 400 }
      );
    }

    const safeCode = orderCode.replace(
      /[^A-Z0-9_-]/g,
      ""
    );

    const fileName =
      `${Date.now()}-${crypto.randomUUID()}.${extension}`;

    uploadedPath = `${safeCode}/${fileName}`;

    const fileBuffer = await file.arrayBuffer();

    const { error: uploadError } =
      await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .upload(uploadedPath, fileBuffer, {
          contentType: file.type,
          upsert: false,
        });

    if (uploadError) {
      console.error(
        "Storage upload error:",
        uploadError
      );

      return NextResponse.json(
        {
          error:
            "Gagal mengupload bukti pembayaran.",
        },
        { status: 500 }
      );
    }

    const { error: updateError } =
      await supabaseAdmin
        .from("orders")
        .update({
          payment_proof: uploadedPath,
          status: "Bukti Dikirim",
          payment_rejected_at: null,
          payment_rejection_note: null,
        })
        .eq("id", order.id);

    if (updateError) {
      console.error(
        "Order update error:",
        updateError
      );

      await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .remove([uploadedPath]);

      uploadedPath = null;

      return NextResponse.json(
        {
          error:
            "Bukti berhasil diupload tetapi gagal memperbarui pesanan.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Bukti pembayaran berhasil dikirim.",
    });
  } catch (error) {
    console.error(
      "Payment proof error:",
      error
    );

    if (uploadedPath) {
      await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .remove([uploadedPath]);
    }

    return NextResponse.json(
      {
        error:
          "Terjadi kesalahan pada server.",
      },
      { status: 500 }
    );
  }
}