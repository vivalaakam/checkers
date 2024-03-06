import { Draughts } from "@jortvl/draughts";
import { Player, Position, getFen } from "shared";
import { AgentTrainer } from "./agent";

export function playMatch(white: AgentTrainer, black: AgentTrainer) {
  const draughts = new Draughts();

  white.setPlayer(Player.White);
  black.setPlayer(Player.Black);

  while (!draughts.gameOver()) {
    /**
     * Get current player
     */
    const player = draughts.turn() === Player.White ? white : black;
    /**
     * Get the move from the player
     */
    const move = player.getMove(getFen(draughts.fen()));
    draughts.move(move);
  }

  /**
   * Calculate the score
   */
  const [winner, ...left] = draughts.position().split("");
  const score =
    250 +
    left.reduce((acc: number, val: string) => {
      switch (val) {
        case Position.Black:
        case Position.White:
          return acc + 3;
        case Position.BlackKing:
        case Position.WhiteKing:
          return acc + 7;
        default:
          return acc;
      }
    }, 0) -
    draughts.history().length;

  /**
   * Set the result, if white won, the score is positive, if black won, the score is negative
   */
  return winner === Player.White ? score : score * -1;
}
