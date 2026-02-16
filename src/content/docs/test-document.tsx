export default function TestDocument() {
  return (
    <>
      <p>
        This is a test document to verify the internal docs system is working
        correctly. If you can read this, the password gate, routing, and content
        rendering are all functioning as expected.
      </p>

      <h2>How to add new documents</h2>
      <ol>
        <li>
          Add a new entry to <code>src/lib/docs-config.ts</code> with the slug,
          title, subtitle, date, and category.
        </li>
        <li>
          Create a new content file at{' '}
          <code>src/content/docs/your-slug.tsx</code> that exports a default
          React component with the document content.
        </li>
        <li>
          Register the content in <code>src/content/docs/index.ts</code> by
          importing it and adding it to the <code>docsContent</code> map.
        </li>
      </ol>

      <h2>Features</h2>
      <ul>
        <li>Password-gated access with localStorage persistence</li>
        <li>Server-side password verification via API route</li>
        <li>Clean, minimal reading experience</li>
        <li>Circular document selector on the hub page</li>
        <li>Easy to extend with new documents</li>
      </ul>

      <p>
        The password is stored as an environment variable on Vercel under{' '}
        <code>DOCS_PASSWORD</code>, keeping it out of the client bundle.
      </p>
    </>
  );
}
