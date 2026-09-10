import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest
) {
  try {
    // Cek login admin
    const adminCookie =
      request.cookies.get("magnificent_admin");

    if (!adminCookie?.value) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    // Ambil file
    const formData =
      await request.formData();

    const file =
      formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          error:
            "File gambar tidak ditemukan.",
        },
        {
          status: 400,
        }
      );
    }

    // Validasi tipe
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Format harus JPG, PNG, atau WEBP.",
        },
        {
          status: 400,
        }
      );
    }

    // Maksimal 5 MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        {
          error:
            "Ukuran gambar maksimal 5 MB.",
        },
        {
          status: 400,
        }
      );
    }

    // Buat nama file unik
    const extension =
      file.name.split(".").pop() ||
      "jpg";

    const fileName =
      `product-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 8)}.${extension}`;

    const filePath =
      `products/${fileName}`;

    // Ubah file menjadi ArrayBuffer
    const arrayBuffer =
      await file.arrayBuffer();

    const buffer = Buffer.from(
      arrayBuffer
    );

    // Upload ke Supabase Storage
    const { error: uploadError } =
      await supabaseAdmin.storage
        .from("product-images")
        .upload(
          filePath,
          buffer,
          {
            contentType:
              file.type,
            upsert: false,
          }
        );

    if (uploadError) {
      console.error(
        "SUPABASE UPLOAD ERROR:",
        uploadError
      );

      return NextResponse.json(
        {
          error:
            uploadError.message,
        },
        {
          status: 500,
        }
      );
    }

    // Ambil URL public
    const {
      data: publicData,
    } =
      supabaseAdmin.storage
        .from("product-images")
        .getPublicUrl(
          filePath
        );

    return NextResponse.json({
      success: true,
      url: publicData.publicUrl,
    });
  } catch (error) {
    console.error(
      "UPLOAD SERVER ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan server.",
      },
      {
        status: 500,
      }
    );
  }
}