import { playMatch } from "./play-match";
import { AgentTrainer } from "./agent";

export async function playBattle(playerList: AgentTrainer[]) {
  for (let i = 0; i < playerList.length - 1; i += 1) {
    for (let j = i + 1; j < playerList.length; j += 1) {
      let score = 0;
      /**
       * Play the match
       */
      score += playMatch(playerList[j], playerList[i]);
      /**
       * Play the reverse match
       */
      score += playMatch(playerList[i], playerList[j]) * -1;

      playerList[j].setResult(score, playerList[i]);
      playerList[i].setResult(-1 * score, playerList[j]);
    }
  }

  playerList.sort((player1, player2) => player2.score - player1.score);

  return playerList;
}
