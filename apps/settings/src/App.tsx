import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import { exists } from "@tauri-apps/plugin-fs";
import { homeDir, join } from "@tauri-apps/api/path";
import "./App.css";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");
  const [configExists, setConfigExists] = useState<boolean | null>(null);
  const [configPath, setConfigPath] = useState("");

  async function checkConfig() {
    const home = await homeDir();
    const fullPath = await join(home, ".config/mango/config.conf");
    setConfigPath(fullPath);
    const found = await exists(fullPath);
    setConfigExists(found);
  }

  useEffect(() => {
    checkConfig();
  }, []);

  async function greet() {
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <main className="container">
      <h1>Mango Settings</h1>

      <section>
        <h2>
          Config Check
          <button onClick={checkConfig} style={{ marginLeft: 8 }}>Refresh</button>
        </h2>
        {configExists === null ? (
          <p>Checking for config file...</p>
        ) : configExists ? (
          <p style={{ color: "green" }}>Found: {configPath}</p>
        ) : (
          <p style={{ color: "red" }}>Not found: {configPath}</p>
        )}
      </section>

      <div className="row">
        <a href="https://vite.dev" target="_blank">
          <img src="/vite.svg" className="logo vite" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank">
          <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <p>Click on the Tauri, Vite, and React logos to learn more.</p>

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          greet();
        }}
      >
        <input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        />
        <button type="submit">Greet</button>
      </form>
      <p>{greetMsg}</p>
    </main>
  );
}

export default App;
