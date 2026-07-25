import "./App.css";
import { useState, useEffect } from "react";

function App() {
  //=== const [text, setText] = useState("");
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [text, setText] = useState("");

  const [entries, setEntries] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  const addEntry = async () => {
    await fetch("http://localhost:5000/entries", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token"),
      },

      body: JSON.stringify({ content: text }),
    });

    setText("");

    loadEntries();
  };

  const loadEntries = async () => {
    const res = await fetch("http://localhost:5000/entries", {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });

    const data = await res.json();

    setEntries(data);
  };

  // ===check registration===

  const register = async () => {
    const res = await fetch(
      "http://localhost:5000/register",

      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email,
          password,
        }),
      },
    );

    console.log(await res.text());
  };

  //==check login==

  const login = async () => {
    console.log("LOGIN CLICKED");
    const res = await fetch(
      "http://localhost:5000/login",

      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email,
          password,
        }),
      },
    );
    console.log("STATUS:", res.status);
    const data = await res.json();

    // === console.log(data);
    localStorage.setItem("token", data.token);

    console.log("TOKEN SAVED: ", data.token);
    window.location.reload();
  };

  //=== LOGOUT ===
  const logout = () => {
    localStorage.removeItem("token");
    setEntries([]);
    window.location.reload();
  };

  //=== DELETE ENTRY === WITH CONFIRMATION

  const confirmDelete = async () => {
    if (!deleteId) return;

    const res = await fetch(
      `http://localhost:5000/entries/${deleteId}`,

      {
        method: "DELETE",

        headers: {
          Authorization: localStorage.getItem("token"),
        },
      },
    );

    console.log("DELETE STATUS", res.status);

    setDeleteId(null);

    loadEntries();
  };

  //=== SELECT ENTRY ===
  const selectEntry = (entry) => {
    setSelectedEntry(entry);
    setText(entry.content);
  };

  //=== UPDATE ENTRY ===
  const updateEntry = async () => {
    if (!selectedEntry) return;

    await fetch(`http://localhost:5000/entries/${selectedEntry.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token"),
      },
      body: JSON.stringify({ content: text }),
    });

    loadEntries();
  };

  //=== USE EFFECT ===
  useEffect(() => {
    //=== loadEntries();
    if (localStorage.getItem("token")) {
      loadEntries();
    }
  }, []);

  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <div className="app">
      <h1>Меморії</h1>
      {isLoggedIn ? (
        <div className="auth-panel ">
          <button onClick={logout}>Вихід</button>
        </div>
      ) : (
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={register}>Реєстрація</button>
          <button onClick={login}>Вхід</button> {" "}
        </div>
      )}
      {isLoggedIn && (
        <>
          <hr />

          {/* <textarea
            className="diary-editor"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Місце для думок..."
          /> 
          <br />
          <button onClick={addEntry}>Додати</button>
          <button onClick={loadEntries}>Оновити</button>

          {/* Список записів   

          <ul className="entry-list">
            {entries.map((e) => (
              <li key={e.id} className="entry-item">
                {e.content}

                <button onClick={() => deleteEntry(e.id)}>Видалити</button>
              </li>
            ))}
          </ul>*/}

          <div className="diary-layout">
            {/* Левая колонка со списком записей */}
            <ul className="entry-list">
              {entries.map((e) => (
                <li
                  key={e.id}
                  className={
                    selectedEntry?.id === e.id
                      ? "entry-item entry-selected"
                      : "entry-item"
                  }
                  onClick={() => selectEntry(e)}
                >
                  {/* Дата */}

                  <strong>{new Date(e.created_at).toLocaleDateString()}</strong>
                  <br />
                  {/* Первые 30 символов */}
                  {e.content.substring(0, 30)}
                  <br />

                  <button
                    onClick={(event) => {
                      event.stopPropagation();

                      //===deleteEntry(e.id);
                      setDeleteId(e.id);
                    }}
                  >
                    Видалити
                  </button>
                </li>
              ))}
            </ul>
            {/* Правая колонка */}
            <div className="editor">
              <textarea
                className="diary-editor"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Місце для думок..."
              />
              <br />
              <button onClick={addEntry}>        Додати       </button>

              <button onClick={loadEntries}>        Оновити       </button>
            </div>
          </div>
        </>
      )}
      {deleteId && (
        <div className="modal-backdrop">
          <div className="modal-window">
            <h3>Видалити запис?</h3>

            <p>Цю дію неможливо скасувати</p>

            <button onClick={() => setDeleteId(null)}>Ні</button>

            <button onClick={confirmDelete}>Так</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
