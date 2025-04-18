import { FC } from "react";
import { View } from "react-native";
import styles from "./styles";
import ChessCell from "../ChessCell";

const Chess: FC = () => {
  const board = [];
  for (let row = 0; row < 8; row++) {
    const cells = [];
    for (let col = 0; col < 8; col++) {
      cells.push(<ChessCell key={`${row}-${col}`} row={row} col={col}/>);
    }
    board.push(
      <View key={row} style={styles.row}>
        {cells}
      </View>
    );
  }
  return <View style={styles.chessboardContainer}>{board}</View>;
};

export default Chess;
