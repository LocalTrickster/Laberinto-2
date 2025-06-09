// URL to explain PHASER scene: https://rexrainbow.github.io/phaser3-rex-notes/docs/site/scene/

export default class Game extends Phaser.Scene {
  constructor() {
    super("game");
  }

  init() {
    this.score = 0;
  }

  preload() {
    this.load.tilemapTiledJSON("map", "public/assets/tilemap/primermapa.json");
    this.load.image("SampleA2", "public/assets/tilemap/SampleA2.png");
    this.load.image("star", "public/assets/star.png");
    this.load.image("exit", "public/assets/exit.png");
    this.load.spritesheet("dude", "./public/assets/dude.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
  }

  create() {
    const map = this.make.tilemap({ key: "map" });
   
    const tileset = map.addTilesetImage("SampleA2", "SampleA2", 32, 32, 0, 0);
    const belowLayer = map.createLayer("Fondo", tileset, 0, 0);
    const platformLayer = map.createLayer("Plataformas", tileset, 0, 0);
    const objectsLayer = map.getObjectLayer("Objetos");

    
    const spawnPoint = map.findObject(
      "Objetos",
      (obj) => obj.name === "player"
    );
    console.log("spawnPoint", spawnPoint);

    this.player = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, "dude");

    this.player.setBounce(0.2);
    

    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "turn",
      frames: [{ key: "dude", frame: 4 }],
      frameRate: 20,
    });

    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    platformLayer.setCollision([71, 4]); 
    this.physics.add.collider(this.player, platformLayer);
   
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    
    this.stars = this.physics.add.group();
    let exitPoint = null;

   
    objectsLayer.objects.forEach((objData) => {
      const { x = 0, y = 0, type, name } = objData;
      if (type === "star") {
        const star = this.stars.create(x, y, "star");
        star.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
      }
      if (name === "salida") {
        exitPoint = objData;
      }
    });

    
    if (exitPoint) {
      this.exit = this.physics.add.staticImage(exitPoint.x, exitPoint.y, "exit");
      this.exit.setVisible(false); 
      this.physics.add.overlap(this.player, this.exit, () => {
        if (this.exit.visible) {
          
          this.scene.restart(); 
        }
      });
    }

   
    this.physics.add.collider(
      this.player,
      this.stars,
      this.collectStar,
      null,
      this
    );
    
    this.physics.add.collider(this.stars, platformLayer);

    this.scoreText = this.add.text(0, 0, `Score: ${this.score}`, {
      fontSize: "32px",
      fill: "#000",
    });
    this.scoreText.setOrigin(1, 0); 
    this.scoreText.setScrollFactor(0); 
    this.scoreText.setPosition(this.cameras.main.width - 16, 16);
  }

  update() {
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
      this.player.anims.play("left", true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
      this.player.anims.play("right", true);
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play("turn");
    }

   
    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-160);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(160);
    } else {
      this.player.setVelocityY(0);
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyR)) {
      this.scene.restart();
    }
  }

  collectStar(player, star) {
    star.disableBody(true, true);
    this.score += 10;
    this.scoreText.setText(`Score: ${this.score}`);

    if (this.stars.countActive(true) === 0) {
      
      if (this.exit) {
        this.exit.setVisible(true);
      }
    }
  }
}
