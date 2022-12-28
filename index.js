const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter; 

const cellsHorizontal = 15;
const cellsVertical = 15; 
const width = window.innerWidth;
const height = window.innerHeight; 

const unitLengthX = width / cellsHorizontal; 
const unitLengthY = height / cellsVertical; 

const engine = Engine.create();
engine.world.gravity.y = 0; 
const { world } = engine;
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        wireframes: false, 
        width, 
        height
    }
});
Render.run(render);
Runner.run(Runner.create(), engine); 
 
// Walls
const walls = [
    // Top
    Bodies.rectangle(width * 0.5, 0, width, 4, { label: 'wall', isStatic: true }),
    // Left
    Bodies.rectangle(0, height * 0.5, 4, height, { label: 'wall', isStatic: true }),
    // Right
    Bodies.rectangle(width, height * 0.5, 4, height, { label: 'wall', isStatic: true }),
    // Down
    Bodies.rectangle(width * 0.5, height, width, 4, { label: 'wall', isStatic: true })
];
World.add(world, walls); 


// Maze

const shuffle = (arr) => {
    let counter = arr.length;

    while(counter > 0) {
        const index = Math.floor(Math.random() * counter);
        counter--;
        const temp = arr[counter]; 
        arr[counter] = arr[index]; 
        arr[index] = temp; 

    }
    return arr; 
}

const grid = Array(cellsVertical).fill(null).map(() => Array(cellsHorizontal).fill(false)); 

const verticals = Array(cellsVertical).fill(null).map(() => Array(cellsHorizontal - 1).fill(false));
const horizontals = Array(cellsVertical - 1).fill(null).map(() => Array(cellsHorizontal).fill(false));

const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);

const wallBreaker = (row, column) => {
    if(grid[row][column]) {
        return;
    }
    grid[row][column] = true; 

    const neighbors = shuffle([
        [row - 1, column, 'Up'],
        [row, column + 1, 'Right'],
        [row + 1, column, 'Down'],
        [row, column - 1, 'Left']
    ]);
    
    for(let neighbor of neighbors) {
        const [nextRow, nextColumn, direction] = neighbor; 
        if(nextRow < 0 || nextRow >= cellsVertical || nextColumn < 0 || nextColumn >= cellsHorizontal) {
            continue; 
        };

        if(grid[nextRow][nextColumn]) {
            continue;
        };

        if(direction === 'Left') {
            verticals[row][column - 1] = true; 
        } else if (direction === 'Right') {
            verticals[row][column] = true; 
        } else if(direction === 'Up') {
            horizontals[row - 1][column] = true; 
        } else if (direction === 'Down') {
            horizontals[row][column] = true; 
        }; 

        wallBreaker(nextRow, nextColumn); 

    }
}



wallBreaker(startRow, startColumn); 
console.log(horizontals, verticals);

horizontals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if(open) {
            return;
        };
        const wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX / 2,
            rowIndex * unitLengthY + unitLengthY,
            unitLengthX,
            10,
            {
                label: 'wall',
                isStatic: true,
                render: {
                    fillStyle: 'red'
                }
            }
        ); 
        World.add(world, wall); 
    });
}); 

verticals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if(open) {
            return true; 
        }

        const wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX,
            rowIndex * unitLengthY + unitLengthY / 2,
            10, 
            unitLengthY,
            {
                label: 'wall', 
                isStatic: true,
                render: {
                    fillStyle: 'red'
                }
            }
        );
        World.add(world, wall); 
    });
});

// Goal

const goal = Bodies.rectangle(
    width - unitLengthX / 2,
    height - unitLengthY / 2,
    unitLengthX * 0.5,
    unitLengthY * 0.7,
    {
        label: 'goal', 
        isStatic: true,
        render: {
            fillStyle: 'green'
        }
    }
);
World.add(world, goal);

// Ball

const ballRadius = Math.min(unitLengthX, unitLengthY) / 4; 
const ball = Bodies.circle(
    unitLengthX / 2,
    unitLengthY / 2,
    ballRadius,
    {
        label: 'ball'
    }
);
World.add(world, ball); 

document.addEventListener('keydown', event => {
    const { x, y } = ball.velocity; 

    if(event.code === 'ArrowLeft') {
        Body.setVelocity(ball, { x: x - 3, y }); 
    };
    if(event.code === 'ArrowUp') {
        Body.setVelocity(ball, { x, y: y - 3 }); 
    };
    if(event.code === 'ArrowRight') {
        Body.setVelocity(ball, { x: x + 3, y: y }); 
    };
    if(event.code === 'ArrowDown') {
        Body.setVelocity(ball, { x: x, y: y + 3 }); 
    };
});

// Win Condition

Events.on(engine, 'collisionStart', event => {
    event.pairs.forEach(collision => {
        const labels = ['ball', 'goal'];

        if(
            labels.includes(collision.bodyA.label) &&
            labels.includes(collision.bodyB.label)
        ) {
            document.querySelector('.winner').classList.remove('hidden'); 
            world.gravity.y = 1; 
            world.bodies.forEach(body => {
                if(body.label === 'wall' || body.label === 'goal') {
                    Body. setStatic(body, false); 
                }
            })
        }
    });
});