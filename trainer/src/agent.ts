import { Keccak } from "sha3";
import { Network, Agent, createEmpty, getMoves, FEN } from "shared";

export class AgentTrainer implements Agent {
  historySize: number;
  history: Float32Array;
  id: string;
  private _games: Set<string> = new Set();
  games: number = 0;
  wins: number = 0;
  score: number = 0;
  minScore = +Infinity;
  maxScore = -Infinity;
  age: number = 0;
  network: Network;
  taken: boolean = false;
  _player: "B" | "W" = "W";

  /**
   * Create a new agent
   * @param historySize
   * @param modelPath
   * @param weights
   */
  constructor(historySize: number, buf: Float32Array) {
    this.historySize = historySize;
    this.network = Network.fromBinary(buf);
    this.id = new Keccak(256).update(Buffer.from(buf.buffer)).digest("hex");
    this.history = createEmpty(this.historySize);
  }

  /**
   * Create a new epoch
   */
  onNewEpoch() {
    this.age += 1;
    this.score = 0;
    this.games = 0;
    this._games = new Set();
    this.maxScore = -Infinity;
    this.minScore = +Infinity;
    this.wins = 0;
    this.reset();
  }

  /**
   * Check if the player has played against the opponent
   * @param player
   */
  hasPlayedBefore(player: AgentTrainer) {
    if (this.id === player.id) {
      return false;
    }

    return this._games.has(player.id);
  }

  /**
   * Set the result of a match
   * @param score
   * @param opponent
   */
  setResult(score: number, opponent: AgentTrainer) {
    this._games.add(opponent.id);
    this.games += 1;
    this.score += score;
    this.minScore = Math.min(this.minScore, score);
    this.maxScore = Math.max(this.maxScore, score);

    if (score > 0) {
      this.wins += 1;
    }
  }

  /**
   * Calculate the average score
   * @returns number
   */
  getAverageScore() {
    return this.score / this.games;
  }

  /**
   * Get the weights of the network
   */
  getWeights() {
    return this.network.getWeights();
  }

  getTopology() {
    return this.network.getTopology();
  }

  /**
   * Serialize the weights of the network
   */
  serialize() {
    return this.network.toBinary();
  }

  /**
   * Reset history
   */
  reset() {
    this.history = new Float32Array(this.historySize);
    this.taken = false;
  }

  toString() {
    return `${this.id} with ${String(this.score).padStart(
      6,
      " "
    )} points min: ${String(this.minScore).padStart(6, " ")} max: ${String(
      this.maxScore
    ).padStart(6, " ")} avg: ${String(
      this.getAverageScore().toFixed(2)
    ).padStart(9, " ")} ${((this.wins / this.games) * 100)
      .toFixed(2)
      .padStart(6, " ")}%`;
  }

  setPlayer(player: "B" | "W") {
    this._player = player;
  }

  /**
   * Calculate moves and return the best one
   * @param gameState 
   * @returns 
   */
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

    this.history = new Float32Array([...board, ...this.history.slice(50)]);
    const value = new Float32Array(this.network.inputs);
    value.set(new Float32Array(50));
    value.set(this.history, 50);

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

      const result = this.network.predict(val);

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
