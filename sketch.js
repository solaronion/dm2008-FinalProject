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
let scoreCount = 0;
let winScore = 5;

var seconds = 0;
let stopTime = 30;
let timeLeft;


let runStartMillis = 0;
let pauseStartMillis = 0;

let gameStarted = false;
let gameOver = false;
let isPaused = true;

let sensitivitySlider;
let micSensitivity = 5000;

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
  
  sensitivitySlider = createSlider(1000, 10000, 5000);
  sensitivitySlider.position(160, 590);
  sensitivitySlider.addClass('slider');
  sensitivitySlider.input(() =>micSensitivity = sensitivitySlider.value());
  sensitivitySlider.hide();
 
}

function draw() {
  background(102, 129, 124);
  

  
  if (!gameStarted) {
    StartScreen();
    return;
  }
  
  if (gameOver && scoreCount < winScore) {
    DeathScreen();
    return;
  }

  if (gameOver && scoreCount >= winScore) {
    WinScreen();
    return;
  }

  if (timeLeft <= 0) {
    gameOver = true;
    FinishEatingScreen();
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
  // compute time left based on when this run started (ignores paused time because runStartMillis is adjusted on resume)
  if (runStartMillis > 0) {
    const elapsedSeconds = floor((millis() - runStartMillis) / 1000);
    timeLeft = Math.max(stopTime - elapsedSeconds, 0);
  } else {
    timeLeft = stopTime;
  }

  if (!isPaused) {
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

  score();
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

  showSensitivitySlider();

  
 
  image(PlayerImg, width/2, height/3 + 50, 50, 50);  
}

function DeathScreen(){
  fill(255);
  textAlign(CENTER, CENTER); 
  textSize(48);
  text("You Failed...", width/2, height/2);
  textSize(20);
  text("R to restart", width/2, height/2 + 50);
  endScore();

  showSensitivitySlider();
 
  image(PlayerImg, width/2, height/3 + 50, 50, 50);  
}

function WinScreen(){
  fill(255);
  textAlign(CENTER, CENTER); 
  textSize(48);
  text("Fon is impressed! :D", width/2, height/2);
  textSize(20);
  text("R to restart", width/2, height/2 + 50);
  endScore();

  showSensitivitySlider();

  image(PlayerImg, width/2 -30, height/3 + 50, 50, 50); 
  image(FonImg, width/2 + 30, height/3 + 50, 50);  
}

function FinishEatingScreen(){
  fill(255);
  textAlign(CENTER, CENTER); 
  textSize(18);
  text("Fon finished eating in peace, and she accepted your confession! :D", width/2, height/2); 
  endScore();
  image(PlayerImg, width/2 -30, height/3 + 50, 50, 50); 
  image(FonImg, width/2 + 30, height/3 + 50, 50); 
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
  textSize(12);
  text("Microphone Sensitivity", 90, 600);

}

/* ----------------- Keys and Game Functions ----------------- */
function keyPressed() {
  if (gameStarted && !gameOver && keyCode === ESCAPE) {
    // toggle pause: when pausing record when it started; when resuming adjust runStartMillis
    if (!isPaused) {
      // going to pause
      isPaused = true;
      pauseStartMillis = millis();
      showSensitivitySlider();
    } else {
      // resuming
      isPaused = false;
      if (pauseStartMillis) {
        // shift runStartMillis forward by the paused duration so elapsed time excludes pause
        runStartMillis += (millis() - pauseStartMillis);
        pauseStartMillis = 0;
      }
      hideSensitivitySlider();   
    }
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
  runStartMillis = millis();
  pauseStartMillis = 0;
  timeLeft = stopTime;
  gameOver = false;
  gameStarted = true;
  enemies = [];     
  Timer = 0;       
  colorIndex = 0;
  scoreCount = 0;
  hideSensitivitySlider();

  ring = new attackRing(attackSize, width/2, height/2 - 150);
  mic = new p5.AudioIn();
  mic.start();
}

function score(){ 
  fill(255); 
  textAlign(CENTER); 
  textSize(20); 
  text("Cats chased off: " + scoreCount, 100, 30);
  text("Time left for Fon to finish eating: " + timeLeft , 440, 30)
}



function endScore(){
  fill(255); 
  textAlign(CENTER); 
  textSize(20); 
  text("Cats chased off: " + scoreCount, width/2, height/2 + 150);
}

function showSensitivitySlider(){
  textSize(12);
  text("Microphone Sensitivity", 90, 600);
  sensitivitySlider.show();
}

function hideSensitivitySlider(){
  sensitivitySlider.hide();
} 


/* ----------------- Classes ----------------- */
class attackRing {
  constructor(size, x, y) {
    this.size = size;
    this.x = x;
    this.y = y;
  }

  show() {
    this.size = vol * micSensitivity + attackSize;

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
    this.alreadyHit = false;

     
  
  }


  

  update(){
    if (this.hit){
      this.x -= this.xVelocity * this.speed * deltaTime / 10;
      this.y -= this.yVelocity * this.speed * deltaTime / 10;
      if (!this.alreadyHit){
      scoreCount += 1;
      }
      this.alreadyHit = true;
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