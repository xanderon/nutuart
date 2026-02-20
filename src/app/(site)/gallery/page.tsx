import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Galerie comercială",
  description:
    "Lucrările comerciale NutuArt: autocolante corporate, geamuri sablate, vitralii, printuri outdoor și trofee personalizate.",
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
