import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-58px)] bg-white flex flex-col">

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Understand Any Codebase Instantly
        </h1>

        <p className="text-gray-600 max-w-xl mb-8">
          Upload a repository or connect GitHub. Ask questions.
          Get grounded answers with file references and line numbers.
        </p>

        <div className="flex gap-4">
          <Link
            href="/upload"
            className="px-6 py-3 bg-black text-white rounded-lg"
          >
            Upload Repository
          </Link>

          <Link
            href="/repos"
            className="px-6 py-3 border rounded-lg"
          >
            View Repositories
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 text-center mb-14">
          <h2 className="text-2xl font-semibold mb-3">
            How It Works
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            The platform analyzes your codebase, builds semantic embeddings,
            and enables grounded AI answers backed by real file references.
          </p>
        </div>

        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-12">

          {/* Step 1 */}
          <div className="bg-white p-8 rounded-xl shadow-sm text-left">
            <div className="text-3xl mb-4">📂</div>
            <h3 className="font-semibold mb-3 text-lg">
              1. Upload or Connect Repository
            </h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Provide a public GitHub URL</li>
              <li>• Or upload a ZIP file of your codebase</li>
              <li>• We securely process code files only</li>
            </ul>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-8 rounded-xl shadow-sm text-left">
            <div className="text-3xl mb-4">🧠</div>
            <h3 className="font-semibold mb-3 text-lg">
              2. Intelligent Code Indexing
            </h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Files are parsed and chunked function-by-function</li>
              <li>• Each chunk is converted into vector embeddings</li>
              <li>• Stored in a semantic vector database</li>
            </ul>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-8 rounded-xl shadow-sm text-left">
            <div className="text-3xl mb-4">💬</div>
            <h3 className="font-semibold mb-3 text-lg">
              3. Ask Questions with Grounded Answers
            </h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Ask: “Where is auth handled?”</li>
              <li>• We retrieve relevant code chunks</li>
              <li>• AI responds with file paths & line ranges</li>
            </ul>
          </div>

        </div>
      </section>

    </div>
  )
}