import type { ReactNode } from "react";
import type { Viewport } from "next";
import "./editor.css";

export const viewport: Viewport = {
  themeColor: "#ece8df",
  colorScheme: "light",
};

export default function EditorLayout({ children }: { children: ReactNode }) {
  return <div className="editor-shell">{children}</div>;
}
