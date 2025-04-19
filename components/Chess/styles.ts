import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
  },
  chessboardContainer: {
    borderWidth: 1,
    borderColor: "#000",
  },
  pieceChoosingContainer: {
    flexDirection: 'row',
  },
  chessPiece: {
    fontSize: 50,
    width: 50,
    textAlign: 'center',
    marginBottom: 20,
    backgroundColor: "#D9EFFF",
    borderWidth: 0.5,

  },
});

export default styles;