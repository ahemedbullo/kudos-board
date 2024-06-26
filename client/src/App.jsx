import React, { useEffect, useState } from "react";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import { Outlet } from "react-router-dom";
import "./App.css";
import SearchBar from "./Search.jsx";
import KudosBoard from "./KudosBoard.jsx";
import Modal from "./Modal.jsx";
import Card from "./Card.jsx";

function App() {
  const [showModal, setShowModal] = useState(false);
  const [boards, setBoards] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [category, setCategory] = useState("All");

  const handleCreateBoardClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const response = await fetch(
          import.meta.env.VITE_BACKEND_URL + "/boards"
        );
        const data = await response.json();
        setBoards(data);
      } catch (error) {
        console.error("Error fetching boards: ", error);
      }
    };
    fetchBoards();
  }, []);

  const handleCreateBoard = async (boardData) => {
    try {
      const response = await fetch(
        import.meta.env.VITE_BACKEND_URL + "/boards",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(boardData),
        }
      );
      if (!response.ok) {
        throw new Error("HandleCreateBoard Error");
      }
      const newBoard = await response.json();
      setBoards([...boards, newBoard]);
      handleCloseModal();
    } catch (error) {
      console.error("Error Creating board: ", error);
    }
  };

  const handleDeleteBoard = async (boardId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/boards/${boardId}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        console.log(
          `Error deleting board: ${response.status} ${response.statusText}`
        );
        throw new Error("Delete not responding correctly");
      }
      const data = await response.json();
      setBoards(boards.filter((board) => board.boardId != boardId));
      setSearchResult(searchResult.filter((board) => board.boardId != boardId));
    } catch (error) {
      console.error("Error deleting board", error);
    }
  };

  const handleSetSearchTerm = (curr) => {
    setSearchTerm(curr);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/boards/search?query=${searchTerm}`
        );
        const data = await response.json();
        setSearchResult(data);
        setBoards(data); // Update boards state with search results
      } catch (error) {
        console.error("Error fetching search results:", error);
      }
    };
    fetchData();
  }, [searchTerm]);

  const handleSetCategory = async (newCategory) => {
    if (newCategory !== category) {
      console.log("Category from ", category, "to new category ", newCategory);
      setCategory(newCategory);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/boards/category/${newCategory}`,
          {
            headers: { Accept: "application/json" },
          }
        );
        const data = await response.json();
        setBoards(data);
        setSearchResult(data); // Update searchResult state with sorted results
      } catch (error) {
        console.error("Error fetching boards by category", error);
      }
    }
  };

  return (
    <div>
      <Router>
        <div className="app-container">
          <header className="header">
            <h1>Kudos Board</h1>
          </header>
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <SearchBar handleSetSearchTerm={handleSetSearchTerm} />
                  <div className="category-buttons">
                    <button onClick={() => handleSetCategory("All")}>
                      All
                    </button>
                    <button onClick={() => handleSetCategory("Recent")}>
                      Recent
                    </button>
                    <button onClick={() => handleSetCategory("Celebrations")}>
                      Celebrations
                    </button>
                    <button onClick={() => handleSetCategory("Thank You")}>
                      Thank You
                    </button>
                    <button onClick={() => handleSetCategory("Inspiration")}>
                      Inspiration
                    </button>
                  </div>
                  <div className="create-card-btn">
                    <button onClick={handleCreateBoardClick}>
                      Create a New Board
                    </button>
                  </div>
                  <Outlet />
                  {showModal && (
                    <Modal
                      onClose={handleCloseModal}
                      onSubmit={handleCreateBoard}
                    />
                  )}
                </>
              }
            >
              <Route
                path="/"
                element={
                  <div className="kudos-boards">
                    {searchTerm ? (
                      <KudosBoard
                        boards={searchResult}
                        onDeleteBoard={handleDeleteBoard}
                      />
                    ) : (
                      <KudosBoard
                        boards={boards}
                        onDeleteBoard={handleDeleteBoard}
                      />
                    )}
                  </div>
                }
              />
            </Route>
            <Route path="/boards/:boardId" element={<Card />} />
          </Routes>
        </div>
      </Router>
      <footer>
        {" "}
        <b>© Created by Ahemed Summer 2024</b>{" "}
      </footer>
    </div>
  );
}

export default App;
