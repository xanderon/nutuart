"use client";

import { useMemo, useRef, useState } from "react";
import { BottomActionBar } from "./BottomActionBar";
import { EditorCanvas } from "./EditorCanvas";
import { EditorToolbar } from "./EditorToolbar";
import { ElementControls } from "./ElementControls";
import { SizeSelector } from "./SizeSelector";
import { SvgLibrary } from "./SvgLibrary";
import type { CanvasStageHandle } from "./canvas/CanvasStage";
import { buildExportFilename, downloadDataUrl, downloadTextFile } from "@/lib/editor/exportDesign";
import { getSelectionStatus } from "@/lib/editor/geometryUtils";
import { serializeDesign, parseSerializedDesign } from "@/lib/editor/serializeDesign";
import type { EditorPanel, SvgAssetCategory } from "@/lib/editor/editorTypes";
import { useEditorStore } from "@/lib/editor/editorStore";

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

export function EditorApp() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<CanvasStageHandle>(null);
  const [activeAssetCategory, setActiveAssetCategory] =
    useState<SvgAssetCategory>("corners");

  const isStarted = useEditorStore((state) => state.isStarted);
  const activePanel = useEditorStore((state) => state.activePanel);
  const document = useEditorStore((state) => state.document);
  const selectedElementId = useEditorStore((state) => state.selectedElementId);
  const viewport = useEditorStore((state) => state.viewport);
  const startEditing = useEditorStore((state) => state.startEditing);
  const goToSetup = useEditorStore((state) => state.goToSetup);
  const setActivePanel = useEditorStore((state) => state.setActivePanel);
  const setProjectName = useEditorStore((state) => state.setProjectName);
  const setShape = useEditorStore((state) => state.setShape);
  const setDimensions = useEditorStore((state) => state.setDimensions);
  const setViewport = useEditorStore((state) => state.setViewport);
  const resetViewport = useEditorStore((state) => state.resetViewport);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);
  const canUndo = useEditorStore((state) => state.past.length > 0);
  const canRedo = useEditorStore((state) => state.future.length > 0);
  const loadDocument = useEditorStore((state) => state.loadDocument);
  const selectElement = useEditorStore((state) => state.selectElement);
  const addElement = useEditorStore((state) => state.addElement);
  const updateElement = useEditorStore((state) => state.updateElement);
  const deleteSelectedElement = useEditorStore((state) => state.deleteSelectedElement);
  const duplicateSelectedElement = useEditorStore(
    (state) => state.duplicateSelectedElement
  );
  const flipSelectedElement = useEditorStore((state) => state.flipSelectedElement);

  const selectedStatus = useMemo(
    () => getSelectionStatus(document, selectedElementId),
    [document, selectedElementId]
  );

  const selectedElement = selectedStatus?.element ?? null;
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

  const renderSetupScreen = () => (
    <div className="mx-auto flex min-h-dvh w-full max-w-6xl items-center px-4 py-8 sm:px-6">
      <div className="grid w-full gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section
          className="editor-panel rounded-[1.6rem] border border-white/70 p-5 shadow-[0_36px_80px_-50px_rgba(0,0,0,0.4)]"
          data-editor-fade-in="true"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--editor-accent)]">
            Editor
          </p>
          <h1 className="mt-3 max-w-xl text-4xl font-semibold tracking-[-0.05em] text-[var(--editor-ink)] sm:text-5xl">
            Compui rapid modelul direct pe oglindă.
          </h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-[var(--editor-muted)]">
            Alegi forma, pui dimensiunile și apoi adaugi ornamentele.
          </p>
        </section>

        <section
          className="editor-panel rounded-[1.6rem] border border-white/70 p-5 shadow-[0_36px_80px_-50px_rgba(0,0,0,0.4)]"
          data-editor-fade-in="true"
        >
          <div className="mb-5">
            <h2 className="text-2xl font-semibold text-[var(--editor-ink)]">
              Setări inițiale
            </h2>
          </div>

          <div className="space-y-4">
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--editor-muted)]">
                Nume proiect
              </span>
              <input
                value={document.projectName}
                onChange={(event) => setProjectName(event.target.value)}
                className="h-11 w-full rounded-[0.95rem] border border-[var(--editor-line)] bg-white/88 px-3 text-base text-[var(--editor-ink)] outline-none transition focus:border-[var(--editor-accent)]"
              />
            </label>

            <SizeSelector
              shape={document.shape}
              widthCm={document.widthCm}
              heightCm={document.heightCm}
              onShapeChange={handleShapeChange}
              onWidthChange={handleWidthChange}
              onHeightChange={handleHeightChange}
            />
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={startEditing}
              className="flex-1 rounded-[1.2rem] bg-[var(--editor-ink)] px-5 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white"
            >
              Continuă în editor
            </button>
            <button
              type="button"
              onClick={handleOpenJson}
              className="rounded-[1.2rem] border border-[var(--editor-line)] bg-white/86 px-5 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--editor-ink)]"
            >
              Deschide JSON
            </button>
          </div>
        </section>
      </div>
    </div>
  );

  if (!isStarted) {
    return (
      <>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={handleLoadJsonFile}
        />
        {renderSetupScreen()}
      </>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
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
        hasSelection={Boolean(selectedElementId)}
        onUndo={undo}
        onRedo={redo}
        onFit={resetViewport}
        onDuplicate={duplicateSelectedElement}
        onDelete={deleteSelectedElement}
        onFlipX={() => flipSelectedElement("x")}
        onFlipY={() => flipSelectedElement("y")}
      />

      <div className="mx-auto flex w-full max-w-[1460px] flex-1 gap-3 px-0 py-0 sm:px-4 sm:py-4">
        <aside className="hidden w-[300px] flex-col gap-4 lg:flex">
          <PanelCard
            title="Bibliotecă SVG"
          >
              <SvgLibrary
              activeCategory={activeAssetCategory}
              onCategoryChange={setActiveAssetCategory}
              onAddAsset={addElement}
            />
          </PanelCard>

          <PanelCard
            title="Suprafață"
          >
            <SizeSelector
              shape={document.shape}
              widthCm={document.widthCm}
              heightCm={document.heightCm}
              onShapeChange={handleShapeChange}
              onWidthChange={handleWidthChange}
              onHeightChange={handleHeightChange}
              compact
            />
          </PanelCard>
        </aside>

        <main className="flex min-h-0 flex-1 flex-col pb-20 md:pb-4">
          <EditorCanvas
            ref={canvasRef}
            document={document}
            selectedElementId={selectedElementId}
            viewport={viewport}
            onViewportChange={setViewport}
            onSelectElement={selectElement}
            onUpdateElement={updateElement}
          />
        </main>

        <aside className="hidden w-[320px] flex-col gap-4 xl:flex">
          <PanelCard
            title="Element selectat"
          >
            <ElementControls
              element={selectedElement}
              onRotate={(rotation) =>
                selectedElement && updateElement(selectedElement.id, { rotation })
              }
              onDuplicate={duplicateSelectedElement}
              onDelete={deleteSelectedElement}
              onFlipX={() => flipSelectedElement("x")}
              onFlipY={() => flipSelectedElement("y")}
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
        hasSelection={Boolean(selectedElementId)}
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
            className="absolute inset-x-3 bottom-[4.5rem]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="editor-panel max-h-[54dvh] overflow-y-auto rounded-[1.35rem] border border-white/70 p-3 shadow-[0_30px_70px_-36px_rgba(0,0,0,0.45)]">
            {activePanel === "library" ? (
              <PanelCard
                title="Bibliotecă SVG"
              >
                <SvgLibrary
                  activeCategory={activeAssetCategory}
                  onCategoryChange={setActiveAssetCategory}
                  onAddAsset={(assetId) => {
                    addElement(assetId);
                    handleClosePanel();
                  }}
                />
              </PanelCard>
            ) : null}

            {activePanel === "shapeSize" ? (
              <PanelCard
                title="Suprafață"
              >
                <SizeSelector
                  shape={document.shape}
                  widthCm={document.widthCm}
                  heightCm={document.heightCm}
                  onShapeChange={handleShapeChange}
                  onWidthChange={handleWidthChange}
                  onHeightChange={handleHeightChange}
                  compact
                />
              </PanelCard>
            ) : null}

            {activePanel === "element" ? (
              <PanelCard
                title="Editare"
              >
                <ElementControls
                  element={selectedElement}
                  onRotate={(rotation) =>
                    selectedElement && updateElement(selectedElement.id, { rotation })
                  }
                  onDuplicate={duplicateSelectedElement}
                  onDelete={deleteSelectedElement}
                  onFlipX={() => flipSelectedElement("x")}
                  onFlipY={() => flipSelectedElement("y")}
                />
              </PanelCard>
            ) : null}

            {activePanel === "export" ? (
              <PanelCard
                title="Export"
              >
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      handleClosePanel();
                      goToSetup();
                    }}
                    className="w-full rounded-[1rem] border border-[var(--editor-line)] bg-white/88 px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--editor-ink)]"
                  >
                    Ecran start
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleExportPng();
                      handleClosePanel();
                    }}
                    className="w-full rounded-[1rem] bg-[var(--editor-ink)] px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white"
                  >
                    Export PNG
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleExportJson();
                      handleClosePanel();
                    }}
                    className="w-full rounded-[1rem] border border-[var(--editor-line)] bg-white/88 px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--editor-ink)]"
                  >
                    Salvează JSON
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleClosePanel();
                      handleOpenJson();
                    }}
                    className="w-full rounded-[1rem] border border-[var(--editor-line)] bg-white/88 px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--editor-ink)]"
                  >
                    Încarcă JSON
                  </button>
                </div>
              </PanelCard>
            ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
