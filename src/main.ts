import { createPixiApp, createMainContainer } from './pixiSetup';
import { setupUI } from './ui';
import { convertPixiContainerToSkia, setupInteractiveHandlers } from './skiaWrapper';

async function main() {
  // 1) Создаём Pixi-приложение
  const app = createPixiApp('pixi-canvas');
  // Создаём один контейнер
  const mainContainer = createMainContainer();
  // Добавляем в stage
  app.stage.addChild(mainContainer);

  // 2) Инициализируем CanvasKit
  const canvasKit = await window.CanvasKitInit({
    locateFile: (file: string) => '/canvaskit/' + file
  });

  // 3) Создаём surface для skia-canvas
  const skiaCanvasEl = document.getElementById('skia-canvas') as HTMLCanvasElement;
  const surface = canvasKit.MakeCanvasSurface(skiaCanvasEl);
  if (!surface) {
    throw new Error('Не удалось создать Skia Surface');
  }

 // Активируем интеративность на Skia канвасе  
  setupInteractiveHandlers(skiaCanvasEl);


  // 4) Функция экспорта PDF
  function exportPDF() {
    console.log(canvasKit)
    if (!canvasKit.SkPDF) {
        throw new Error('SkPDF не поддерживается в данной версии CanvasKit');
      }
    try {
      // Создаём PDF документ
      const pdfData = canvasKit.SkPDF.MakeDocument();
      if (!pdfData) {
        throw new Error('Не удалось создать PDF документ');
      }
  
      const pageWidth = 612; // 8.5 inches * 72 DPI
      const pageHeight = 792; // 11 inches * 72 DPI
      const pdfCanvas = pdfData.beginPage(pageWidth, pageHeight);
  
      // Конвертируем Pixi-контейнер в Skia-объекты
      convertPixiContainerToSkia(mainContainer, pdfCanvas, canvasKit);
  
      pdfData.endPage();
      pdfData.close();
  
      // Экспорт PDF
      const pdfBytes = pdfData.stream.buffer;
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
  
      // Загружаем файл
      const link = document.createElement('a');
      link.href = url;
      link.download = 'scene.pdf';
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Ошибка при экспорте PDF:', error);
    }
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
