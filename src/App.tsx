import { useMemo } from "react";
import { createStore } from "./store";
import { Board } from "./components/Board";

export default function App() {
  const { store } = useMemo(() => createStore(), []);
  return <Board store={store} />;
}
