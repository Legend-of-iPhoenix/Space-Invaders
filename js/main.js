var canvas = document.querySelector("canvas");
var context = canvas.getContext('2d');

var scale = 5; // increase this if it seems blurry, decrease to give slight performance boost.

canvas.width = 192 * scale;
canvas.height = 160 * scale;

var keysDown = {};

context.translate(canvas.width / 2, canvas.height / 2); // center of canvas = (0, 0)
context.scale(5/scale, 5/scale) // canvas coords are x=0-196 and y=0-80, just like the real game. 

fillBackground("black");

var aliens = [];
var enemyBullets = [];
var bullet = null;

var firingCooldown = 100; // ms
var canFire = true;

var direction = -1; // start going left, towards -inf
var speed = 1;

var round = 1;
var score = 0;

var lives = 3;

var playerPos = 0;

function Bullet(x, y, deltaX, deltaY, radius) {
  this.x = x;
  this.y = y;
  this.deltaX = deltaX;
  this.deltaY = deltaY;
  this.radius = radius;
  this.draw = function () {
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
    x = x - width/2;
    y = y - height/2;
    return ((this.x - Math.max(x, Math.min(this.x, x + width))) ** 2) + ((this.y - Math.max(y, Math.min(this.y, y + height))) ** 2) < (this.radius ** 2);
  }
}

function Alien(x, y, sprite, size) {
  this.x = x;
  this.y = y;
  this.deltaX = 0;
  this.deltaY = 0;
  this.sprite = sprite;
  this.size = size || [48, 32]; // if size is specified, use it, otherwise use 32.
  this.padding = 8;
  this.getScreenPos = function() {
  	return {
  		x: ((this.x - 11/2) * (this.size[0] + this.padding * 2)) + this.deltaX,
  		y: ((this.y - 5) * (this.size[1] + this.padding * 2)) + this.deltaY
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
}


var rowColors = ["red", "orange", "green", "blue", "purple"] // pretty arbitrary
// create the aliens.

for (var i = 0; i < 11; i++) {
  aliens.push([]); // new column
  for (var j = 0; j < 5; j++) {
    var index = aliens[aliens.length - 1].push(new Alien(i, j, rowColors[j], [48, 32]));
    aliens[aliens.length - 1][index - 1].draw();
  }
}

function tick() { // makes the game "tick"
  aliens = aliens.map(col => {
    col = col.map(alien => {
      if (alien) {
        alien.deltaX += direction * speed;
        var hit = false;
        if (bullet) {
        	var pos = alien.getScreenPos();
          if (bullet.checkCollision(pos.x, pos.y, alien.size[0], alien.size[1])) { // if a bullet collided with an alien
            score += 5 * round; // increase the score
            bullet = null; // delete bullet
            return null // delete alien
          }
        }
        return alien
      }
    });
    return col
  });

  // clean the array, removing empty cols from the edges.

  while (aliens[aliens.length - 1].find(x=>x) === undefined) {
    aliens.pop(); // remove last
  }

  while (aliens[0].find(x=>x) === undefined) {
    aliens.shift(); // remove first element
  }

  if (aliens.length) {
    fillBackground("black"); // clear screen
    if (Math.max(Math.abs(aliens[0].find(alien => alien).getScreenPos().x), Math.abs(aliens[aliens.length - 1].find(alien => alien).getScreenPos().x)) >= 90*scale) {
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
  		bullet = null;
  	} else {
  		bullet.draw()
  	}
  }

  if (keysDown['ArrowLeft']) {
  	playerPos -= 3;
  }
  if (keysDown['ArrowRight']) {
  	playerPos += 3;
  }

	var img = document.getElementById("ship1");
	context.drawImage(img, playerPos, 300, 5*16, 5*16)

  window.requestAnimationFrame(tick);
}

window.onkeydown = function(event) {
	keysDown[event.key] = true;
	var key = event.key;
	if (key == " " && !bullet) { // if we pressed space and there isn't a bullet being rendered.
		bullet = new Bullet(playerPos + 8 * scale, 300 - 5*7, 0, -4, 5);
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
  context.setTransform(1, 0, 0, 1, 0, 0); // simple transformation matrix, just reset everything.
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.restore();
}