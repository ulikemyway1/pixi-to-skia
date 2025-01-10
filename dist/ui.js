import { addRandomFigure } from "./pixiSetup";
export function setupUI(app, container, onExportPDF) {
    const btnAdd = document.getElementById("btn-add-figure");
    const btnExport = document.getElementById("btn-export-pdf");
    btnAdd.onclick = () => {
        addRandomFigure(container);
    };
    btnExport.onclick = () => {
        onExportPDF();
    };
}
