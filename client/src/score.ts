import {FEN} from "./types.ts";
import Draughts from "@jortvl/draughts";

export function scoreByPieceCount(board: FEN) {
    const KING_WEIGHT = 1.5; // Kings are usually more valuable
    let white_player_score = board.white.reduce((acc, row) => acc + (row.startsWith('K') ? KING_WEIGHT : 1), 0);
    let black_player_score = board.black.reduce((acc, row) => acc + (row.startsWith('K') ? KING_WEIGHT : 1), 0);

    return [white_player_score, black_player_score];
}


export function scoreByDefensivePositioning(board: FEN) {
    let white_score = board.white.reduce((acc, row) => acc + (row.startsWith('K') ? 6 : (Math.floor((50 - parseInt(row, 10)) / 5) + 1) * 0.5), 0);
    let black_score = board.black.reduce((acc, row) => acc + (row.startsWith('K') ? 6 : (Math.floor(parseInt(row, 10) / 5) + 1) * 0.5), 0);

    return [white_score, black_score];
}

export function scoreByOffensivePositioning(board: FEN) {
    let white_score = ['46', '47', '48', '49', '50', 'K46', 'K47', 'K48', 'K49', 'K50'].filter((x) => board.white.includes(x)).length;
    let black_score = ['1', '2', '3', '4', '5', 'K1', 'K2', 'K3', 'K4', 'K5'].filter((x) => board.black.includes(x)).length;

    return [white_score, black_score];
}

export function scoreByMobility(fen: FEN) {
    let d1 = new Draughts();
    d1.load(`B:W${fen.white.join(',')}:B${fen.black.join(',')}`);

    let black_score = d1.moves().reduce((acc, cap) => acc + 1 + (cap.takes.length * 10), 0)
    d1.load(`W:W${fen.white.join(',')}:B${fen.black.join(',')}`);
    let white_score = d1.moves().reduce((acc, cap) => acc + 1 + (cap.takes.length * 10), 0)

    return [white_score, black_score];
}


export function combinedScore(board: FEN): [number, number] {
    let scores_piece = scoreByPieceCount(board);
    let scores_def = scoreByDefensivePositioning(board);
    let scores_mobility = scoreByMobility(board);
    let scores_offensive = scoreByOffensivePositioning(board);

    return [scores_piece[0] + scores_def[0] + scores_mobility[0] + scores_offensive[0], scores_piece[1] + scores_def[1] + scores_mobility[1] + scores_offensive[1]];
}