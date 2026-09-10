import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request: NextRequest) {
  try {
    const cookie = request.cookies.get(
      "magnificent_admin"
    )?.value;

    if (!cookie) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const productsResult = await supabaseAdmin
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    const ordersResult = await supabaseAdmin
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (productsResult.error) {
      console.error(productsResult.error);

      return NextResponse.json(
        { error: productsResult.error.message },
        { status: 500 }
      );
    }

    if (ordersResult.error) {
      console.error(ordersResult.error);

      return NextResponse.json(
        { error: ordersResult.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      products: productsResult.data || [],
      orders: ordersResult.data || [],
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Gagal mengambil data admin." },
      { status: 500 }
    );
  }
}