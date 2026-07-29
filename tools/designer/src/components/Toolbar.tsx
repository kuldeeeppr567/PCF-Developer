import React, { useRef } from "react";
import { useDesigner, stateToSpec, specToState } from "../store/designerStore";
import type { ControlSpec } from "../types";
import "./Toolbar.css";

export function Toolbar() {
  const { state, setMeta, loadSpec } = useDesigner();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleExport() {
    const spec = stateToSpec(state);
    const json = JSON.stringify(spec, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "control.spec.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const spec = JSON.parse(ev.target?.result as string) as ControlSpec;
        loadSpec(specToState(spec));
      } catch {
        alert("Invalid control.spec.json file.");
      }
    };
    reader.readAsText(file);
    // Reset so the same file can be re-imported
    e.target.value = "";
  }

  function handleCopySpec() {
    const spec = stateToSpec(state);
    navigator.clipboard.writeText(JSON.stringify(spec, null, 2)).catch(() => {
      alert("Clipboard not available — use Export instead.");
    });
  }

  return (
    <header className="toolbar">
      <div className="toolbar__brand">
        <span className="toolbar__logo" aria-hidden="true">🎨</span>
        <span className="toolbar__title">PCF Designer</span>
      </div>

      <div className="toolbar__meta">
        <div className="toolbar__field">
          <label className="toolbar__label" htmlFor="tb-name">Control Name</label>
          <input
            id="tb-name"
            className="toolbar__input toolbar__input--name"
            type="text"
            value={state.name}
            onChange={(e) => setMeta("name", e.target.value)}
            placeholder="MyControl"
            spellCheck={false}
          />
        </div>

        <div className="toolbar__field">
          <label className="toolbar__label" htmlFor="tb-ns">Namespace</label>
          <input
            id="tb-ns"
            className="toolbar__input"
            type="text"
            value={state.namespace}
            onChange={(e) => setMeta("namespace", e.target.value)}
            placeholder="MyCompany.Controls"
            spellCheck={false}
          />
        </div>

        <div className="toolbar__field">
          <label className="toolbar__label" htmlFor="tb-ver">Version</label>
          <input
            id="tb-ver"
            className="toolbar__input toolbar__input--version"
            type="text"
            value={state.version}
            onChange={(e) => setMeta("version", e.target.value)}
            placeholder="0.0.1"
            spellCheck={false}
          />
        </div>

        <div className="toolbar__field">
          <label className="toolbar__label" htmlFor="tb-type">Control Type</label>
          <select
            id="tb-type"
            className="toolbar__select"
            value={state.controlType}
            onChange={(e) =>
              setMeta("controlType", e.target.value as "field" | "dataset")
            }
          >
            <option value="field">Field</option>
            <option value="dataset">Dataset</option>
          </select>
        </div>
      </div>

      <div className="toolbar__actions">
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="toolbar__file-input"
          aria-label="Import spec file"
          onChange={handleImport}
        />
        <button
          className="toolbar__btn toolbar__btn--ghost"
          onClick={() => fileInputRef.current?.click()}
          title="Import an existing control.spec.json"
        >
          📂 Import Spec
        </button>
        <button
          className="toolbar__btn toolbar__btn--ghost"
          onClick={handleCopySpec}
          title="Copy spec JSON to clipboard"
        >
          📋 Copy JSON
        </button>
        <button
          className="toolbar__btn toolbar__btn--primary"
          onClick={handleExport}
          title="Download control.spec.json"
        >
          ⬇️ Export Spec
        </button>
      </div>
    </header>
  );
}
