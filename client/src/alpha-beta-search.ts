import {ABScore, FEN} from "./types.ts";
import {combinedScore} from "./score.ts";
import Draughts from '@jortvl/draughts';
import {getFen} from "./utils.ts";


function isGameOver(gameState: FEN) {
    return gameState.black.length === 0 || gameState.white.length === 0;
}

function getLegalMoves(gameState: FEN) {
    const d1 = new Draughts();
    d1.load(`${gameState.move}:W${gameState.white.join(',')}:B${gameState.black.join(',')}`);

    return d1.moves().map((x) => `${x.from}-${x.to}`).sort(() => Math.random() - 0.5);
}

function applyMove(gameState: FEN, move: string) {
    const d1 = new Draughts();
    d1.load(`${gameState.move}:W${gameState.white.join(',')}:B${gameState.black.join(',')}`);
    d1.move(move);
    return getFen(d1.fen());
}

export function alphaBeta(
    gameState: FEN,
    depth: number,
    paths: ABScore = {
        score: 0,
        path: []
    },
    alpha: number = -Infinity,
    beta: number = Infinity,
    maximizingPlayer: "B" | "W"
):
    ABScore {
    if (depth === 0 || isGameOver(gameState)) {
        return {
            score: combinedScore(gameState)[maximizingPlayer === "B" ? 1 : 0],
            path: paths.path
        };
    }

    if (gameState.move === maximizingPlayer) {
        let maxEval = {score: -Infinity, path: []};
        for (const move of getLegalMoves(gameState)) {
            const ev = alphaBeta(
                applyMove(gameState, move), depth - 1, {
                    score: 0,
                    path: paths.path.concat(move)
                }, alpha, beta, maximizingPlayer === "B" ? "W" : "B"
            );
            if (ev.score > maxEval.score) {
                maxEval = ev;
            }

            if (ev.score > alpha) {
                alpha = ev.score;
            }

            if (beta <= alpha) {
                break;
            }
        }
        return maxEval;
    } else {
        let minEval = {score: Infinity, path: []};
        for (const move of getLegalMoves(gameState)) {
            const ev = alphaBeta(
                applyMove(gameState, move),
                depth - 1,
                {
                    score: 0,
                    path: paths.path.concat(move)
                },
                alpha, beta,
                maximizingPlayer === "B" ? "W" : "B"
            );

            if (ev.score < minEval.score) {
                minEval = ev;
            }

            if (ev.score < beta) {
                beta = ev.score;
            }

            if (beta <= alpha) {
                break;
            }
        }
        return minEval;
    }
}