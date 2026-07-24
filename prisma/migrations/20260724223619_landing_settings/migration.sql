-- CreateTable
CREATE TABLE "HeroFlavor" (
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "img" TEXT NOT NULL,
    "bg" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "HeroFlavor_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "SalesPoint" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SalesPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSection" (
    "key" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "SiteSection_pkey" PRIMARY KEY ("key")
);
