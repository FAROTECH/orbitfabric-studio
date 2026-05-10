const scopeItems = [
  "Open a local OrbitFabric mission workspace",
  "Inspect mission files and generated artifact locations",
  "Display source and outputs in read-only form",
  "Invoke OrbitFabric Core through a controlled local command path",
];

const nonGoalItems = [
  "No editing",
  "No graph view",
  "No scenario runner",
  "No generator workbench",
  "No independent validation",
];

function App() {
  return (
    <main className="studio-shell">
      <section className="hero-panel" aria-labelledby="studio-title">
        <div className="eyebrow">OrbitFabric Studio</div>
        <h1 id="studio-title">Read-only Mission Project Viewer</h1>
        <p className="release">v0.1.0 development scaffold</p>
        <p className="summary">
          Local-first visual engineering workbench for OrbitFabric Mission Data
          Contracts. This scaffold is intentionally narrow: it establishes the
          application shell before workspace inspection logic is introduced.
        </p>
      </section>

      <section className="grid" aria-label="v0.1.0 boundaries">
        <article className="card">
          <h2>Primary loop</h2>
          <div className="loop">Open -&gt; Inspect</div>
          <p>
            Studio must inspect an existing OrbitFabric mission workspace without
            becoming a second model engine.
          </p>
        </article>

        <article className="card">
          <h2>Authority model</h2>
          <ul>
            <li>Mission Model remains the source of truth.</li>
            <li>OrbitFabric Core remains authoritative.</li>
            <li>Studio remains downstream and presentation-oriented.</li>
          </ul>
        </article>

        <article className="card">
          <h2>v0.1.0 scope</h2>
          <ul>
            {scopeItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="card warning-card">
          <h2>Not in this release</h2>
          <ul>
            {nonGoalItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}

export default App;
