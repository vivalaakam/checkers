import { FEN } from "./types";

export interface Agent {
    getMove(gameState: FEN): any
}