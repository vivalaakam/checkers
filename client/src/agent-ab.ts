import { Agent } from "shared";
import { alphaBeta } from "./alpha-beta-search";
import { FEN } from "./types";
import { getMoves } from "./utils";

export class AgentAB implements Agent {
  depth: number;
  player: "B" | "W";
  constructor(depth: number, player: "B" | "W") {
    this.depth = depth;
    this.player = player;
  }

  getRandomeMove(gameState: FEN) {
    return getMoves(gameState)
      .map((x) => `${x.from}-${x.to}`)
      .sort(() => Math.random() - 0.5);
  }

  getMove(gameState: FEN) {
    const result = alphaBeta(
      gameState,
      this.depth,
      {
        score: 0,
        path: [],
      },
      -Infinity,
      Infinity,
      this.player
    );

    console.log("result", result);

    return result.path.length ? result.path[0] : this.getRandomeMove(gameState);
  }
}
