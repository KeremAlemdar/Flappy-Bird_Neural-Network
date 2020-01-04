import React, { Component } from 'react';
import './App.css';
import { NeuralNetwork } from './neural/nn';

const TOTAL_BIRDS = 250;
const HEIGHT = 500;
const WIDTH = 800;
const PIPE_WIDTH = 10;
const MIN_PIPE_HEIGHT = 20;
const FPS = 120;
const SPEED_MODE_FPS = 480;

class Bird {
  constructor (ctx, brain) {
    this.ctx = ctx;
    this.x = 150;
    this.y = 150;
    this.age = 0;
    this.fitness = 0;
    this.gravity = 0.1;
    this.velocity = 0;
    this.isDead = false;

    if(brain) {
    this.brain = brain.copy();
    this.mutate();
  } else {
    this.brain = new NeuralNetwork(5,10,2);
  }
}
  draw () {
    this.ctx.fillStyle = 'red';
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y,10, 0, 2*Math.PI);
    this.ctx.fill();
  }

  update = (pipeX, spaceStartY, spaceEndY) => {
    this.age += 1;
    if (this.velocity <= 4 ) {
    this.velocity = this.velocity + this.gravity;
  }
    this.y += this.velocity;
    this.think(pipeX, spaceStartY, spaceEndY);
    }

    think = (pipeX, spaceStartY, spaceEndY) => {
      //inputs:
      // [bird.x, bird.y]


      const inputs = [
        (Math.abs(this.x - pipeX) / WIDTH).toFixed(2),
        (this.y / HEIGHT).toFixed(2),
        (spaceStartY / HEIGHT).toFixed(2),
        (spaceEndY / HEIGHT).toFixed(2),
        (this.velocity / 5).toFixed(2),
      ];
      // range 0, 1
      const output = this.brain.predict(inputs);
      if (output[0] < output[1]) {
        this.jump();
      }
    }

    mutate = () => {
      this.brain.mutate((val) => {
        if(Math.random() < 0.1) {
          return val + Math.random()*0.1;
        }
          return val;
      });
      }

    jump = () => {
      this.velocity = -4;
    }
}
class Pipe {
  constructor (ctx, height, space) {
    this.ctx = ctx;
    this.isDead = false;
    this.x = WIDTH;
    this.y = height ? HEIGHT - height : 0;
    this.width = PIPE_WIDTH;
    this.height = height || MIN_PIPE_HEIGHT + Math.random() * (HEIGHT-space-MIN_PIPE_HEIGHT*2);
  }
  draw () {
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(this.x,this.y,this.width,this.height);
    //this.ctx.fillRect(this.x,this.height+space,PIPE_WIDTH,secondPipeHeight);
  }

  update = () => {
    this.x -= 1;
    if ((this.x + PIPE_WIDTH) < 0) {
      this.isDead = true;
    }
}
}
class App extends Component {

  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();
    this.frameCount = 0;
    this.space = 120;
    this.generationCount = 0;
    this.highscore = 0;
    this.pipes = [];
    this.birds = [];
    this.deadBirds = [];
    this.state = {
      gameSpeed : FPS,
    };
}

  componentDidMount() {
    // document.addEventListener('keydown', this.onKeyDown);
    this.startGame();
    const ctx = this.getCtx();

}

startGame = () => {
this.generationCount += 1;
this.highscore = Math.max(this.highscore, this.gameStart ? Date.now() - this.gameStart : 0);
this.gameStart = Date.now();
this.frameCount = 0;
clearInterval(this.loop);
const ctx = this.canvasRef.current.getContext('2d');
ctx.clearRect(0,0,WIDTH,HEIGHT);

this.pipes = this.generatePipes();
this.birds = this.generateBirds();
this.loop = setInterval(this.gameLoop, 1000 / this.state.gameSpeed);

}

// USER ONLY MODE
// onKeyDown = (e) => {
//   if(e.code === 'Space') {
//     this.birds[0].jump();
//   }
// }

getCtx = () => this.canvasRef.current.getContext('2d');

