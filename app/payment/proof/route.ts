import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

const BUCKET = "payment-proofs";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

function extensionFromType(type: string) {
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

export async function POST(request: NextRequest) {
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
        { error: "Kode pesanan wajib diisi." },
        { status: 400 }
      );
    }

    if (!whatsapp) {
      return NextResponse.json(
        { error: "Nomor WhatsApp wajib diisi." },
        { status: 400 }
      );
    }

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Bukti transfer wajib diupload." },
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

    // Cari order
    const { data: order, error: orderError } =
      await supabaseAdmin
        .from("orders")
        .select(
          "id, order_code, whatsapp, status, payment_proof"
        )
        .eq("order_code", orderCode)
        .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: "Pesanan tidak ditemukan." },
        { status: 404 }
      );
    }

    // Verifikasi nomor WhatsApp
    const normalizePhone = (value: string) =>
      value.replace(/\D/g, "");

    if (
      normalizePhone(order.whatsapp) !==
      normalizePhone(whatsapp)
    ) {
      return NextResponse.json(
        {
          error:
            "Nomor WhatsApp tidak sesuai dengan pesanan.",
        },
        { status: 403 }
      );
    }

    if (
      order.status === "Pembayaran Diterima" ||
      order.status === "Diproses" ||
      order.status === "Siap Diambil" ||
      order.status === "Selesai"
    ) {
      return NextResponse.json(
        {
          error:
            "Pembayaran pesanan ini sudah diverifikasi.",
        },
        { status: 400 }
      );
    }

    const extension = extensionFromType(file.type);

    if (!extension) {
      return NextResponse.json(
        { error: "Format file tidak valid." },
        { status: 400 }
      );
    }

    const filePath =
      `${orderCode}/` +
      `${Date.now()}-${crypto.randomUUID()}.${extension}`;

    // Ubah File menjadi ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    const { error: uploadError } =
      await supabaseAdmin.storage
        .from(BUCKET)
        .upload(filePath, arrayBuffer, {
          contentType: file.type,
          cacheControl: "3600",
          upsert: false,
        });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);

      return NextResponse.json(
        {
          error:
            "Gagal mengupload bukti transfer.",
        },
        { status: 500 }
      );
    }

    // Simpan path file ke database
    const { error: updateError } =
      await supabaseAdmin
        .from("orders")
        .update({
          payment_proof: filePath,
          status: "Bukti Dikirim",
          payment_rejected_at: null,
          payment_rejection_note: null,
        })
        .eq("id", order.id);

    if (updateError) {
      // Jika database gagal, hapus file yang baru diupload
      await supabaseAdmin.storage
        .from(BUCKET)
        .remove([filePath]);

      console.error(
        "Database update error:",
        updateError
      );

      return NextResponse.json(
        {
          error:
            "Bukti berhasil diupload tetapi gagal menyimpan data pesanan.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Bukti transfer berhasil dikirim.",
      order_code: orderCode,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Terjadi kesalahan saat mengupload bukti transfer.",
      },
      { status: 500 }
    );
  }
}