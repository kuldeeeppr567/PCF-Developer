import { useState } from "react";
import { useDesigner } from "../store/designerStore";
import { getBlock } from "../data/blockRegistry";
import { PCF_PROPERTY_TYPES } from "../types";
import type { DatasetColumn, PcfPropertyType } from "../types";
import "./PropertiesPanel.css";

type PanelTab = "props" | "binding" | "layout";

export function PropertiesPanel() {
  const { state, selectedBlock, updateBlockProp, renameBlock, setMeta, addDatasetColumn, removeDatasetColumn } =
    useDesigner();
  const [tab, setTab] = useState<PanelTab>("props");

  // New dataset column form state
  const [newColName, setNewColName] = useState("");
  const [newColDisplay, setNewColDisplay] = useState("");
  const [newColType, setNewColType] = useState<PcfPropertyType>("SingleLine.Text");

  const blockEntry = selectedBlock ? getBlock(selectedBlock.blockType) : null;

  return (
    <aside className="props-panel" aria-label="Properties panel">
      <div className="props-panel__header">Properties</div>

      {/* Tab bar */}
      <div className="props-panel__tabs" role="tablist">
        <button
          role="tab"
          aria-selected={tab === "props"}
          className={`props-panel__tab${tab === "props" ? " props-panel__tab--active" : ""}`}
          onClick={() => setTab("props")}
        >
          Block
        </button>
        <button
          role="tab"
          aria-selected={tab === "binding"}
          className={`props-panel__tab${tab === "binding" ? " props-panel__tab--active" : ""}`}
          onClick={() => setTab("binding")}
        >
          Binding
        </button>
        <button
          role="tab"
          aria-selected={tab === "layout"}
          className={`props-panel__tab${tab === "layout" ? " props-panel__tab--active" : ""}`}
          onClick={() => setTab("layout")}
        >
          Layout
        </button>
      </div>

      <div className="props-panel__body">
        {/* ── Block Props Tab ── */}
        {tab === "props" && (
          <>
            {!selectedBlock ? (
              <div className="props-panel__empty">
                <div className="props-panel__empty-icon">🖱️</div>
                <div>Select a block on the canvas to edit its properties</div>
              </div>
            ) : (
              <div className="props-panel__section">
                <div className="props-panel__section-title">
                  {blockEntry?.icon} {selectedBlock.blockType}
                  <span className="props-panel__block-id">#{selectedBlock.id}</span>
                </div>

                {/* Instance ID editor */}
                <Field label="Instance ID">
                  <input
                    className="props-panel__input"
                    type="text"
                    defaultValue={selectedBlock.id}
                    onBlur={(e) => renameBlock(selectedBlock.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                    }}
                    spellCheck={false}
                    title="Press Enter or click away to apply"
                  />
                </Field>

                {/* Block-specific props */}
                {blockEntry?.props.map((propDef) => (
                  <Field key={propDef.name} label={propDef.label}>
                    {propDef.type === "boolean" ? (
                      <label className="props-panel__toggle-row">
                        <input
                          type="checkbox"
                          checked={Boolean(selectedBlock.props[propDef.name])}
                          onChange={(e) =>
                            updateBlockProp(selectedBlock.id, propDef.name, e.target.checked)
                          }
                        />
                        <span>{Boolean(selectedBlock.props[propDef.name]) ? "Yes" : "No"}</span>
                      </label>
                    ) : propDef.options ? (
                      <select
                        className="props-panel__select"
                        value={String(selectedBlock.props[propDef.name] ?? propDef.default)}
                        onChange={(e) =>
                          updateBlockProp(selectedBlock.id, propDef.name, e.target.value)
                        }
                      >
                        {propDef.options.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : propDef.type === "number" ? (
                      <input
                        className="props-panel__input"
                        type="number"
                        value={Number(selectedBlock.props[propDef.name] ?? propDef.default)}
                        onChange={(e) =>
                          updateBlockProp(selectedBlock.id, propDef.name, Number(e.target.value))
                        }
                      />
                    ) : (
                      <input
                        className="props-panel__input"
                        type={propDef.name === "color" ? "color" : "text"}
                        value={String(selectedBlock.props[propDef.name] ?? propDef.default ?? "")}
                        onChange={(e) =>
                          updateBlockProp(selectedBlock.id, propDef.name, e.target.value)
                        }
                        spellCheck={false}
                      />
                    )}
                  </Field>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Binding Tab ── */}
        {tab === "binding" && (
          <div className="props-panel__section">
            <div className="props-panel__section-title">Control Metadata</div>

            <Field label="Description">
              <input
                className="props-panel__input"
                type="text"
                value={state.description}
                onChange={(e) => setMeta("description", e.target.value)}
                placeholder="Optional description"
              />
            </Field>

            <Field label="Target Table (docs only)">
              <input
                className="props-panel__input"
                type="text"
                value={state.targetTable}
                onChange={(e) => setMeta("targetTable", e.target.value)}
                placeholder="e.g. account"
                spellCheck={false}
              />
            </Field>

            {state.controlType === "field" ? (
              <>
                <div className="props-panel__section-title" style={{ marginTop: 16 }}>
                  Field Binding
                </div>
                <Field label="Property Name">
                  <input
                    className="props-panel__input"
                    type="text"
                    value={state.fieldPropertyName}
                    onChange={(e) => setMeta("fieldPropertyName", e.target.value)}
                    placeholder="value"
                    spellCheck={false}
                  />
                </Field>
                <Field label="Data Type">
                  <select
                    className="props-panel__select"
                    value={state.fieldOfType}
                    onChange={(e) => setMeta("fieldOfType", e.target.value as PcfPropertyType)}
                  >
                    {PCF_PROPERTY_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Required">
                  <label className="props-panel__toggle-row">
                    <input
                      type="checkbox"
                      checked={state.fieldRequired}
                      onChange={(e) => setMeta("fieldRequired", e.target.checked)}
                    />
                    <span>{state.fieldRequired ? "Yes" : "No"}</span>
                  </label>
                </Field>
              </>
            ) : (
              <>
                <div className="props-panel__section-title" style={{ marginTop: 16 }}>
                  Dataset Config
                </div>
                <Field label="Dataset Name">
                  <input
                    className="props-panel__input"
                    type="text"
                    value={state.datasetName}
                    onChange={(e) => setMeta("datasetName", e.target.value)}
                    spellCheck={false}
                  />
                </Field>
                <Field label="Display Name">
                  <input
                    className="props-panel__input"
                    type="text"
                    value={state.datasetDisplayName}
                    onChange={(e) => setMeta("datasetDisplayName", e.target.value)}
                  />
                </Field>

                <div className="props-panel__sub-title">Columns</div>
                {state.datasetColumns.map((col) => (
                  <div key={col.name} className="props-panel__col-row">
                    <span className="props-panel__col-name">{col.name}</span>
                    <span className="props-panel__col-type">{col.ofType}</span>
                    <button
                      className="props-panel__col-delete"
                      onClick={() => removeDatasetColumn(col.name)}
                      aria-label={`Remove column ${col.name}`}
                    >
                      ×
                    </button>
                  </div>
                ))}

                <div className="props-panel__add-col">
                  <input
                    className="props-panel__input"
                    type="text"
                    placeholder="column name"
                    value={newColName}
                    onChange={(e) => setNewColName(e.target.value)}
                    spellCheck={false}
                  />
                  <input
                    className="props-panel__input"
                    type="text"
                    placeholder="display name"
                    value={newColDisplay}
                    onChange={(e) => setNewColDisplay(e.target.value)}
                  />
                  <select
                    className="props-panel__select"
                    value={newColType}
                    onChange={(e) => setNewColType(e.target.value as PcfPropertyType)}
                  >
                    {PCF_PROPERTY_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <button
                    className="props-panel__add-col-btn"
                    onClick={() => {
                      if (!newColName.trim()) return;
                      addDatasetColumn({
                        name: newColName.trim(),
                        displayName: newColDisplay.trim() || undefined,
                        ofType: newColType,
                      } as DatasetColumn);
                      setNewColName("");
                      setNewColDisplay("");
                    }}
                  >
                    + Add Column
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Layout Tab ── */}
        {tab === "layout" && (
          <div className="props-panel__section">
            <div className="props-panel__section-title">Layout</div>

            <Field label="Direction">
              <select
                className="props-panel__select"
                value={state.layoutDirection}
                onChange={(e) =>
                  setMeta("layoutDirection", e.target.value as "vertical" | "horizontal")
                }
              >
                <option value="vertical">Vertical (stack)</option>
                <option value="horizontal">Horizontal (row)</option>
              </select>
            </Field>

            <Field label="Gap between blocks">
              <input
                className="props-panel__input"
                type="text"
                value={state.layoutGap}
                onChange={(e) => setMeta("layoutGap", e.target.value)}
                placeholder="8px"
                spellCheck={false}
              />
            </Field>

            <Field label="Padding (outer)">
              <input
                className="props-panel__input"
                type="text"
                value={state.layoutPadding}
                onChange={(e) => setMeta("layoutPadding", e.target.value)}
                placeholder="8px"
                spellCheck={false}
              />
            </Field>
          </div>
        )}
      </div>
    </aside>
  );
}

// ── Helper ──────────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="props-panel__field">
      <label className="props-panel__field-label">{label}</label>
      {children}
    </div>
  );
}
