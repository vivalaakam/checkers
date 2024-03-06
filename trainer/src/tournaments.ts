import * as fs from "fs";
import { playTournament } from "./play-tournament";
import { Network, createNew, crossover, mutate } from "shared";
import { playBattle } from "./play-battle";
import { AgentTrainer } from "./agent";

export async function tournaments(
  historySize: number,
  layers: number[] = [],
  epoch = 64,
  population = 32,
  best = false
) {
  const modelName = `${(historySize + 1) * 50}_${layers.join("_")}`;
  const modelPath = `../models/${modelName}`;
  /**
   * Create the model if it does not exist
   */
  if (!fs.existsSync(modelPath)) {
    fs.mkdirSync(modelPath, { recursive: true });
  }

  let topPlayerList = [];
  const topPlayerIds = new Set();
  const bestModels = new Set();
  let playerList: AgentTrainer[] = [];

  const baseLayers = [];
  let inp = historySize * 50 + 50;
  for (let i = 0; i < layers.length; i++) {
    baseLayers.push([inp, 1, layers[i]]);
    inp = layers[i];
  }

  const baseNet = new Network(historySize * 50 + 50, 1, baseLayers);

  const topologySize = baseNet.getTopology().length;
  const size = baseNet.size() + topologySize;

  /**
   * Load the best models
   */
  if (best) {
    const weights = fs
      .readdirSync(modelPath)
      .filter((file) => file.endsWith(".bin"));

    for (const weight of weights) {
      const buf = fs.readFileSync(`${modelPath}/${weight}`);
      const weights = new Float32Array(buf.buffer);
      const agent = new AgentTrainer(historySize * 50, weights);
      agent.age = 1;
      bestModels.add(agent.id);
      playerList.push(agent);
      topPlayerList.push(agent);
      topPlayerIds.add(agent.id);
    }

    const d = playerList.length;
    let ind = 0;
    /**
     * Create new players by crossover and mutation from the best models.
     * For the zero population, we need to ensure the greatest genetic diversity, than next populations.
     * This way we will get a larger number of potentially viable models, from which subsequent generations will be built in the future
     */
    if (d > 1) {
      while (playerList.length < Math.max(population, d * 2)) {
        const playerA = playerList[ind];
        const playerB = playerList[Math.floor(Math.random() * d)];

        if (playerA && playerB && playerA.id !== playerB.id) {
          const newWeights = mutate(
            crossover(playerA.getWeights(), playerB.getWeights())
          );

          const weights = new Float32Array(size);
          weights.set(baseNet.getTopology());
          weights.set(newWeights, topologySize);

          const agent = new AgentTrainer(historySize * 50, weights);
          playerList.push(agent);

          ind += 1;
          ind = ind % d;
        }
      }
    }
  }

  /**
   * Create the initial population
   */
  while (playerList.length < population) {
    const w = createNew(baseNet.size(), 2);

    const weights = new Float32Array(size);
    weights.set(baseNet.getTopology());
    weights.set(w, topologySize);

    const agent = new AgentTrainer(historySize * 50, weights);
    playerList.push(agent);
  }

  /**
   * Run the initial championship
   */
  playerList = await playTournament(playerList);

  console.log(
    `0 ${playerList[0].id} (${playerList[0].age}) with ${playerList[0].score} points`
  );

  let currentEpoch = 0;
  while (currentEpoch <= epoch) {
    /**
     * Keep the best 25% of the population
     */
    playerList = playerList.slice(0, Math.floor(population / 4));

    for (const player of playerList) {
      player.onNewEpoch();

      /**
       * if the player is in the top 25% and has played at least one tournament, add it to the top players
       */
      if (player.age > 1 && !topPlayerIds.has(player.id)) {
        topPlayerIds.add(player.id);
        topPlayerList.push(player);
        console.log("add top player", player.id, topPlayerList.length);
      }
    }

    const d = playerList.length;

    /**
     * Create new players by crossover and mutation
     */
    let ind = 0;
    while (playerList.length < population) {
      const playerA = playerList[ind];
      const playerB = playerList[Math.floor(Math.random() * d)];

      if (playerA && playerB && playerA.id !== playerB.id) {
        const newWeights = mutate(
          crossover(playerA.getWeights(), playerB.getWeights())
        );

        const weights = new Float32Array(size);
        weights.set(baseNet.getTopology());
        weights.set(newWeights, topologySize);

        const agent = new AgentTrainer(historySize * 50, weights);
        playerList.push(agent);
        ind += 1;
        ind = ind % d;
      }
    }

    /**
     * Run the championship
     */
    playerList = await playTournament(playerList);
    currentEpoch += 1;
    console.log(
      `${currentEpoch} ${playerList[0].id} (${playerList[0].age}) with ${playerList[0].score} points`
    );
  }

  /**
   * Add the top players to the list from championship
   */
  for (const player of playerList) {
    if (player.age > 1 && !topPlayerIds.has(player.id)) {
      topPlayerIds.add(player.id);
      topPlayerList.push(player);
      console.log("add top player", player.id, topPlayerList.length);
    }
  }

  console.log("-----");
  console.log(topPlayerList.length);
  console.log("-----");

  /**
   * Reset agents
   */
  for (const player of topPlayerList) {
    player.onNewEpoch();
  }

  /**
   * Run the final championship
   */
  topPlayerList = await playBattle(topPlayerList);
  let index = 1;
  for (const player of topPlayerList) {
    const code = bestModels.has(player.id) ? "\x1b[32m" : "\x1b[36m";
    const reset = "\x1b[m";
    console.log(
      `${code}${String(index).padStart(4, " ")} ${player.toString()}${reset}`
    );
    index += 1;
  }

  /**
   * Save the best player
   */

  while (topPlayerList[0] && bestModels.has(topPlayerList[0].id)) {
    /**
     * Remove the best player if it is already in the best models
     */
    console.log("remove", topPlayerList[0].id);
    topPlayerList.shift();
  }

  if (topPlayerList[0]) {
    let player = topPlayerList[0];
    console.log(`${player.score} ${player.id}`);
    const weights = player.serialize();

    console.log(weights.length, weights.length / 4);
    fs.writeFileSync(`${modelPath}/${player.id}.bin`, weights);
  }
}
