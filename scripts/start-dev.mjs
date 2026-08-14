/**
 * Wrapper that starts pnpm dev and auto-answers drizzle-kit push prompts
 * by periodically sending Enter to stdin (selects the default/first option).
 * Run: node scripts/start-dev.mjs
 */
import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const proc = spawn('pnpm', ['dev'], {
  cwd: root,
  env: process.env,
  stdio: ['pipe', 'inherit', 'inherit'],
  shell: true,
})

// Send Enter every 400ms to auto-select the default option in drizzle prompts
const timer = setInterval(() => {
  if (proc.killed || proc.exitCode !== null) {
    clearInterval(timer)
    return
  }
  try {
    proc.stdin.write('\n')
  } catch {
    // stdin may be closed
  }
}, 400)

proc.on('exit', (code) => {
  clearInterval(timer)
  console.log(`Dev server exited with code ${code}`)
  process.exit(code ?? 0)
})

proc.on('error', (err) => {
  console.error('Failed to start dev server:', err)
  process.exit(1)
})

// Keep this process alive
process.on('SIGINT', () => {
  proc.kill('SIGINT')
  process.exit(0)
})
process.on('SIGTERM', () => {
  proc.kill('SIGTERM')
  process.exit(0)
})
