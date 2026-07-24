import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { requireAdmin } from "@/lib/requireAdmin";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: "Formato de imagem não suportado." }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: "Imagem muito grande (máx. 5MB)." }, { status: 400 });

  const ext = file.type.split("/")[1];
  const key = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const blob = await put(key, file, { access: "public", addRandomSuffix: false });
  return NextResponse.json({ url: blob.url });
}
