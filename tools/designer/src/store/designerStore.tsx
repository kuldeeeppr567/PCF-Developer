import { createContext, useContext, useReducer, useCallback } from "react";
import type { Dispatch, ReactNode } from "react";
import type { CanvasBlock, DesignerState, DatasetColumn, PcfPropertyType } from "../types";
import { defaultPropsFor } from "../data/blockRegistry";

// ── Initial state ──────────────────────────────────────────────────────────

const INITIAL_STATE: DesignerState = {
  name: "MyControl",
  namespace: "MyCompany.Controls",
  version: "0.0.1",
  description: "",
  controlType: "field",
  targetTable: "",

  fieldPropertyName: "value",
  fieldOfType: "SingleLine.Text",
  fieldRequired: true,

  datasetName: "dataSetGrid",
  datasetDisplayName: "Data",
  datasetColumns: [],

  layoutDirection: "vertical",
  layoutGap: "8px",
  layoutPadding: "8px",

  blocks: [],
  selectedBlockId: null,
};

// ── Actions ────────────────────────────────────────────────────────────────

type Action =
  | { type: "SET_META"; field: keyof DesignerState; value: unknown }
  | { type: "ADD_BLOCK"; blockType: string }
  | { type: "REMOVE_BLOCK"; id: string }
  | { type: "SELECT_BLOCK"; id: string | null }
  | { type: "UPDATE_BLOCK_PROP"; id: string; propName: string; value: unknown }
  | { type: "RENAME_BLOCK"; id: string; newId: string }
  | { type: "REORDER_BLOCKS"; orderedIds: string[] }
  | { type: "ADD_DATASET_COLUMN"; column: DatasetColumn }
  | { type: "REMOVE_DATASET_COLUMN"; name: string }
  | { type: "LOAD_SPEC"; state: DesignerState };

// ── Reducer ────────────────────────────────────────────────────────────────

let _instanceCounter = 0;

function reducer(state: DesignerState, action: Action): DesignerState {
  switch (action.type) {
    case "SET_META":
      return { ...state, [action.field]: action.value };

    case "ADD_BLOCK": {
      _instanceCounter += 1;
      const newBlock: CanvasBlock = {
        id: `${action.blockType.toLowerCase()}_${_instanceCounter}`,
        blockType: action.blockType,
        props: defaultPropsFor(action.blockType),
      };
      return {
        ...state,
        blocks: [...state.blocks, newBlock],
        selectedBlockId: newBlock.id,
      };
    }

    case "REMOVE_BLOCK":
      return {
        ...state,
        blocks: state.blocks.filter((b) => b.id !== action.id),
        selectedBlockId:
          state.selectedBlockId === action.id ? null : state.selectedBlockId,
      };

    case "SELECT_BLOCK":
      return { ...state, selectedBlockId: action.id };

    case "UPDATE_BLOCK_PROP":
      return {
        ...state,
        blocks: state.blocks.map((b) =>
          b.id === action.id
            ? { ...b, props: { ...b.props, [action.propName]: action.value } }
            : b,
        ),
      };

    case "RENAME_BLOCK": {
      const newId = action.newId.trim();
      if (!newId || state.blocks.some((b) => b.id === newId)) return state;
      return {
        ...state,
        blocks: state.blocks.map((b) =>
          b.id === action.id ? { ...b, id: newId } : b,
        ),
        selectedBlockId: state.selectedBlockId === action.id ? newId : state.selectedBlockId,
      };
    }

    case "REORDER_BLOCKS": {
      const idMap = new Map(state.blocks.map((b) => [b.id, b]));
      const reordered = action.orderedIds
        .map((id) => idMap.get(id))
        .filter((b): b is CanvasBlock => b !== undefined);
      return { ...state, blocks: reordered };
    }

    case "ADD_DATASET_COLUMN":
      return {
        ...state,
        datasetColumns: [...state.datasetColumns, action.column],
      };

    case "REMOVE_DATASET_COLUMN":
      return {
        ...state,
        datasetColumns: state.datasetColumns.filter(
          (c) => c.name !== action.name,
        ),
      };

    case "LOAD_SPEC":
      return { ...action.state };

    default:
      return state;
  }
}

// ── Context ────────────────────────────────────────────────────────────────

interface DesignerContextValue {
  state: DesignerState;
  dispatch: Dispatch<Action>;
  // Convenience helpers
  addBlock: (blockType: string) => void;
  removeBlock: (id: string) => void;
  selectBlock: (id: string | null) => void;
  updateBlockProp: (id: string, propName: string, value: unknown) => void;
  renameBlock: (id: string, newId: string) => void;
  setMeta: (field: keyof DesignerState, value: unknown) => void;
  reorderBlocks: (orderedIds: string[]) => void;
  addDatasetColumn: (column: DatasetColumn) => void;
  removeDatasetColumn: (name: string) => void;
  loadSpec: (state: DesignerState) => void;
  selectedBlock: CanvasBlock | null;
}

const DesignerContext = createContext<DesignerContextValue | null>(null);

// ── Provider ───────────────────────────────────────────────────────────────

