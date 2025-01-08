import * as PIXI from 'pixi.js';
import { addRandomFigure } from './pixiSetup';

/**
 * Привязка двух кнопок:
 * - «Добавить фигуру»
 * - «Экспорт в PDF»
 */
export function setupUI(
  app: PIXI.Application,
  container: PIXI.Container,
  onExportPDF: () => void
) {
  const btnAdd = document.getElementById('btn-add-figure') as HTMLButtonElement;
  const btnExport = document.getElementById('btn-export-pdf') as HTMLButtonElement;

  btnAdd.onclick = () => {
    // Добавляем фигуру в container (у нас нет переключения, всегда один контейнер)
    addRandomFigure(container);
  };

  btnExport.onclick = () => {
    onExportPDF();
  };
}
