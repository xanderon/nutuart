"use client";

import { useEffect } from "react";

const desktopGuardQuery = "(hover: hover) and (pointer: fine)";

function isProtectedDesktop() {
  return window.matchMedia(desktopGuardQuery).matches;
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return Boolean(
    target.closest(
      'input, textarea, select, [contenteditable="true"], [contenteditable=""], [role="textbox"]'
    )
  );
}

function isProtectedLinkInteraction(target: EventTarget | null) {
  return target instanceof HTMLElement && Boolean(target.closest("a"));
}

export function DesktopInteractionGuard() {
  useEffect(() => {
    const syncBodyFlag = () => {
      document.body.dataset.desktopGuard = isProtectedDesktop() ? "true" : "false";
    };

    const mediaQuery = window.matchMedia(desktopGuardQuery);
    syncBodyFlag();

    const blockEvent = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
    };

    const handleContextMenu = (event: MouseEvent) => {
      if (!isProtectedDesktop()) return;
      blockEvent(event);
    };

    const handleDragStart = (event: DragEvent) => {
      if (!isProtectedDesktop()) return;
      blockEvent(event);
    };

    const handleSelectStart = (event: Event) => {
      if (!isProtectedDesktop() || isEditableTarget(event.target)) return;
      blockEvent(event);
    };

    const handleCopyCut = (event: ClipboardEvent) => {
      if (!isProtectedDesktop() || isEditableTarget(event.target)) return;
      blockEvent(event);
    };

    const handleAuxClick = (event: MouseEvent) => {
      if (!isProtectedDesktop()) return;
      if (event.button !== 1) return;

      if (isProtectedLinkInteraction(event.target)) {
        blockEvent(event);
      }
    };

    const handleModifiedClick = (event: MouseEvent) => {
      if (!isProtectedDesktop()) return;
      if (!isProtectedLinkInteraction(event.target)) return;
      if (!(event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)) return;

      blockEvent(event);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isProtectedDesktop()) return;
      if (isEditableTarget(event.target)) return;

      const key = event.key.toLowerCase();
      const hasPrimaryModifier = event.ctrlKey || event.metaKey;
      const hasShiftCombo = hasPrimaryModifier && event.shiftKey;

      if (
        key === "f12" ||
        (hasPrimaryModifier && ["a", "c", "o", "p", "s", "u"].includes(key)) ||
        (hasShiftCombo && ["c", "i", "j", "s"].includes(key))
      ) {
        blockEvent(event);
      }
    };

    document.addEventListener("contextmenu", handleContextMenu, { capture: true });
    document.addEventListener("dragstart", handleDragStart, { capture: true });
    document.addEventListener("selectstart", handleSelectStart, { capture: true });
    document.addEventListener("copy", handleCopyCut, { capture: true });
    document.addEventListener("cut", handleCopyCut, { capture: true });
    document.addEventListener("auxclick", handleAuxClick, { capture: true });
    document.addEventListener("click", handleModifiedClick, { capture: true });
    document.addEventListener("keydown", handleKeyDown, { capture: true });
    mediaQuery.addEventListener("change", syncBodyFlag);

    return () => {
      delete document.body.dataset.desktopGuard;
      document.removeEventListener("contextmenu", handleContextMenu, { capture: true });
      document.removeEventListener("dragstart", handleDragStart, { capture: true });
      document.removeEventListener("selectstart", handleSelectStart, { capture: true });
      document.removeEventListener("copy", handleCopyCut, { capture: true });
      document.removeEventListener("cut", handleCopyCut, { capture: true });
      document.removeEventListener("auxclick", handleAuxClick, { capture: true });
      document.removeEventListener("click", handleModifiedClick, { capture: true });
      document.removeEventListener("keydown", handleKeyDown, { capture: true });
      mediaQuery.removeEventListener("change", syncBodyFlag);
    };
  }, []);

  return null;
}