export function DesignerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  const addBlock = useCallback(
    (blockType: string) => dispatch({ type: "ADD_BLOCK", blockType }),
    [],
  );
  const removeBlock = useCallback(
    (id: string) => dispatch({ type: "REMOVE_BLOCK", id }),
    [],
  );
  const selectBlock = useCallback(
    (id: string | null) => dispatch({ type: "SELECT_BLOCK", id }),
    [],
  );
  const updateBlockProp = useCallback(
    (id: string, propName: string, value: unknown) =>
      dispatch({ type: "UPDATE_BLOCK_PROP", id, propName, value }),
    [],
  );
  const renameBlock = useCallback(
    (id: string, newId: string) => dispatch({ type: "RENAME_BLOCK", id, newId }),
    [],
  );
  const setMeta = useCallback(
    (field: keyof DesignerState, value: unknown) =>
      dispatch({ type: "SET_META", field, value }),
    [],
  );
  const reorderBlocks = useCallback(
    (orderedIds: string[]) => dispatch({ type: "REORDER_BLOCKS", orderedIds }),
    [],
  );
  const addDatasetColumn = useCallback(
    (column: DatasetColumn) => dispatch({ type: "ADD_DATASET_COLUMN", column }),
    [],
  );
  const removeDatasetColumn = useCallback(
    (name: string) => dispatch({ type: "REMOVE_DATASET_COLUMN", name }),
    [],
  );
  const loadSpec = useCallback(
    (s: DesignerState) => dispatch({ type: "LOAD_SPEC", state: s }),
    [],
  );

  const selectedBlock =
    state.blocks.find((b) => b.id === state.selectedBlockId) ?? null;

  const value: DesignerContextValue = {
    state,
    dispatch,
    addBlock,
    removeBlock,
    selectBlock,
    updateBlockProp,
    renameBlock,
    setMeta,
    reorderBlocks,
    addDatasetColumn,
    removeDatasetColumn,
    loadSpec,
    selectedBlock,
  };

  return (
    <DesignerContext.Provider value={value}>
      {children}
    </DesignerContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────────

export function useDesigner(): DesignerContextValue {
  const ctx = useContext(DesignerContext);
  if (!ctx) throw new Error("useDesigner must be used inside <DesignerProvider>");
  return ctx;
}

// ── Spec serialiser ────────────────────────────────────────────────────────

import type { ControlSpec } from "../types";

export function stateToSpec(state: DesignerState): ControlSpec {
  const spec: ControlSpec = {
    name: state.name,
    namespace: state.namespace,
    version: state.version,
    controlType: state.controlType,
    blocks: [],
  };

  if (state.description) spec.description = state.description;
  if (state.targetTable) spec.targetTable = state.targetTable;

  if (state.controlType === "field") {
    spec.field = {
      propertyName: state.fieldPropertyName,
      ofType: state.fieldOfType as PcfPropertyType,
      required: state.fieldRequired,
    };
  } else {
    spec.dataset = {
      name: state.datasetName,
      displayName: state.datasetDisplayName || undefined,
      columns: state.datasetColumns.length ? state.datasetColumns : undefined,
    };
  }

  const layout: ControlSpec["layout"] = {};
  if (state.layoutDirection !== "vertical") layout.direction = state.layoutDirection;
  if (state.layoutGap !== "8px") layout.gap = state.layoutGap;
  if (state.layoutPadding !== "8px") layout.padding = state.layoutPadding;
  if (Object.keys(layout).length) spec.layout = layout;

  spec.blocks = state.blocks.map((b) => ({
    id: b.id,
    blockType: b.blockType,
    props: Object.keys(b.props).length ? b.props : undefined,
  }));

  return spec;
}

// ── Spec deserialiser ──────────────────────────────────────────────────────

export function specToState(spec: ControlSpec): DesignerState {
  _instanceCounter = Math.max(
    _instanceCounter,
    ...spec.blocks.map((_, i) => i + 1),
  );

  return {
    name: spec.name ?? "MyControl",
    namespace: spec.namespace ?? "MyCompany.Controls",
    version: spec.version ?? "0.0.1",
    description: spec.description ?? "",
    controlType: spec.controlType ?? "field",
    targetTable: spec.targetTable ?? "",

    fieldPropertyName: spec.field?.propertyName ?? "value",
    fieldOfType: (spec.field?.ofType ?? "SingleLine.Text") as PcfPropertyType,
    fieldRequired: spec.field?.required ?? true,

    datasetName: spec.dataset?.name ?? "dataSetGrid",
    datasetDisplayName: spec.dataset?.displayName ?? "Data",
    datasetColumns: spec.dataset?.columns ?? [],

    layoutDirection: spec.layout?.direction ?? "vertical",
    layoutGap: spec.layout?.gap ?? "8px",
    layoutPadding: spec.layout?.padding ?? "8px",

    blocks: spec.blocks.map((b, i) => ({
      id: b.id ?? `${b.blockType.toLowerCase()}_${i + 1}`,
      blockType: b.blockType,
      props: { ...defaultPropsFor(b.blockType), ...(b.props ?? {}) },
    })),

    selectedBlockId: null,
  };
}
