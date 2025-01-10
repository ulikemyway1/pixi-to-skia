import * as PIXI from "pixi.js";
import CanvasKit, { Canvas } from "canvaskit-wasm";

// Глобальный список интерактивных объектов
const interactiveObjects: Array<{
  obj: PIXI.DisplayObject;
  bounds: PIXI.Rectangle;
}> = [];

// Функция для преобразования контейнера PixiJS в Skia
export function convertPixiContainerToSkia(
  container: PIXI.Container,
  skCanvas: Canvas,
  canvasKit: typeof CanvasKit,
) {
  interactiveObjects.length = 0;

  for (const child of container.children) {
    drawDisplayObject(child, skCanvas, canvasKit);
  }
}

// Рекурсивная отрисовка DisplayObject и сбор интерактивных объектов
function drawDisplayObject(
  displayObject: PIXI.DisplayObject,
  skCanvas: Canvas,
  canvasKit: typeof CanvasKit,
) {
  skCanvas.save();

  if (displayObject.interactive) {
    const bounds = displayObject.getBounds();
    interactiveObjects.push({ obj: displayObject, bounds });
  }

  const m = createMatrixM44(displayObject, canvasKit);
  skCanvas.concat(m);

  if (displayObject instanceof PIXI.Graphics) {
    drawGraphics(displayObject, skCanvas, canvasKit);
  }

  if (displayObject instanceof PIXI.Container) {
    for (const child of displayObject.children) {
      drawDisplayObject(child, skCanvas, canvasKit);
    }
  }

  if (displayObject instanceof PIXI.Sprite) {
    drawGraphics(displayObject, skCanvas, canvasKit);
  }

  skCanvas.restore();
}

function createMatrixM44(obj: PIXI.DisplayObject, canvasKit: typeof CanvasKit) {
  const { a, b, c, d, tx, ty } = obj.worldTransform;
  const skMatrixM44 = [a, c, 0, tx, b, d, 0, ty, 0, 0, 1, 0, 0, 0, 0, 1];
  return skMatrixM44;
}

