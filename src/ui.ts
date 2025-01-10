import * as PIXI from "pixi.js";
import { addRandomFigure } from "./pixiSetup";


export function setupUI(
  app: PIXI.Application,
  container: PIXI.Container,
  onExportPDF: () => void,
) {
  const btnAdd = document.getElementById("btn-add-figure") as HTMLButtonElement;
  const btnExport = document.getElementById(
    "btn-export-pdf",
  ) as HTMLButtonElement;

  btnAdd.onclick = () => {
    addRandomFigure(container);
  };

  btnExport.onclick = () => {
    onExportPDF();
  };
}
