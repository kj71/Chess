import { useCallback, useContext, useRef } from "react";
import { ChessContext, ChessDispatchContext } from "./ChessContext";
import { PIECE, PLAYER } from "./constants";
import { getClonedObj, getNextplayerTurn } from "./utils";

const useOnPressingCell = () => {
  const chessState = useContext(ChessContext);
  const { board, selectedCell, playerTurn, previousTargetCell, pawnMovedTwoCellsInPreviousTurn, kingMoved } = chessState;
  const dispatch = useContext(ChessDispatchContext);
  const selectedBoardPiece = selectedCell ? board[selectedCell.row]?.[selectedCell.col] : undefined;
  const {piecePlayer: selectedPiecePlayer = '', pieceType: selectedPieceType = ''} = selectedBoardPiece || {};
  const tempBoard = useRef<Array<Array<{ piecePlayer: string; pieceType: string } | null>> | null>(null);
  const pawnMovedTwoCellsRef = useRef<boolean>(false);
  const kingMovedRef = useRef<{
    [key: string]: boolean;
  } | null>(null);

  const canPieceMove = useCallback((targetRow: number, targetCol: number) => {
    if(!selectedCell || !tempBoard.current) {
      return;
    }
    const targetBoardPiece = board[targetRow][targetCol];
    const {piecePlayer: targetPiecePlayer = ''} = targetBoardPiece || {};
    const {row: selectedRow, col: selectedCol} = selectedCell;

    const movePieceToTargetTemporarily = () => {
      if(!tempBoard.current) {
        return;
      }
      tempBoard.current[targetRow][targetCol] = tempBoard.current[selectedRow][selectedCol];
      tempBoard.current[selectedRow][selectedCol] = null;
    }

    const canPawnMove = () => {
      if(!tempBoard.current) {
        return;
      }
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
          movePieceToTargetTemporarily();
          return true;
        }
        if(targetRow === selectedRow + 2 * moveDirection && isPawnInInitialPosition) {
          movePieceToTargetTemporarily();
          pawnMovedTwoCellsRef.current = true;
          return true;
        }
        return false;
      }
      if(targetRow !== selectedRow + moveDirection) {
        return false;
      }
      if(targetBoardPiece) {
        movePieceToTargetTemporarily();
        return true;
      }
      if(!pawnMovedTwoCellsInPreviousTurn || !previousTargetCell) {
        return false;
      }
      const {row: previousTargetRow, col: previousTargetCol} = previousTargetCell;
      const enPassantRow = selectedPiecePlayer === PLAYER.WHITE ? 3 : 4;
      if(
        selectedRow === enPassantRow
        && pawnMovedTwoCellsInPreviousTurn
        && previousTargetRow === selectedRow
        && previousTargetCol === targetCol
      ) {
        movePieceToTargetTemporarily();
        tempBoard.current[previousTargetRow][previousTargetCol] = null;
        return true;
      }
    }

    switch (selectedPieceType) {
      case PIECE.PAWN: return canPawnMove();

    }

  }, [chessState, dispatch]);

  const isKingInCheckAfterMove = useCallback(() => {
    return false;
  }, [chessState, dispatch]);

  const onPressingCell = useCallback((targetRow: number, targetCol: number) => {
    if(!dispatch) {
      return;
    }
    
    tempBoard.current = getClonedObj(board);
    pawnMovedTwoCellsRef.current = pawnMovedTwoCellsInPreviousTurn;
    kingMovedRef.current = getClonedObj(kingMoved);

    const targetBoardPiece = board[targetRow][targetCol];
    const {piecePlayer: targetPiecePlayer = '', pieceType: targetPieceType = ''} = targetBoardPiece || {};
    
    if(!selectedCell) {
      if(targetPiecePlayer !== playerTurn) {
        return;
      }
      dispatch({
        type: 'SELECT_CELL',
        payload: { row: targetRow, col: targetCol },
      });
      return;
    }
   
    if(targetPiecePlayer === playerTurn) {
      dispatch({
        type: 'SELECT_CELL',
        payload: { row: targetRow, col: targetCol },
      });
      return;
    }

    if(canPieceMove(targetRow, targetCol) && !isKingInCheckAfterMove()) {
      let nextPlayerTurn = getNextplayerTurn(playerTurn);
      let pawnEligibleToChange = false;
      const isLastRow = (playerTurn === PLAYER.WHITE) ? (targetRow === 0): (targetRow === 7);
      if(selectedPieceType === PIECE.PAWN && isLastRow) {
        nextPlayerTurn = playerTurn;
        pawnEligibleToChange = true;
      }
      dispatch ({
        type: 'UPDATE_BOARD_AFTER_MOVE',
        payload: {
          board: tempBoard.current,
          pawnMovedTwoCellsInPreviousTurn: pawnMovedTwoCellsRef.current,
          previousTargetCell: {
            row: targetRow,
            col: targetCol,
          },
          kingMoved: kingMovedRef.current,
          playerTurn: nextPlayerTurn,
          pawnEligibleToChange,
        }
      })
    }

  }, [chessState, dispatch, canPieceMove, isKingInCheckAfterMove]);

  return onPressingCell;
}

export default useOnPressingCell;