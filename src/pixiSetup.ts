import * as PIXI from 'pixi.js';

/**
 * Создаёт Pixi-приложение, привязанное к canvas #pixi-canvas
 */
export function createPixiApp(canvasId: string): PIXI.Application {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
  if (!canvas) {
    throw new Error(`Canvas #${canvasId} not found`);
  }
  const app = new PIXI.Application({
    width: canvas.width,
    height: canvas.height,
    view: canvas,
    backgroundColor: 0x1099bb
  });
  return app;
}

export function createMainContainer(): PIXI.Container {
  const container = new PIXI.Container();

  const g4 = new PIXI.Graphics()
 
   g4.lineStyle(10, '#ffff00', 1)

     .moveTo(0, 70).lineTo(150, 30)

   g4.angle = 0;

  // Добавим несколько красных эллипсов
  for (let i = 0; i < 3; i++) {
    const g = new PIXI.Graphics();
    g.beginFill(0xff0000);
    g.drawEllipse(0, 0, 50 + Math.random() * 30, 25 + Math.random() * 20);
    g.endFill();
    g.x = 100 + i * 100;
    g.y = 100 + Math.random() * 50;
    g.angle = Math.random() * 180;
    container.addChild(g);
  }

const button = new PIXI.Graphics();
button.beginFill(0x5498db);
button.drawRect(100,10,200,50);
button.endFill();
button.x = 0;
button.y = 0;

button.interactive = true;
button.on('pointerdown', () => {
    console.log(`Knopochka vjata`);
  });

  button.on('pointerup', () => {
    console.log(`Knopochka otjata`);
    addRandomFigure(container);
  });

  button.on('pointerenter', () => {
    button.tint = 0x2980b9;
  });

  button.on('pointerout', () => {
    button.tint = 0xFFFFFF;
  });

  const text = new PIXI.Text('Add figure', {
    fontFamily: 'Arial',
    fontSize: 16,
    fill: 0xffffff,
    align: 'center',
  });
  
  text.x = 170;
  text.y = 25;


const sprite = PIXI.Sprite.from('/img/cat.jpeg');


sprite.x = 80;
sprite.y = 100;
sprite.anchor.set(0, 0);
container.addChild(sprite);

container.addChild(button);
button.addChild(text);

  return container;
}

/**
 * Функция добавляет случайную фигуру в контейнер.
 */
export function addRandomFigure(container: PIXI.Container) {
    const g = new PIXI.Graphics();
    g.beginFill({ r: Math.random() *255, g: Math.random() *255, b: Math.random() *255, a: Math.random() });
    g.drawRect(0,0,Math.floor(Math.random() *70),Math.floor(Math.random() *70));
    g.endFill();
    g.x = Math.floor(Math.random() * 600);
    g.y = Math.floor(Math.random() * 600);;
    container.addChild(g);

}
