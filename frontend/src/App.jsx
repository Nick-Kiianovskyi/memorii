import "./App.css";
import { useState, useEffect } from "react";

function App() {
  //=== const [text, setText] = useState("");
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");

  const [entries, setEntries] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
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

  //=== SAVE ENTRY ===

  const saveEntry = async () => {
    // Если запись НЕ выбрана

    // создаём новую

    if (!selectedEntry) {
      await fetch("http://localhost:5000/entries", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          Authorization: localStorage.getItem("token"),
        },

        body: JSON.stringify({
          title,
          content: text,
          category_id: categoryId, // Use null if no category is selected
        }),
      });

      loadEntries();

      return;
    }

    // Если запись выбрана

    // обновляем её

    await fetch(
      `http://localhost:5000/entries/${selectedEntry.id}`,

      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",

          Authorization: localStorage.getItem("token"),
        },

        body: JSON.stringify({
          title,
          content: text,
          category_id: categoryId,
        }),
      },
    );

    loadEntries();
  };
  //=== LOAD CATEGORIES ===
  const loadCategories = async () => {
    const res = await fetch(
      "http://localhost:5000/categories",

      {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      },
    );

    const data = await res.json();

    setCategories(data);
  };

  //=== SELECT ENTRY ===
  const selectEntry = (entry) => {
    setSelectedEntry(entry);

    setTitle(entry.title || ""); // Assuming entry has a title property
    setText(entry.content);
    setCategoryId(entry.category_id || ""); // Assuming entry has a category_id property
  };
  // === NEW ENTRY ===

  const newEntry = () => {
    // снимаем выбор записи

    setSelectedEntry(null);

    // очищаем редактор
    setTitle(""); // Clear title for new entry
    setText("");
    setCategoryId(""); // Clear category selection for new entry
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
      body: JSON.stringify({ title, content: text, category_id: categoryId }),
    });

    loadEntries();
  };

  //=== USE EFFECT ===
  useEffect(() => {
    //=== loadEntries();
    if (localStorage.getItem("token")) {
      loadEntries();
      loadCategories();
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
                  style={{
                    backgroundColor: e.category_color
                      ? e.category_color + "33"
                      : "#f7f1e3", // Add transparency to the category color
                  }}
                  onClick={() => selectEntry(e)}
                >
                  {/* Дата */}

                  {/*<strong>{new Date(e.created_at).toLocaleDateString()}</strong> */}
                  <div>
                    <span className="entry-date">
                      {new Date(
                        e.updated_at || e.created_at,
                      ).toLocaleTimeString("uk-UA", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {" | "}
                    <span className="entry-title">
                      {/* Title or ервые 10 символов */}
                      {e.title || `***${e.content.substring(0, 14)}...`}{" "}
                    </span>
                  </div>

                  <button
                    className="entry-delete"
                    onClick={(event) => {
                      event.stopPropagation();

                      setDeleteId(e.id);
                    }}
                  >
                    🗑
                  </button>
                </li>
              ))}
            </ul>
            {/* Правая колонка */}
            <div className="editor">
              <div className="editor-header">
                <input
                  type="text"
                  className="entry-title-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="...назва.."
                />

                <select
                  className="entry-category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  <option value="">Без категорії</option>

                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                className="diary-editor"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Місце для думок..."
              />
              <br />
              {/*<button onClick={addEntry}>        Додати       </button> */}
              <button onClick={newEntry}>        Новий запис       </button>
              <button onClick={saveEntry}>        Зберегти       </button>
              {/* <button onClick={loadEntries}>        Оновити       </button> */}
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
