var game = new Phaser.Game(
  window.innerWidth - 25,
  window.innerHeight - 25,
  Phaser.CANVAS,
  "phaser-multiplayer-socketio",
  { preload: preload, create: create, update: update, render: render }
);

function preload() {
  game.load.image("bullet", "assets/shmup-bullet.png");
  game.load.image("ship", "assets/thrust_ship.png");
  game.load.image("background", "assets/tests/debug-grid-1920x1920.png");
  game.stage.disableVisibilityChange = true;
}
var sprite;
var ships = {};
var weapon;
var cursors;
var fireButton;
var socket;
var gameInitialized = false;

function emitPlayerShip() {
  socket.emit("shipStatus", {
    id: socket.id,
    x: sprite.x,
    y: sprite.y,
    angle: sprite.angle,
    angularVelocity: sprite.body.angularVelocity,
    acceleration: sprite.body.acceleration,
    fire: fireButton.isDown
  });
}

function renderShip(key) {
  let ship = game.add.sprite(400, 300, "ship");

  ship.anchor.set(0.5);

  ship.scale.set(2, 2);

  game.physics.arcade.enable(ship);

  //sprite.body.drag.set(35);
  ship.body.maxVelocity.set(300);
  weaponEne = game.add.weapon(30, "bullet");

  //  The bullets will be automatically killed when they are 2000ms old
  weaponEne.bulletKillType = Phaser.Weapon.KILL_LIFESPAN;
  weaponEne.bulletLifespan = 2000;

  //  The speed at which the bullet is fired
  weaponEne.bulletSpeed = 600;

  //  Speed-up the rate of fire, allowing them to shoot 1 bullet every 60ms
  weaponEne.fireRate = 100;

  //  Wrap bullets around the world bounds to the opposite side
  weaponEne.bulletWorldWrap = false;
  weaponEne.trackSprite(ship, 0, 0, true);

  ship.weapon = weaponEne;
  //  Tell the Weapon to track the 'player' Sprite
  ships[key] = ship;

  return ship;
}

function create() {
  socket = io("http://localhost:5000");

  game.add.tileSprite(0, 0, 4920, 4920, "background");

  game.world.setBounds(0, 0, 4920, 4920);

  //  Creates 30 bullets, using the 'bullet'  graphic
  weapon = game.add.weapon(30, "bullet");

  //  The bullets will be automatically killed when they are 2000ms old
  weapon.bulletKillType = Phaser.Weapon.KILL_LIFESPAN;
  weapon.bulletLifespan = 2000;

  //  The speed at which the bullet is fired
  weapon.bulletSpeed = 600;

  //  Speed-up the rate of fire, allowing them to shoot 1 bullet every 60ms
  weapon.fireRate = 100;

  //  Wrap bullets around the world bounds to the opposite side
  weapon.bulletWorldWrap = false;

  sprite = this.add.sprite(400, 300, "ship");

  sprite.anchor.set(0.5);

  sprite.scale.set(2, 2);

  game.camera.follow(sprite);

  game.physics.arcade.enable(sprite);

  //sprite.body.drag.set(35);
  sprite.body.maxVelocity.set(300);

  //  Tell the Weapon to track the 'player' Sprite
  //  With no offsets from the position
  //  But the 'true' argument tells the weapon to track sprite rotation
  weapon.trackSprite(sprite, 0, 0, true);

  cursors = this.input.keyboard.createCursorKeys();

  fireButton = this.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);

  setInterval(emitPlayerShip, 1);

  gameInitialized = true;

  socket.on("gameState", data => {
    for (key in data.status) {
      if (key != undefined && key != null && data.status[key].id != socket.id) {
        //console.log(data.status[key])
        if (!ships[key]) {
          renderShip(key);
        }
        let playerShip = data.status[key];
        ships[key].x = playerShip.x;
        ships[key].y = playerShip.y;
        ships[key].angle = playerShip.angle;
        ships[key].body.angularVelocity = playerShip.angularVelocity;
        ships[key].body.acceleration = playerShip.acceleration;
        if (playerShip.fire) {
          ships[key].weapon.fire();
        }
      }
    }
  });
}

function update() {
  if (gameInitialized) {
    if (cursors.up.isDown) {
      game.physics.arcade.accelerationFromRotation(
        sprite.rotation,
        900,
        sprite.body.acceleration
      );
      masterId = socket.id;
    } else {
      sprite.body.acceleration.set(0);
    }

    if (cursors.left.isDown) {
      masterId = socket.id;
      sprite.body.angularVelocity = -300;
    } else if (cursors.right.isDown) {
      masterId = socket.id;
      sprite.body.angularVelocity = 300;
    } else {
      sprite.body.angularVelocity = 0;
    }

    if (fireButton.isDown) {
      weapon.fire();
    }

    game.world.wrap(sprite, 16);
  }
}

function render() {
  if (gameInitialized) {
    game.debug.spriteInfo(sprite, 32, 32);
  }
}
