import { FC, useCallback, useContext } from "react";
import { Text, TouchableOpacity } from "react-native";
import styles from "./styles";
import { ChessContext } from "@/ChessContext";
import { getChessPiece } from "@/utils";

interface Props {
  row: number;
  col: number;
  onPressingCell: (row: number, col: number) => void;
}

const ChessCell: FC<Props> = (props) => {
  const { row, col, onPressingCell } = props;
  const { board, selectedCell } = useContext(ChessContext);
  const boardPiece = board[row][col];
  const {piecePlayer = '', pieceType = ''} = boardPiece || {};
  const isBlackCell = (row + col) % 2 === 0;
  const isSelectedCell = selectedCell?.row === row && selectedCell?.col === col;

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
      onPressIn={onPress}  
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