import { BLOCK_REGISTRY } from "../data/blockRegistry";
import { useDesigner } from "../store/designerStore";
import "./BlockPalette.css";

const CATEGORIES = [
  { id: "input", label: "Input" },
  { id: "display", label: "Display" },
  { id: "layout", label: "Layout" },
  { id: "data", label: "Data" },
] as const;

export function BlockPalette() {
  const { addBlock } = useDesigner();

  return (
    <aside className="palette" aria-label="Block palette">
      <div className="palette__header">Blocks</div>

      {CATEGORIES.map((cat) => {
        const blocks = BLOCK_REGISTRY.filter((b) => b.category === cat.id);
        if (!blocks.length) return null;
        return (
          <div key={cat.id} className="palette__group">
            <div className="palette__group-label">{cat.label}</div>
            {blocks.map((block) => (
              <button
                key={block.blockType}
                className="palette__item"
                onClick={() => addBlock(block.blockType)}
                title={block.description}
                aria-label={`Add ${block.displayName} block`}
              >
                <span className="palette__icon" aria-hidden="true">
                  {block.icon}
                </span>
                <span className="palette__name">{block.displayName}</span>
                <span className="palette__add" aria-hidden="true">+</span>
              </button>
            ))}
          </div>
        );
      })}

      <div className="palette__tip">
        Click a block to add it to the canvas
      </div>
    </aside>
  );
}
