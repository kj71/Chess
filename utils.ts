import { PIECE, PLAYER } from "./constants";

export const getFile = (col: number) => {
  return String.fromCharCode(97 + col);
}

export const getRank = (row: number) => {
  return (8 - row).toString();
}

export const getChessPiece = (pieceType: string, piecePlayer: string) => {
  const pieceUnicode = {
    [PIECE.PAWN]: piecePlayer === PLAYER.WHITE ? "\u2659" : "\u265F\uFE0E",
    [PIECE.ROOK]: piecePlayer === PLAYER.WHITE ? "\u2656" : "\u265C",
    [PIECE.KNIGHT]: piecePlayer === PLAYER.WHITE ? "\u2658" : "\u265E",
    [PIECE.BISHOP]: piecePlayer === PLAYER.WHITE ? "\u2657" : "\u265D",
    [PIECE.QUEEN]: piecePlayer === PLAYER.WHITE ? "\u2655" : "\u265B",
    [PIECE.KING]: piecePlayer === PLAYER.WHITE ? "\u2654" : "\u265A"
  }
  return pieceUnicode[pieceType];
}

export const getClonedObj = (obj: Object) => {
  return JSON.parse(JSON.stringify(obj));
}

export const getNextplayerTurn = (playerTurn: string) => {
  return playerTurn === PLAYER.WHITE ? PLAYER.BLACK : PLAYER.WHITE;
}