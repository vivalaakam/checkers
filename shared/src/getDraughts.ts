import Draughts from "@jortvl/draughts";

export function getDraughts() {
  if (Draughts.Draughts) {
    return Draughts.Draughts;
  }

  return Draughts;
}
