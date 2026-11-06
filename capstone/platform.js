//File for handling platform objects, the blocks that make up the world

import { translation, scaling, multiply, rotationX, rotationY, normalize } from "./math.js";

// Cube
export const cubeVertices = new Float32Array([
  -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5,
  -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5,
  -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5,
  -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5,
  0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5,
  -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5
]);
export const cubeIndices = new Uint16Array([
  0, 1, 2, 0, 2, 3,    // front
  4, 5, 6, 4, 6, 7,    // back
  8, 9, 10, 8, 10, 11,   // top
  12, 13, 14, 12, 14, 15,   // bottom
  16, 17, 18, 16, 18, 19,   // right
  20, 21, 22, 20, 22, 23    // left
]);

//Wedge
export const wedgeVertices = new Float32Array([
  -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5,
  -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5,
  -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5,
  -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, -0.5,
  0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, 0.5
]);
export const wedgeIndices = new Uint16Array([
  0, 1, 2, 0, 2, 3,    // top
  4, 6, 7, 4, 5, 6,    // back 
  8, 11, 10, 8, 10, 9, // bottom
  12, 13, 14,          // left 
  15, 16, 17           // right 
]);


// Class for creating platform objects that are placed in the world
export class Platform {
  constructor(visibility = true, x, y, z, width, height, depth, shape = "cube", rotX = 0, rotY = 0, speed = 0, range = 0, direction = [1, 0, 0]) {
    this.position = [x, y, z];
    this.scale = [width, height, depth];
    this.cullRange = Math.hypot(width/2, height/2, depth/2) + 2.0; // Used to not calculate collisions for far away platforms
    this.shape = shape;

    this.rotation = [rotX, rotY]; 
    this.cosX = rotX !== 0 ? Math.cos(rotX) : 1;
    this.sinX = rotX !== 0 ? Math.sin(rotX) : 0;
    this.cosY = rotY !== 0 ? Math.cos(rotY) : 1;
    this.sinY = rotY !== 0 ? Math.sin(rotY) : 0;

    this.startPos = [x, y, z];
    this.speed = speed;
    this.range = range;
    this.deltaPosition = [0, 0, 0];
    this.direction = normalize(direction); 

    this.visible = visibility; 

    if (shape === "cube") {
      this.uvs = new Float32Array([
        0, 0, width, 0, width, height, 0, height, // front
        width, 0, width, height, 0, height, 0, 0, // back
        0, depth, 0, 0, width, 0, width, depth, // top
        0, depth, width, depth, width, 0, 0, 0, // bottom
        depth, 0, depth, height, 0, height, 0, 0, // right
        0, 0, depth, 0, depth, height, 0, height // left
      ]);
    }
    else if (shape === "wedge") {
      const slantLength = Math.hypot(height, depth);
      
      this.uvs = new Float32Array([
        0, 0, width, 0, width, slantLength, 0, slantLength, // top (slanted)
        0, 0, 0, height, width, height, width, 0,     // back 
        0, 0, width, 0, width, depth, 0, depth,       // bottom 
        0, 0, depth, 0, 0, height,                    // left 
        depth, 0, depth, height, 0, 0                 // right 
      ]);
    }
  }

  update(timeElapsed) {
    if (this.speed === 0) return;

    const lastX = this.position[0];
    const lastY = this.position[1];
    const lastZ = this.position[2];

    const offset = Math.sin(timeElapsed * this.speed) * this.range;
    this.position[0] = this.startPos[0] + this.direction[0] * offset;
    this.position[1] = this.startPos[1] + this.direction[1] * offset;
    this.position[2] = this.startPos[2] + this.direction[2] * offset;

    this.deltaPosition[0] = this.position[0] - lastX;
    this.deltaPosition[1] = this.position[1] - lastY;
    this.deltaPosition[2] = this.position[2] - lastZ;
  }

  getMatrix() {
    const T = translation(this.position[0], this.position[1], this.position[2]);
    const S = scaling(this.scale[0], this.scale[1], this.scale[2]);
    let M = S;
    
    if (this.rotation[0] !== 0) M = multiply(rotationX(this.rotation[0]), M);
    if (this.rotation[1] !== 0) M = multiply(rotationY(this.rotation[1]), M);
    
    return multiply(T, M);
  }
}

// Array of platform objects in the world
// NORMAL PLATFORM (visibility, xPos, yPos, zPos, width, height, depth, shape)
// ROTATED PLATFORM (visibility, xPos, yPos, zPos, width, height, depth, shape, rotX, rotY)
// MOVING PLATFORM (visibility, xPos, yPos, zPos, width, height, depth, shape, rotX, rotY, speed, range, direction[directionX, directionY, directionZ])
export const levelPlatforms = [
  new Platform(true, 0, 0, 0, 10, 1, 10, "cube"), // Floor

] 

function generatePlatforms(mode = 0) {
  switch (mode) {
    case 0: {
      // Inverted Pyramid Thing
      for (let i = 20; i > 0; i--) {
        const platformHeight = i * 5;
        const platformYOffset = platformHeight / 2 + 0.5; 
  
        levelPlatforms.push(new Platform(true, 0, platformYOffset, i * -10, i * 20 + 10, platformHeight, 10, "cube"));
        levelPlatforms.push(new Platform(true, 0, platformYOffset, i * 10, i * 20 + 10, platformHeight, 10, "cube"));
        levelPlatforms.push(new Platform(true, i * 10, platformYOffset, 0, 10, platformHeight, i * 20 - 10, "cube"));
        levelPlatforms.push(new Platform(true, i * -10, platformYOffset, 0, 10, platformHeight, i * 20 - 10, "cube"));
      }
      break;
    }

    case 1: {
      // Random Platformer
      for (let i = 20; i > 0; i--) {
        const platformHeight = 1;
        const platformYOffset = platformHeight / 2 - 0.5; 
        
        let rand = Math.floor(Math.random() * 20);

        levelPlatforms.push(new Platform(true, rand, platformYOffset + i * 5, i * -20, 10, platformHeight, 10, "cube"));
      }
      break;
    }

    case 2: {
      // Stress test
      let bounds = 15;
      for (let i = -bounds; i < bounds; i++) {
        for (let j = -bounds; j < bounds; j++) {
          for (let k = -bounds; k < bounds; k++) {
            levelPlatforms.push(new Platform(true, i * 15, j * 15, k * 15, 10, 1, 10, "cube"));
          }
        }
      }
      break;
    }
  }
}



generatePlatforms(1);

//TODO: Implement adding new platforms in real-time
// setTimeout(() => {
//   generatePlatforms();
// }, 2000);



  


