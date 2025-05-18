import { useCallback, useContext, useEffect, useRef } from "react";
import { ChessContext, ChessDispatchContext } from "./ChessContext";
import { GAME_STATE, PIECE, PLAYER } from "./constants";
import { getClonedObj, getNextplayerTurn } from "./utils";

const useOnPressingCell = () => {
  const chessState = useContext(ChessContext);
  const { board, selectedCell, playerTurn, previousTargetCell, pawnMovedTwoCellsInPreviousTurn, kingMoved, rookMoved, gameState } = chessState;
  const dispatch = useContext(ChessDispatchContext);
  const selectedBoardPiece = selectedCell ? board[selectedCell.row]?.[selectedCell.col] : undefined;
  const {pieceType: selectedPieceType = ''} = selectedBoardPiece || {};
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

  const movePieceToTargetTemporarily = useCallback((
    targetRow: number, 
    targetCol: number, 
    selectedCell: {row: number, col: number},
    selectedPiece: {piecePlayer: string, pieceType: string}
  ) => {
    if(!tempBoard.current) {
      return;
    }
    tempBoard.current[targetRow][targetCol] = tempBoard.current[selectedCell.row][selectedCell.col];
    tempBoard.current[selectedCell.row][selectedCell.col] = null;
    
    if(selectedPiece.pieceType === PIECE.KING && kingMovedRef.current) {
      kingMovedRef.current[selectedPiece.piecePlayer] = true;
    }

    if(!rookMovedRef.current) {
      return;
    }

    if(targetCol === 0 && targetRow === 0) {
      rookMovedRef.current[PLAYER.BLACK][PIECE.QUEEN] = true;
    }
    if(targetCol === 7 && targetRow === 0) {
      rookMovedRef.current[PLAYER.BLACK][PIECE.KING] = true;
    }
    if(targetCol === 0 && targetRow === 7) {
      rookMovedRef.current[PLAYER.WHITE][PIECE.QUEEN] = true;
    }
    if(targetCol === 7 && targetRow === 7) {
      rookMovedRef.current[PLAYER.WHITE][PIECE.KING] = true;
    }
    
    if(selectedPiece.pieceType !== PIECE.ROOK) {
      return;
    }
    if(selectedCell.col === 0 && selectedCell.row === (selectedPiece.piecePlayer === PLAYER.WHITE ? 7 : 0)) {
      rookMovedRef.current[selectedPiece.piecePlayer][selectedPiece.pieceType] = true;
    }
    if(selectedCell.col === 7 && selectedCell.row === (selectedPiece.piecePlayer === PLAYER.WHITE ? 7 : 0)) {
      rookMovedRef.current[selectedPiece.piecePlayer][selectedPiece.pieceType] = true;
    }
  }, []);

  const canPawnMove = useCallback((
    targetRow: number, 
    targetCol: number, 
    selectedCell: {row: number, col: number},
    selectedPiece: {piecePlayer: string, pieceType: string}
  ) => {
    if(!tempBoard.current) {
      return false;
    }
    const moveDirection = selectedPiece.piecePlayer === PLAYER.WHITE ? -1 : 1;
    const pawnInitialRow = selectedPiece.piecePlayer === PLAYER.WHITE ? 6 : 1;
    const isPawnInInitialPosition = selectedCell.row === pawnInitialRow;
    const targetBoardPiece = board[targetRow][targetCol];
    if(Math.abs(selectedCell.col - targetCol) > 1) {
      return false;
    }
    if(selectedCell.col === targetCol) {
      if(targetBoardPiece) {
        return false;
      }
      if(targetRow === selectedCell.row + moveDirection) {
        movePieceToTargetTemporarily(targetRow, targetCol, selectedCell, selectedPiece);
        return true;
      }
      if(targetRow === selectedCell.row + 2 * moveDirection && isPawnInInitialPosition) {
        movePieceToTargetTemporarily(targetRow, targetCol, selectedCell, selectedPiece);
        pawnMovedTwoCellsRef.current = true;
        return true;
      }
      return false;
    }
    if(targetRow !== selectedCell.row + moveDirection) {
      return false;
    }
    if(targetBoardPiece) {
      movePieceToTargetTemporarily(targetRow, targetCol, selectedCell, selectedPiece);
      return true;
    }
    if(!pawnMovedTwoCellsInPreviousTurn || !previousTargetCell) {
      return false;
    }
    const {row: previousTargetRow, col: previousTargetCol} = previousTargetCell;
    const enPassantRow = selectedPiece.piecePlayer === PLAYER.WHITE ? 3 : 4;
    if(
      selectedCell.row === enPassantRow
      && pawnMovedTwoCellsInPreviousTurn
      && previousTargetRow === selectedCell.row
      && previousTargetCol === targetCol
    ) {
      movePieceToTargetTemporarily(targetRow, targetCol, selectedCell, selectedPiece);
      tempBoard.current[previousTargetRow][previousTargetCol] = null;
      return true;
    }
    return false;
  }, [chessState, movePieceToTargetTemporarily]);

  const canKnightMove = useCallback((
    targetRow: number, 
    targetCol: number, 
    selectedCell: {row: number, col: number},
    selectedPiece: {piecePlayer: string, pieceType: string}
  ) => {
    if(!tempBoard.current) {
      return false;
    }
    const colDiff = Math.abs(selectedCell.col - targetCol);
    const rowDiff = Math.abs(selectedCell.row - targetRow);
    if(colDiff == 2 && rowDiff == 1 || colDiff == 1 && rowDiff == 2) {
      movePieceToTargetTemporarily(targetRow, targetCol, selectedCell, selectedPiece);
      return true;
    }
    return false;
  }, [chessState, movePieceToTargetTemporarily]);

  const canBishopMove = useCallback((
    targetRow: number, 
    targetCol: number, 
    selectedCell: {row: number, col: number},
    selectedPiece: {piecePlayer: string, pieceType: string}
  ) => {
    if(!tempBoard.current) {
      return false;
    }
    const colDiff = Math.abs(selectedCell.col - targetCol);
    const rowDiff = Math.abs(selectedCell.row - targetRow);
    if(colDiff !== rowDiff) {
      return false;
    }
    const moveDirectionCol = (targetCol - selectedCell.col) / colDiff;
    const moveDirectionRow = (targetRow - selectedCell.row) / rowDiff;
    for(let i = 1; i < colDiff; i++) {
      const nextRow = selectedCell.row + moveDirectionRow * i;
      const nextCol = selectedCell.col + moveDirectionCol * i;
      if(tempBoard.current[nextRow][nextCol]) {
        return false;
      }
    }
    movePieceToTargetTemporarily(targetRow, targetCol, selectedCell, selectedPiece);
    return true;
  }, [chessState, movePieceToTargetTemporarily]);

  const canRookMove = useCallback((
    targetRow: number, 
    targetCol: number, 
    selectedCell: {row: number, col: number},
    selectedPiece: {piecePlayer: string, pieceType: string}
  ) => {
    if(!tempBoard.current) {
      return false;
    }
    const colDiff = Math.abs(selectedCell.col - targetCol);
    const rowDiff = Math.abs(selectedCell.row - targetRow);
    if(colDiff !== 0 && rowDiff !== 0) {
      return false;
    }
    if(colDiff === 0) {
      const moveDirectionRow = (targetRow - selectedCell.row) / rowDiff;
      for(let i = 1; i < rowDiff; i++) {
        const nextRow = selectedCell.row + moveDirectionRow * i;
        if(tempBoard.current[nextRow][selectedCell.col]) {
          return false;
        }
      }
    }
    if(rowDiff === 0) {
      const moveDirectionCol = (targetCol - selectedCell.col) / colDiff;
      for(let i = 1; i < colDiff; i++) {
        const nextCol = selectedCell.col + moveDirectionCol * i;
        if(tempBoard.current[selectedCell.row][nextCol]) {
          return false;
        }
      }
    }
    movePieceToTargetTemporarily(targetRow, targetCol, selectedCell, selectedPiece);
    return true;
  }, [chessState, movePieceToTargetTemporarily]);

  const canQueenMove = useCallback((
    targetRow: number, 
    targetCol: number, 
    selectedCell: {row: number, col: number},
    selectedPiece: {piecePlayer: string, pieceType: string}
  ) => {
    if(!tempBoard.current) {
      return false;
    }
    return canBishopMove(targetRow, targetCol, selectedCell, selectedPiece) || 
           canRookMove(targetRow, targetCol, selectedCell, selectedPiece);
  }, [chessState, movePieceToTargetTemporarily, canBishopMove, canRookMove]);

  const canKingMove = useCallback((
    targetRow: number, 
    targetCol: number, 
    selectedCell: {row: number, col: number},
    selectedPiece: {piecePlayer: string, pieceType: string}
  ) => {
    if(!tempBoard.current) {
      return false;
    }
    const colDiff = Math.abs(selectedCell.col - targetCol);
    const rowDiff = Math.abs(selectedCell.row - targetRow);
    
    // Normal king move
    if(colDiff <= 1 && rowDiff <= 1) {
      movePieceToTargetTemporarily(targetRow, targetCol, selectedCell, selectedPiece);
      return true;
    }
    
    // Castling
    if(rowDiff === 0 && colDiff === 2) {
      // Check if king has moved before
      if(kingMoved[selectedPiece.piecePlayer]) {
        return false;
      }
      
      // Determine rook position and new positions based on castling direction
      const isKingSideCastling = targetCol > selectedCell.col;
      const rookCol = isKingSideCastling ? 7 : 0;
      const rook = tempBoard.current[selectedCell.row][rookCol];
      
      // Check if rook exists and hasn't moved
      if(!rook || rook.pieceType !== PIECE.ROOK || rookMovedRef?.current?.[rook.piecePlayer]?.[rook.pieceType]) {
        return false;
      }
      
      // Check if path between rook and king is clear
      const pathStart = isKingSideCastling ? selectedCell.col + 1 : selectedCell.col - 1;
      const pathEnd = isKingSideCastling ? rookCol - 1 : rookCol + 1;
      const pathDirection = isKingSideCastling ? 1 : -1;
      
      for(let col = pathStart; col !== pathEnd; col += pathDirection) {
        if(tempBoard.current[selectedCell.row][col]) {
          return false;
        }
      }

      // Check if king is in check at current position
      const kingPosition = {row: selectedCell.row, col: selectedCell.col};
      if(isKingInCheck(tempBoard.current, kingPosition, selectedPiece.piecePlayer)) {
        return false;
      }
      
      // Check if king's path is free from check
      for(let col = selectedCell.col; col !== targetCol; col += pathDirection) {
        // Temporarily move king to check position
        const originalPiece = tempBoard.current[selectedCell.row][col];
        tempBoard.current[selectedCell.row][col] = tempBoard.current[selectedCell.row][selectedCell.col];
        tempBoard.current[selectedCell.row][selectedCell.col] = null;
        
        // Check if king is in check at this position
        const kingPosition = {row: selectedCell.row, col};
        if(isKingInCheck(tempBoard.current, kingPosition, selectedPiece.piecePlayer)) {
          // Restore original position
          tempBoard.current[selectedCell.row][selectedCell.col] = tempBoard.current[selectedCell.row][col];
          tempBoard.current[selectedCell.row][col] = originalPiece;
          return false;
        }
        
        // Restore original position
        tempBoard.current[selectedCell.row][selectedCell.col] = tempBoard.current[selectedCell.row][col];
        tempBoard.current[selectedCell.row][col] = originalPiece;
      }
      
      // Move both king and rook
      movePieceToTargetTemporarily(targetRow, targetCol, selectedCell, selectedPiece);
      // Move rook to its new position (next to king)
      const rookNewPosition = isKingSideCastling ? targetCol - 1 : targetCol + 1;
      tempBoard.current[selectedCell.row][rookNewPosition] = tempBoard.current[selectedCell.row][rookCol];
      tempBoard.current[selectedCell.row][rookCol] = null;
      
      return true;
    }
    
    return false;
  }, [chessState, movePieceToTargetTemporarily]);

  const canPieceMove = useCallback((targetRow: number, targetCol: number, selectedCell: {row: number, col: number}) => {
    if(!selectedCell || !tempBoard.current) {
      return false;
    }
    const selectedPiece = tempBoard.current[selectedCell.row][selectedCell.col];
    if (!selectedPiece) return false;
    const targetPiece = tempBoard.current[targetRow][targetCol];
    if (targetPiece && targetPiece.piecePlayer === selectedPiece.piecePlayer) return false;
    
    switch (selectedPiece.pieceType) {
      case PIECE.PAWN: return canPawnMove(targetRow, targetCol, selectedCell, selectedPiece);
      case PIECE.KNIGHT: return canKnightMove(targetRow, targetCol, selectedCell, selectedPiece);
      case PIECE.BISHOP: return canBishopMove(targetRow, targetCol, selectedCell, selectedPiece);
      case PIECE.ROOK: return canRookMove(targetRow, targetCol, selectedCell, selectedPiece);
      case PIECE.QUEEN: return canQueenMove(targetRow, targetCol, selectedCell, selectedPiece);
      case PIECE.KING: return canKingMove(targetRow, targetCol, selectedCell, selectedPiece);
      default: return false;
    }
  }, [chessState, dispatch, canPawnMove, canKnightMove, canBishopMove, canRookMove, canQueenMove, canKingMove]);

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
    if(gameState !== GAME_STATE.IN_PROGRESS) {
      return;
    }
    tempBoard.current = getClonedObj(board);
    pawnMovedTwoCellsRef.current = pawnMovedTwoCellsInPreviousTurn;
    kingMovedRef.current = getClonedObj(kingMoved);
    rookMovedRef.current = getClonedObj(rookMoved);

    const targetBoardPiece = board[targetRow][targetCol];
    const {piecePlayer: targetPiecePlayer = ''} = targetBoardPiece || {};
    
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

    if(canPieceMove(targetRow, targetCol, selectedCell)) {
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
            board: getClonedObj(tempBoard.current),
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

  const isKingInCheckMate = useCallback(() => {
    if(!tempBoard.current) {
      return false;
    }
    const kingPosition = getKingPosition(tempBoard.current, playerTurn);
    if(!kingPosition) {
      return false;
    }
    if(!isKingInCheck(tempBoard.current, kingPosition, playerTurn)) {
      return false; 
    }
    for(let row = 0; row < 8; row++) {
      for(let col = 0; col < 8; col++) {
        if(!tempBoard.current) {
          return false;
        }
        const piece = tempBoard.current[row][col];
        if(piece?.piecePlayer === playerTurn) {
          for(let targetRow = 0; targetRow < 8; targetRow++) {
            for(let targetCol = 0; targetCol < 8; targetCol++) {
              if(canPieceMove(targetRow, targetCol, {row, col})) {
                if(!isKingInCheckAfterMove()) {
                  tempBoard.current = getClonedObj(board);
                  pawnMovedTwoCellsRef.current = pawnMovedTwoCellsInPreviousTurn;
                  kingMovedRef.current = getClonedObj(kingMoved);
                  rookMovedRef.current = getClonedObj(rookMoved);
                  return false;
                }
                tempBoard.current = getClonedObj(board);
                pawnMovedTwoCellsRef.current = pawnMovedTwoCellsInPreviousTurn;
                kingMovedRef.current = getClonedObj(kingMoved);
                rookMovedRef.current = getClonedObj(rookMoved);
              }
            }
          }
        }
      }
    }
    return true;
  }, [playerTurn, dispatch, getKingPosition, isKingInCheck, canPieceMove]);

  const isStalemate = useCallback(() => {
    if(!tempBoard.current) {
      return false;
    }
    const kingPosition = getKingPosition(tempBoard.current, playerTurn);
    if(!kingPosition) {
      return false;
    }
    if(isKingInCheck(tempBoard.current, kingPosition, playerTurn)) {
      return false;
    }
    for(let row = 0; row < 8; row++) {
      for(let col = 0; col < 8; col++) {
        if(!tempBoard.current) {
          return false;
        }
        const piece = tempBoard.current[row][col];
        if(piece?.piecePlayer === playerTurn) {
          for(let targetRow = 0; targetRow < 8; targetRow++) {
            for(let targetCol = 0; targetCol < 8; targetCol++) {
              if(canPieceMove(targetRow, targetCol, {row, col})) {
                if(!isKingInCheckAfterMove()) {
                  tempBoard.current = getClonedObj(board);
                  pawnMovedTwoCellsRef.current = pawnMovedTwoCellsInPreviousTurn;
                  kingMovedRef.current = getClonedObj(kingMoved);
                  rookMovedRef.current = getClonedObj(rookMoved);
                  return false;
                }
                tempBoard.current = getClonedObj(board);
                pawnMovedTwoCellsRef.current = pawnMovedTwoCellsInPreviousTurn;
                kingMovedRef.current = getClonedObj(kingMoved);
                rookMovedRef.current = getClonedObj(rookMoved);
              }
            }
          }
        }
      }
    }
    return true;
  }, [chessState, dispatch, getKingPosition, isKingInCheck, canPieceMove]);

  useEffect(() => {
    if(!dispatch) {
      return;
    }
    if(gameState === GAME_STATE.IN_PROGRESS) {
      if(isKingInCheckMate()) {
        dispatch({
          type: 'UPDATE_GAME_STATE',
          payload: GAME_STATE.CHECKMATE,
        });
      } else if(isStalemate()) {
        dispatch({
          type: 'UPDATE_GAME_STATE',
          payload: GAME_STATE.STALEMATE,
        });
      }
    }
  }, [gameState, isKingInCheckMate, isStalemate, dispatch]);

  return onPressingCell;
}

export default useOnPressingCell;