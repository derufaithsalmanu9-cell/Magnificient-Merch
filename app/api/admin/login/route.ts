import { NextResponse } from "next/server";
import crypto from "crypto";

function createToken() {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET belum diatur.");
  }

  return crypto
    .createHmac("sha256", secret)
    .update("admin")
    .digest("hex");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const username = body.username?.trim();
    const password = body.password;

    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminUsername || !adminPassword) {
      return NextResponse.json(
        {
          error: "Konfigurasi admin belum lengkap di .env.local",
        },
        { status: 500 }
      );
    }

    if (
      username !== adminUsername ||
      password !== adminPassword
    ) {
      return NextResponse.json(
        {
          error: "Username atau password salah.",
        },
        { status: 401 }
      );
    }

    const token = createToken();

    const response = NextResponse.json({
      success: true,
    });

    response.cookies.set({
      name: "magnificent_admin",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);

    return NextResponse.json(
      {
        error: "Terjadi kesalahan pada server.",
      },
      { status: 500 }
    );
  }
}