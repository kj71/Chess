import { PIECE, PLAYER, GAME_STATE } from './constants';

interface Cell {
  row: number;
  col: number;
}

interface ChessContextType {
  board: Array<Array<{ piecePlayer: string; pieceType: string } | null>>;
  selectedCell: Cell | null;
  previousTargetCell: Cell | null;
  pawnMovedForwardinPreviousTurn: boolean;
  playerTurn: string;
  gameState: string;
  kingMoved: {
    [key: string]: boolean;
  };
}

export const initialChessState: ChessContextType = {
  board: [
    [
      { pieceType: PIECE.ROOK, piecePlayer: PLAYER.BLACK },
      { pieceType: PIECE.KNIGHT, piecePlayer: PLAYER.BLACK },
      { pieceType: PIECE.BISHOP, piecePlayer: PLAYER.BLACK },
      { pieceType: PIECE.QUEEN, piecePlayer: PLAYER.BLACK },
      { pieceType: PIECE.KING, piecePlayer: PLAYER.BLACK },
      { pieceType: PIECE.BISHOP, piecePlayer: PLAYER.BLACK },
      { pieceType: PIECE.KNIGHT, piecePlayer: PLAYER.BLACK },
      { pieceType: PIECE.ROOK, piecePlayer: PLAYER.BLACK },
    ],
    [
      { pieceType: PIECE.PAWN, piecePlayer: PLAYER.BLACK },
      { pieceType: PIECE.PAWN, piecePlayer: PLAYER.BLACK },
      { pieceType: PIECE.PAWN, piecePlayer: PLAYER.BLACK },
      { pieceType: PIECE.PAWN, piecePlayer: PLAYER.BLACK },
      { pieceType: PIECE.PAWN, piecePlayer: PLAYER.BLACK },
      { pieceType: PIECE.PAWN, piecePlayer: PLAYER.BLACK },
      { pieceType: PIECE.PAWN, piecePlayer: PLAYER.BLACK },
      { pieceType: PIECE.PAWN, piecePlayer: PLAYER.BLACK },
    ],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [
      { pieceType: PIECE.PAWN, piecePlayer: PLAYER.WHITE },
      { pieceType: PIECE.PAWN, piecePlayer: PLAYER.WHITE },
      { pieceType: PIECE.PAWN, piecePlayer: PLAYER.WHITE },
      { pieceType: PIECE.PAWN, piecePlayer: PLAYER.WHITE },
      { pieceType: PIECE.PAWN, piecePlayer: PLAYER.WHITE },
      { pieceType: PIECE.PAWN, piecePlayer: PLAYER.WHITE },
      { pieceType: PIECE.PAWN, piecePlayer: PLAYER.WHITE },
      { pieceType: PIECE.PAWN, piecePlayer: PLAYER.WHITE },
    ],
    [
      { pieceType: PIECE.ROOK, piecePlayer: PLAYER.WHITE },
      { pieceType: PIECE.KNIGHT, piecePlayer: PLAYER.WHITE },
      { pieceType: PIECE.BISHOP, piecePlayer: PLAYER.WHITE },
      { pieceType: PIECE.QUEEN, piecePlayer: PLAYER.WHITE },
      { pieceType: PIECE.KING, piecePlayer: PLAYER.WHITE },
      { pieceType: PIECE.BISHOP, piecePlayer: PLAYER.WHITE },
      { pieceType: PIECE.KNIGHT, piecePlayer: PLAYER.WHITE },
      { pieceType: PIECE.ROOK, piecePlayer: PLAYER.WHITE },
    ],
  ],
  selectedCell: null,
  previousTargetCell: null,
  playerTurn: PLAYER.WHITE,
  gameState: GAME_STATE.IN_PROGRESS,
  kingMoved: {
    [PLAYER.WHITE]: false,
    [PLAYER.BLACK]: false,
  },
  pawnMovedForwardinPreviousTurn: false,
};

const chessReducer = (state: ChessContextType, action: any) => {
  const {payload, type} = action;
  switch (type) {
    case 'SELECT_CELL': {
      return {
        ...state,
        selectedCell: payload,
      };
    }
    default:
      return state;
  }
};

export default chessReducer;