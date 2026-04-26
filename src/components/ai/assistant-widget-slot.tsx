"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const AssistantWidget = dynamic(
  () => import("./assistant-widget").then((module) => module.AssistantWidget),
  {
    ssr: false,
  }
);

export function AssistantWidgetSlot() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const enable = () => setEnabled(true);

    if (typeof globalThis.requestIdleCallback === "function") {
      const idleId = globalThis.requestIdleCallback(enable, { timeout: 1200 });
      return () => globalThis.cancelIdleCallback(idleId);
    }

    const timeoutId = globalThis.setTimeout(enable, 600);
    return () => globalThis.clearTimeout(timeoutId);
  }, []);

  if (!enabled) {
    return null;
  }

  return <AssistantWidget />;
}
