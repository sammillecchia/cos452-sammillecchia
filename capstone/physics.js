// File for handling player physics
export const player = {
    position: [0, 5, 0],
    velocity: [0, 0, 0],
    radius: 1.0,
    isGrounded: false
};

// Helper function for clamping 
function clampToEdge(lineStart, lineEnd) {
    const lineVector = [lineEnd[0] - lineStart[0], lineEnd[1] - lineStart[1]];
    const pointVector = [player.position[1] - lineStart[0], player.position[2] - lineStart[1]];

    const lenSq = lineVector[0] * lineVector[0] + lineVector[1] * lineVector[1];
    const dot = pointVector[0] * lineVector[0] + pointVector[1] * lineVector[1];

    const projectionScalar = Math.max(0, Math.min(1, dot / lenSq));

    return [
        lineStart[0] + projectionScalar * lineVector[0],
        lineStart[1] + projectionScalar * lineVector[1]
    ];
}

// Handles collisions/clipping
function resolveCollision(closestX, closestY, closestZ, isWedge) {
    const deltaX = player.position[0] - closestX;
    const deltaY = player.position[1] - closestY;
    const deltaZ = player.position[2] - closestZ;
    const distanceToSurface = Math.hypot(deltaX, deltaY, deltaZ);

    if (distanceToSurface >= player.radius || distanceToSurface <= 0.0001) return;

    const normalDirs = [
        deltaX / distanceToSurface,
        deltaY / distanceToSurface,
        deltaZ / distanceToSurface
    ]

    const clippingDepth = player.radius - distanceToSurface;

    // Push out of collision
    player.position[0] += normalDirs[0] * clippingDepth;
    player.position[1] += normalDirs[1] * clippingDepth;
    player.position[2] += normalDirs[2] * clippingDepth;

    const dot = player.velocity[0] * normalDirs[0] + player.velocity[1] * normalDirs[1] + player.velocity[2] * normalDirs[2];

    if (dot < 0) {
        player.velocity[0] -= dot * normalDirs[0];
        player.velocity[1] -= dot * normalDirs[1];

        // Sliding on wedges
        const zMultiplier = (isWedge && normalDirs[1] > 0.1 && normalDirs[1] < 0.9) ? 1.5 : 1.0;
        player.velocity[2] -= dot * normalDirs[2] * zMultiplier;
    }

    if (normalDirs[1] > 0.5) player.isGrounded = true;
}

