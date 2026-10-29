import { lookAt, inverse } from "./math.js";

// A class for handling moving the viewport
export class Camera {
    constructor(distance) {
        this.distance = distance;
        this.baseDistance = distance;
        this.azimuth = 0;          //X rotation
        this.elevation = 0;        //Y rotation
        this.up = [0, 1, 0];
        this.cameraMatrix = new Float32Array(16)
        this.viewMatrix = new Float32Array(16);
    }

    // Updates camara view position, takes a calculated target position and
    // the playerInputs.camera object 
    // Heavily references webgl2 fundamentals for creating the camera system
    // https://webgl2fundamentals.org/webgl/lessons/webgl-visualizing-the-camera.html
    update(targetPosition, inputs) {

        // TODO: Add collision detection so the camera doesnt clip through the floor (clamping/checking distance)

        // Starting with just 0.01 but may want to change this to allow for variable sensitivty
        this.azimuth -= inputs.camera.mouseX * 0.01;
        this.elevation -= inputs.camera.mouseY * 0.005;

        // Reset camera 
        inputs.camera.mouseX = 0;
        inputs.camera.mouseY = 0;

        // Set a offset for the camera so the marble is rendered lower down
        const yOffset = 1.5;
        const positionOffset = [
            targetPosition[0],
            targetPosition[1] + yOffset,
            targetPosition[2]
        ];

        // Clamping so camera cant move over the top of the marble
        const maxPitch = 1.56; // Slightly less than 90 degrees
        this.elevation = Math.max(-maxPitch, Math.min(maxPitch, this.elevation));

        const cosElevation = Math.cos(this.elevation);
        const eye = [
            positionOffset[0] + this.distance * cosElevation * Math.sin(this.azimuth),
            positionOffset[1] + this.distance * Math.sin(this.elevation),
            positionOffset[2] + this.distance * cosElevation * Math.cos(this.azimuth)
        ];

        const cameraMatrix = lookAt(eye, positionOffset, this.up);
        this.viewMatrix = inverse(cameraMatrix, cameraMatrix);
    }
}