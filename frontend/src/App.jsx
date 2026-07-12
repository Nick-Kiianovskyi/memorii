import { useState, useEffect } from "react";

function App() {
  //=== const [text, setText] = useState("");
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [text, setText] = useState("");

  const [entries, setEntries] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

  //=== DELETE ENTRY ===
  const deleteEntry = async (id) => {
    await fetch(`http://localhost:5000/entries/${id}`, {
      method: "DELETE",

      headers: {
        Authorization: localStorage.getItem("token"),
      },
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
    <div style={{ padding: "20px" }}>
       <h1>Меморії</h1>
      {isLoggedIn ? (
        <>
          <button onClick={logout}>Вихід</button>
        </>
      ) : (
        <>
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
        </>
      )}
      {isLoggedIn && (
        <>
          <hr />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Місце для думок..."
            style={{
              width: "100%",

              height: "300px",
            }}
          />
          <br />
          <button onClick={addEntry}>Додати</button>
          <button onClick={loadEntries}>Оновити</button>{" "}
          <ul>
            {entries.map((e) => (
              <li key={e.id}>
                {e.content}

                <button onClick={() => deleteEntry(e.id)}>Видалити</button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default App;
