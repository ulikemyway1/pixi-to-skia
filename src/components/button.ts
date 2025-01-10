import * as PIXI from "pixi.js";

export function createButton(
  buttonText: string,
  callback: () => void,
): PIXI.Graphics {
  const button = new PIXI.Graphics();
  button.beginFill(0x5498db);
  button.drawRect(100, 10, 200, 50);
  button.endFill();
  button.x = 0;
  button.y = 0;

  button.interactive = true;
  button.on("pointerdown", () => {
    console.log(`Knopochka vjata`);
  });

  button.on("pointerup", () => {
    console.log(`Knopochka otjata`);
    callback();
  });

  button.on("pointerenter", () => {
    button.tint = 0x2980b9;
  });

  button.on("pointerout", () => {
    button.tint = 0xffffff;
  });

  const text = new PIXI.Text(buttonText, {
    fontFamily: "Arial",
    fontSize: 16,
    fill: 0xffffff,
    align: "center",
  });

  text.x = 170;
  text.y = 25;

  button.addChild(text);

  return button;
}
