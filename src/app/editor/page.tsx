import { EditorApp } from "@/components/editor/EditorApp";
import { buildPageMetadata } from "@/lib/site";

export const metadata = buildPageMetadata({
  title: "Editor de design",
  description:
    "Configurează un model personalizat pentru oglindă sau sticlă, direct în browser.",
  path: "/editor",
  keywords: [
    "editor design oglinda",
    "configurator sticla",
    "oglinda personalizata",
    "geam sablat personalizat",
  ],
});

export default function EditorPage() {
  return <EditorApp />;
}
