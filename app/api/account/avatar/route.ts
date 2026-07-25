import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const MAX_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });

  const ext = ALLOWED_TYPES[file.type];
  if (!ext) return NextResponse.json({ error: "Envie uma imagem JPG, PNG ou WEBP." }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: "Imagem muito grande (máx. 2MB)." }, { status: 400 });

  const key = `avatars/${session.user.id}-${Date.now()}.${ext}`;
  const blob = await put(key, file, { access: "public", addRandomSuffix: false, contentType: file.type });

  await prisma.user.update({ where: { id: session.user.id }, data: { avatarUrl: blob.url } });

  return NextResponse.json({ url: blob.url });
}
