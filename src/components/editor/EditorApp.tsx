"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BottomActionBar } from "./BottomActionBar";
import { EditorCanvas } from "./EditorCanvas";
import { EditorToolbar } from "./EditorToolbar";
import { ElementControls } from "./ElementControls";
import { SizeSelector } from "./SizeSelector";
import { SvgLibrary } from "./SvgLibrary";
import type { CanvasStageHandle } from "./canvas/CanvasStage";
import { buildExportFilename, downloadDataUrl, downloadTextFile } from "@/lib/editor/exportDesign";
import { getAspectRatio, getSelectionStatus } from "@/lib/editor/geometryUtils";
import { serializeDesign, parseSerializedDesign } from "@/lib/editor/serializeDesign";
import type { EditorPanel, SvgAssetCategory } from "@/lib/editor/editorTypes";
import { useEditorStore } from "@/lib/editor/editorStore";

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName;

  return (
    target.isContentEditable ||
    tagName === "INPUT" ||
    tagName === "TEXTAREA" ||
    tagName === "SELECT"
  );
}

function PanelCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="editor-panel rounded-[1.35rem] border border-white/70 p-3 shadow-[0_24px_60px_-40px_rgba(0,0,0,0.42)]">
      <div className="mb-3">
        <h2 className="text-base font-semibold text-[var(--editor-ink)]">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-[var(--editor-muted)]">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function MobilePanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <div className="px-1">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--editor-muted)]">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

