import { Toolbar } from "./components/Toolbar";
import { BlockPalette } from "./components/BlockPalette";
import { Canvas } from "./components/Canvas";
import { PropertiesPanel } from "./components/PropertiesPanel";
import { LivePreview } from "./components/LivePreview";
import { DesignerProvider } from "./store/designerStore";
import "./App.css";

export function App() {
  return (
    <DesignerProvider>
      <div className="app">
        <Toolbar />
        <div className="app__workspace">
          <BlockPalette />
          <Canvas />
          <PropertiesPanel />
          <LivePreview />
        </div>
      </div>
    </DesignerProvider>
  );
}
