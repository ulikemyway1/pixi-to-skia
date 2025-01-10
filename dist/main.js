import { createPixiApp, createMainContainer } from "./pixiSetup";
import { setupUI } from "./ui";
import { convertPixiContainerToSkia, setupInteractiveHandlers, } from "./skiaWrapper";
async function main() {
    const app = createPixiApp("pixi-canvas");
    const mainContainer = createMainContainer();
    app.stage.addChild(mainContainer);
    const canvasKit = await window.CanvasKitInit({
        locateFile: (file) => "/canvaskit/" + file,
    });
    const skiaCanvasEl = document.getElementById("skia-canvas");
    const surface = canvasKit.MakeCanvasSurface(skiaCanvasEl);
    if (!surface) {
        throw new Error("Не удалось создать Skia Surface");
    }
    setupInteractiveHandlers(skiaCanvasEl);
    function exportPDF() {
        try {
            const width = app.renderer.width;
            const height = app.renderer.height;
            // Создаем поток для записи PDF
            const stream = new canvasKit.SkDynamicMemoryWStream();
            // Создаем PDF-документ
            const pdf = canvasKit.SkPDF.MakeDocument(stream);
            // Начинаем страницу и получаем Canvas для рисования
            const canvas = pdf.beginPage(width, height);
            // Конвертируем Pixi-контейнер в Skia-объекты
            convertPixiContainerToSkia(mainContainer, canvas, canvasKit);
            // Заканчиваем страницу
            pdf.endPage();
            // Завершаем документ
            pdf.close();
            // Получаем данные PDF из потока
            const pdfData = stream.detachAsData();
            const pdfBytes = pdfData.bytes();
            // Скачиваем PDF
            downloadData(pdfBytes, "export.pdf");
        }
        catch (error) {
            console.error("Ошибка при экспорте PDF:", error);
        }
    }
    function downloadData(data, fileName) {
        const blob = new Blob([data], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
    }
    // 5) Настраиваем UI (две кнопки)
    setupUI(app, mainContainer, exportPDF);
    // 6) В цикле Pixi (ticker) рендерим Skia
    app.ticker.add(() => {
        const skCanvas = surface.getCanvas();
        skCanvas.clear(canvasKit.WHITE);
        convertPixiContainerToSkia(mainContainer, skCanvas, canvasKit);
        surface.flush();
    });
}
main();