export function EditorApp() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<CanvasStageHandle>(null);
  const [activeAssetCategory, setActiveAssetCategory] =
    useState<SvgAssetCategory>("corners");

  const activePanel = useEditorStore((state) => state.activePanel);
  const document = useEditorStore((state) => state.document);
  const selectedElementId = useEditorStore((state) => state.selectedElementId);
  const selectedElementIds = useEditorStore((state) => state.selectedElementIds);
  const viewport = useEditorStore((state) => state.viewport);
  const setActivePanel = useEditorStore((state) => state.setActivePanel);
  const setShape = useEditorStore((state) => state.setShape);
  const setDimensions = useEditorStore((state) => state.setDimensions);
  const setCanvasSize = useEditorStore((state) => state.setCanvasSize);
  const setViewport = useEditorStore((state) => state.setViewport);
  const resetViewport = useEditorStore((state) => state.resetViewport);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);
  const canUndo = useEditorStore((state) => state.past.length > 0);
  const canRedo = useEditorStore((state) => state.future.length > 0);
  const loadDocument = useEditorStore((state) => state.loadDocument);
  const selectElement = useEditorStore((state) => state.selectElement);
  const addElementToSelection = useEditorStore((state) => state.addElementToSelection);
  const clearSelection = useEditorStore((state) => state.clearSelection);
  const addElement = useEditorStore((state) => state.addElement);
  const updateElement = useEditorStore((state) => state.updateElement);
  const updateElements = useEditorStore((state) => state.updateElements);
  const deleteSelectedElement = useEditorStore((state) => state.deleteSelectedElement);
  const duplicateSelectedElement = useEditorStore(
    (state) => state.duplicateSelectedElement
  );
  const flipSelectedElement = useEditorStore((state) => state.flipSelectedElement);
  const alignSelectedElements = useEditorStore((state) => state.alignSelectedElements);

  const selectedStatus = useMemo(
    () => getSelectionStatus(document, selectedElementId),
    [document, selectedElementId]
  );

  const selectedElement = selectedStatus?.element ?? null;
  const selectedCount = selectedElementIds.length;
  const artboardAspectRatio = useMemo(
    () => getAspectRatio(document.widthCm, document.heightCm),
    [document.heightCm, document.widthCm]
  );
  const scaleLabel = `${Math.round(viewport.scale * 100)}%`;

  const handleExportPng = () => {
    const dataUrl = canvasRef.current?.exportImage();

    if (!dataUrl) {
      return;
    }

    downloadDataUrl(dataUrl, buildExportFilename(document.projectName, "png"));
  };

  const handleExportJson = () => {
    downloadTextFile(
      serializeDesign(document),
      buildExportFilename(document.projectName, "json")
    );
  };

  const handleOpenJson = () => fileInputRef.current?.click();

  const handleLoadJsonFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const text = await file.text();
    const nextDocument = parseSerializedDesign(text);
    loadDocument(nextDocument);
    event.target.value = "";
  };

  const handlePanelChange = (panel: EditorPanel) => setActivePanel(panel);
  const handleClosePanel = () => setActivePanel(null);
  const handleShapeChange = (shape: typeof document.shape) => {
    setShape(shape);
    resetViewport();
  };
  const handleWidthChange = (value: number) => {
    setDimensions(value, document.heightCm);
    resetViewport();
  };
  const handleHeightChange = (value: number) => {
    setDimensions(document.widthCm, value);
    resetViewport();
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      if (isTypingTarget(event.target)) {
        return;
      }

      const key = event.key.toLowerCase();

      if (event.key === "Escape") {
        if (!selectedCount) {
          return;
        }

        event.preventDefault();
        clearSelection();
        return;
      }

      if (event.key === "Delete" || event.key === "Backspace") {
        if (!selectedCount) {
          return;
        }

        event.preventDefault();
        deleteSelectedElement();
        return;
      }

      if (selectedCount < 2) {
        return;
      }

      const alignMap = {
        l: "left",
        r: "right",
        b: "bottom",
        t: "top",
        c: "centerX",
        m: "middle",
      } as const;

      const alignment = alignMap[key as keyof typeof alignMap];

      if (!alignment) {
        return;
      }

      event.preventDefault();
      alignSelectedElements(alignment);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    alignSelectedElements,
    clearSelection,
    deleteSelectedElement,
    selectedCount,
  ]);

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={handleLoadJsonFile}
      />

      <EditorToolbar
        scaleLabel={scaleLabel}
        canUndo={canUndo}
        canRedo={canRedo}
        hasSelection={selectedCount > 0}
        onUndo={undo}
        onRedo={redo}
        onFit={resetViewport}
        onDuplicate={duplicateSelectedElement}
        onDelete={deleteSelectedElement}
        onFlipX={() => flipSelectedElement("x")}
        onFlipY={() => flipSelectedElement("y")}
      />

      <div className="flex w-full min-h-0 flex-1 gap-2 overflow-hidden px-0 py-0 sm:px-3 sm:py-3">
        <aside className="hidden w-[300px] min-h-0 flex-col gap-4 overflow-y-auto pb-2 lg:flex">
          <PanelCard
            title="Desene"
          >
              <SvgLibrary
              activeCategory={activeAssetCategory}
              onCategoryChange={setActiveAssetCategory}
              onAddAsset={addElement}
            />
          </PanelCard>

          <PanelCard
            title="Model"
          >
            <SizeSelector
              shape={document.shape}
              widthCm={document.widthCm}
              heightCm={document.heightCm}
              onShapeChange={handleShapeChange}
              onWidthChange={handleWidthChange}
              onHeightChange={handleHeightChange}
              dense
            />
          </PanelCard>
        </aside>

        <main className="flex min-h-0 flex-1 flex-col overflow-hidden pb-[3.7rem] md:pb-2">
          <EditorCanvas
            ref={canvasRef}
            document={document}
            selectedElementId={selectedElementId}
            selectedElementIds={selectedElementIds}
            viewport={viewport}
            onViewportChange={setViewport}
            onCanvasSizeChange={setCanvasSize}
            onSelectElement={selectElement}
            onAddElementToSelection={addElementToSelection}
            onClearSelection={clearSelection}
            onUpdateElement={updateElement}
            onUpdateElements={updateElements}
          />
        </main>

        <aside className="hidden w-[320px] min-h-0 flex-col gap-4 overflow-y-auto pb-2 xl:flex">
          <PanelCard
            title="Element selectat"
          >
            <ElementControls
              element={selectedCount === 1 ? selectedElement : null}
              selectedCount={selectedCount}
              shape={document.shape}
              aspectRatio={artboardAspectRatio}
              onRotate={(rotation) =>
                selectedElement && updateElement(selectedElement.id, { rotation })
              }
              onDuplicate={duplicateSelectedElement}
              onDelete={deleteSelectedElement}
              onFlipX={() => flipSelectedElement("x")}
              onFlipY={() => flipSelectedElement("y")}
              onAlign={alignSelectedElements}
            />
          </PanelCard>

          <PanelCard
            title="Export"
          >
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleExportPng}
                className="w-full rounded-[1rem] bg-[var(--editor-ink)] px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white"
              >
                Export PNG
              </button>
              <button
                type="button"
                onClick={handleExportJson}
                className="w-full rounded-[1rem] border border-[var(--editor-line)] bg-white/88 px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--editor-ink)]"
              >
                Salvează JSON
              </button>
              <button
                type="button"
                onClick={handleOpenJson}
                className="w-full rounded-[1rem] border border-[var(--editor-line)] bg-white/88 px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--editor-ink)]"
              >
                Încarcă JSON
              </button>
            </div>
          </PanelCard>
        </aside>
      </div>

      <BottomActionBar
        activePanel={activePanel}
        hasSelection={selectedCount > 0}
        onChange={handlePanelChange}
      />

      {activePanel ? (
        <div className="fixed inset-0 z-30 md:hidden" data-editor-fade-in="true">
          <button
            type="button"
            aria-label="Închide meniul"
            onClick={handleClosePanel}
            className="absolute inset-0 bg-transparent"
          />

          <div
            className="absolute inset-x-0 bottom-[3.15rem]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="max-h-[46dvh] overflow-y-auto border-t border-black/8 bg-[rgba(244,241,234,0.98)] px-3 py-2 shadow-[0_-18px_40px_-30px_rgba(0,0,0,0.28)] backdrop-blur-xl">
            {activePanel === "library" ? (
              <MobilePanel title="Desene">
                <SvgLibrary
                  activeCategory={activeAssetCategory}
                  onCategoryChange={setActiveAssetCategory}
                  onAddAsset={(assetId) => {
                    addElement(assetId);
                    handleClosePanel();
                  }}
                />
              </MobilePanel>
            ) : null}

            {activePanel === "shapeSize" ? (
              <MobilePanel title="Pagină">
                <SizeSelector
                  shape={document.shape}
                  widthCm={document.widthCm}
                  heightCm={document.heightCm}
                  onShapeChange={handleShapeChange}
                  onWidthChange={handleWidthChange}
                  onHeightChange={handleHeightChange}
                  compact
                />
              </MobilePanel>
            ) : null}

            {activePanel === "element" ? (
              <MobilePanel title="Edit">
                <ElementControls
                  element={selectedCount === 1 ? selectedElement : null}
                  selectedCount={selectedCount}
                  shape={document.shape}
                  aspectRatio={artboardAspectRatio}
                  onRotate={(rotation) =>
                    selectedElement && updateElement(selectedElement.id, { rotation })
                  }
                  onDuplicate={duplicateSelectedElement}
                  onDelete={deleteSelectedElement}
                  onFlipX={() => flipSelectedElement("x")}
                  onFlipY={() => flipSelectedElement("y")}
                  onAlign={alignSelectedElements}
                />
              </MobilePanel>
            ) : null}

            {activePanel === "export" ? (
              <MobilePanel title="Save">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleExportPng();
                      handleClosePanel();
                    }}
                    className="rounded-[0.95rem] bg-[var(--editor-ink)] px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-white"
                  >
                    PNG
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleExportJson();
                      handleClosePanel();
                    }}
                    className="rounded-[0.95rem] border border-[var(--editor-line)] bg-white/88 px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--editor-ink)]"
                  >
                    JSON
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleClosePanel();
                      handleOpenJson();
                    }}
                    className="rounded-[0.95rem] border border-[var(--editor-line)] bg-white/88 px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--editor-ink)]"
                  >
                    Load
                  </button>
                </div>
              </MobilePanel>
            ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
