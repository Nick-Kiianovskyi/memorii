import "./App.css";
import { useState, useEffect } from "react";

const API_URL = import.meta.env.DEV
  ? "http://localhost:5000"
  : "https://memorii.onrender.com";

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
  const [showCategories, setShowCategories] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#cccccc");

  const [editingCategory, setEditingCategory] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [filterCategoryId, setFilterCategoryId] = useState("");
  //=== variable to track if a new entry is being created
  const [isNewEntry, setIsNewEntry] = useState(false);

  const addEntry = async () => {
    // ==await fetch("http://localhost:5000/entries", {
    await fetch(`${API_URL}/entries`, {
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
    const res = await fetch(`${API_URL}/entries`, {
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
      `${API_URL}/register`,

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
      `${API_URL}/login`,

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
      `${API_URL}/entries/${deleteId}`,

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
      await fetch(`${API_URL}/entries`, {
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
      setIsNewEntry(false); // Reset the new entry flag after saving
      loadEntries();

      return;
    }

    // Если запись выбрана

    // обновляем её

    await fetch(
      `${API_URL}/entries/${selectedEntry.id}`,

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
    setIsNewEntry(false); // Reset the new entry flag after saving
    loadEntries();
  };

  //===ADD CATEGORY ===
  const addCategory = async () => {
    if (editingCategory) {
      await fetch(
        `${API_URL}/categories/${editingCategory.id}`,

        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",

            Authorization: localStorage.getItem("token"),
          },

          body: JSON.stringify({
            name: newCategoryName,

            color: newCategoryColor,
          }),
        },
      );
    } else {
      await fetch(
        `${API_URL}/categories`,

        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",

            Authorization: localStorage.getItem("token"),
          },

          body: JSON.stringify({
            name: newCategoryName,

            color: newCategoryColor,
          }),
        },
      );
    }

    setEditingCategory(null);

    setNewCategoryName("");

    setNewCategoryColor("#cccccc");

    await loadCategories();
  };
  //=== LOAD CATEGORIES ===
  const loadCategories = async () => {
    const res = await fetch(
      `${API_URL}/categories`,

      {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      },
    );

    const data = await res.json();

    setCategories(data);
  };

  //=== DELETE CATEGORY ===
  const deleteCategory = async (id) => {
    const res = await fetch(
      `${API_URL}/categories/${id}`,

      {
        method: "DELETE",

        headers: {
          Authorization: localStorage.getItem("token"),
        },
      },
    );

    if (!res.ok) {
      alert(await res.text());

      return;
    }

    await loadCategories();
  };

  //=== SELECT ENTRY ===
  const selectEntry = (entry) => {
    setIsNewEntry(false); // Reset the new entry flag when selecting an existing entry
    setSelectedEntry(entry);

    setTitle(entry.title || ""); // Assuming entry has a title property
    setText(entry.content);
    setCategoryId(entry.category_id || ""); // Assuming entry has a category_id property
  };
  // === NEW ENTRY ===

  const newEntry = () => {
    // снимаем выбор записи
    setIsNewEntry(true); // Set the flag to indicate a new entry is being created
    setSelectedEntry(null);

    // очищаем редактор
    setTitle(""); // Clear title for new entry
    setText("");
    setCategoryId(""); // Clear category selection for new entry
  };

  //=== UPDATE ENTRY ===
  const updateEntry = async () => {
    if (!selectedEntry) return;

    await fetch(`${API_URL}/entries/${selectedEntry.id}`, {
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
    // Load entries and categories when the component mounts
    //=== loadEntries();
    if (localStorage.getItem("token")) {
      loadEntries(); // Load entries only if the user is logged in
      loadCategories(); // Load categories only if the user is logged in
    }
  }, []);

  const isLoggedIn = !!localStorage.getItem("token"); // Check if the user is logged in based on the presence of a token

  //=== FILTER ENTRIES BASED ON SEARCH TEXT ===
  {
    /*
  const filteredEntries = entries.filter((e) =>
    ((e.title || "") + " " + (e.content || "") + " " + (e.category_name || ""))

      .toLowerCase()

      .includes(searchText.toLowerCase()),
  ); */
  }
  const filteredEntries = entries.filter((e) => {
    const matchesSearch = (
      (e.title || "") +
      " " +
      (e.content || "") +
      " " +
      (e.category_name || "")
    )

      .toLowerCase()

      .includes(searchText.toLowerCase());

    const matchesCategory =
      !filterCategoryId || String(e.category_id) === filterCategoryId;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="app">
      {/*<h1>Меморії</h1>*/}
      {/*<img src="/m10.svg" alt="Меморії" className="logo" />  */}
      <img src="/m91.png" alt="Меморії" className="logo" />
      <h2 className="auth-title">особистий щоденник</h2>

      {!isLoggedIn && (
        <div className="auth-panel">
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

          <button onClick={login}>Вхід</button>
        </div>
      )}
      {isLoggedIn && (
        <>
          {/*<hr /> */}

          <div className="editor-bar">
            {" "}
            <button onClick={newEntry}>        Новий запис       </button>
            <button onClick={saveEntry}>        Зберегти       </button>
            <button onClick={() => setShowCategories(!showCategories)}>
              Категорії      
            </button>
            <button onClick={logout}>Вихід</button>
          </div>

          <div className="diary-layout">
            {/* Левая колонка со списком записей */}
            <div className="entries-panel">
              <div className="search-row">
                <select
                  className="filter-category"
                  value={filterCategoryId}
                  onChange={(e) => {
                    console.log("Selected category ID:", e.target.value);
                    //setCategoryId(e.target.value)

                    setFilterCategoryId(e.target.value);
                  }}
                >
                  <option value="">усі категорії</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <input
                  className="search-input"
                  type="text"
                  placeholder="пошук..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>
              <ul className="entry-list">
                {/* { entries.map((e) => ( */}
                {filteredEntries.map((e) => (
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
                        {(
                          e.title || `***${e.content.substring(0, 14)}...`
                        ).slice(0, 18)}
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
            </div>
            {/* Правая колонка */}
            <div className="editor">
              <div
                className="editor-header"
                style={{ visibility: isNewEntry ? "visible" : "hidden" }}
              >
                <input
                  type="text"
                  className="entry-title-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="назва..."
                />

                <select
                  className="entry-category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  <option value="">категорія...</option>

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
      {showCategories && (
        <div className="modal-backdrop">
          <div className="modal-window">
            <h3>Категорії</h3>

            <input
              className="category-input"
              type="text"
              placeholder="Назва категорії"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />

            <div className="color-picker-row">
              <span>Колір:</span>

              <input
                type="color"
                value={newCategoryColor}
                onChange={(e) => setNewCategoryColor(e.target.value)}
              />
            </div>

            <button onClick={addCategory}>
              {editingCategory ? "Зберегти" : "Створити"}
            </button>

            <button onClick={() => setShowCategories(false)}>Закрити</button>

            <hr />

            <div className="category-list">
              {categories.map((c) => (
                <div key={c.id} className="category-row">
                  <div className="category-info">
                    <span
                      className="category-color"
                      style={{
                        backgroundColor: c.color,
                      }}
                    />

                    <span>{c.name}</span>
                  </div>

                  <div className="category-actions">
                    <button
                      className="icon-btn"
                      onClick={() => {
                        setEditingCategory(c);
                        setNewCategoryName(c.name);
                        setNewCategoryColor(c.color);
                      }}
                    >
                      ✏️
                    </button>

                    <button
                      className="icon-btn"
                      onClick={() => deleteCategory(c.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
