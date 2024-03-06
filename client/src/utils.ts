import { FEN } from "./types.ts";
import Draughts from "@jortvl/draughts";

export function getFen(fen: string): FEN {
  const regex = /^(B|W):(W(.*)):(B(.*))$/;

  let m = regex.exec(fen);

  if (!m) {
    throw new Error("Invalid FEN");
  }

  return {
    move: m[1] === "B" ? "B" : "W",
    white: m[3].split(","),
    black: m[5].split(","),
  };
}

export function getMoves(gameState: FEN): { from: number; to: number }[] {
  const d1 = new Draughts();
  d1.load(
    `${gameState.move}:W${gameState.white.join(",")}:B${gameState.black.join(
      ","
    )}`
  );

  return d1.moves();
}
