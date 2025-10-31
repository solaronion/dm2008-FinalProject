/* ----------------- Globals ----------------- */
let player;
let mic;
let ring;
let attackSize = 20;
let vol;
let attackColor = ["#0059ffff","#ffed24ff","#ff0e0eff"];
let colorIndex = 0


const SPAWN_RATE = 90;
/* ----------------- Assets ----------------- */
let PlayerImg;

function preload(){
  PlayerImg = loadImage("Assets/PlayerImg.png");
}

function setup() {
  imageMode(CENTER);
  createCanvas(500, 500);
  background(102, 129, 124);
  fill(255);
  ring = new attackRing(attackSize, width/2, height/2);
  mic = new p5.AudioIn();
  mic.start();
}

function draw() {
  background(102, 129, 124); 
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

  ring.show();
  console.log(ring.size);
}

class attackRing {
  constructor(size, x, y) {
    this.size = size;
    this.x = x;
    this.y = y;
  }

  show() {
   
    this.size = vol * 5000 + attackSize;

    if (this.size > 50)
    { colorIndex = 1;
    }
    if (this.size > 100)
    {
    colorIndex = 2;
    }
    if (this.size <= 50)
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

