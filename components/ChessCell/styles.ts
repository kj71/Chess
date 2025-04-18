import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  cellContainer: {
    height: 50,
    width: 50,
    backgroundColor: "#D9EFFF",
    justifyContent: "center",
    alignItems: "center",
    cursor: "default",
    userSelect: "none",
  },
  blackCell: {
    backgroundColor: "#4A90E2",
  },
  selectedCell: {
    backgroundColor: "#9370DB",
  },
  chessPiece: {
    fontSize: 50,
  },
});

export default styles;