import Draughts from "@jortvl/draughts";
import * as d3 from "d3";
import { getFen } from "./utils.ts";
import {
  combinedScore,
  scoreByDefensivePositioning,
  scoreByMobility,
  scoreByOffensivePositioning,
  scoreByPieceCount,
} from "./score.ts";
import d3ToPng from "d3-svg-to-png";
import { Agent } from "shared";

export class Board {
  _board: Draughts;
  _el: string;
  _moves: number;
  _white: Agent;
  _black: Agent;
  _gameOver: boolean = false;

  constructor(element: string) {
    this._board = Draughts();
    this._el = element;
    this._container = d3.select(element);
    this._moves = 0;
    this.drawBoard();
    this.draw();
  }

  set whitePlayer(player: Agent) {
    this._white = player;
  }

  set blackPlayer(player: Agent) {
    this._black = player;
  }

  asPng(name: string) {
    return d3ToPng(this._el, name, {
      scale: 3,
      format: "png",
      quality: 0.01,
      download: false,
      ignore: ".ignored",
      background: "white",
    });
  }

  gameOver() {
    return this._gameOver
  }

  fen() {
    return this._board.fen();
  }

  drawScore() {
    const fen = getFen(this._board.fen());

    const scores_piece = scoreByPieceCount(fen);
    const scores_def = scoreByDefensivePositioning(fen);
    const scores_mobility = scoreByMobility(fen);
    const scores_offensive = scoreByOffensivePositioning(fen);
    const scores_combine = combinedScore(fen);

    d3.select("text.white-piece").text(scores_piece[0]);
    d3.select("text.black-piece").text(scores_piece[1]);
    d3.select("text.white-def").text(scores_def[0]);
    d3.select("text.black-def").text(scores_def[1]);
    d3.select("text.white-mobility").text(scores_mobility[0]);
    d3.select("text.black-mobility").text(scores_mobility[1]);
    d3.select("text.white-offensive").text(scores_offensive[0]);
    d3.select("text.black-offensive").text(scores_offensive[1]);
    d3.select("text.white-total").text(scores_combine[0]);
    d3.select("text.black-total").text(scores_combine[1]);
    d3.select("text.moves").text(this._moves);
  }

  drawBoard() {
    const svg = this._container
      .append("svg")
      .attr("width", 600)
      .attr("height", 400);

    const gameBoard = svg.append("g");

    const checkers = svg.append("g");
    checkers.attr("class", "checkers");

    let position_index = 0;
    for (let i = 0; i < 100; i += 1) {
      if (i % 2 != Math.floor(i / 10) % 2) {
        position_index += 1;

        const cell = gameBoard
          .append("g")
          .attr("class", `tile`)
          .attr(
            "transform",
            `translate(${(i % 10) * 40}, ${Math.floor(i / 10) * 40})`
          );
        cell
          .append("rect")
          .attr("width", 40)
          .attr("height", 40)
          .attr("rx", 4)
          .attr("ry", 4)
          .style("fill", "gray");
        cell.append("text").text(position_index).attr("x", 0).attr("y", 12);
      }
    }

    const score = svg
      .append("g")
      .attr("class", "score")
      .attr("transform", `translate(410, 0)`);

    score.append("text").text("white").attr("x", 80).attr("y", 12);
    score.append("text").text("black").attr("x", 150).attr("y", 12);
    score.append("text").text("piece:").attr("x", 10).attr("y", 48);
    score
      .append("text")
      .attr("class", "white-piece")
      .text("0")
      .attr("x", 80)
      .attr("y", 48);
    score
      .append("text")
      .attr("class", "black-piece")
      .text("0")
      .attr("x", 150)
      .attr("y", 48);
    score.append("text").text("def:").attr("x", 10).attr("y", 84);
    score
      .append("text")
      .attr("class", "white-def")
      .text("0")
      .attr("x", 80)
      .attr("y", 84);
    score
      .append("text")
      .attr("class", "black-def")
      .text("0")
      .attr("x", 150)
      .attr("y", 84);
    score.append("text").text("mobility:").attr("x", 10).attr("y", 120);
    score
      .append("text")
      .attr("class", "white-mobility")
      .text("0")
      .attr("x", 80)
      .attr("y", 120);
    score
      .append("text")
      .attr("class", "black-mobility")
      .text("0")
      .attr("x", 150)
      .attr("y", 120);
    score.append("text").text("offensive:").attr("x", 10).attr("y", 156);
    score
      .append("text")
      .attr("class", "white-offensive")
      .text("0")
      .attr("x", 80)
      .attr("y", 156);
    score
      .append("text")
      .attr("class", "black-offensive")
      .text("0")
      .attr("x", 150)
      .attr("y", 156);
    score.append("text").text("total:").attr("x", 10).attr("y", 192);
    score
      .append("text")
      .attr("class", "white-total")
      .text("0")
      .attr("x", 80)
      .attr("y", 192);
    score
      .append("text")
      .attr("class", "black-total")
      .text("0")
      .attr("x", 150)
      .attr("y", 192);
    score.append("text").text("move:").attr("x", 10).attr("y", 228);
    score
      .append("text")
      .attr("class", "moves")
      .text("0")
      .attr("x", 80)
      .attr("y", 228);
  }

  getRandomeMove() {
    const moves = this._board.moves();
    return moves[Math.floor(Math.random() * moves.length)];
  }

  move() {
    if (this._gameOver) {
      console.log("game over");
      return;
    }

    const player =
      this._board.turn().toUpperCase() === "W" ? this._white : this._black;

    let path = player.getMove(getFen(this._board.fen()));
    const res = this._board.move(path);
    if (!res) {
      this._gameOver = true;
      console.log("game over");
      return;
    }
    this.draw();
    this._moves += 1;
  }

  draw() {
    d3.selectAll("g.checker").remove();
    const checkers = d3.select("g.checkers");
    const external_position = this._board.position();
    let position_index = 0;
    for (let row = 0; row < 10; row++) {
      const shifted = row % 2 !== 0 ? 1 : 0;
      for (let col = 0; col < 10; col++) {
        if ((col + shifted) % 2 === 1) {
          position_index += 1;
          const pieceGroup = checkers
            .append("g")
            .attr("transform", `translate(${col * 40 + 20}, ${row * 40 + 20})`)
            .attr("class", `checker ${external_position[position_index]}`)
            .attr("data-index", position_index);

          switch (external_position[position_index]) {
            case "b":
              pieceGroup.append("circle").attr("r", 10).style("fill", "black");
              break;
            case "B":
              pieceGroup
                .append("circle")
                .attr("r", 10)
                .style("fill", "black")
                .style("opacity", 0.4);
              break;
            case "w":
              pieceGroup.append("circle").attr("r", 10).style("fill", "white");
              break;
            case "W":
              pieceGroup
                .append("circle")
                .attr("r", 10)
                .style("fill", "white")
                .style("opacity", 0.4);
              break;
          }
        }
      }
    }
  }
}
