// URL to explain PHASER scene: https://rexrainbow.github.io/phaser3-rex-notes/docs/site/scene/

export default class Game extends Phaser.Scene {
  
  static totalScore = 0;
  static totalStars = 0;
  static currentLevel = 1;

  constructor() {
    super("game");
  }

  init() {
    this.score = Game.totalScore;
    this.starsCollected = Game.totalStars;
  }

  preload() {
    const maps = ["primermapa", "segundomapa", "tercermapa"];
    const mapName = maps[Game.currentLevel - 1];
    this.currentMapKey = `map${Game.currentLevel}`; 
    if (!mapName) {
      this.scene.start("victory"); 
    } else {
      this.load.tilemapTiledJSON(this.currentMapKey, `public/assets/tilemap/${mapName}.json`);
    }
    this.load.image("SampleA2", "public/assets/tilemap/SampleA2.png");
    this.load.image("star", "public/assets/star.png");
    this.load.image("exit", "public/assets/exit.png");
    this.load.spritesheet("dude", "./public/assets/dude.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
  }

  create() {
    const map = this.make.tilemap({ key: this.currentMapKey }); 

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
          this.goToNextLevel();
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

    this.starsText = this.add.text(16, 16, `⭐: ${this.starsCollected}`, {
      fontSize: "32px",
      fill: "#000",
    });
    this.starsText.setOrigin(0, 0); 
    this.starsText.setScrollFactor(0); 

   
    const resetButton = this.add.text(this.cameras.main.width - 16, 60, '🔄 Reset', {
      fontSize: '28px',
      fill: '#0077cc',
      backgroundColor: 'rgba(255,255,255,0)',
      padding: { left: 0, right: 0, top: 0, bottom: 0 }
    })
    .setOrigin(1, 0)
    .setScrollFactor(0)
    .setInteractive({ useHandCursor: true })
    .on('pointerdown', () => {
      Game.currentLevel = 1;
      Game.totalScore = 0;
      Game.totalStars = 0;
      this.scene.start("game"); 
    });

    
    this.input.keyboard.on('keydown-Ñ', () => {
      this.registry.set("totalScore", this.score);
      this.registry.set("totalStars", this.starsCollected);
      this.scene.start("victory");
    });
    this.input.keyboard.on('keydown-N', (event) => {
      if (event.key === 'ñ' || event.key === 'Ñ') {
        this.registry.set("totalScore", this.score);
        this.registry.set("totalStars", this.starsCollected);
        this.scene.start("victory");
      }
    });
    this.input.keyboard.on('keydown', (event) => {
      if (event.key === 'ñ' || event.key === 'Ñ') {
        this.registry.set("totalScore", this.score);
        this.registry.set("totalStars", this.starsCollected);
        this.scene.start("victory");
      }
    });
  }

  update() {
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-220);
      this.player.anims.play("left", true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(220);
      this.player.anims.play("right", true);
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play("turn");
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-220);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(220);
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
    this.starsCollected += 1;
    this.scoreText.setText(`Score: ${this.score}`);
    this.starsText.setText(`⭐: ${this.starsCollected}`);

    if (this.stars.countActive(true) === 0) {
      if (this.exit) {
        this.exit.setVisible(true);
      }
    }
  }

  goToNextLevel() {
    Game.totalScore = this.score;
    Game.totalStars = this.starsCollected;
    Game.currentLevel += 1;
    const maps = ["primermapa", "segundomapa", "tercermapa"];
    if (Game.currentLevel > maps.length) {
     
      this.registry.set("totalScore", this.score);
      this.registry.set("totalStars", this.starsCollected);
      this.scene.start("victory");
    } else {
      this.scene.restart();
    }
  }
}
