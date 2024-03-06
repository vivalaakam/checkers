import { FEN } from "./types";

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