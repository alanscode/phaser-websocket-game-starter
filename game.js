var game = new Phaser.Game(
  window.innerWidth,
  600,
  Phaser.CANVAS,
  "phaser-example",
  { preload: preload, create: create, update: update, render: render }
);

function preload() {
  game.load.image("bullet", "assets/shmup-bullet.png");
  game.load.image("ship", "assets/thrust_ship.png");
  game.stage.disableVisibilityChange = true;
}

var sprite;
var weapon;
var cursors;
var fireButton;
var socket;
var masterId = null;
function create() {
  socket = io("http://localhost:3000");

  socket.on("ship", data => {
    if (masterId != socket.id) {
      console.log(data)
      sprite.x = data.x;
      sprite.y = data.y;
      sprite.body.angularVelocity = data.angularVelocity;
      sprite.angle = data.angle;
      sprite.body.acceleration.set(data.acceleration);
      sprite.body.velocity = data.velocity;
    }
  });

  socket.on("fire", data => {
    if (masterId != socket.id) {
      weapon.fire();
    }
  });
  //  Creates 30 bullets, using the 'bullet' graphic
  weapon = game.add.weapon(30, "bullet");

  //  The bullets will be automatically killed when they are 2000ms old
  weapon.bulletKillType = Phaser.Weapon.KILL_LIFESPAN;
  weapon.bulletLifespan = 2000;

  //  The speed at which the bullet is fired
  weapon.bulletSpeed = 600;

  //  Speed-up the rate of fire, allowing them to shoot 1 bullet every 60ms
  weapon.fireRate = 100;

  //  Wrap bullets around the world bounds to the opposite side
  weapon.bulletWorldWrap = true;

  sprite = this.add.sprite(400, 300, "ship");

  sprite.anchor.set(0.5);

  game.physics.arcade.enable(sprite);

  //sprite.body.drag.set(70);
  sprite.body.maxVelocity.set(200);

  //  Tell the Weapon to track the 'player' Sprite
  //  With no offsets from the position
  //  But the 'true' argument tells the weapon to track sprite rotation
  weapon.trackSprite(sprite, 0, 0, true);

  cursors = this.input.keyboard.createCursorKeys();

  fireButton = this.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);

  setInterval(emitShipSocket,1)
}

function emitShipSocket() {
   if (masterId == null) return
  socket.emit("ship", {
    id: socket.id,
    x: sprite.x,
    y: sprite.y,
    angularVelocity: sprite.body.angularVelocity,
    angle: sprite.angle,
    acceleration: sprite.body.acceleration,
    velocity: sprite.body.velocity
  });
}

function update() {
  if (cursors.up.isDown) {
    game.physics.arcade.accelerationFromRotation(
      sprite.rotation,
      300,
      sprite.body.acceleration
    );
    masterId = socket.id;
    //emitShipSocket();
  } else {
    sprite.body.acceleration.set(0);
  }

  if (cursors.left.isDown) {
    sprite.body.angularVelocity = -300;
    //emitShipSocket();
  } else if (cursors.right.isDown) {
    sprite.body.angularVelocity = 300;
    //emitShipSocket();
  } else {
    sprite.body.angularVelocity = 0;   
  }

  if (fireButton.isDown) {
    masterId = socket.id;
    weapon.fire();
    socket.emit("fire", socket.id);
  }

  game.world.wrap(sprite, 16);
  
}

function render() {
  weapon.debug();
}
