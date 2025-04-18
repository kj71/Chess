import Chess from "@/components/Chess";
import { View } from "react-native";
import { ChessProvider } from '@/ChessContext';

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ChessProvider>
        <Chess/>
      </ChessProvider>
    </View>
  );
}
