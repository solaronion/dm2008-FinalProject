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
let showRules = false;
let rulesBtn;
let backBtn;

let sensitivitySlider;
let micSensitivity = 5000;

let PlayerImg2;
let BlueImg2;
let YellowImg2; 
let RedImg2;

let playerFrames = [];
let enemyFrames = [];

/* ----------------- Assets ----------------- */


function preload(){
  PlayerImg = loadImage("Assets/PlayerImg1.png");
  FonImg = loadImage("Assets/FonImg.png");
  RedImg = loadImage("Assets/RedEnemyImg1.png");
  BlueImg = loadImage("Assets/BlueEnemyImg1.png");
  YellowImg = loadImage("Assets/YellowEnemyImg1.png");

  PlayerImg2 = loadImage("Assets/PlayerImg2.png");
  BlueImg2   = loadImage("Assets/BlueEnemyImg2.png");
  YellowImg2 = loadImage("Assets/YellowEnemyImg2.png");
  RedImg2    = loadImage("Assets/RedEnemyImg2.png");
  BackgroundImg = loadImage("Assets/Background.png");
  TreeImg = loadImage("Assets/Trees.png");
  StartImg = loadImage("Assets/Startscreen.png")
  PauseImg = loadImage("Assets/pause.png")
  RulesImg = loadImage("Assets/rules.png")


  PlayerImg.resize(50, 0);    
  PlayerImg2.resize(50, 0);
  FonImg.resize(50, 0);
  BlueImg.resize(50, 0);     
  BlueImg2.resize(50, 0);
  YellowImg.resize(50, 0);    
  YellowImg2.resize(50, 0);
  RedImg.resize(50, 0);       
  RedImg2.resize(50, 0);

  //fonts
  font = loadFont("Assets/Fonts/Mabook.ttf");


  enemyColor = [BlueImg, YellowImg, RedImg];
  playerFrames = [PlayerImg, PlayerImg2];
  enemyAnimFrames = [
    [BlueImg,   BlueImg2],
    [YellowImg, YellowImg2],
    [RedImg,    RedImg2]
    ];
}

/* ----------------- Sound ----------------- */


/* ----------------- Setup & Draw ----------------- */
function setup() {
  imageMode(CENTER);
  textAlign(CENTER, CENTER); 
  createCanvas(650, 650);
  background(102, 129, 124);
  fill(255);
  textFont(font);
  sensitivitySlider = createSlider(1000, 10000, 5000);
  sensitivitySlider.position(350, 465);
  sensitivitySlider.addClass('slider');

  sensitivitySlider.input(() =>micSensitivity = sensitivitySlider.value());
  sensitivitySlider.hide();
 
  rulesBtn = createButton("Rules");
  rulesBtn.position(width/2 - 240, height/2 + 240);
  rulesBtn.mousePressed(() => {
  showRules = true;
  });
  rulesBtn.addClass('btn');
  rulesBtn.hide();   


  backBtn = createButton("Back");
  backBtn.position(width/2 - 240, height/2 + 240); 
  backBtn.mousePressed(() => {
  showRules = false;
  });
  backBtn.addClass('btn');
  backBtn.hide(); 

  

}

