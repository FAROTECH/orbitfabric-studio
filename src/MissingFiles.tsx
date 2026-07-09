export function MissingFiles({ files }: { files: string[] }) {
  if (files.length === 0) {
    return null;
  }

  return (
    <section className="entry-section muted-section">
      <h3>Expected source files not detected</h3>
      <p>
        Missing files are reported structurally. This is not a validation result.
      </p>
      <ul className="missing-list">
        {files.map((file) => (
          <li key={file}>{file}</li>
        ))}
      </ul>
    </section>
  );
}
