# PCF Designer

A browser-based visual canvas for designing PCF controls. Draw your control layout using pre-built blocks, annotate fields with Dataverse metadata, preview in real-time, and export a `control.spec.json` that the [generator](../generator/) turns into a complete, buildable PCF project.

## Quick Start

```bash
cd tools/designer
npm install
npm run dev
# → opens http://localhost:5173
```

## What it does

```
You (visual design)
       ↓
  PCF Designer  →  control.spec.json
                          ↓
                   pcf-gen generate
                          ↓
               controls/<Name>/  (buildable PCF project)
```

## The Interface

```
┌──────────────────────────────────────────────────────────────────┐
│  🎨 PCF Designer  │ MyControl │ MyCompany.Controls │ Field │ … │ ⬇️ Export │
├───────────────┬──────────────────────┬──────────────┬───────────┤
│  BLOCKS       │  CANVAS              │  PROPERTIES  │  PREVIEW  │
│               │                      │              │           │
│  🏷️ Label     │  ⠿ 🏷️ Label   "Hi" │  Block tab:  │  ┌──────┐ │
│  📝 TextInput │  ⠿ ⭐ Rating  #r_1  │  ● label     │  │Hi    │ │
│  ⭐ Rating    │  ⠿ 🔘 Button  #b_1  │  ● max: 5    │  │★★★☆☆│ │
│  🔄 Toggle    │                      │  ● size: med │  │[Save]│ │
│  🎚️ Slider    │  ← Click to add      │              │  └──────┘ │
│  …            │     drag to reorder  │  Binding tab │           │
│               │     Del to remove    │  Layout tab  │  Spec JSON│
└───────────────┴──────────────────────┴──────────────┴───────────┘
```

### Left panel — Block Palette
Click any block to add it to the canvas. Blocks are grouped by category:
- **Display**: Label
- **Input**: TextInput, Rating, Toggle, Slider, DatePicker, Button, NumberInput
- **Layout**: Card
- **Data**: DataGrid

### Centre — Canvas
- Click a block row to select it (highlights in blue)
- **Drag** the `⠿` handle to reorder
- Press **Delete/Backspace** while a row is focused to remove it
- Quick-add buttons at the bottom for the 3 most common blocks

### Right panel — Properties (3 tabs)

| Tab | What it edits |
|-----|---------------|
| **Block** | Props for the selected block (label, value, size, etc.) + Instance ID |
| **Binding** | Control description, target table, field/dataset binding config, data type |
| **Layout** | Stack direction (vertical / horizontal), gap, padding |

### Preview panel
- **Render** tab — live React render of your control in a device frame
- **Spec JSON** tab — the `control.spec.json` that would be exported

## Export & Generate

1. Click **⬇️ Export Spec** → downloads `control.spec.json`
2. In your terminal:
   ```bash
   cd tools/generator
   npm install && npm run build
   node dist/index.js generate path/to/control.spec.json
   ```
3. Your control is created under `controls/<ControlName>/`

## Import / Round-trip

Click **📂 Import Spec** to load an existing `control.spec.json` back into the designer. Edit visually and re-export to update the spec. Re-run the generator with `--force` to regenerate the code:

```bash
node dist/index.js generate controls/MyControl/MyControl/control.spec.json --force
```

## Build for production

```bash
npm run build   # outputs to dist/
npm run preview # serves dist/ locally for testing
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | TypeScript check + production bundle |
| `npm run preview` | Preview the production build |
