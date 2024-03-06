import { play } from "./play";
import { AgentTrainer } from "./agent";

export async function playTournament(playerList: AgentTrainer[]) {
  let d = Math.floor(playerList.length / 2);

  /**
   * Count rounds
   */
  let rounds = Math.ceil(Math.log2(playerList.length)) + 2;

  for (let i = 0; i < rounds; i += 1) {
    playerList.forEach((player) => player.reset());

    for (let j = 0; j < d; j += 1) {
      let dj = d;

      /**
       * Find the next opponent
       */
      let found = false;
      while (dj < playerList.length && !found) {
        if (
          playerList[dj].hasPlayedBefore(playerList[j]) ||
          playerList[dj].games > i
        ) {
          dj += 1;
        } else {
          found = true;
        }
      }

      if (found) {
        const score = play(playerList[j], playerList[dj]);

        // console.log(playerList[j].id, playerList[dj].id, score);

        playerList[j].setResult(score, playerList[dj]);
        playerList[dj].setResult(-1 * score, playerList[j]);
      }
    }

    playerList.sort((player1, player2) => player2.score - player1.score);

    // for (const player of playerList) {
    //     console.log(player.id, player.score);
    // }

    console.log(
      "round",
      i,
      playerList[0].id,
      playerList[0].score.toFixed(1).padStart(6, " ")
    );
  }

  return playerList;
}