function draw() {
  background(102, 129, 124);
  imageMode(CENTER);

  image(BackgroundImg, width/2, height/2, width, height);
  

  
  if (!gameStarted && !showRules) {
    rulesBtn.show();  
    backBtn.hide();  
    hideSensitivitySlider();
    StartScreen();
    return;
  }

  if (!gameStarted && showRules) {
    rulesBtn.hide();   
    backBtn.show();    
    RulesScreen();
    return;
  }
    rulesBtn.hide();
    backBtn.hide();
  
  if (gameOver && scoreCount < winScore) {
    DeathScreen();
    return;
  }

  if (gameOver && scoreCount >= winScore && timeLeft > 0) {
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
  // timer functionality is generated with github copilot
  if (runStartMillis > 0) {
    const elapsedSeconds = floor((millis() - runStartMillis) / 1000);
    timeLeft = Math.max(stopTime - elapsedSeconds, 0);
  } else {
    timeLeft = stopTime;
  }

  if (!isPaused) {
    Timer++;
    if (Timer > spawnTime) {

    // github copilot generated code to select enemy color and frames
    const idx = floor(random(enemyAnimFrames.length));
    const colorImgForLogic = enemyColor[idx];
    const framesForDrawing = enemyAnimFrames[idx];

    enemies.push(new Enemy(colorImgForLogic, framesForDrawing));
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

  image(TreeImg, width/2, height/2, width, height);


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
  image(StartImg, width/2, height/2, width, height);
  fill("#c4996c")
  stroke ("#61533cd2")
  strokeWeight(5);
  textAlign(CENTER, CENTER); 
}

  
function RulesScreen(){
image(StartImg, width/2, height/2, width, height);

fill(0, 150);
rect(0, 0, width, height);

image(RulesImg, width/2, height/2, width, height)
sensitivitySlider.show();

fill(250)
strokeWeight();
textSize(15);
text("Microphone Sensitivity", 260, 475);

}
  
 
 


function DeathScreen(){
  fill(0, 150);
  rect(0, 0, width, height);
  fill("#c4996c")
  stroke ("#61533cd2")
  
  strokeWeight(5);
  textAlign(CENTER, CENTER); 
  textSize(48);
  text("You Failed...", width/2, height/2);
  textSize(20);
  text("R to restart", width/2, height/2 + 50);
  endScore();

  textSize(15);
  text("Microphone Sensitivity", 260, 475);
  showSensitivitySlider();
 
  image(PlayerImg, width/2, height/3 + 50, 50, 50);  
}

function WinScreen(){
  fill(0, 150);
  rect(0, 0, width, height);
  fill("#c4996c")
  stroke ("#61533cd2")
  strokeWeight(5);
  textAlign(CENTER, CENTER); 
  textSize(48);
  text("Fon is impressed! :D", width/2, height/2);
  textSize(20);
  text("R to restart", width/2, height/2 + 50);
  endScore();

  textSize(15);
  text("Microphone Sensitivity", 260, 475);
  showSensitivitySlider();

  image(PlayerImg, width/2 -30, height/3 + 50, 50, 50); 
  image(FonImg, width/2 + 30, height/3 + 50, 50);  
}

function FinishEatingScreen(){
  fill(0, 150);
  rect(0, 0, width, height);
   fill("#c4996c")
  stroke ("#61533cd2")
  strokeWeight(5);
  textAlign(CENTER, CENTER); 
  textSize(18);
  text("Fon finished eating in peace, and she accepted your confession! :D", width/2, height/2); 
  endScore();
  image(PlayerImg, width/2 -30, height/3 + 50, 50, 50); 
  image(FonImg, width/2 + 30, height/3 + 50, 50); 
}



function PauseScreen(){
  fill("#c4996c")
  stroke ("#61533cd2")
  strokeWeight(5);
  image(TreeImg, width/2, height/2, width, height);

  fill(0, 150);
  rect(0, 0, width, height);
  image(PauseImg, width/2, height/2, width, height)
  fill(255);
  textAlign(CENTER, CENTER); 
  textSize(48);
  text("Game Paused", width/2, height/2 - 20);
  textSize(20);
  text("Press ESC to Resume!", width/2, height/2 + 30);
  fill(250)
  strokeWeight(1);
  textSize(15);
  text("Microphone Sensitivity", 260, 475);

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
  fill("#c4996c")
  stroke ("#61533cd2")
  strokeWeight(5);
  textAlign(CENTER); 
  textSize(20); 
  text("Cats chased off: " + scoreCount, 100, 30);
  text("Time left for Fon to finish eating: " + timeLeft , 440, 30)
}

 

function endScore(){
  fill("#c4996c")
  stroke ("#61533cd2")
  strokeWeight(5);
  textAlign(CENTER); 
  textSize(20); 
  text("Cats chased off: " + scoreCount, width/2, height/2 + 80);
}

function showSensitivitySlider(){
  textSize(15);
  text("Microphone Sensitivity", 260, 475);
  sensitivitySlider.show();
}

function hideSensitivitySlider(){
  sensitivitySlider.hide();
} 


/* ----------------- Classes ----------------- */
class attackRing {
  constructor(size, x, y) {
    this.size = size;
    this.targetSize = size;
    this.sizeSmoothing = 0.25; //hi jiaye please change this to adjust how fast the size changes
    this.x = x;
    this.y = y;
    this.prevX = x; 
    this.prevY = y;
    this.frames = playerFrames; 
    this.animIndex = 0;
    this.animTimer = 0;
    this.animPeriod = 150;
  }

  show() {
    this.targetSize = vol * micSensitivity + attackSize;
    this.size = lerp(this.size, this.targetSize, this.sizeSmoothing);
    if (this.size > 150) {
      colorIndex = 2;
    } else if (this.size > 80) {
      colorIndex = 1;
    } else {
      colorIndex = 0;
    }

    fill(attackColor[colorIndex]);
    noStroke();
    ellipse(this.x, this.y, this.size, this.size);

    //animation 
    const moved = dist(this.x, this.y, this.prevX, this.prevY) > 0.5;
    if (moved) {
      this.animTimer += deltaTime;
      if (this.animTimer >= this.animPeriod) {
        this.animTimer = 0;
        this.animIndex = (this.animIndex + 1) % this.frames.length;
      }
    } else {
      this.animIndex = 0;
      this.animTimer = 0;
    }

  //sprite flipping based on movement direction code with the help of chatgpt
   const imgToDraw = (this.frames && this.frames.length > 0)
  ? this.frames[this.animIndex]
  : null;

    const movedRight = (this.x - this.prevX) > 0.5;

    if (imgToDraw) {
     push();
      translate(this.x, this.y);
      if (movedRight) scale(-1, 1); 
      image(imgToDraw, 0, 0, 50, 50);  
      pop();
    }

    this.prevX = this.x;
    this.prevY = this.y;
  }
}

class Enemy {
  constructor(img, frames) {
    this.img = img;
    this.frames = frames;    
    this.animIndex = 0;
    this.animTimer = 0;
    this.animPeriod = 160;
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

    this.prevX =  this.x;
    this.prevY =  this.y;

  
  }


  

  update(){
    this.prevX = this.x;
    this.prevY = this.y;

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

     this.animTimer += deltaTime;
    if (this.animTimer >= this.animPeriod) {
      this.animTimer = 0;
      this.animIndex = (this.animIndex + 1) % this.frames.length;
    }
  }


  show() {
  const imgToDraw = (this.frames && this.frames.length > 0) ? this.frames[this.animIndex] : this.img;
  if (!imgToDraw) return;

  const movingRight = (this.x - this.prevX) > 0.01;

  push();
  translate(this.x, this.y);
  if (movingRight) scale(-1, 1);
  image(imgToDraw, 0, 0, this.size, this.size);
  pop();
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


