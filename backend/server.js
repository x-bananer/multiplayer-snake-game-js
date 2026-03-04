import { WebSocketServer } from 'ws';
import { tickGame, generateFood } from './gameEngine.js';

const BOARD_SIZE = 380;

const PORT = process.env.PORT || 3000;
const CELL = 20;
const INITIAL_SPEED = 150;
const MIN_SPEED = 60;
const SPEED_STEP = 5;

const wss = new WebSocketServer({ port: PORT });

let width = BOARD_SIZE;
let height = BOARD_SIZE;
let speed = INITIAL_SPEED;
let intervalId;

let state;

const clients = new Set();

let players = {
    p1: null,
    p2: null,
    p3: null
};

const broadcast = () => {
    const data = JSON.stringify({ type: 'state', payload: state });
    clients.forEach(client => {
        if (client.readyState === 1) {
            client.send(data);
        }
    });
};

const startGame = () => {
    state = {
        snakes: {
            p1: [{ x: CELL, y: CELL }],
            p2: [{ x: width - CELL * 2, y: height - CELL * 2 }],
            p3: [{ x: width / 2, y: height / 2 }]
        },
        directions: {
            p1: 'RIGHT',
            p2: 'LEFT',
            p3: 'UP'
        },
        food: generateFood(width, height),
        scores: { p1: 0, p2: 0, p3: 0 },
        status: 'running',
        winner: null
    };

    speed = INITIAL_SPEED;
    clearInterval(intervalId);
    intervalId = setInterval(loop, speed);
};

const loop = () => {
    if (!state || state.status !== 'running') return;

    state = tickGame(state, width, height);

    broadcast();

    if (state.status !== 'running') {
        clearInterval(intervalId);
        return;
    }

    const totalScore = state.scores.p1 + state.scores.p2;
    const newSpeed = Math.max(MIN_SPEED, INITIAL_SPEED - totalScore * SPEED_STEP);

    if (newSpeed !== speed) {
        speed = newSpeed;
        clearInterval(intervalId);
        intervalId = setInterval(loop, speed);
    }
};

wss.on('connection', ws => {
    clients.add(ws);

    let playerId = null;

    if (!players.p1) {
        players.p1 = ws;
        playerId = 'p1';
    } else if (!players.p2) {
        players.p2 = ws;
        playerId = 'p2';
    } else if (!players.p3) {
        players.p3 = ws;
        playerId = 'p3';
    }

    ws.send(JSON.stringify({
        type: 'role',
        player: playerId
    }));

    ws.send(JSON.stringify({ type: 'state', payload: state }));

    ws.on('message', message => {
        try {
            const data = JSON.parse(message);

            if (data.type === 'input' && playerId) {
                const direction = data.direction;
                const current = state.directions[playerId];

                if (direction === 'DOWN' && current !== 'UP') state.directions[playerId] = 'DOWN';
                if (direction === 'UP' && current !== 'DOWN') state.directions[playerId] = 'UP';
                if (direction === 'RIGHT' && current !== 'LEFT') state.directions[playerId] = 'RIGHT';
                if (direction === 'LEFT' && current !== 'RIGHT') state.directions[playerId] = 'LEFT';
            }

            if (data.type === 'restart') {
                startGame();
                broadcast();
            }
        } catch (e) {}
    });

    ws.on('close', () => {
        clients.delete(ws);

        if (players.p1 === ws) players.p1 = null;
        if (players.p2 === ws) players.p2 = null;
        if (players.p3 === ws) players.p3 = null;
    });
});

startGame();
broadcast();

console.log(`Server running on port ${PORT}`);