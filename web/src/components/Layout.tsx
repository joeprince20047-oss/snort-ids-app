import { Sun, Moon, Shield, Github } from 'lucide-react'
import { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
  darkMode: boolean
  setDarkMode: (v: boolean) => void
}

export default function Layout({ children, darkMode, setDarkMode }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-cyber-900 transition-colors">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white dark:bg-cyber-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <Shield className="w-7 h-7 text-green-500" />
              <span className="font-bold text-lg text-gray-900 dark:text-white">
                SNORT <span className="text-blue-500">IDS</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="https://github.com/joeprince20047-oss/snort-ids-app"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-cyber-700 transition-colors"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  )
}
