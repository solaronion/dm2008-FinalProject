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

/* ----------------- Assets ----------------- */


function preload(){
  PlayerImg = loadImage("Assets/PlayerImg.png");
  PlayerImg.resize(50, 0);
  FonImg = loadImage("Assets/FonImg.png");
  FonImg.resize(50, 0);
  RedImg = loadImage("Assets/RedEnemyImg.png");
  BlueImg = loadImage("Assets/BlueEnemyImg.png");
  YellowImg = loadImage("Assets/YellowEnemyImg.png");

  enemyColor = [RedImg, BlueImg, YellowImg];
}


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

  image(FonImg, width/2, height/2);
  ring.show();

  /* ----------------- Enemy Spawn ----------------- */
  Timer++;
  if (Timer > spawnTime) {
    let randomEnemy = random(enemyColor); 
    enemies.push(new Enemy(randomEnemy));
    Timer = 0;

  }

  for (let i = 0; i < enemies.length; i++) {
    enemies[i].update();
    enemies[i].show();
    if (enemies[i].reachedFon(25)) { 
    gameOver = true;
    }
    if (enemies[i].hitsPlayer(ring.x, ring.y, playerRadius)) {
    gameOver = true;
    }
  }


  /* ----------------- Collition with Center Fon ----------------- */
  let d = dist(ring.x, ring.y, width/2, height/2);
  if (d < ring.size/2){
    gameOver = true;
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


/* ----------------- Keys ----------------- */
function keyPressed() {
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

  }

  update(){
    this.x += this.xVelocity * this.speed * deltaTime/1000;
    this.y += this.yVelocity * this.speed * deltaTime/1000;
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
}


// add ui slider to adjust sensitivity (is at 5000 rn)