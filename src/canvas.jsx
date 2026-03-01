import { useRef, useEffect } from 'react';

const CELL = 20;
const INITIAL_SPEED = 200;
const MIN_SPEED = 60;
const SPEED_STEP = 5;

const generateFood = (width, height) => ({
    x: Math.floor(Math.random() * (width / CELL)) * CELL,
    y: Math.floor(Math.random() * (height / CELL)) * CELL
});

const getNextHead = (snake, direction, width, height) => {
    const head = { ...snake[0] };

    if (direction === 'DOWN') {
        head.y = head.y + CELL > height - CELL ? 0 : head.y + CELL;
    }

    if (direction === 'UP') {
        head.y = head.y - CELL < 0 ? height - CELL : head.y - CELL;
    }

    if (direction === 'RIGHT') {
        head.x = head.x + CELL > width - CELL ? 0 : head.x + CELL;
    }

    if (direction === 'LEFT') {
        head.x = head.x - CELL < 0 ? width - CELL : head.x - CELL;
    }

    return head;
};

const checkSelfCollision = (snake, head) =>
    snake.some(segment => segment.x === head.x && segment.y === head.y);

const Canvas = ({ width, height }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        let direction = 'RIGHT';
        let speed = INITIAL_SPEED;
        let intervalId;
        let snake = [{ x: CELL, y: CELL }];
        let food = generateFood(width, height);

        const drawBackground = () => {
            ctx.fillStyle = '#FFCE1B';
            ctx.fillRect(0, 0, width, height);
        };

        const drawFood = () => {
            ctx.fillStyle = '#FF00FF';
            ctx.beginPath();
            ctx.arc(
                food.x + CELL / 2,
                food.y + CELL / 2,
                CELL / 2,
                0,
                Math.PI * 2
            );
            ctx.fill();
        };

        const drawSnake = () => {
            ctx.fillStyle = '#00674F';
            snake.forEach(segment => {
                ctx.beginPath();
                ctx.roundRect(segment.x, segment.y, CELL, CELL, 4);
                ctx.fill();
            });
        };

        const render = () => {
            drawBackground();
            drawFood();
            drawSnake();
        };

        const startLoop = () => {
            intervalId = setInterval(tick, speed);
        };

        const increaseSpeed = () => {
            clearInterval(intervalId);
            speed = Math.max(MIN_SPEED, speed - SPEED_STEP);
            startLoop();
        };

        const resetGame = () => {
            clearInterval(intervalId);
            alert('Game Over');
            snake = [{ x: CELL, y: CELL }];
            direction = 'RIGHT';
            speed = INITIAL_SPEED;
            food = generateFood(width, height);
            startLoop();
        };

        const tick = () => {
            const nextHead = getNextHead(snake, direction, width, height);

            if (checkSelfCollision(snake, nextHead)) {
                resetGame();
                return;
            }

            const ateFood = nextHead.x === food.x && nextHead.y === food.y;

            snake.unshift(nextHead);

            if (ateFood) {
                food = generateFood(width, height);
                increaseSpeed();
            } else {
                snake.pop();
            }

            render();
        };

        const handleKeyDown = event => {
            if (event.key === 'ArrowDown' && direction !== 'UP') {
                direction = 'DOWN';
            }

            if (event.key === 'ArrowUp' && direction !== 'DOWN') {
                direction = 'UP';
            }

            if (event.key === 'ArrowRight' && direction !== 'LEFT') {
                direction = 'RIGHT';
            }

            if (event.key === 'ArrowLeft' && direction !== 'RIGHT') {
                direction = 'LEFT';
            }
        };

        render();
        startLoop();

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            clearInterval(intervalId);
        };

    }, [width, height]);

    return <canvas ref={canvasRef} width={width} height={height} />;
};

export default Canvas;