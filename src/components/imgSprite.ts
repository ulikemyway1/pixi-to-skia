import * as PIXI from "pixi.js";

export function createImgSprite(
  src: string,
  options: { x: number; y: number },
): PIXI.Sprite {
  const sprite = PIXI.Sprite.from(src);
  sprite.x = options.x;
  sprite.y = options.y;
  sprite.anchor.set(0, 0);

  return sprite;
}
