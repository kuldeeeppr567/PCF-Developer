import { useState } from "react";
import { useDesigner, stateToSpec } from "../store/designerStore";
import {
  Label,
  TextInput,
  Rating,
  Toggle,
  Slider,
  DatePicker,
  Card,
  DataGrid,
  Button,
  NumberInput,
} from "../blocks";
import "./LivePreview.css";

// ── Block renderer ──────────────────────────────────────────────────────────

function renderBlock(blockType: string, props: Record<string, unknown>, key: string) {
  const p = props as Record<string, never>;

  switch (blockType) {
    case "Label":
      return <Label key={key} {...p} />;
    case "TextInput":
      return <TextInput key={key} {...p} />;
    case "Rating":
      return <Rating key={key} {...p} />;
    case "Toggle":
      return <Toggle key={key} {...p} />;
    case "Slider":
      return <Slider key={key} {...p} />;
    case "DatePicker":
      return <DatePicker key={key} {...p} />;
    case "Card":
      return <Card key={key} {...p} />;
    case "DataGrid":
      return (
        <DataGrid
          key={key}
          columns={[
            { key: "col1", header: "Column 1" },
            { key: "col2", header: "Column 2" },
          ]}
          rows={[
            { col1: "Sample A", col2: "Value 1" },
            { col1: "Sample B", col2: "Value 2" },
          ]}
          {...p}
        />
      );
    case "Button":
      return <Button key={key} {...p} />;
    case "NumberInput":
      return <NumberInput key={key} {...p} />;
    default:
      return (
        <div key={key} className="live-preview__unknown-block">
          Unknown block: {blockType}
        </div>
      );
  }
}

// ── Preview panel ───────────────────────────────────────────────────────────

type PreviewTab = "preview" | "json";

export function LivePreview() {
  const { state } = useDesigner();
  const [tab, setTab] = useState<PreviewTab>("preview");

  const spec = stateToSpec(state);
  const specJson = JSON.stringify(spec, null, 2);

  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: state.layoutDirection === "horizontal" ? "row" : "column",
    gap: state.layoutGap,
    padding: state.layoutPadding,
    flexWrap: "wrap",
  };

  return (
    <section className="live-preview" aria-label="Live preview">
      <div className="live-preview__header">
        <span className="live-preview__title">Preview</span>
        <div className="live-preview__tabs" role="tablist">
          <button
            role="tab"
            aria-selected={tab === "preview"}
            className={`live-preview__tab${tab === "preview" ? " live-preview__tab--active" : ""}`}
            onClick={() => setTab("preview")}
          >
            Render
          </button>
          <button
            role="tab"
            aria-selected={tab === "json"}
            className={`live-preview__tab${tab === "json" ? " live-preview__tab--active" : ""}`}
            onClick={() => setTab("json")}
          >
            Spec JSON
          </button>
        </div>
      </div>

      {tab === "preview" ? (
        <div className="live-preview__stage">
          <div className="live-preview__device">
            <div className="live-preview__device-bar">
              <span>{state.name || "MyControl"}</span>
            </div>
            <div className="live-preview__device-body">
              {state.blocks.length === 0 ? (
                <div className="live-preview__empty">
                  Add blocks to see a preview
                </div>
              ) : (
                <div style={containerStyle}>
                  {state.blocks.map((block) =>
                    renderBlock(block.blockType, block.props, block.id),
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="live-preview__json-stage">
          <pre className="live-preview__json">{specJson}</pre>
        </div>
      )}
    </section>
  );
}
