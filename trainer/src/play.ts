import { playMatch } from "./play-match";
import { AgentTrainer } from "./agent";

export function play(playerA: AgentTrainer, playerB: AgentTrainer) {
  let score = 0;
  /**
   * Play the match
   */
  score += playMatch(playerA, playerB);
  /**
   * Play the reverse match
   */
  score += playMatch(playerB, playerA) * -1;

  return score;
}
