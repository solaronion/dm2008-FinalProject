/* ----------------- Globals ----------------- */
let player;
let mic;
let ring;
let attackSize = 20;
let vol;
let attackColor = ["#0059ffff","#ffed24ff","#ff0e0eff"];
let colorIndex = 0
let gameStarted = false;


/* ----------------- Assets ----------------- */


function preload(){
  PlayerImg = loadImage("Assets/PlayerImg.png");
  FonImg = loadImage("Assets/FonImg.png");
  RedImg = loadImage("Assets/RedEnemyImg.png");
  BlueImg = loadImage("Assets/BlueEnemyImg.png");
  YellowImg = loadImage("Assets/YellowEnemyImg.png");
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

  ring.show();
  image(FonImg, width/2, height/2, 50, 50,);

  console.log(ring.size);
  //player.rotateTowards(mouse, 0.1, 0); (its not working :())
}


/* ----------------- StartScreen ----------------- */
function StartScreen(){
  fill(255);
  textAlign(CENTER, CENTER); 
  textSize(48);
  text("SPACE key to Start", width/2, height/2);
  textSize(20);
  text("Hiss the cats away! WASD to move", width/2, height/2 + 50);
  
 
  image(PlayerImg, width/2, height/3 + 50, 50, 50);  
}


function keyPressed() {
  if (keyCode === 32 && !gameStarted) {
    gameStarted = true
    ring = new attackRing(attackSize, width/2, height/2);
    mic = new p5.AudioIn();
    mic.start();
  }
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
    
   
    PlayerImg.resize(50, 0);
    image(PlayerImg, this.x, this.y);    
     
  }
}
// add ui slider to adjust sensitivity (is at 5000 rn)