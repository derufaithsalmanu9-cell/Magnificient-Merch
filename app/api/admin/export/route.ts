import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import ExcelJS from "exceljs";
import path from "path";
import fs from "fs";

export const runtime = "nodejs";

const TEMPLATE_PATH = path.join(
  process.cwd(),
  "public",
  "templates",
  "DATA PO TEMPLATE.xlsx"
);

function checkAdmin(request: NextRequest) {
  const cookie =
    request.cookies.get("magnificent_admin")?.value;

  return Boolean(cookie);
}

/* =========================================================
   NORMALIZE PRODUCT NAME
========================================================= */

function normalizeProductName(name: string) {
  return name
    .toUpperCase()
    .trim()
    .replace(/\s+/g, " ");
}

/* =========================================================
   DETECT KATEGORI PEMESAN
========================================================= */

function getCategory(className: string) {
  const value = (className || "").toUpperCase();

  if (
    value.includes("GURU") ||
    value.includes("KARYAWAN")
  ) {
    return "GURU,KARYAWAN";
  }

  if (value.includes("UMUM")) {
    return "UMUM";
  }

  return "SISWA";
}

/* =========================================================
   MAP PRODUK KE TEMPLATE
========================================================= */

function fillProduct(
  row: ExcelJS.Row,
  item: any
) {
  const product = normalizeProductName(
    item.name || ""
  );

  const quantity = Number(
    item.quantity || 0
  );

  const size = (
    item.size || ""
  )
    .toString()
    .toUpperCase()
    .trim();

  /*
   * =====================================================
   * PACKAGE
   * D = LUMINA
   * E = VENTRA
   * F = PYRA
   * G = ALTUSZORA
   * H = CRYON
   * =====================================================
   */

  const packageMap: Record<string, number> = {
    LUMINA: 4,
    VENTRA: 5,
    PYRA: 6,
    ALTUSZORA: 7,
    CRYON: 8,
  };

  for (const key of Object.keys(packageMap)) {
    if (product.includes(key)) {
      row.getCell(packageMap[key]).value =
        quantity;

      return;
    }
  }

  /*
   * =====================================================
   * KEYCHAIN
   * BB
   * =====================================================
   */

  if (product.includes("KEYCHAIN")) {
    row.getCell(54).value = quantity;
    return;
  }

  /*
   * =====================================================
   * TOTEBAG
   * AX
   * =====================================================
   */

  if (
    product.includes("TOTEBAG") ||
    product.includes("TOTE BAG")
  ) {
    row.getCell(50).value = quantity;
    return;
  }

  /*
   * =====================================================
   * BASEBALL CAP
   * AY
   * =====================================================
   */

  if (
    product.includes("BASEBALL") ||
    product.includes("CAP")
  ) {
    row.getCell(51).value = quantity;
    return;
  }

  /*
   * =====================================================
   * PINBROSS
   * AZ / BA
   *
   * Jika item.size = FACE / BODY
   * =====================================================
   */

  if (
    product.includes("PIN") ||
    product.includes("PINBROSS")
  ) {
    if (size === "FACE" || size === "F") {
      row.getCell(52).value = quantity;
    } else {
      row.getCell(53).value = quantity;
    }

    return;
  }

  /*
   * =====================================================
   * T-SHIRT
   *
   * SHORT:
   *
   * NAVY  J:N
   * CREAM O:S
   *
   * LONG:
   *
   * NAVY AD:AH
   * CREAM AI:AM
   *
   * GA SHORT:
   *
   * NAVY T:X
   * CREAM Y:AC
   *
   * GA LONG:
   *
   * NAVY AN:AR
   * CREAM AS:AW
   * =====================================================
   */

  if (
    product.includes("T-SHIRT") ||
    product.includes("TSHIRT") ||
    product.includes("T SHIRT")
  ) {
    let startColumn: number | null =
      null;

    const isLong =
      product.includes("LENGAN PANJANG") ||
      product.includes("LONG") ||
      product.includes("PANJANG");

    const isGA =
      product.includes("GLACIERA") ||
      product.includes("(GA)") ||
      product.includes("GA");

    const isNavy =
      product.includes("NAVY");

    const isCream =
      product.includes("CREAM");

    /*
     * LUMINA VENTRA
     */

    if (!isGA && !isLong && isNavy) {
      startColumn = 10;
    }

    if (!isGA && !isLong && isCream) {
      startColumn = 15;
    }

    /*
     * GLACIERA ARTICS SHORT
     */

    if (isGA && !isLong && isNavy) {
      startColumn = 20;
    }

    if (isGA && !isLong && isCream) {
      startColumn = 25;
    }

    /*
     * LUMINA VENTRA LONG
     */

    if (!isGA && isLong && isNavy) {
      startColumn = 30;
    }

    if (!isGA && isLong && isCream) {
      startColumn = 35;
    }

    /*
     * GLACIERA ARTICS LONG
     */

    if (isGA && isLong && isNavy) {
      startColumn = 40;
    }

    if (isGA && isLong && isCream) {
      startColumn = 45;
    }

    if (startColumn === null) {
      return;
    }

    const sizeMap: Record<
      string,
      number
    > = {
      S: 0,
      M: 1,
      L: 2,
      XL: 3,
      XXL: 4,
    };

    const offset = sizeMap[size];

    if (offset === undefined) {
      return;
    }

    row.getCell(
      startColumn + offset
    ).value = quantity;
  }
}