export function drawGraphics(
  displayObject: PIXI.DisplayObject,
  skCanvas: Canvas,
  canvasKit: any,
): void {
  const pixiColorToSkiaColor4f = (
    pixiColor: number,
    alpha: number = 1.0,
  ): Float32Array => {
    const r = ((pixiColor >> 16) & 0xff) / 255;
    const g = ((pixiColor >> 8) & 0xff) / 255;
    const b = (pixiColor & 0xff) / 255;
    return canvasKit.Color4f(r, g, b, alpha);
  };

  const processDisplayObject = (obj: PIXI.DisplayObject): void => {
    if (obj instanceof PIXI.Graphics) {
      const fillPaint = new canvasKit.Paint();
      fillPaint.setStyle(canvasKit.PaintStyle.Fill);
      fillPaint.setAntiAlias(true);

      const strokePaint = new canvasKit.Paint();
      strokePaint.setStyle(canvasKit.PaintStyle.Stroke);
      strokePaint.setAntiAlias(true);

      for (const data of obj.geometry.graphicsData ?? []) {
        const shape = data.shape;
        const path = new canvasKit.Path();

        if (shape instanceof PIXI.Ellipse) {
          const rect = canvasKit.XYWHRect(
            shape.x - shape.width,
            shape.y - shape.height,
            shape.width * 2,
            shape.height * 2,
          );
          path.addOval(rect);
        } else if (shape instanceof PIXI.Rectangle) {
          const rect = canvasKit.XYWHRect(
            shape.x,
            shape.y,
            shape.width,
            shape.height,
          );
          path.addRect(rect);
        } else if (shape instanceof PIXI.Polygon) {
          const points = shape.points;
          if (points.length >= 2) {
            path.moveTo(points[0], points[1]);
            for (let i = 2; i < points.length; i += 2) {
              path.lineTo(points[i], points[i + 1]);
            }
            if (shape.closeStroke) {
              path.close();
            }
          }
        }

        if (data.fillStyle?.visible) {
          const fillColor = data.fillStyle.color ?? 0x000000;
          const fillAlpha = data.fillStyle.alpha ?? 1.0;
          fillPaint.setColor(pixiColorToSkiaColor4f(fillColor, fillAlpha));
          skCanvas.drawPath(path, fillPaint);
        }

        if (data.lineStyle?.visible) {
          const strokeColor = data.lineStyle.color ?? 0x000000;
          const strokeAlpha = data.lineStyle.alpha ?? 1.0;
          strokePaint.setColor(
            pixiColorToSkiaColor4f(strokeColor, strokeAlpha),
          );
          strokePaint.setStrokeWidth(data.lineStyle.width ?? 1);

          const cap = data.lineStyle.cap ?? "butt";
          strokePaint.setStrokeCap(
            cap === "round"
              ? canvasKit.StrokeCap.Round
              : cap === "square"
                ? canvasKit.StrokeCap.Square
                : canvasKit.StrokeCap.Butt,
          );

          const join = data.lineStyle.join ?? "miter";
          strokePaint.setStrokeJoin(
            join === "round"
              ? canvasKit.StrokeJoin.Round
              : join === "bevel"
                ? canvasKit.StrokeJoin.Bevel
                : canvasKit.StrokeJoin.Miter,
          );

          strokePaint.setStrokeMiter(data.lineStyle.miterLimit ?? 10);
          skCanvas.drawPath(path, strokePaint);
        }

        path.delete();
      }

      fillPaint.delete();
      strokePaint.delete();
    } else if (obj instanceof PIXI.Sprite) {
      const sprite = obj;
      if (
        sprite.texture &&
        sprite.texture.baseTexture &&
        sprite.texture.baseTexture.resource
      ) {
        const resource = sprite.texture.baseTexture.resource;
        if (resource.source) {
          const imageElement = resource.source as HTMLImageElement;
          const skImage =
            canvasKit.MakeImageFromCanvasImageSource(imageElement);
          if (skImage) {
            skCanvas.save();

            const { a, b, c, d } = sprite.worldTransform;
            const anchorOffsetX = sprite.anchor.x * sprite.width;
            const anchorOffsetY = sprite.anchor.y * sprite.height;
            const skMatrixM44 = [
              a,
              c,
              0,
              0,
              b,
              d,
              0,
              0,
              0,
              0,
              1,
              0,
              0,
              0,
              0,
              1,
            ];
            skCanvas.concat(skMatrixM44);

            const srcRect = canvasKit.XYWHRect(
              0,
              0,
              skImage.width(),
              skImage.height(),
            );
            const destRect = canvasKit.XYWHRect(
              anchorOffsetX,
              anchorOffsetY,
              sprite.width,
              sprite.height,
            );
            skCanvas.drawImageRect(skImage, srcRect, destRect, null);
            skCanvas.restore();
            skImage.delete();
          }
        }
      }
    }

    if (obj.children) {
      for (const child of obj.children) {
        processDisplayObject(child);
      }
    }
  };

  processDisplayObject(displayObject);
}

// Функция проверки попадания точки внутрь прямоугольника
function isPointInRect(x: number, y: number, rect: PIXI.Rectangle): boolean {
  return (
    x >= rect.x &&
    x <= rect.x + rect.width &&
    y >= rect.y &&
    y <= rect.y + rect.height
  );
}

export function setupInteractiveHandlers(skCanvasElement: HTMLCanvasElement) {
  skCanvasElement.addEventListener("pointerdown", onPointerDown);
  skCanvasElement.addEventListener("pointerup", onPointerUp);
}

function onPointerDown(e: PointerEvent) {
  const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  for (const { obj, bounds } of interactiveObjects) {
    if (bounds && isPointInRect(x, y, bounds)) {
      obj.emit && obj.emit("pointerdown", e);
    }
  }
}

function onPointerUp(e: PointerEvent) {
  const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  for (const { obj, bounds } of interactiveObjects) {
    if (bounds && isPointInRect(x, y, bounds)) {
      obj.emit && obj.emit("pointerup", e);
    }
  }
}
