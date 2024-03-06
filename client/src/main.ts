import { AgentAB } from "./agent-ab.ts";
import { AgentNN } from "./agent-nn.ts";
import { Board } from "./board.ts";
import { loadFile } from "./loadFile.ts";

const game = new Board("#app");

const playerWhiteSelect = document.querySelector(
  "#playerWhite"
) as HTMLSelectElement;
const playerWhiteDepth = document.querySelector(
  "#depthWhite"
) as HTMLInputElement;
const playerWhiteNN = document.querySelector("#fileWhite") as HTMLInputElement;
const playerBlackNN = document.querySelector("#fileBlack") as HTMLInputElement;

const playerBlackSelect = document.querySelector(
  "#playerBlack"
) as HTMLSelectElement;
const playerBlackDepth = document.querySelector(
  "#depthBlack"
) as HTMLInputElement;

playerWhiteSelect.addEventListener("change", () => {
  if (playerWhiteSelect.value == "nn") {
    playerWhiteNN.parentElement.style.display = "inline-block";
    playerWhiteDepth.parentElement.style.display = "none";
  } else {
    playerWhiteNN.parentElement.style.display = "none";
    playerWhiteDepth.parentElement.style.display = "inline-block";
  }
});

playerBlackSelect.addEventListener("change", () => {
  if (playerBlackSelect.value == "nn") {
    playerBlackNN.parentElement.style.display = "inline-block";
    playerBlackDepth.parentElement.style.display = "none";
  } else {
    playerBlackNN.parentElement.style.display = "none";
    playerBlackDepth.parentElement.style.display = "inline-block";
  }
});

document.querySelector("#game").addEventListener("click", async () => {
  const loadSnapshots = (
    document.querySelector("#loadSnapshots") as HTMLInputElement
  ).checked;

  if (playerWhiteSelect.value === "nn" && playerWhiteNN.files?.[0]) {
    const weight = await loadFile(playerWhiteNN.files[0]);
    game.whitePlayer = new AgentNN(weight, "W");
  } else {
    game.whitePlayer = new AgentAB(parseInt(playerWhiteDepth.value), "W");
  }
  if (playerBlackSelect.value === "nn" && playerBlackNN.files?.[0]) {
    const weight = await loadFile(playerBlackNN.files[0]);
    game.blackPlayer = new AgentNN(weight, "B");
  } else {
    game.blackPlayer = new AgentAB(parseInt(playerBlackDepth.value), "B");
  }

  if (loadSnapshots) {
    const file = await game.asPng(`game_000.png`);
    download(`game_000.png`, file);
  }
  let i = 1;
  while (!game.gameOver() && i < 300) {
    game.move();
    console.log("epoch", i, game.gameOver());
    game.drawScore();
    if (loadSnapshots) {
      const file = await game.asPng(
        `game_${i.toString().padStart(3, "0")}.png`
      );
      download(`game_${i.toString().padStart(3, "0")}.png`, file);
    }
    console.log("board", game.fen(), game.gameOver());
    await new Promise((resolve) => setTimeout(resolve, 1000));
    i += 1;
  }
});

function download(name: string, data: string) {
  const a = document.createElement("a"); //Create <a>
  a.href = data;
  a.download = name;
  a.click();
}
