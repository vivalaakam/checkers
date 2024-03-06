import { ArgumentParser } from "argparse";
import { tournaments } from "../src/tournaments";

async function tournamentsSingle(
  hist: number,
  layer: number[],
  epoch: number,
  population: number,
  iterations: number,
  best: boolean
) {
  for (let i = 0; i < iterations; i++) {
    await tournaments(hist, layer, epoch, population, best);
  }
}

const parser = new ArgumentParser({
  description: "Trainer",
  add_help: true,
});
parser.add_argument("--history", {
  type: "int",
  default: "1",
  help: "History size",
});

parser.add_argument("--epoch", {
  type: "int",
  default: "64",
  help: "num epoch",
});

parser.add_argument("--population", {
  type: "int",
  default: "32",
  help: "population size",
});

parser.add_argument("--layers", {
  type: "int",
  nargs: "+",
  default: [],
  help: "History size",
});

parser.add_argument("--iterations", {
  type: "int",
  default: "1",
  help: "population size",
});

parser.add_argument("--best");

const args = parser.parse_args();

tournamentsSingle(
  args.history,
  args.layers,
  args.epoch,
  args.population,
  args.iterations,
  args.best === "true"
).then(() => {
  console.log("done");
});