export function updatePhysics(dt, camera, playerInputs, platforms) {
    player.isGrounded = false;

    // TODO: Move all of these static values for physics into one object
    // Gravity
    const gravity = -60.0;
    player.velocity[1] += gravity * dt;

    // WASD movement (relative to camera)
    const forwardX = -Math.sin(camera.azimuth);
    const forwardZ = -Math.cos(camera.azimuth);
    const rightX = Math.cos(camera.azimuth);
    const rightZ = -Math.sin(camera.azimuth);

    let moveX = 0;
    let moveZ = 0;

    if (playerInputs.movement.keyForward) { moveX += forwardX; moveZ += forwardZ; }
    if (playerInputs.movement.keyBack) { moveX -= forwardX; moveZ -= forwardZ; }
    if (playerInputs.movement.keyRight) { moveX += rightX; moveZ += rightZ; }
    if (playerInputs.movement.keyLeft) { moveX -= rightX; moveZ -= rightZ; }

    const moveLength = Math.hypot(moveX, moveZ);
    if (moveLength > 0) {
        moveX /= moveLength;
        moveZ /= moveLength;

        if (moveLength > 1.0) {
            const diagonalBoost = 1.15;
            moveX *= diagonalBoost;
            moveZ *= diagonalBoost;
        }
    }

    const acceleration = 70.0; //TODO
    player.velocity[0] += moveX * acceleration * dt;
    player.velocity[2] += moveZ * acceleration * dt;

    const friction = 8.0; //TODO
    if (player.isGrounded) {
        player.velocity[0] -= player.velocity[0] * friction * dt;
        player.velocity[2] -= player.velocity[2] * friction * dt;
    } else {
        player.velocity[0] -= player.velocity[0] * (friction * 0.2) * dt;
        player.velocity[2] -= player.velocity[2] * (friction * 0.2) * dt;
    }

    // Movment
    player.position[0] += player.velocity[0] * dt;
    player.position[1] += player.velocity[1] * dt;
    player.position[2] += player.velocity[2] * dt;

    // Collisions
    for (const platform of platforms) {
        const minX = platform.position[0] - (platform.scale[0] / 2);
        const maxX = platform.position[0] + (platform.scale[0] / 2);
        const minY = platform.position[1] - (platform.scale[1] / 2);
        const maxY = platform.position[1] + (platform.scale[1] / 2);
        const minZ = platform.position[2] - (platform.scale[2] / 2);
        const maxZ = platform.position[2] + (platform.scale[2] / 2);

        let closestX, closestY, closestZ;

        if (platform.shape === "cube") {
            closestX = Math.max(minX, Math.min(player.position[0], maxX));
            closestY = Math.max(minY, Math.min(player.position[1], maxY));
            closestZ = Math.max(minZ, Math.min(player.position[2], maxZ));
        } else if (platform.shape === "wedge") {
            const rampLength = Math.hypot(platform.scale[1], platform.scale[2]);
            const normalY = platform.scale[2] / rampLength;
            const normalZ = platform.scale[1] / rampLength;

            closestX = Math.max(minX, Math.min(player.position[0], maxX));
            closestY = player.position[1];
            closestZ = player.position[2];

            const distanceToSlope = (player.position[1] - minY) * normalY + (player.position[2] - maxZ) * normalZ;

            if ((distanceToSlope <= 0) && (player.position[1] >= minY) && (player.position[2] >= minZ)) {
                if (player.position[0] >= minX && player.position[0] <= maxX) {
                    const distances = [
                        -distanceToSlope, player.position[1] - minY,
                        player.position[2] - minZ, player.position[0] - minX,
                        maxX - player.position[0]
                    ];
                    const minDistance = Math.min(...distances);
                    switch (distances.indexOf(minDistance)) {
                        case 0: closestY += minDistance * normalY; closestZ += minDistance * normalZ; break;
                        case 1: closestY = minY; break;
                        case 2: closestZ = minZ; break;
                        case 3: closestX = minX; break;
                        case 4: closestX = maxX; break;
                    }
                }
            } else {
                const closestSlopePoint = clampToEdge([maxY, minZ], [minY, maxZ]);
                const closestBottomPoint = clampToEdge([minY, minZ], [minY, maxZ]);
                const closestBackPoint = clampToEdge([minY, minZ], [maxY, minZ]);

                const distToSlope = (player.position[1] - closestSlopePoint[0]) ** 2 + (player.position[2] - closestSlopePoint[1]) ** 2;
                const distToBottom = (player.position[1] - closestBottomPoint[0]) ** 2 + (player.position[2] - closestBottomPoint[1]) ** 2;
                const distToBack = (player.position[1] - closestBackPoint[0]) ** 2 + (player.position[2] - closestBackPoint[1]) ** 2;

                let bestPoint = distToSlope < distToBottom ? closestSlopePoint : closestBottomPoint;
                let bestDist = distToSlope < distToBottom ? distToSlope : distToBottom;
                bestPoint = distToBack < bestDist ? closestBackPoint : bestPoint;

                closestY = bestPoint[0];
                closestZ = bestPoint[1];
            }
        }
        resolveCollision(closestX, closestY, closestZ, (platform.shape === "wedge"));
    }

    // Jumping
    if (player.isGrounded && playerInputs.movement.keyJump) {
        player.velocity[1] = 30; // JUMP HEIGHT
        player.isGrounded = false;
    }

     // Check to reset position if you have fallen into the void
    if (player.position[1] < -20.0) {
        player.position = [0, 5, 0];
        player.velocity = [0, 0, 0];
    }
}

