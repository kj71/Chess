import { createContext, FC, useReducer } from 'react';
import chessReducer, { initialChessState } from './chessReducer';
import { Dispatch } from 'react';

export const ChessContext = createContext(initialChessState);

export const ChessDispatchContext = createContext<Dispatch<any> | null>(null);

interface ChessProviderProps {
  children: React.ReactNode;
}

export const ChessProvider: FC<ChessProviderProps> = ({ children }) => {
  const [chessState, dispatch] = useReducer(chessReducer, initialChessState);

  return (
    <ChessContext.Provider value={chessState}>
      <ChessDispatchContext.Provider value={dispatch}>
        {children}
      </ChessDispatchContext.Provider>
    </ChessContext.Provider>
  );
}
