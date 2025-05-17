import { useCallback, useContext, useRef } from "react";
import { ChessContext, ChessDispatchContext } from "./ChessContext";
import { PIECE, PLAYER } from "./constants";
import { getClonedObj, getNextplayerTurn } from "./utils";

const useOnPressingCell = () => {
  const chessState = useContext(ChessContext);
  const { board, selectedCell, playerTurn, previousTargetCell, pawnMovedTwoCellsInPreviousTurn, kingMoved, rookMoved } = chessState;
  const dispatch = useContext(ChessDispatchContext);
  const selectedBoardPiece = selectedCell ? board[selectedCell.row]?.[selectedCell.col] : undefined;
  const {piecePlayer: selectedPiecePlayer = '', pieceType: selectedPieceType = ''} = selectedBoardPiece || {};
  const tempBoard = useRef<Array<Array<{ piecePlayer: string; pieceType: string } | null>> | null>(null);
  const pawnMovedTwoCellsRef = useRef<boolean>(false);
  const kingMovedRef = useRef<{
    [key: string]: boolean;
  } | null>(null);
  const rookMovedRef = useRef<{
    [key: string]: {
      [key: string]: boolean;
    };
  } | null>(null);
  const {row: selectedRow = -1, col: selectedCol = -1} = selectedCell || {};

  const isKingInCheck = useCallback((board: Array<Array<{ piecePlayer: string; pieceType: string } | null>>, kingPosition: {row: number, col: number}, playerTurn: string) => {
    const {row, col} = kingPosition;
    const opponentPlayer = playerTurn === PLAYER.WHITE ? PLAYER.BLACK : PLAYER.WHITE;
    
    // Check for pawn attacks
    const pawnDirections = playerTurn === PLAYER.WHITE ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]];
    for (const [dr, dc] of pawnDirections) {
      const checkRow = row + dr;
      const checkCol = col + dc;
      if (checkRow >= 0 && checkRow < 8 && checkCol >= 0 && checkCol < 8) {
        const piece = board[checkRow][checkCol];
        if (piece && piece.pieceType === PIECE.PAWN && piece.piecePlayer === opponentPlayer) {
          return true;
        }
      }
    }
    
    // Check for knight attacks
    const knightMoves = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
    for (const [dr, dc] of knightMoves) {
      const checkRow = row + dr;
      const checkCol = col + dc;
      if (checkRow >= 0 && checkRow < 8 && checkCol >= 0 && checkCol < 8) {
        const piece = board[checkRow][checkCol];
        if (piece && piece.pieceType === PIECE.KNIGHT && piece.piecePlayer === opponentPlayer) {
          return true;
        }
      }
    }
    
    // Check for diagonal attacks (bishop and queen)
    const diagonalDirections = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    for (const [dr, dc] of diagonalDirections) {
      let checkRow = row + dr;
      let checkCol = col + dc;
      while (checkRow >= 0 && checkRow < 8 && checkCol >= 0 && checkCol < 8) {
        const piece = board[checkRow][checkCol];
        if (piece) {
          if (piece.piecePlayer === opponentPlayer && 
              (piece.pieceType === PIECE.BISHOP || piece.pieceType === PIECE.QUEEN)) {
            return true;
          }
          break; // Stop checking in this direction if we hit any piece
        }
        checkRow += dr;
        checkCol += dc;
      }
    }
    
    // Check for horizontal/vertical attacks (rook and queen)
    const straightDirections = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dr, dc] of straightDirections) {
      let checkRow = row + dr;
      let checkCol = col + dc;
      while (checkRow >= 0 && checkRow < 8 && checkCol >= 0 && checkCol < 8) {
        const piece = board[checkRow][checkCol];
        if (piece) {
          if (piece.piecePlayer === opponentPlayer && 
              (piece.pieceType === PIECE.ROOK || piece.pieceType === PIECE.QUEEN)) {
            return true;
          }
          break; // Stop checking in this direction if we hit any piece
        }
        checkRow += dr;
        checkCol += dc;
      }
    }
    
    // Check for king attacks (for adjacent squares)
    const kingMoves = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
    for (const [dr, dc] of kingMoves) {
      const checkRow = row + dr;
      const checkCol = col + dc;
      if (checkRow >= 0 && checkRow < 8 && checkCol >= 0 && checkCol < 8) {
        const piece = board[checkRow][checkCol];
        if (piece && piece.pieceType === PIECE.KING && piece.piecePlayer === opponentPlayer) {
          return true;
        }
      }
    }
    
    return false;
  }, []);

  const movePieceToTargetTemporarily = useCallback((targetRow: number, targetCol: number) => {
    if(!tempBoard.current) {
      return;
    }
    tempBoard.current[targetRow][targetCol] = tempBoard.current[selectedRow][selectedCol];
    tempBoard.current[selectedRow][selectedCol] = null;
    if(selectedPieceType === PIECE.KING && kingMovedRef.current) {
      kingMovedRef.current[selectedPiecePlayer] = true;
    }
    if(!rookMovedRef.current) {
      return;
    }
    if(selectedPieceType === PIECE.ROOK && selectedCell?.col === 0 && !rookMovedRef.current[selectedPiecePlayer][PIECE.QUEEN]) {
      rookMovedRef.current[selectedPiecePlayer][selectedPieceType] = true;
    }
    if(selectedPieceType === PIECE.ROOK && selectedCell?.col === 7 && !rookMovedRef.current[selectedPiecePlayer][PIECE.KING]) {
      rookMovedRef.current[selectedPiecePlayer][selectedPieceType] = true;
    }
  }, [selectedRow, selectedCol, selectedPiecePlayer, selectedPieceType]);

  const canPawnMove = useCallback((targetRow: number, targetCol: number) => {
    if(!tempBoard.current) {
      return false;
    }
    const moveDirection = selectedPiecePlayer === PLAYER.WHITE ? -1 : 1;
    const pawnInitialRow = selectedPiecePlayer === PLAYER.WHITE ? 6 : 1;
    const isPawnInInitialPosition = selectedRow === pawnInitialRow;
    const targetBoardPiece = board[targetRow][targetCol];
    if(Math.abs(selectedCol - targetCol) > 1) {
      return false;
    }
    if(selectedCol === targetCol) {
      if(targetBoardPiece) {
        return false;
      }
      if(targetRow === selectedRow + moveDirection) {
        movePieceToTargetTemporarily(targetRow, targetCol);
        return true;
      }
      if(targetRow === selectedRow + 2 * moveDirection && isPawnInInitialPosition) {
        movePieceToTargetTemporarily(targetRow, targetCol);
        pawnMovedTwoCellsRef.current = true;
        return true;
      }
      return false;
    }
    if(targetRow !== selectedRow + moveDirection) {
      return false;
    }
    if(targetBoardPiece) {
      movePieceToTargetTemporarily(targetRow, targetCol);
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
      movePieceToTargetTemporarily(targetRow, targetCol);
      tempBoard.current[previousTargetRow][previousTargetCol] = null;
      return true;
    }
    return false;
  }, [chessState, movePieceToTargetTemporarily]);

  const canKnightMove = useCallback((targetRow: number, targetCol: number) => {
    if(!tempBoard.current) {
      return false;
    }
    const colDiff = Math.abs(selectedCol - targetCol);
    const rowDiff = Math.abs(selectedRow - targetRow);
    if(colDiff == 2 && rowDiff == 1 || colDiff == 1 && rowDiff == 2) {
      movePieceToTargetTemporarily(targetRow, targetCol);
      return true;
    }
    return false;
  }, [chessState, movePieceToTargetTemporarily]);

  const canBishopMove = useCallback((targetRow: number, targetCol: number) => {
    if(!tempBoard.current) {
      return false;
    }
    const colDiff = Math.abs(selectedCol - targetCol);
    const rowDiff = Math.abs(selectedRow - targetRow);
    if(colDiff !== rowDiff) {
      return false;
    }
    const moveDirectionCol = (targetCol - selectedCol) / colDiff;
    const moveDirectionRow = (targetRow - selectedRow) / rowDiff;
    for(let i = 1; i < colDiff; i++) {
      const nextRow = selectedRow + moveDirectionRow * i;
      const nextCol = selectedCol + moveDirectionCol * i;
      if(board[nextRow][nextCol]) {
        return false;
      }
    }
    movePieceToTargetTemporarily(targetRow, targetCol);
    return true;
  }, [chessState, movePieceToTargetTemporarily]);

  const canRookMove = useCallback((targetRow: number, targetCol: number) => {
    if(!tempBoard.current) {
      return false;
    }
    const colDiff = Math.abs(selectedCol - targetCol);
    const rowDiff = Math.abs(selectedRow - targetRow);
    if(colDiff !== 0 && rowDiff !== 0) {
      return false;
    }
    if(colDiff === 0) {
      const moveDirectionRow = (targetRow - selectedRow) / rowDiff;
      for(let i = 1; i < rowDiff; i++) {
        const nextRow = selectedRow + moveDirectionRow * i;
        if(board[nextRow][selectedCol]) {
          return false;
        }
      }
    }
    if(rowDiff === 0) {
      const moveDirectionCol = (targetCol - selectedCol) / colDiff;
      for(let i = 1; i < colDiff; i++) {
        const nextCol = selectedCol + moveDirectionCol * i;
        if(board[selectedRow][nextCol]) {
          return false;
        }
      }
    }
    movePieceToTargetTemporarily(targetRow, targetCol);
    return true;
  }, [chessState, movePieceToTargetTemporarily]);

  const canQueenMove = useCallback((targetRow: number, targetCol: number) => {
    if(!tempBoard.current) {
      return false;
    }
    return canBishopMove(targetRow, targetCol) || canRookMove(targetRow, targetCol);
  }, [chessState, movePieceToTargetTemporarily, canBishopMove, canRookMove]);

  const canKingMove = useCallback((targetRow: number, targetCol: number) => {
    if(!tempBoard.current) {
      return false;
    }
    const colDiff = Math.abs(selectedCol - targetCol);
    const rowDiff = Math.abs(selectedRow - targetRow);
    
    // Normal king move
    if(colDiff <= 1 && rowDiff <= 1) {
      movePieceToTargetTemporarily(targetRow, targetCol);
      return true;
    }
    
    // Castling
    if(rowDiff === 0 && colDiff === 2) {
      // Check if king has moved before
      if(kingMoved[selectedPiecePlayer]) {
        return false;
      }
      
      // Determine rook position and new positions based on castling direction
      const isKingSideCastling = targetCol > selectedCol;
      const rookCol = isKingSideCastling ? 7 : 0;
      const rookNewCol = isKingSideCastling ? selectedCol + 1 : selectedCol - 1;
      const rook = board[selectedRow][rookCol];
      
      // Check if rook exists and hasn't moved
      if(!rook || rook.pieceType !== PIECE.ROOK || !rookMovedRef.current || rookMovedRef.current[rook.piecePlayer][rook.pieceType]) {
        return false;
      }
      
      // Check if path between rook and king is clear
      const pathStart = isKingSideCastling ? selectedCol + 1 : selectedCol - 1;
      const pathEnd = isKingSideCastling ? rookCol - 1 : rookCol + 1;
      const pathDirection = isKingSideCastling ? 1 : -1;
      
      for(let col = pathStart; col !== pathEnd; col += pathDirection) {
        if(board[selectedRow][col]) {
          return false;
        }
      }

      // Check if king is in check at current position
      const kingPosition = {row: selectedRow, col: selectedCol};
      if(isKingInCheck(tempBoard.current, kingPosition, selectedPiecePlayer)) {
        return false;
      }
      
      // Check if king's path is free from check
      for(let col = selectedCol; col !== targetCol; col += pathDirection) {
        // Temporarily move king to check position
        const originalPiece = tempBoard.current[selectedRow][col];
        tempBoard.current[selectedRow][col] = tempBoard.current[selectedRow][selectedCol];
        tempBoard.current[selectedRow][selectedCol] = null;
        
        // Check if king is in check at this position
        const kingPosition = {row: selectedRow, col};
        if(isKingInCheck(tempBoard.current, kingPosition, selectedPiecePlayer)) {
          // Restore original position
          tempBoard.current[selectedRow][selectedCol] = tempBoard.current[selectedRow][col];
          tempBoard.current[selectedRow][col] = originalPiece;
          return false;
        }
        
        // Restore original position
        tempBoard.current[selectedRow][selectedCol] = tempBoard.current[selectedRow][col];
        tempBoard.current[selectedRow][col] = originalPiece;
      }
      
      // Move both king and rook
      movePieceToTargetTemporarily(targetRow, targetCol);
      // Move rook to its new position (next to king)
      const rookNewPosition = isKingSideCastling ? targetCol - 1 : targetCol + 1;
      tempBoard.current[selectedRow][rookNewPosition] = tempBoard.current[selectedRow][rookCol];
      tempBoard.current[selectedRow][rookCol] = null;
      
      return true;
    }
    
    return false;
  }, [chessState, movePieceToTargetTemporarily]);

  const canPieceMove = useCallback((targetRow: number, targetCol: number) => {
    if(!selectedCell || !tempBoard.current) {
      return false;
    }
    switch (selectedPieceType) {
      case PIECE.PAWN: return canPawnMove(targetRow, targetCol);
      case PIECE.KNIGHT: return canKnightMove(targetRow, targetCol);
      case PIECE.BISHOP: return canBishopMove(targetRow, targetCol);
      case PIECE.ROOK: return canRookMove(targetRow, targetCol);
      case PIECE.QUEEN: return canQueenMove(targetRow, targetCol);
      case PIECE.KING: return canKingMove(targetRow, targetCol);
      default: return false;
    }
  }, [chessState, dispatch, canPawnMove, canKnightMove, canBishopMove, canRookMove, canQueenMove]);

  const getKingPosition = useCallback((board: Array<Array<{ piecePlayer: string; pieceType: string } | null>>, playerTurn: string) => {
    for(let row = 0; row < 8; row++) {
      for(let col = 0; col < 8; col++) {
        const boardPiece = board[row][col];
        if(boardPiece && boardPiece.pieceType === PIECE.KING && boardPiece.piecePlayer === playerTurn) {
          return {row, col};
        }
      }
    }
    return null;
  }, []);

  const isKingInCheckAfterMove = useCallback(() => {
    if(!tempBoard.current) {
      return false;
    }
    const kingPosition = getKingPosition(tempBoard.current, playerTurn);
    if (!kingPosition) return false;
    return isKingInCheck(tempBoard.current, kingPosition, playerTurn);
  }, [chessState, dispatch, getKingPosition, isKingInCheck]);

  const onPressingCell = useCallback((targetRow: number, targetCol: number) => {
    if(!dispatch) {
      return;
    }
    
    tempBoard.current = getClonedObj(board);
    pawnMovedTwoCellsRef.current = pawnMovedTwoCellsInPreviousTurn;
    kingMovedRef.current = getClonedObj(kingMoved);
    rookMovedRef.current = getClonedObj(rookMoved);

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

    if(canPieceMove(targetRow, targetCol)) {
      if(!isKingInCheckAfterMove()) {
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
            rookMoved: rookMovedRef.current,
            playerTurn: nextPlayerTurn,
            pawnEligibleToChange,
          }
        })
      } else {
        tempBoard.current = getClonedObj(board);
        pawnMovedTwoCellsRef.current = pawnMovedTwoCellsInPreviousTurn;
        kingMovedRef.current = getClonedObj(kingMoved);
        rookMovedRef.current = getClonedObj(rookMoved);
      }
    }

  }, [chessState, dispatch, canPieceMove, isKingInCheckAfterMove]);

  return onPressingCell;
}

export default useOnPressingCell;