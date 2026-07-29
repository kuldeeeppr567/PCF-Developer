import { useId } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDesigner } from "../store/designerStore";
import { getBlock } from "../data/blockRegistry";
import type { CanvasBlock } from "../types";
import "./Canvas.css";

// ── Sortable block row ──────────────────────────────────────────────────────

function SortableBlockRow({ block }: { block: CanvasBlock }) {
  const { selectBlock, removeBlock, state } = useDesigner();
  const isSelected = state.selectedBlockId === block.id;
  const entry = getBlock(block.blockType);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  // Get a short readable summary of main prop
  const summary = (() => {
    if (!entry) return "";
    const labelProp = entry.props.find((p) => p.name === "label" || p.name === "text");
    if (!labelProp) return "";
    const val = block.props[labelProp.name];
    if (typeof val === "string" && val) return `"${val}"`;
    return "";
  })();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`canvas-block${isSelected ? " canvas-block--selected" : ""}`}
      onClick={() => selectBlock(block.id)}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`${block.blockType} block ${block.id}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectBlock(block.id);
        }
        if (e.key === "Delete" || e.key === "Backspace") {
          e.preventDefault();
          removeBlock(block.id);
        }
      }}
    >
      <span
        className="canvas-block__drag"
        {...attributes}
        {...listeners}
        title="Drag to reorder"
        aria-label="Drag handle"
        role="button"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        ⠿
      </span>

      <span className="canvas-block__icon" aria-hidden="true">
        {entry?.icon ?? "🧩"}
      </span>

      <span className="canvas-block__type">{block.blockType}</span>

      {summary && (
        <span className="canvas-block__summary">{summary}</span>
      )}

      <span className="canvas-block__id">{block.id}</span>

      <button
        className="canvas-block__delete"
        onClick={(e) => {
          e.stopPropagation();
          removeBlock(block.id);
        }}
        title="Remove block"
        aria-label={`Remove ${block.id}`}
        tabIndex={-1}
      >
        ×
      </button>
    </div>
  );
}

// ── Canvas ──────────────────────────────────────────────────────────────────

export function Canvas() {
  const { state, reorderBlocks, addBlock } = useDesigner();
  const droppableId = useId();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = state.blocks.findIndex((b) => b.id === active.id);
      const newIndex = state.blocks.findIndex((b) => b.id === over.id);
      const reordered = arrayMove(state.blocks, oldIndex, newIndex);
      reorderBlocks(reordered.map((b) => b.id));
    }
  }

  return (
    <div className="canvas" id={droppableId}>
      <div className="canvas__header">
        <span className="canvas__title">Canvas</span>
        <span className="canvas__hint">
          {state.blocks.length === 0
            ? "← Click a block in the palette to add it"
            : `${state.blocks.length} block${state.blocks.length !== 1 ? "s" : ""} · drag to reorder`}
        </span>
      </div>

      {state.blocks.length === 0 ? (
        <div className="canvas__empty">
          <div className="canvas__empty-icon" aria-hidden="true">🎨</div>
          <div className="canvas__empty-text">Your canvas is empty</div>
          <div className="canvas__empty-sub">
            Add blocks from the palette on the left
          </div>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={state.blocks.map((b) => b.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="canvas__list" role="list" aria-label="Canvas blocks">
              {state.blocks.map((block) => (
                <SortableBlockRow key={block.id} block={block} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Quick-add strip at bottom */}
      <div className="canvas__footer">
        <span className="canvas__footer-label">Quick add:</span>
        {["Label", "TextInput", "Button"].map((bt) => (
          <button
            key={bt}
            className="canvas__quick-add"
            onClick={() => addBlock(bt)}
            aria-label={`Quick add ${bt}`}
          >
            + {bt}
          </button>
        ))}
      </div>
    </div>
  );
}
