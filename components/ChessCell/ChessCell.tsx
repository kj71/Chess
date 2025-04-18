import { FC, useCallback, useContext } from "react";
import { Text, TouchableOpacity } from "react-native";
import styles from "./styles";
import { ChessContext } from "@/ChessContext";
import { getChessPiece } from "@/utils";
import useOnPressingCell from "@/useOnPressingCell";

interface Props {
  row: number;
  col: number;
}

const ChessCell: FC<Props> = (props) => {
  const { row, col } = props;
  const { board, selectedCell } = useContext(ChessContext);
  const boardPiece = board[row][col];
  const {piecePlayer = '', pieceType = ''} = boardPiece || {};
  const isBlackCell = (row + col) % 2 === 0;
  const isSelectedCell = selectedCell?.row === row && selectedCell?.col === col;
  const onPressingCell = useOnPressingCell();

  const onPress = useCallback(() => {
    onPressingCell(row, col);
  }, [row, col, onPressingCell]);

  return (
    <TouchableOpacity 
      activeOpacity={1} 
      style={[
        styles.cellContainer, 
        isBlackCell ? styles.blackCell : null,
        isSelectedCell ? styles.selectedCell : null,
      ]}
      onPress={onPress}  
    >
      {
        boardPiece ? (
          <Text style={styles.chessPiece}>{getChessPiece(pieceType, piecePlayer)}</Text>
        ) : null
      }
    </TouchableOpacity>
  );
};

export default ChessCell;