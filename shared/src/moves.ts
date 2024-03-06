import { FEN } from "./types";
import { getDraughts } from "./getDraughts";

const Draughts = getDraughts();
export function getMoves(gameState: FEN): { from: number; to: number }[] {
  const d1 = new Draughts();
  d1.load(
    `${gameState.move}:W${gameState.white.join(",")}:B${gameState.black.join(
      ","
    )}`
  );

  return d1.moves();
}
