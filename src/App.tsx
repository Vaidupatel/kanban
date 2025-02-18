import { useState } from "react";
import ListViewBoard from "./Components/ListViewBoard";
import { KanbanProvider } from "./Context/KanbanContext";
import KanbanBoard from "./Components/KanbanBoard";

function App() {
  const [isBoardView, setIsBoardView] = useState<boolean>(false);

  return (
    <KanbanProvider>
      <div className="bg-gray-900 min-h-screen text-white">
        <div className="max-w-7xl mx-auto p-4">
          <button
            onClick={() => setIsBoardView((prev) => !prev)}
            className="mb-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-md flex items-center gap-2"
          >
            Change to {isBoardView ? "List" : "Board"} view
          </button>
          {isBoardView ? (
            <KanbanBoard isBoardView={isBoardView} />
          ) : (
            <ListViewBoard isBoardView={isBoardView} />
          )}
        </div>
      </div>
    </KanbanProvider>
  );
}

export default App;
