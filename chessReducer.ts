import { PIECE, PLAYER, GAME_STATE } from './constants';

interface Cell {
  row: number;
  col: number;
}

interface ChessContextType {
  board: Array<Array<{ piecePlayer: string; pieceType: string } | null>>;
  selectedCell: Cell | null;
  previousTargetCell: Cell | null;
  pawnMovedTwoCellsInPreviousTurn: boolean;
  playerTurn: string;
  gameState: string;
  kingMoved: {
    [key: string]: boolean;
  };
  rookMoved: {
    [key: string]: {
      [key: string]: boolean;
    };
  };
  pawnEligibleToChange: boolean;
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
  rookMoved: {
    [PLAYER.WHITE]: {
      [PIECE.KING]: false,
      [PIECE.QUEEN]: false,
    },
    [PLAYER.BLACK]: {
      [PIECE.KING]: false,
      [PIECE.QUEEN]: false,
    },
  },
  pawnMovedTwoCellsInPreviousTurn: false,
  pawnEligibleToChange: false,
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
    case 'UPDATE_BOARD_AFTER_MOVE': {
      const {
        board,
        pawnMovedTwoCellsInPreviousTurn,
        previousTargetCell,
        kingMoved,
        rookMoved,
        playerTurn,
        pawnEligibleToChange,
      } = payload;
      return {
        ...state,
        board,
        selectedCell: null,
        previousTargetCell,
        playerTurn,
        kingMoved,
        rookMoved,
        pawnMovedTwoCellsInPreviousTurn,
        pawnEligibleToChange,
      }
    }
    case 'REPLACE_PAWN': {
      const {pieceType, playerTurn} = payload;
      const newBoard = state.board;
      if (state.previousTargetCell) {
        const {row, col} = state.previousTargetCell;
        newBoard[row][col] = {
          piecePlayer: newBoard[row][col]?.piecePlayer || PLAYER.WHITE,
          pieceType,
        };
      }
      return {
        ...state,
        board: newBoard,
        playerTurn,
        pawnEligibleToChange: false,
      }
    }
    case 'UPDATE_GAME_STATE': {
      return {
        ...state,
        gameState: payload,
      }
    }
    default:
      return state;
  }
};

export default chessReducer;