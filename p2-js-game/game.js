window.addEventListener('load', function() {
const canvas = document.getElementById('canvas-game');
const ctx = canvas.getContext('2d');
canvas.width = 1000;
canvas.height = 500;

class InputHandler {
  constructor(game) {
    this.game = game;
    // for monitoring key pressed events
    window.addEventListener('keydown', event => {
      if((  (event.key === 'ArrowUp') ||
            (event.key === 'ArrowDown') ||
            (event.key === 'ArrowRight') ||
            (event.key === 'ArrowLeft')
      ) && this.game.keys.indexOf(event.key) === -1) {
          this.game.keys.push(event.key);
          //(" ") space bar key event for shooting enemies
      } else if(event.key === ' ') { 
          this.game.player.shootTop();
          //press "d" to toggle for debugging
      } else if(event.key === 'd') { //
          this.game.debug = !this.game.debug;
      }
    });
    window.addEventListener('keyup', event => {
      if(this.game.keys.indexOf(event.key) > -1) {
        this.game.keys.splice(this.game.keys.indexOf(event.key), 1);
      }
    });
  }
}
class Projectile {
  constructor(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.width = 10;
    this.height = 3;
    this.speed = 3;
    this.markedForDeletion = false;
    this.image = document.getElementById('projectile');
  }
  update() {
    this.x += this.speed;
    if(this.x > this.game.width * 0.8) this.markedForDeletion = true;
  }
  draw(context) {
    context.drawImage(this.image, this.x, this.y);
  }
}
class Player {
  constructor(game) {
    this.game = game;
    this.width = 165;
    this.height = 100;
    this.x = 20;
    this.y = 100;
    this.frameX = 0; //sprite
    this.frameY = 0; //sprite
    this.maxFrame = 2;
    this.speedY = 1; //movement of player Up or down
    this.speedX = 1; //movement of player Right or Left
    this.maxSpeed = 3;
    this.projectiles = [];
    this.image = document.getElementById('player');
    this.powerUp = false;
    this.powerUpTimer = 0;
    this.powerUpLimit = 10000; //10 seconds powerUp last
  }
  update(deltaTime){
    if(this.game.keys.includes('ArrowUp')) this.speedY = -this.maxSpeed;
    else if(this.game.keys.includes('ArrowDown')) this.speedY = this.maxSpeed;
    else if(this.game.keys.includes('ArrowRight')) this.speedX = this.maxSpeed;
    else if(this.game.keys.includes('ArrowLeft')) this.speedX = -this.maxSpeed;
    else {
      this.speedY = 0;
      this.speedX = 0;
    }
    this.y += this.speedY;
    this.x += this.speedX;
    // vertical boundaries
    if(this.y > this.game.height - this.height * 0.5) this.y = this.game.height - this.height * 0.5;
    else if (this.y < -this.height * 0.5) this.y = -this.height * 0.5;
    // horizontal boundaries
    if(this.x > this.game.width - this.width * 0.5) this.x = this.game.width - this.width * 0.5;
    else if (this.x < -this.width * 0.5) this.x = -this.width * 0.5;
    //handle projectiles
    this.projectiles.forEach(projectile => {
      projectile.update();
    });
    this.projectiles = this.projectiles.filter(projectile => !projectile.markedForDeletion);
    // sprite animation
    if(this.frameX < this.maxFrame){
      this.frameX++;
    } else {
      this.frameX = 0;
    }
    // power up
    if(this.powerUp){
      if(this.powerUpTimer > this.powerUpLimit) {
        this.powerUpTimer = 0;
        this.powerUp = false;
      } else {
        this.powerUpTimer += deltaTime;
        this.game.ammo += 0.1;
      }
    }
  }
  draw(context){
    if(this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
    this.projectiles.forEach(projectile => {
      projectile.draw(context);
    });
    context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height);
  }
  shootTop() {
    if(this.game.ammo > 0) {
      this.projectiles.push(new Projectile(this.game, this.x + 80, this.y + 60));
      this.game.ammo--;
    }
    if(this.powerUp) this.shootBottom();
  }
  shootBottom() {
    if(this.game.ammo > 0) {
      this.projectiles.push(new Projectile(this.game, this.x + 80, this.y + 70));
    }
  }
  enterPowerUp() {
    this.powerTimer = 0;
    this.powerUp = true;
    if(this.game.ammo < this.game.maxAmmo) this.game.ammo = this.game.maxAmmo;
  }
}
class Enemy {
  constructor(game) {
    this.game = game;
    this.x = this.game.width
    this.speedX = Math.random() * -1.5 -0.5;
    this.markedForDeletion = false;
    this.frameX = 0;
    this.frameY = 0;
    this.maxFrame = 3;
  }
  update() {
    this.x += this.speedX - this.game.speed;
    if(this.x + this.width < 0) this.markedForDeletion = true;
    if(this.frameX < this.maxFrame){
      this.frameX++;
    } else this.frameX = 0;
  }
  draw(context) {
    if(this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
    context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height);
    if(this.game.debug) {
      context.font = '20px Arial';
      context.fillText(this.lives, this.x, this.y);
    }
  }
}
  class Monster extends Enemy {
    constructor(game) {
      super(game);
      this.width = 109;
      this.height = 88;
      this.y = Math.random() * (this.game.height * 0.95 - this.height);
      this.image = document.getElementById('monster');
      this.lives = 5;
      this.score = this.lives;
    }
  }
  class EnergyPower extends Enemy {
    constructor(game) {
      super(game);
      this.width = 75;
      this.height = 40;
      this.y = Math.random() * (this.game.height * 0.95 - this.height);
      this.image = document.getElementById('power');
      this.maxFrame = 3;
      this.lives = 5;
      this.score = 15;
      this.type = 'power';
    }
  }
class Layer {
  constructor(game, image, speedModifier) {
    this.game = game;
    this.image = image;
    this.speedModifier = speedModifier;
    this.width = 1768;
    this.height = 500;
    this.x = 0;
    this.y = 0;
  }
  update(){
    if(this.x <= -this.width) this.x = 0;
    this.x -= this.game.speed * this.speedModifier;
  }
  draw(context){
    context.drawImage(this.image, this.x, this.y);
    context.drawImage(this.image, this.x + this.width, this.y);
  }
}
class Background {
  constructor(game){
    this.game = game;
    this.image1 = document.getElementById('layer1');
    this.image2 = document.getElementById('layer2');
    this.image3 = document.getElementById('layer3');
    this.image4 = document.getElementById('layer4');
    this.layer1 = new Layer(this.game, this.image1, 0.2);
    this.layer2 = new Layer(this.game, this.image2, 0.4);
    this.layer3 = new Layer(this.game, this.image3, 1);
    this.layer4 = new Layer(this.game, this.image4, 1.5);
    this.layers =[this.layer1, this.layer2, this.layer3];
  }
  update(){
    this.layers.forEach(layer => layer.update());
  }
  draw(context){
    this.layers.forEach(layer => layer.draw(context));
  }
}
class Explosion {
  constructor(game, x, y){
    this.game = game;
    this.frameX = 0;
    this.spriteWidth = 200;
    this.spriteHeight = 200;
    this.width = this.spriteWidth;
    this.height = this.spriteHeight;
    this.x = x - this.width * 0.5;
    this.y = y - this.height * 0.5;
    this.fps = 30;
    this.timer = 0;
    this.interval = 1000/this.fps;
    this.markedForDeletion = false;
    this.maxFrame = 8;
    this.image = document.getElementById('smokeExplosion');
  }
  update(deltaTime) {
    this.x -= this.game.speed;
    if(this.timer > this.interval) {
      this.frameX++;
      this.timer = 0;
    } else {
      this.timer += deltaTime;
    }
    if(this.frameX > this.maxFrame) this.markedForDeletion = true;
  }
  draw(context){
    context.drawImage(this.image, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
  }
}
class UI {
  constructor(game) {
    this.game = game;
    this.fontSize = 30;
    this.fontFamily = 'Arial';
    this.color = 'yellow';
  }
  draw(context) {
    context.save();
    context.fillStyle = this.color;
    context.shadowOffsetX = 2;
    context.shadowOffsetY = 2;
    context.shadowColor = 'black';
    context.font = `${this.fontSize}px ${this.fontFamily}`;
    context.fillText(`Score : ${this.game.score}`, 840, 480);
    const formattedTime = (this.game.gameTime * 0.001).toFixed(0);
    const timeLimit = (this.game.timeLimit * 0.001).toFixed(0);
    context.fillText(`Countdown : ${timeLimit - formattedTime}`, 410, 480);
    //game over messages
    if (this.game.gameOver) {
      context.textAlign = 'center';
      let message1;
      let message2;
      if(this.game.score > this.game.winningScore) {
        message1 = 'You Win!';
        message2 = 'Congratulations!';
      } else {
        message1 = 'Game Over!';
        message2 = 'Try again!';
      }
      context.font = `70px ${this.fontFamily}`;
      context.fillText(message1, this.game.width * 0.5, this.game.height * 0.5 - 20); //+-20 spacing between sa messages
      context.font = `25px ${this.fontFamily}`;
      context.fillText(message2, this.game.width * 0.5, this.game.height * 0.5 + 20); //+-20 spacing between sa messages
    }
      //ammo charging level
      if(this.game.player.powerUp) context.fillStyle = '#2dab03';
      for(let i = 0; i < this.game.ammo; i++) {
      let bullets = 10 + 3 * i;
      if(bullets > 100) {
        context.fillRect(100, 480, 3, 5);
      } else {
        context.fillRect(10 + 3 * i, 480, 3, 5);
      }
      }
    context.restore();
  }
}
class Game {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.background = new Background(this); // link to Background class
    this.player = new Player(this); //link to Player class
    this.input = new InputHandler(this); // link to InputHandler class
    this.ui = new UI(this); //User Interface class
    this.keys = []; // track all keys pressed down
    this.enemies = [];
    this.explosions = [];
    this.enemyTimer = 0;
    this.enemyInterval = 1000; //1 seconds
    this.ammo = 20;
    this.maxAmmo = 50;
    this.ammoTimer = 0;
    this.ammoInterval = 350; //350 millisecond
    this.gameOver = false;
    this.score = 0;
    this.winningScore = 100;
    this.gameTime = 0;
    this.timeLimit = 30000; // 30 second
    this.speed = 1;
    this.debug = false;
  }
  update(deltaTime){
    if(!this.gameOver) this.gameTime += deltaTime;
    if(this.gameTime > this.timeLimit) this.gameOver = true;
    this.background.update();
    this.background.layer4.update();
    this.player.update(deltaTime);
    if(this.ammoTimer > this.ammoInterval) {
      if(this.ammo < this.maxAmmo) this.ammo++;
      this.ammoTimer = 0;
    } else {
      this.ammoTimer += deltaTime;
    }
    this.explosions.forEach(explosion => explosion.update(deltaTime));
    this.enemies.forEach(enemy => {
      enemy.update();
      if (this.checkCollisions(this.player, enemy)) {
        enemy.markedForDeletion = true;
        this.addExplosion(enemy);
        if(enemy.type === 'power') this.player.enterPowerUp();
        else if(!this.gameOver) this.score--;
      }
      this.player.projectiles.forEach(projectile => {
        if(this.checkCollisions(projectile,enemy)) {
          enemy.lives--;
          projectile.markedForDeletion = true;
          if(enemy.lives <= 0) {
            enemy.markedForDeletion = true;
            this.addExplosion(enemy);
            if(!this.gameOver) this.score += enemy.score;
          }
        }
      });
    });
    this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);
    if (this.enemyTimer > this.enemyInterval && !this.gameOver) {
      this.addEnemy();
      this.enemyTimer = 0;
    } else {
      this.enemyTimer += deltaTime;
    }
  }
  draw(context) {
    this.background.draw(context);
    this.player.draw(context); 
    this.enemies.forEach(enemy => {
      enemy.draw(context);
    });
    this.explosions.forEach(explosion => explosion.draw(context));
    this.background.layer4.draw(context);
    this.ui.draw(context);
  }
  //adjust enemy  appearance frequency
  addEnemy() {
    const randomize = Math.random();
    if(randomize < 0.8) this.enemies.push(new Monster(this));
    else this.enemies.push(new EnergyPower(this));
  }
  addExplosion(enemy) {
      this.explosions.push(new Explosion(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
  }
  checkCollisions(rect1, rect2) {
    return ( rect1.x < rect2.x + rect2.width &&
              rect1.x + rect1.width > rect2.x &&
              rect1.y < rect2.y + rect2.height &&
              rect1.y + rect1.height > rect2.y)
  }
}
const game = new Game(canvas.width, canvas.height);
let lastTime = 0;
// animation loops
function animate(timeStamp){
  const deltaTime = timeStamp - lastTime;
  lastTime = timeStamp;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  game.draw(ctx);
  game.update(deltaTime);
  requestAnimationFrame(animate);
}
animate(0);
});
