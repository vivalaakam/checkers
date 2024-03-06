import { Agent } from "shared";
import { Network } from "shared";
import { FEN } from "./types";
import { getMoves } from "./utils";

export class AgentNN implements Agent {
  _player: "B" | "W";
  _network: Network;
  _history: Float32Array;
  _historySize: number;

  constructor(network: Float32Array, player: "B" | "W") {
    this._player = player;
    this._network = Network.fromBinary(network);
    this._historySize = this._network.inputs / 50 - 1;
    this._history = new Float32Array(this._historySize * 50);
  }

  getMove(gameState: FEN): string {
    const board = new Float32Array(50);
    const wMul = this._player === "W" ? 1 : -1;

    for (let i = 0; i < gameState.white.length; i++) {
      let isKing = gameState.white[i].startsWith("K");
      let pos = isKing
        ? parseInt(gameState.white[i].slice(1), 10)
        : parseInt(gameState.white[i], 10);
      board[pos] = wMul * (isKing ? 2 : 1);
    }

    for (let i = 0; i < gameState.black.length; i++) {
      let isKing = gameState.black[i].startsWith("K");
      let pos = isKing
        ? parseInt(gameState.black[i].slice(1), 10)
        : parseInt(gameState.black[i], 10);
      board[pos] = -1 * wMul * (isKing ? 2 : 1);
    }

    this._history = new Float32Array([...board, ...this._history.slice(50)]);

    const value = new Float32Array(this._network.inputs);
    value.set(new Float32Array(50));
    value.set(this._history, 50);

    let pos = 0;
    let posVal = -Infinity;

    const moves = getMoves(gameState);

    for (let i = 0; i < moves.length; i += 1) {
      /**
       * Create a new value for move
       */
      const move = moves[i];
      const val = value.slice();
      val[move.from - 1] = -1;
      val[move.to - 1] = 1;

      const result = this._network.predict(val);

      /**
       * If the result is better than the previous one, save it
       */
      if (result[0] > posVal) {
        pos = moves.indexOf(move);
        posVal = result[0];
      }
    }

    /**
     * Return the best move in the format from-to
     */
    return `${moves[pos].from}-${moves[pos].to}`;
  }
}
