import { useCallback, useContext } from "react";
import { ChessContext, ChessDispatchContext } from "./ChessContext";
import { PIECE, PLAYER } from "./constants";

const useOnPressingCell = () => {
  const chessState = useContext(ChessContext);
  const { board, selectedCell, playerTurn, previousTargetCell, pawnMovedForwardinPreviousTurn } = chessState;
  const dispatch = useContext(ChessDispatchContext);
  const selectedBoardPiece = selectedCell ? board[selectedCell.row]?.[selectedCell.col] : undefined;
  const {piecePlayer: selectedPiecePlayer = '', pieceType: selectedPieceType = ''} = selectedBoardPiece || {};

  const canPieceMove = useCallback((targetRow: number, targetCol: number) => {
    if(!selectedCell) {
      return;
    }
    const targetBoardPiece = board[targetRow][targetCol];
    const {piecePlayer: targetPiecePlayer = ''} = targetBoardPiece || {};
    const {row: selectedRow, col: selectedCol} = selectedCell;

    switch (selectedPieceType) {
      case PIECE.PAWN: {
        const moveDirection = selectedPiecePlayer === PLAYER.WHITE ? -1 : 1;
        const pawnInitialRow = selectedPiecePlayer === PLAYER.WHITE ? 6 : 1;
        const isPawnInInitialPosition = selectedRow === pawnInitialRow;
        if(Math.abs(selectedCol - targetCol) > 1) {
          return false;
        }
        if(selectedCol === targetCol) {
          if(targetBoardPiece) {
            return false;
          }
          if(targetRow === selectedRow + moveDirection) {
            return true;
          }
          if(targetRow === selectedRow + 2 * moveDirection && isPawnInInitialPosition) {
            return true;
          }
          return false;
        }
        if(targetRow !== selectedRow + moveDirection) {
          return false;
        }
        if(targetBoardPiece) {
          return true;
        }
        if(!pawnMovedForwardinPreviousTurn || !previousTargetCell) {
          return false;
        }
        const {row: previousTargetRow, col: previousTargetCol} = previousTargetCell;
        if(
          isPawnInInitialPosition 
          && pawnMovedForwardinPreviousTurn
          && previousTargetRow === selectedRow
          && previousTargetCol === targetCol
        ) {
          return true;
        }
      }
    }

  }, [chessState]);

  const onPressingCell = useCallback((targetRow: number, targetCol: number) => {
    if(!dispatch) {
      return;
    }
    const targetBoardPiece = board[targetRow][targetCol];
    const {piecePlayer: targetPiecePlayer = '', pieceType: targetPieceType = ''} = targetBoardPiece || {};
    
    if(!selectedCell) {
      if(targetPiecePlayer !== playerTurn) {
        return;
      }
      dispatch({
        type: "SELECT_CELL",
        payload: { row: targetRow, col: targetCol },
      });
      return;
    }
   
    if(targetPiecePlayer === playerTurn) {
      dispatch({
        type: "SELECT_CELL",
        payload: { row: targetRow, col: targetCol },
      });
      return;
    }

    dispatch({
      type: "SELECT_CELL",
      payload: null,
    });

    if(canPieceMove()) {

    }

  }, [chessState]);

  return onPressingCell;
}

export default useOnPressingCell;