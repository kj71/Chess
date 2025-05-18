import React, { FC, useCallback, useContext, useMemo } from "react";
import { Text, View } from "react-native";
import styles from "./styles";
import ChessCell from "../ChessCell";
import useOnPressingCell from "@/useOnPressingCell";
import { ChessContext, ChessDispatchContext } from "@/ChessContext";
import { getChessPiece, getNextplayerTurn } from "@/utils";
import { GAME_STATE, PIECE, PLAYER } from "@/constants";

const Chess: FC = () => {
  const board = [];
  const onPressingCell = useOnPressingCell();
  const { pawnEligibleToChange, playerTurn, gameState } = useContext(ChessContext);
  const dispatch = useContext(ChessDispatchContext);

  const playerWon = useMemo(() => {
    if(gameState !== GAME_STATE.CHECKMATE) {
      return null;
    }
    return getNextplayerTurn(playerTurn);
  }, [gameState, playerTurn]);

  const onChoosingPiece = useCallback((piece: string) => {
    if(!dispatch) {
      return;
    }
    dispatch({
      type: "REPLACE_PAWN",
      payload: {
        pieceType: piece,
        playerTurn: getNextplayerTurn(playerTurn),
      }
    });
  }, [dispatch]);

  for (let row = 0; row < 8; row++) {
    const cells = [];
    for (let col = 0; col < 8; col++) {
      cells.push(<ChessCell key={`${row}-${col}`} row={row} col={col} onPressingCell={onPressingCell}/>);
    }
    board.push(
      <View key={row} style={styles.row}>
        {cells}
      </View>
    );
  }
  return (
    <>
      {
        gameState === GAME_STATE.CHECKMATE
        ? (
          <Text style={styles.checkmateText}>{`Checkmate!!! ${playerWon} Won!`}</Text>
        )
        : null
      }
      {
        gameState === GAME_STATE.STALEMATE
        ? (
          <Text style={styles.checkmateText}>{`Stalemate!!!`}</Text>
        )
        : null
      }
      {
        pawnEligibleToChange
        ? (
          <View style={styles.pieceChoosingContainer}>
            <Text 
              style={styles.chessPiece}
              onPress={() => onChoosingPiece(PIECE.QUEEN)}
            >
              {getChessPiece(PIECE.QUEEN, playerTurn)}
            </Text>
            <Text 
              style={styles.chessPiece}
              onPress={() => onChoosingPiece(PIECE.ROOK)}
            >
              {getChessPiece(PIECE.ROOK, playerTurn)}
            </Text>
            <Text 
              style={styles.chessPiece}
              onPress={() => onChoosingPiece(PIECE.KNIGHT)}
            >
              {getChessPiece(PIECE.KNIGHT, playerTurn)}
            </Text>
            <Text 
              style={styles.chessPiece}
              onPress={() => onChoosingPiece(PIECE.BISHOP)}
            >
              {getChessPiece(PIECE.BISHOP, playerTurn)}
            </Text>
          </View>
        )
        : null
      }
      <View 
        style={styles.chessboardContainer}
        pointerEvents={pawnEligibleToChange ? 'none': undefined}
      >
        {board}
      </View>
    </>
  );
};

export default Chess;