generatePipes = () => {
  const ctx = this.getCtx();
  const firstPipe = new Pipe(ctx, null, this.space);
  const secondPipeHeight = HEIGHT - firstPipe.height - this.space;
  const SecondPipe = new Pipe(ctx,secondPipeHeight,80);
  return [firstPipe, SecondPipe];
}

generateBirds = (bird) => {
  const birds = [];
  const ctx = this.getCtx();
  for (var i = 0; i < TOTAL_BIRDS; i += 1) {
    const brain = this.deadBirds.length && this.pickOne().brain;
    const newBird = new Bird(ctx, brain);
    birds.push(newBird);
  }
  return birds;
};

gameLoop = () => {
  this.update();
  this.draw();
}

update = () => {
this.frameCount = this.frameCount + 1;
if(this.frameCount % (300) === 0) {
  const pipes = this.generatePipes();
  this.pipes.push(...pipes);
}
//update pipe position
this.pipes.forEach(pipe => pipe.update());

//update bird position,
this.birds.forEach(bird => {
  const nextPipe = this.getNextPipe(bird);
  const spaceStartY = nextPipe.y + nextPipe.height;
   bird.update(nextPipe.x, spaceStartY, spaceStartY + this.space)
 });

// delete off-screen pipes
this.pipes = this.pipes.filter(pipe => !pipe.isDead);

// delete dead birds
this.updateBirdDeadState();
this.deadBirds.push(...this.birds.filter(bird => bird.isDead));
this.birds = this.birds.filter(bird => !bird.isDead);

// UNUTMA ÖLÜLER VAR
if (this.birds.length === 0) {
   let totalAge = 0;
   // tum kuslarin toplam yasini hesapla
   this.deadBirds.forEach((deadBird) => { totalAge += deadBird.age; });

   // toplam yasi kullanarak her kus icin saglamlilik degeri ata
   this.deadBirds.forEach((deadBird) => { deadBird.fitness = deadBird.age / totalAge; });
   this.startGame();
 }
}

getNextPipe = (bird) => {
  for (let i = 0; i < this.pipes.length; i++) {
    if (this.pipes[i].x > bird.x) {
      return this.pipes[i];
    }
  }
}

giveBirdKerem = () => {
  const should = 0;
  const number = 0;
  for (var i = 0; i < this.deadBirds.length; i += 1) {
    if(this.number < this.deadBirds[i].fitness) {
      this.should = i;
    }
  }
  return this.deadBirds[should];
}

pickOne = () => {
  let index = 0;
  let r = Math.random();
  while (r > 0) {
    r -= this.deadBirds[index].fitness;
    index += 1;
  }
  index -= 1;
  return this.deadBirds[index];
}

//detect bird is dead
updateBirdDeadState = () => {
  // detect collisions
  this.birds.forEach((bird) => {
    this.pipes.forEach((pipe) => {
      if (
        bird.y <= 0 || bird.y >= HEIGHT || (
          bird.x >= pipe.x && bird.x <= pipe.x + pipe.width
          && bird.y >= pipe.y && bird.y <= pipe.y + pipe.height)
      ) {
        bird.isDead = true;
      }
    });
  });
}

draw() {
  const ctx = this.canvasRef.current.getContext('2d');
  ctx.clearRect(0,0,WIDTH,HEIGHT);
  this.pipes.forEach(pipe => pipe.draw());
  this.birds.forEach(bird => bird.draw());

  // oyun durumu
console.log(`Jenerasyon: ${this.generationCount}`, 10, 15);
console.log(`Kus sayisi: ${this.birds.length}`, 10, 30);
console.log(`En iyi ilerleme: ${(this.highscore / 1000).toFixed(1)} sn`, 10, 45);
}


  render() {
  return (
    <div className="App">
      <canvas
      ref={this.canvasRef}
      id="myCanvas" width={WIDTH} height={HEIGHT}
        style={{marginTop: '24px', border: '1px solid #c3c3c3'}}>
      </canvas>
      <div>
      <input
        type="range"
        min="120" max="1000"
        value={this.state.gameSpeed}
        onChange={e => this.setState({gameSpeed: e.target.value}, this.startGame)}
        />
      </div>
      <div onClick={() => this.setState({})}>
        {this.frameCount}
      </div>
    </div>
  );
}
}
export default App;
