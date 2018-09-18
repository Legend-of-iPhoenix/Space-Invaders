var canvas = document.querySelector("canvas");
var context = canvas.getContext('2d');

context.translate(canvas.width / 2, canvas.height / 2); // center of canvas = (0, 0)
context.scale(.2, .2) // canvas coords are x=0-196 and y=0-80, just like the real game. 

fillBackground("black");

var aliens = [];
var enemyBullets = [];
var bullets = [];

var bulletLimit = 4;

var direction = -1; // start going left, towards -inf
var speed = 1;

var round = 0;
var score = 0;

var lives = 3;

var playerPos = 0;

function Bullet(x, y, deltaX, deltaY, radius, damage) {
  this.x = x;
  this.y = y;
  this.deltaX = deltaX;
  this.deltaY = deltaY;
  this.radius = radius;
  this.damage = damage;
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
    return ((this.x - Math.max(x, Math.min(this.x, x + width))) ** 2) + ((this.y - Math.max(y, Math.min(this.y, y + height))) ** 2) < (this.radius ** 2);
  }
}

function Alien(x, y, sprite, size) {
  this.x = x;
  this.y = y;
  this.sprite = sprite;
  this.size = size || [48, 32]; // if size is specified, use it, otherwise use 32.
  this.draw = function () { /* todo: when sprites are done, make this use spritesheet(s) */
    context.fillStyle = this.sprite;
    var size = this.size,
      x = this.x,
      y = this.y;
    context.fillRect(x - size[0] / 2, y - size[1] / 2, size[0], size[1]); // fill a rectangle around the center of the sprite.
  }
}


var rowColors = ["red", "orange", "green", "blue", "purple"] // pretty arbitrary
// create the aliens.

for (var i = 0; i < 11; i++) {
  aliens.push([]); // new column
  for (var j = 0; j < 5; j++) {
    var index = aliens[aliens.length - 1].push(new Alien(i * 64 - 352, j * 48 - 220, rowColors[j], [48, 32])); // 352 and 220 are constants for centering.
    aliens[aliens.length - 1][index - 1].draw();
  }
}

function tick() { // makes the game "tick"
  aliens = aliens.map(col => {
    col = col.map(alien => {
      if (alien) {
        alien.x += direction * speed;
        var hit = false;
        bullets = bullets.map(bullet => {
          if (bullet.checkCollision(alien.x, alien.y, alien.size[0], alien.size[1])) { // if a bullet collided with an alien
            score += 5 * round; // increase the score
            hit = true;
            return null; // delete bullet
          }
          return bullet
        }).filter(bullet => bullet); // remove deleted values.
        if (hit) {
          return null
        }
        return alien
      }
    });
    return col
  });

  // clean the array, removing empty cols from the edges.

  while (aliens[aliens.length - 1] === null) {
    aliens.pop(); // remove last
  }

  while (aliens[0] === null) {
    aliens.shift(); // remove first element
  }

  if (aliens.length) {
    fillBackground("black"); // clear screen
    if (Math.max(Math.abs(aliens[0].find(alien => alien).x), Math.abs(aliens[aliens.length - 1].find(alien => alien).x)) >= 700) {
      direction *= -1 // flip direction
      aliens = aliens.map(col => { // shift down the aliens
        col.map(alien => {
          if (alien) {
            alien.y += 5
          }
          return alien;
        });
        return col
      });
    }
    aliens.map(col => col.map(alien => alien && alien.draw())) // bit of a hack, if alien is false/false-y (aka null), the interpreter won't execute alien.draw
  }
  bullets.map(bullet=>bullet.draw())
  drawPlayer()
}

function drawPlayer() {
	var img = document.getElementById("ship1");
	context.drawImage(img, playerPos, 300, 5*16, 5*16)
}

window.onkeydown = function(event) {
	var key = event.key;
	if (key) {
		if (key == "ArrowLeft") { // user pressed left
			playerPos -= 5
			drawPlayer();
		}
		if (key == "ArrowRight") { // user pressed right
			playerPos += 5
			drawPlayer();
		}
		if (key == " " && bullets.length < bulletLimit) {
			bullets.push(new Bullet(playerPos, 300 - 5*7, 0, -2, 5))
		}
	}
}

setInterval(tick,0)

// helper functions vv
function fillBackground(style) {
  context.fillStyle = style;
  context.save();
  context.setTransform(1, 0, 0, 1, 0, 0); // simple transformation matrix, just reset everything.
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.restore();
}

/*
  Unused, but could be helpful.
*/
function toRadians(degrees) {
  return degrees * Math.PI / 180;
}