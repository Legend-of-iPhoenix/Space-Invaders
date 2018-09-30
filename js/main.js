var canvas = document.querySelector("canvas");
var context = canvas.getContext('2d');

var scale = 5; // increase this if it seems blurry, decrease to give slight performance boost.

canvas.width = 192 * scale;
canvas.height = 160 * scale;

var keysDown = {}; // current keys held down on the keyboard

context.translate(canvas.width / 2, canvas.height / 2); // center of canvas = (0, 0)
context.scale(5 / scale, 5 / scale) // canvas coords are x=0-196 and y=0-80, just like the real game. 

fillBackground("black");

var aliens = []; // holds the aliens. Check docs for more info.
var enemyBullets = []; // will eventually hold bullets fired by aliens
var bullet = null; // holds bullet fired by player
var bulletSpeed = 6; // speed of bullet

var direction = -1; // start going left, towards -inf
var speed = 1; // alien speed
var alienSpeedup = .5; // added to speed every round.

var round = 1; // unused, will be incremented when aliens redraw
var score = 0; // current score.

var lives = 3; // unused, will hold lives

var playerPos = 0; // position of player

function Bullet(x, y, deltaX, deltaY, radius, firedBy) {
  this.x = x;
  this.y = y;
  this.deltaX = deltaX;
  this.deltaY = deltaY;
  this.radius = radius;
  this.firedBy = firedBy;

  this.draw = function () { // draws the bullet
    context.fillStyle = "white";
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI)
    context.fill();
    context.closePath();

    // while we draw it, we might as well handle movement.
    this.x += this.deltaX;
    this.y += this.deltaY;
  }

  this.checkCollision = function (x, y, width, height) {
    // algorithm from https://yal.cc/rectangle-circle-intersection-test/
    // fantastic article, had exactly what I needed with no fluff
    x = x - width / 2; // center the x value to be in the middle.
    y = y - height / 2; // center the y value to be in the middle.
    return ((this.x - Math.max(x, Math.min(this.x, x + width))) ** 2) + ((this.y - Math.max(y, Math.min(this.y, y + height))) ** 2) < (this.radius ** 2);
  }

  this.ondestroy = function () { // called right before bullet is destroyed

  }

  this.oncreate = function () { // called right after bullet is created

  }

  this.oncreate();
}

function Alien(x, y, sprite, size) {
  this.x = x;
  this.y = y;
  this.deltaX = 0;
  this.deltaY = 0;
  this.sprite = sprite;
  this.size = size || [48, 32]; // if size is specified, use it, otherwise use 32.
  this.padding = 8;
  this.getScreenPos = function () { // converts our coordinate system into actual, honest to goodness, screen coords.
    return {
      x: ((this.x - 11 / 2) * (this.size[0] + this.padding * 2)) + this.deltaX, // 11 = num aliens per row
      y: ((this.y - 5) * (this.size[1] + this.padding * 2)) + this.deltaY // 5 = magic number that makes everything look nice. We'll pretend it has significance, though.
    }
  }
  this.draw = function () { /* todo: when sprites are done, make this use spritesheet(s) */
    context.fillStyle = this.sprite;
    var pos = this.getScreenPos();
    var size = this.size,
      x = pos.x,
      y = pos.y;
    context.fillRect(x - size[0] / 2, y - size[1] / 2, size[0], size[1]); // fill a rectangle around the center of the sprite.
  }

  this.ondestroy = function () { // called right before alien gets destroyed

  }
}


var rowColors = ["red", "orange", "green", "blue", "purple"] // pretty arbitrary
// create the aliens.
function createAliens() { // wrap it as a function because we'll use it later to reset the board.
  for (var i = 0; i < 11; i++) {
    aliens.push([]); // new column
    for (var j = 0; j < 5; j++) {
      var index = aliens[aliens.length - 1].push(new Alien(i, j, rowColors[j], [48, 32]));
      aliens[aliens.length - 1][index - 1].draw();
    }
  }
}
createAliens();

function tick() { // makes the game "tick"
  aliens = aliens.map(col => {
    col = col.map(alien => {
      if (alien) {
        alien.deltaX += direction * speed;
        if (bullet) {
          var pos = alien.getScreenPos();
          if (bullet.checkCollision(pos.x, pos.y, alien.size[0], alien.size[1])) { // if a bullet collided with an alien
            score += 5 * round; // increase the score
            bullet.ondestroy();
            bullet = null; // delete bullet
            alien.ondestroy();
            return null // delete alien
          }
        }
        return alien
      }
    });
    return col
  });

  // clean the array, removing empty cols from the edges.
  while (aliens.length && aliens[aliens.length - 1].find(x => x) === undefined) {
    aliens.pop(); // remove last
  }

  while (aliens.length && aliens[0].find(x => x) === undefined) {
    aliens.shift(); // remove first element
  }

  if (!aliens.length) { // if aliens all died, increment the round counter and speed counter 
    createAliens();
    direction = -1;
    speed += alienSpeedup;
    round++;
    playerPos = 0;
  }

  if (aliens.length) {
    fillBackground("black"); // clear screen
    if (Math.max(Math.abs(aliens[0].find(alien => alien).getScreenPos().x), Math.abs(aliens[aliens.length - 1].find(alien => alien).getScreenPos().x)) >= 90 * scale) {
      direction *= -1 // flip direction
      aliens = aliens.map(col => { // shift down the aliens
        col.map(alien => {
          if (alien) {
            alien.deltaY += 5
          }
          return alien;
        });
        return col
      });
    }
    aliens.map(col => col.map(alien => alien && alien.draw())) // bit of a hack, if alien is false/false-y (aka null), the interpreter won't execute alien.draw
  }

  if (bullet) {
    if (Math.abs(bullet.y) > 400) {
      bullet.ondestroy();
      bullet = null;
    } else {
      bullet.draw()
    }
  }

  if (keysDown['ArrowLeft'] || keysDown["A"]) {
    playerPos -= 3;
  }

  if (keysDown['ArrowRight'] || keysDown["D"]) {
    playerPos += 3;
  }

  var img = document.getElementById("ship1");
  context.drawImage(img, playerPos, 300, 5 * 16, 5 * 16)

  window.requestAnimationFrame(tick);
}

window.onkeydown = function (event) {
  event.key = event.key[0].toUpperCase() + event.key.substring(1) // make first char uppercase, doesn't affect (say) "ArrowLeft", but makes 'a' and 'A' equivalent
  keysDown[event.key] = true;
  var key = event.key;
  if (key == " " && !bullet) { // if we pressed space and there isn't a bullet being rendered.
    bullet = new Bullet(playerPos + 8 * scale, 300 - 5 * 7, 0, -bulletSpeed, 5, "player");
  }
}

window.onkeyup = function (event) {
  keysDown[event.key] = false;
}

window.requestAnimationFrame(tick);

// helper functions vv
function fillBackground(style) {
  context.fillStyle = style;
  context.save();
  context.setTransform(1, 0, 0, 1, 0, 0); // simple transformation matrix, just reset everything. If it makes no sense, ignore this line.
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.restore();
}