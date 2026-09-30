import PasswordAnalyzer from './components/PasswordAnalyzer'
import PasswordGenerator from './components/PasswordGenerator'

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <main className="mx-auto max-w-4xl px-4 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100">
            Password Security <span className="text-emerald-400">Analyzer</span>
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            🔒 Everything runs locally in your browser. Your password is never sent, stored or logged.
          </p>
        </header>
        <div className="grid gap-6 md:grid-cols-2">
          <PasswordAnalyzer />
          <PasswordGenerator />
        </div>
      </main>
    </div>
  )
}
