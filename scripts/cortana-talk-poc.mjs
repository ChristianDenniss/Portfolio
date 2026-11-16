/**
 * One-command Cortana talk animation POC.
 *
 * Usage: npm run cortana:talk-poc
 * Opens http://localhost:3000/?menu=1&talkpoc=1
 * Starts `next dev` if nothing is listening on :3000.
 */
import { spawn } from 'node:child_process'
import http from 'node:http'
import { platform } from 'node:os'

const PORT = Number(process.env.PORT || 3000)
const USE_GMOD =
  process.env.CORTANA_MODEL === 'gmod' || process.argv.includes('--gmod')
const POC_URL = USE_GMOD
  ? `http://localhost:${PORT}/?menu=1&talkpoc=1&cortana=gmod`
  : `http://localhost:${PORT}/?menu=1&talkpoc=1`
const READY_TIMEOUT_MS = 120_000

function isServerUp() {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${PORT}/`, (res) => {
      res.resume()
      resolve(true)
    })
    req.on('error', () => resolve(false))
    req.setTimeout(1200, () => {
      req.destroy()
      resolve(false)
    })
  })
}

function openBrowser(url) {
  const os = platform()
  if (os === 'win32') {
    spawn('cmd', ['/c', 'start', '', url], { detached: true, stdio: 'ignore' }).unref()
    return
  }
  if (os === 'darwin') {
    spawn('open', [url], { detached: true, stdio: 'ignore' }).unref()
    return
  }
  spawn('xdg-open', [url], { detached: true, stdio: 'ignore' }).unref()
}

function startDevServer() {
  console.log(`[cortana-talk-poc] Starting next dev on :${PORT}…`)
  const child = spawn('npm', ['run', 'dev'], {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, PORT: String(PORT) }
  })
  child.on('exit', (code) => {
    if (code && code !== 0) {
      console.error(`[cortana-talk-poc] dev server exited with code ${code}`)
      process.exit(code)
    }
  })
  return child
}

async function waitForServer() {
  const started = Date.now()
  while (Date.now() - started < READY_TIMEOUT_MS) {
    if (await isServerUp()) return true
    await new Promise((r) => setTimeout(r, 800))
  }
  return false
}

async function main() {
  console.log('[cortana-talk-poc] Cortana talk animation POC')
  console.log(`[cortana-talk-poc] Target: ${POC_URL}`)
  console.log(
    USE_GMOD
      ? '[cortana-talk-poc] GMod rig: AU26/AU27 jaw morphs + facial bones. Move mouse for look-at.'
      : '[cortana-talk-poc] Expect mouthOpen morph + cycling demo lines. Move mouse for look-at.'
  )

  let ownedDev = null
  if (!(await isServerUp())) {
    ownedDev = startDevServer()
    const ok = await waitForServer()
    if (!ok) {
      console.error('[cortana-talk-poc] Timed out waiting for localhost:' + PORT)
      if (ownedDev) ownedDev.kill('SIGTERM')
      process.exit(1)
    }
  } else {
    console.log(`[cortana-talk-poc] Dev server already up on :${PORT}`)
  }

  openBrowser(POC_URL)
  console.log('[cortana-talk-poc] Browser opened. Leave this terminal open while the POC runs.')
  console.log('[cortana-talk-poc] Stop with Ctrl+C (only kills the server if this script started it).')

  if (!ownedDev) {
    // Server was already running — script can exit after open.
    return
  }

  process.on('SIGINT', () => {
    ownedDev?.kill('SIGTERM')
    process.exit(0)
  })
  process.on('SIGTERM', () => {
    ownedDev?.kill('SIGTERM')
    process.exit(0)
  })
}

main().catch((err) => {
  console.error('[cortana-talk-poc]', err)
  process.exit(1)
})
