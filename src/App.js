import React, { Component } from 'react';
import './App.css';

const HEIGHT = 500;
const WIDTH = 800;
const PIPE_WIDTH = 60;
const MIN_PIPE_HEIGHT = 40;
const FPS = 120;

class Bird {
  constructor (ctx) {
    this.ctx = ctx;
    this.x = 150;
    this.y = 150;
    this.gravity = 0.1;
    this.velocity = 0;
  }
  draw () {
    this.ctx.fillStyle = 'red';
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y,10, 0, 2*Math.PI);
    this.ctx.fill();
  }

  update = () => {
    if (this.velocity <= 5 ) {
    this.velocity = this.velocity + this.gravity;
  }
    this.y += this.velocity;

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
    this.height = height || MIN_PIPE_HEIGHT + Math.random() * (HEIGHT-space-MIN_PIPE_HEIGHT);
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
    this.pipes = [];
    this.birds = [];
}

  componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown);
    const ctx = this.getCtx();
this.pipes = this.generatePipes();
this.birds = [new Bird(ctx)];
setInterval(this.gameLoop, 1000 / FPS);
}

onKeyDown = (e) => {
  if(e.code === 'Space') {
    this.birds[0].jump();
  }
}

getCtx = () => this.canvasRef.current.getContext('2d');

generatePipes = () => {
  const ctx = this.getCtx();
  const firstPipe = new Pipe(ctx, null, this.space);
  const secondPipeHeight = HEIGHT - firstPipe.height - this.space;
  const SecondPipe = new Pipe(ctx,secondPipeHeight,80);
  return [firstPipe, SecondPipe];
}

gameLoop = () => {
  this.update();
  this.draw();
}

update = () => {
this.frameCount = this.frameCount + 1;
if(this.frameCount % 320 === 0) {
  const pipes = this.generatePipes();
  this.pipes.push(...pipes);
}

this.pipes.forEach(pipe => pipe.update());
this.pipes = this.pipes.filter(pipe => !pipe.isDead);
this.birds.forEach(bird => bird.update());
}

draw() {
  const ctx = this.canvasRef.current.getContext('2d');
  ctx.clearRect(0,0,WIDTH,HEIGHT);
  this.pipes.forEach(pipe => pipe.draw());
  this.birds.forEach(bird => bird.draw());
}
  render() {
  return (
    <div className="App">
      <canvas
      ref={this.canvasRef}
      id="myCanvas" width={WIDTH} height={HEIGHT}
        style={{marginTop: '24px', border: '1px solid #c3c3c3'}}>
      </canvas>
    </div>
  );
}
}
export default App;