/* =========================================================
   GET ORDERS
========================================================= */

export async function GET(
  request: NextRequest
) {
  try {
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

    /*
     * CEK TEMPLATE
     */

    if (!fs.existsSync(TEMPLATE_PATH)) {
      return NextResponse.json(
        {
          error:
            "File template Excel tidak ditemukan.",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * AMBIL PESANAN
     */

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
        address,
        note,
        payment_method,
        items,
        total,
        status,
        created_at
      `)
      .order("created_at", {
        ascending: true,
      });

    if (error) {
      console.error(error);

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

    /*
     * LOAD TEMPLATE
     */

    const workbook =
      new ExcelJS.Workbook();

    await workbook.xlsx.readFile(
      TEMPLATE_PATH
    );

    /*
     * PASTIKAN 3 SHEET ADA
     */

    const siswaSheet =
      workbook.getWorksheet("SISWA");

    const guruSheet =
      workbook.getWorksheet(
        "GURU,KARYAWAN"
      );

    const umumSheet =
      workbook.getWorksheet("UMUM");

    if (
      !siswaSheet ||
      !guruSheet ||
      !umumSheet
    ) {
      return NextResponse.json(
        {
          error:
            "Template Excel harus memiliki sheet SISWA, GURU,KARYAWAN, dan UMUM.",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * HAPUS DATA LAMA
     *
     * HEADER TEMPLATE = BARIS 1-4
     *
     * Data dimulai baris 5
     */

    const sheets = [
      siswaSheet,
      guruSheet,
      umumSheet,
    ];

    for (const sheet of sheets) {
      for (
        let row = sheet.rowCount;
        row >= 5;
        row--
      ) {
        sheet.spliceRows(row, 1);
      }
    }

    /*
     * COUNTER
     */

    const counters = {
      SISWA: 0,
      "GURU,KARYAWAN": 0,
      UMUM: 0,
    };

    /*
     * ISI DATA
     */

    for (const order of orders || []) {
      const category =
        getCategory(
          order.class_name || ""
        );

      let sheet: ExcelJS.Worksheet;

      if (category === "SISWA") {
        sheet = siswaSheet;
      } else if (
        category === "GURU,KARYAWAN"
      ) {
        sheet = guruSheet;
      } else {
        sheet = umumSheet;
      }

      counters[category]++;

      /*
       * TAMBAH BARIS
       */

      const row =
        sheet.addRow([]);

      /*
       * NOMOR
       */

      row.getCell(1).value =
        counters[category];

      /*
       * NAMA
       */

      row.getCell(2).value =
        order.customer_name || "";

      /*
       * KELAS
       */

      row.getCell(3).value =
        order.class_name || "";

      /*
       * ITEMS
       */

      const items =
        Array.isArray(order.items)
          ? order.items
          : [];

      for (const item of items) {
        fillProduct(row, item);
      }

      /*
       * HARGA
       *
       * BC = 55
       */

      row.getCell(55).value =
        Number(order.total || 0);

      /*
       * KETERANGAN
       *
       * BD = 56
       */

      const information = [];

      if (order.order_code) {
        information.push(
          `Order: ${order.order_code}`
        );
      }

      if (order.payment_method) {
        information.push(
          `Pembayaran: ${order.payment_method}`
        );
      }

      if (order.status) {
        information.push(
          `Status: ${order.status}`
        );
      }

      if (order.whatsapp) {
        information.push(
          `WA: ${order.whatsapp}`
        );
      }

      if (order.address) {
        information.push(
          `Alamat: ${order.address}`
        );
      }

      if (order.note) {
        information.push(
          `Catatan: ${order.note}`
        );
      }

      row.getCell(56).value =
        information.join(" | ");

      /*
       * COPY STYLE DARI BARIS SEBELUMNYA
       */

      const previousRow =
        sheet.getRow(
          row.number - 1
        );

      for (
        let column = 1;
        column <= 56;
        column++
      ) {
        const source =
          previousRow.getCell(column);

        const target =
          row.getCell(column);

        if (source.style) {
          target.style =
            source.style;
        }

        if (source.numFmt) {
          target.numFmt =
            source.numFmt;
        }

        if (source.alignment) {
          target.alignment =
            source.alignment;
        }

        if (source.border) {
          target.border =
            source.border;
        }
      }

      /*
       * FORMAT HARGA
       */

      row.getCell(55).numFmt =
        '#,##0';

      /*
       * WRAP TEXT
       */

      row.getCell(56).alignment = {
        vertical: "middle",
        wrapText: true,
      };
    }

    /*
     * =====================================================
     * TOTAL
     * =====================================================
     *
     * Kita tambahkan TOTAL setelah data.
     */

    for (const sheet of sheets) {
      const totalRow =
        sheet.addRow([]);

      totalRow.getCell(2).value =
        "TOTAL";

      /*
       * TOTAL D:BB
       */

      for (
        let column = 4;
        column <= 54;
        column++
      ) {
        const letter =
          sheet.getColumn(
            column
          ).letter;

        totalRow.getCell(
          column
        ).value = {
          formula: `SUM(${letter}5:${letter}${
            totalRow.number - 1
          })`,
        };
      }

      /*
       * TOTAL HARGA
       */

      totalRow.getCell(55).value = {
        formula: `SUM(BC5:BC${
          totalRow.number - 1
        })`,
      };

      totalRow.getCell(55).numFmt =
        '#,##0';

      /*
       * BOLD
       */

      for (
        let column = 1;
        column <= 56;
        column++
      ) {
        totalRow.getCell(
          column
        ).font = {
          bold: true,
        };
      }
    }

    /*
     * =====================================================
     * FREEZE HEADER
     * =====================================================
     */

    for (const sheet of sheets) {
      sheet.views = [
        {
          state: "frozen",
          ySplit: 4,
          xSplit: 3,
        },
      ];

      /*
       * PRINT
       */

      sheet.pageSetup.orientation =
        "landscape";

      sheet.pageSetup.fitToPage = true;

      sheet.pageSetup.fitToWidth = 1;

      sheet.pageSetup.fitToHeight = 0;
    }

    /*
     * =====================================================
     * BUFFER
     * =====================================================
     */

    const buffer =
      await workbook.xlsx.writeBuffer();

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
            "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "EXPORT ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Gagal membuat file Excel.",
      },
      {
        status: 500,
      }
    );
  }
}