import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Galerie",
  description:
    "Proiectele NutuArt prezentate digital: autocolante corporate, geamuri sablate, vitralii, printuri outdoor, trofee și preview pentru colecția de artă Marcel Nuțu.",
};

export default function GalleryPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const params = new URLSearchParams();
  if (searchParams?.collection && typeof searchParams.collection === "string") {
    params.set("collection", searchParams.collection);
  }

  const target = params.toString() ? `/?${params.toString()}` : "/";
  redirect(target);
}
