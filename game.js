var game = new Phaser.Game(
  window.innerWidth - 25,
  600,
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
var weapon;
var cursors;
var fireButton;
var socket;
var masterId;

function create() {
  socket = io("http://localhost:5000");

  socket.on("ship", data => {
    if (masterId != socket.id) {
      console.log(data);
      sprite.x = data.x;
      sprite.y = data.y;
      sprite.body.angularVelocity = data.angularVelocity;
      sprite.angle = data.angle;
      sprite.body.acceleration.set(data.acceleration);
      sprite.body.velocity = data.velocity;

      if (data.fire) {
        weapon.fire();
      }
    }
  });

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

  masterId = socket.id;

  setInterval(emitShipSocket, 1);
}

function emitShipSocket() {
  if (!masterId) return;
  socket.emit("ship", {
    id: socket.id,
    x: sprite.x,
    y: sprite.y,
    angularVelocity: sprite.body.angularVelocity,
    angle: sprite.angle,
    acceleration: sprite.body.acceleration,
    velocity: sprite.body.velocity,
    fire: fireButton.isDown
  });
}

function update() {
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
    masterId = socket.id;
    weapon.fire();
    //socket.emit("fire", socket.id);
  }

  game.world.wrap(sprite, 16);
}

function render() {
  weapon.debug();
  game.debug.spriteInfo(sprite, 32, 32);
}
