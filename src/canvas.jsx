import { useRef, useEffect } from 'react';

function Canvas(props) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        const CELL = 20;

        context.fillStyle = '#FFCE1B';
        context.fillRect(0, 0, props.width, props.height);

        let direction = 'RIGHT';

        let snake = [
            { x: CELL, y: CELL }
        ];

        let speed = 200;

        let interval;

        let food = {
            x: Math.floor(Math.random() * (props.width / CELL)) * CELL,
            y: Math.floor(Math.random() * (props.height / CELL)) * CELL
        };

        context.fillStyle = '#FF00FF';
        context.beginPath();
        context.arc(
            food.x + CELL / 2,
            food.y + CELL / 2,
            CELL / 2,
            0,
            Math.PI * 2
        );
        context.fill();

        context.fillStyle = '#00674F';
        snake.forEach(item => {
            context.beginPath();
            context.roundRect(item.x, item.y, CELL, CELL, 4);
            context.fill();
        });

        const handleKeyDown = (event) => {
            if (event.key === 'ArrowDown') {
                direction = 'DOWN';
            }

            if (event.key === 'ArrowUp') {
                direction = 'UP';
            }

            if (event.key === 'ArrowRight') {
                direction = 'RIGHT';
            }

            if (event.key === 'ArrowLeft') {
                direction = 'LEFT';
            }
        };

        const startInterval = () => {
            
            interval = setInterval(() => {
                const head = { ...snake[0] };
                if (direction === 'DOWN') {
                    const isBottomEdge = head.y + CELL > props.height - CELL
                    if (!isBottomEdge) {
                        head.y += CELL;
                    } else {
                        head.y = 0;
                    }

                }

                if (direction === 'UP') {
                    const isTopEdge = (head.y - CELL) < 0;
                    if (!isTopEdge) {
                        head.y -= CELL;
                    } else {
                        head.y = props.height - CELL;
                    }

                }

                if (direction === 'RIGHT') {
                    const isRightEdge = head.x + CELL > props.width - CELL;
                    if (!isRightEdge) {
                        head.x += CELL;
                    } else {
                        head.x = 0;
                    }

                }

                if (direction === 'LEFT') {
                    const isLeftEdge = (head.x - CELL) < 0;
                    if (!isLeftEdge) {
                        head.x -= CELL;
                    } else {
                        head.x = props.width - CELL;
                    }

                }
                console.log(head.x, head.y)

                const isFood = head.x === food.x && head.y == food.y;
                const hitSelf = snake.some(segment => segment.x === head.x && segment.y === head.y);
                if (hitSelf) {
                    clearInterval(interval);
                    alert('Game Over');

                    // Reset game state
                    snake = [{ x: CELL, y: CELL }];
                    direction = 'RIGHT';
                    speed = 200;
                    food = {
                        x: Math.floor(Math.random() * (props.width / CELL)) * CELL,
                        y: Math.floor(Math.random() * (props.height / CELL)) * CELL
                    };

                    startInterval();
                    return;
                }

                snake.unshift(head);

                if (isFood) {
                    food.x = Math.floor(Math.random() * (props.width / CELL)) * CELL;
                    food.y = Math.floor(Math.random() * (props.height / CELL)) * CELL;

                    context.fillStyle = '#FF00FF';
                    context.beginPath();
                    context.arc(
                        food.x + CELL / 2,
                        food.y + CELL / 2,
                        CELL / 2,
                        0,
                        Math.PI * 2
                    );
                    context.fill();

                    clearInterval(interval);
                    speed = Math.max(60, speed - 5);
                    startInterval();
                } else {
                    snake.pop();
                }


                context.fillStyle = '#FFCE1B';
                context.fillRect(0, 0, props.width, props.height);

                context.fillStyle = '#FF00FF';
                context.beginPath();
                context.arc(
                    food.x + CELL / 2,
                    food.y + CELL / 2,
                    CELL / 2,
                    0,
                    Math.PI * 2
                );
                context.fill();


                context.fillStyle = '#00674F';
                snake.forEach(item => {
                    context.beginPath();
                    context.roundRect(item.x, item.y, CELL, CELL, 4);
                    context.fill();
                });
            }, speed);
        }

        startInterval();

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            clearInterval(interval);
        };
    }, []);


    return <canvas ref={canvasRef} width={props.width} height={props.height} />;
}

export default Canvas;