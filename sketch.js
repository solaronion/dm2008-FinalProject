/* ----------------- Globals ----------------- */
let player;
const playerSize = 50;
const playerRadius = playerSize * 0.2;
let mic;
let ring;
let attackSize = 20;
let vol;
let attackColor = ["#0059ffff","#ffed24ff","#ff0e0eff"];
let colorIndex = 0

let enemies = [];
let spawnTime = 120;
let enemyColor = [];
let Timer = 0


let gameStarted = false;
let gameOver = false;
let isPaused = true;

/* ----------------- Assets ----------------- */


function preload(){
  PlayerImg = loadImage("Assets/PlayerImg.png");
  PlayerImg.resize(50, 0);
  FonImg = loadImage("Assets/FonImg.png");
  FonImg.resize(50, 0);
  RedImg = loadImage("Assets/RedEnemyImg.png");
  BlueImg = loadImage("Assets/BlueEnemyImg.png");
  YellowImg = loadImage("Assets/YellowEnemyImg.png");

  enemyColor = [BlueImg, YellowImg,RedImg];
}

/* ----------------- Sound ----------------- */


/* ----------------- Setup & Draw ----------------- */
function setup() {
  imageMode(CENTER);
  textAlign(CENTER, CENTER); 
  createCanvas(650, 650);
  background(102, 129, 124);
  fill(255);
 
}

function draw() {
  background(102, 129, 124);
  

  
  if (!gameStarted) {
    StartScreen();
    return;
  }
  
  if (gameOver) {
    DeathScreen();
    return;
  }

  if (!isPaused) {
  vol = mic.getLevel();
  if (keyIsDown(68)) { 
    ring.x += 4;
  }
  if (keyIsDown(65)) { 
    ring.x -= 4;
  }
  if (keyIsDown(87)) { 
    ring.y -= 4;
  }
  if (keyIsDown(83)) { 
    ring.y += 4;
  }
  ring.x = constrain(ring.x, 0, width);
  ring.y = constrain(ring.y, 0, height);
  }

  image(FonImg, width/2, height/2);
  ring.show();

  /* ----------------- Enemy Spawn ----------------- */
  if (!isPaused){
  Timer++;
  if (Timer > spawnTime) {
    let randomEnemy = random(enemyColor); 
    enemies.push(new Enemy(randomEnemy));
    Timer = 0;

    }


  for (let i = enemies.length - 1; i >= 0; i--) {
    let enemy = enemies[i];

    enemy.update();
    enemy.show();

    let playerEnemyD = dist(enemy.x, enemy.y, ring.x, ring.y);
    let collide = playerEnemyD < (ring.size / 2 + enemy.size / 2);
    let currentEnemyColor = enemyColor[colorIndex];

    if (collide && currentEnemyColor == enemy.img){
      enemy.hit = true;
    }

    if (enemy.hit && enemy.offScreen()){
      enemies.splice(i, 1);
      continue; // skip rest of this loop
    }  
      
      if (enemies[i].reachedFon(25)) { 
      gameOver = true;
    }

    if (enemies[i].hitsPlayer(ring.x, ring.y, playerRadius)) {
      gameOver = true;
    }  
  }


  /* ----------------- Collision with Center Fon ----------------- */
  let d = dist(ring.x, ring.y, width/2, height/2);
  if (d < ring.size/2){
    gameOver = true;
  }
} else {
    for (let i = 0; i < enemies.length; i++) {
      enemies[i].show();
    }
    PauseScreen();
  }
 

  console.log(ring.size);
}



/* ----------------- Screens ----------------- */
function StartScreen(){
  fill(255);
  textAlign(CENTER, CENTER); 
  textSize(48);
  text("SPACE key to Start", width/2, height/2);
  textSize(20);
  text("Hiss the cats away! WASD to move", width/2, height/2 + 50);

 
  image(PlayerImg, width/2, height/3 + 50, 50, 50);  
}

function DeathScreen(){
  fill(255);
  textAlign(CENTER, CENTER); 
  textSize(48);
  text("You Died", width/2, height/2);
  textSize(20);
  text("R to restart", width/2, height/2 + 50);
  
 
  image(PlayerImg, width/2, height/3 + 50, 50, 50);  
}

function PauseScreen(){
  noStroke();
  fill(0, 150);
  rect(0, 0, width, height);
  fill(255);
  textAlign(CENTER, CENTER); 
  textSize(48);
  text("Game Paused", width/2, height/2 - 20);
  textSize(20);
  text("Press ESC to Resume!", width/2, height/2 + 30);
}

/* ----------------- Keys and Game States ----------------- */
function keyPressed() {
  if (gameStarted && !gameOver && keyCode === ESCAPE) {
    isPaused = !isPaused;
    return;
  }
  if (!gameStarted && keyCode === 32) {
    startNewRun();
    return;
  }

  if (gameOver && (key === 'r' || key === 'R')) {
    startNewRun();
    return;
  }
}

function startNewRun() {
  if (mic && mic.stop) mic.stop();
  isPaused = false;
  gameOver = false;
  gameStarted = true;
  enemies = [];     
  Timer = 0;       
  colorIndex = 0;

  ring = new attackRing(attackSize, width/2, height/2 - 150);
  mic = new p5.AudioIn();
  mic.start();
}




/* ----------------- Classes ----------------- */
class attackRing {
  constructor(size, x, y) {
    this.size = size;
    this.x = x;
    this.y = y;
  }

  show() {
   
    this.size = vol * 5000 + attackSize;

    if (this.size > 80)
    { colorIndex = 1;
    }
    if (this.size > 150)
    {
    colorIndex = 2;
    }
    if (this.size <= 80)
	{
	colorIndex = 0;
	} 
   
    fill(attackColor[colorIndex])
    noStroke();
    ellipse(this.x, this.y, this.size, this.size);
    image(PlayerImg, this.x, this.y);    
     
  }
}

class Enemy {
  constructor(img) {
    this.img = img;
    this.size = 50;

    const angle = random(360);
    const spawnRadius = 430;

    this.x = (width/2) + cos(angle)*spawnRadius
    this.y = (height/2) + sin(angle)*spawnRadius
    this.speed = 30;

    const distFromCenterX = (width/2) - this.x;
    const distFromCenterY = (height/2) - this.y;
    const direction = createVector(distFromCenterX, distFromCenterY);
    direction.normalize();
    this.xVelocity = direction.x;
    this.yVelocity = direction.y;

    this.hit = false;

     
  
  }


  

  update(){
    if (this.hit){
      this.x -= this.xVelocity * this.speed * deltaTime / 10;
      this.y -= this.yVelocity * this.speed * deltaTime / 10;
    }
    else{
      this.x += this.xVelocity * this.speed * deltaTime/1000;
      this.y += this.yVelocity * this.speed * deltaTime/1000;
    }
  }


  show() {
    image(this.img, this.x, this.y, this.size, this.size);
  }

  reachedFon(killDistance = 10){
    return dist(this.x, this.y, width/2, height/2) <= killDistance;
  }

  hitsPlayer(px, py, pr) {
    const enemyRadius = this.size * 0.5; 
    return dist(this.x, this.y, px, py) <= (enemyRadius + pr);
}
 
  offScreen (){
  let off = false;
  if (this.x < -this.size) off = true;
  if (this.x > width + this.size) off = true;
  if (this.y < -this.size) off = true;
  if (this.y > height + this.size) off = true;
  return off;
  }
}


// add ui slider to adjust sensitivity (is at 5000 rn)