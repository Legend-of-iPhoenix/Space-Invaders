# Code Documentation

## Table of Contents

 - [Code Documentation](#code-documentation)
    - [Table of Contents](#table-of-contents)
    - [Alien General Info](#alien-general-info)
        - [`x`](#alien-general-info)
        - [`y`](#alien-general-info)
        - [`deltaX`](#alien-general-info)
        - [`deltaY`](#alien-general-info)
        - [`sprite`](#alien-general-info)
        - [`size`](#alien-general-info)
        - [`padding`](#alien-general-info)
        - [`getScreenPos()`](#alien-general-info)
        - [`draw()`](#alien-general-info)
        - [`ondestroy()`](#alien-general-info)
        - [How aliens are stored](#how-aliens-are-stored)
    - [Bullet General Info](#bullet-general-info)
        - [`x`](#bullet-general-info)
        - [`y`](#bullet-general-info)
        - [`deltaX`](#bullet-general-info)
        - [`deltaY`](#bullet-general-info)
        - [`radius`](#bullet-general-info)
        - [`firedBy`](#bullet-general-info)
        - [`draw()`](#bullet-general-info)
        - [`checkCollision(x, y, width, height)`](#bullet-general-info)
        - [`oncreate()`](#bullet-general-info)
        - [`ondestroy()`](#bullet-general-info)
        - ["checkCollision" function](#checkcollision-function)
            - [`x`](#checkcollision-function)
            - [`y`](#checkcollision-function)
            - [`width`](#checkcollision-function)
            - [`height`](#checkcollision-function)
    - [General Functions](#general-functions)
        - [createAliens()](#createaliens)
        - [fillBackground(style)](#fillbackgroundstyle)
        - [tick()](#tick)
    - [Global Variables](#global-variables)
        - [`keysDown`](#global-variables)
        - [`aliens`](#global-variables)
        - [`enemyBullets`](#global-variables)
        - [`bullet`](#global-variables)
        - [`bulletSpeed`](#global-variables)
        - [`direction`](#global-variables)
        - [`speed`](#global-variables)
        - [`alienSpeedup`](#global-variables)
        - [`round`](#global-variables)
        - [`score`](#global-variables)
        - [`lives`](#global-variables)
        - [`playerPos`](#global-variables)
    - [ondestroy](#ondestroy)
    - [oncreate](#oncreate)

## Alien General Info

| Property         | Description                                                                                                                                                   | Type     |
|------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| `x`              | The x coordinate of the alien identifying which column it is in. Leftmost column = 0, rightmost column = 11.                                                  | Value    |
| `y`              | The y coordinate of the alien identifying which column it is in. Leftmost column = 0, rightmost column = 11.                                                  | Value    |
| `deltaX`         | How far left or right the alien is from its starting position on-screen.                                                                                      | Value    |
| `deltaY`         | How far up or down the alien is from its starting position on-screen.                                                                                         | Value    |
| `sprite`         | The sprite used by the alien. Currently just the color of the alien, will change in future update.                                                            | Value    |
| `size`           | Size of the sprite used by the alien. Default `[48,32]` (48 pixels wide, 32 tall)                                                                             | Value    |
| `padding`        | Number of pixels of padding around the alien. Default `8` (8 pixels on each side)                                                                             | Value    |
| `getScreenPos()` | Returns the alien's position on-screen.                                                                                                                       | Function |
| `draw()`         | Draws the alien.                                                                                                                                              | Function |
| `ondestroy()`    | Not meant to be called, supposed to be overwritten with code to be called right before the alien is destroyed. See section [ondestroy](#ondestroy) | Function |

### How aliens are stored

Aliens are stored by column. The `aliens` array has 11 sub-arrays (one for each column), each holding five aliens (one for each row).

If an alien is dead, its spot in the array is replaced with `null`. If the first or last columns of the array is empty (i.e. you killed all of the aliens in either of those columns), they are removed from the array.

Visualization (living aliens are represented by `X`'s and dead ones are represented with dots)

```
..xxxx.xxx.
...xx..xxx.
....x..xx..
....x...x..
....x......
```

is turned into

```
xxxx.xxx
.xx..xxx
..x..xx.
..x...x.
..x.....
```

because the last column and the first two columns were empty. The empty column in the middle is not removed because it is not "padding" the front or end of the array.

## Bullet General Info

| Property                              | Description                                                                                                                                                    | Type     |
|---------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| `x`                                   | The x coordinate of the bullet *on the screen*                                                                                                                 | Value    |
| `y`                                   | The y coordinate of the bullet *on the screen*                                                                                                                 | Value    |
| `deltaX`                              | The speed of the bullet in the x direction.                                                                                                                    | Value    |
| `deltaY`                              | The speed of the bullet in the y direction.                                                                                                                    | Value    |
| `radius`                              | The radius of the bullet. Used to draw the circle representing the bullet and to calculate collisions.                                                         | Value    |
| `firedBy`                             | `"player"` if bullet was fired by the player, `"alien"` (unused, todo) if bullet was fired by an alien.                                                        | Value    |
| `draw()`                              | Draws the bullet.                                                                                                                                              | Function |
| `checkCollision(x, y, width, height)` | See below.                                                                                                                                                     | Function |
| `oncreate()`                          | Not meant to be called, supposed to be overwritten with code to be called right after the bullet is created. See the [oncreate](#oncreate) section below.      | Function |
| `ondestroy()`                         | Not meant to be called, supposed to be overwritten with code to be called right before the bullet is destroyed. See the [ondestroy](#ondestroy) section below. | Function |

### "checkCollision" function

Used to check a collisions between a bullet and a rectangle. Takes 4 parameters:

| Parameter | Description                                                 |
|-----------|-------------------------------------------------------------|
| `x`       | The on-screen x value of the top-left corner of the target. |
| `y`       | The on-screen y value of the top-left corner of the target. |
| `width`   | The width of the target.                                    |
| `height`  | The height of the target.                                   |

Returns `true` if there is a collision between the bullet and the rectangle specified by the inputs, returns `false` otherwise.


Not my algorithm (from the source code):
```javascript
// algorithm from https://yal.cc/rectangle-circle-intersection-test/
// fantastic article, had exactly what I needed with no fluff
```

## General Functions

### `createAliens()`

Resets the `aliens` array, effectively creating the aliens and resetting the screen.

### `fillBackground(style)`

Fills the background with a certain style. The style is usually a color value (i.e. `"red"`, `"#ff0"`, `#7b291b`, `rgba(10, 10 10, 10)`, `hsl(270,60%,70%)`), but it can be any valid CSS `<color>` value. If that last bit doesn't make sense, just ignore it.

### `tick()`

Called every frame, handles practically everything.

## Global Variables
I can't be bothered to individually write documentation for each of these, so use this snippet from the source code:
```javascript
var keysDown = {}; // current keys held down on the keyboard

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
``` 

## ondestroy

Aliens and bullets have an event that is called right before they are destroyed: `ondestroy`

If you want to do something right before an alien or bullet is deleted (i.e. play an animation, etc), you should put it in this function.

## oncreate

Bullets (aliens do **not** have this event) have an event that is called right after they are created: `oncreate`

If you want to do something right after a bullet is created (i.e. play an animation, etc), you should put it in this function.