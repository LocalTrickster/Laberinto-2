export default class Victory extends Phaser.Scene {
  constructor() {
    super("victory");
  }

  preload() {
    this.load.image("victoryImage", "public/assets/victory.jpg");
  }

  create() {
    const { width, height } = this.sys.game.canvas;
    this.add.image(width / 2, height / 2, "victoryImage").setOrigin(0.5, 0.5);

    this.add.text(width / 2, height - 80, "¡Felicidades! Has ganado.", {
      fontSize: "40px",
      fill: "#fff",
      stroke: "#000",
      strokeThickness: 6,
    }).setOrigin(0.5, 0.5);

    // Score y estrellas en la parte inferior centrados
    this.add.text(width / 2, height - 32, 
      `⭐: ${this.registry.get("totalStars") || 0}   Score: ${this.registry.get("totalScore") || 0}`, 
      {
        fontSize: "32px",
        fill: "#fff",
        stroke: "#000",
        strokeThickness: 4,
      }
    ).setOrigin(0.5, 1);
  }
}