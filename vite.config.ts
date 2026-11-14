import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

/** Arquivos maiores que isso em /public não entram no pacote offline (ex.: fotos originais em alta). */
const LIMITE_OFFLINE = 1_000_000

function listarArquivos(dir: string): string[] {
  return readdirSync(dir).flatMap((nome) => {
    const caminho = join(dir, nome)
    return statSync(caminho).isDirectory() ? listarArquivos(caminho) : [caminho]
  })
}

/**
 * Gera o /sw.js no build com a lista de tudo que precisa ficar salvo no celular
 * para o app funcionar offline (JS, CSS, fontes, ícones e imagens leves).
 */
function offlineServiceWorker(): Plugin {
  return {
    name: 'air-jogos-offline',
    apply: 'build',
    generateBundle(_options, bundle) {
      const doBuild = Object.keys(bundle).filter(
        (f) =>
          !f.endsWith('.map') &&
          f !== 'index.html' &&
          // fontes: só o formato moderno (woff2) e os alfabetos usados em português
          !f.endsWith('.woff') &&
          !/devanagari|vietnamese/.test(f)
      )
      const publicos = listarArquivos('public')
        .filter((f) => statSync(f).size <= LIMITE_OFFLINE)
        .map((f) => relative('public', f).split(sep).join('/'))
      const arquivos = ['/', '/index.html', ...[...doBuild, ...publicos].map((f) => '/' + f)]

      const hash = createHash('sha1')
      hash.update(arquivos.join('|'))
      for (const f of listarArquivos('public')) hash.update(readFileSync(f))
      const versao = hash.digest('hex').slice(0, 12)

      const template = readFileSync('pwa/sw-template.js', 'utf8')
      this.emitFile({
        type: 'asset',
        fileName: 'sw.js',
        source: template.replace('__VERSION__', versao).replace('__PRECACHE__', JSON.stringify(arquivos, null, 2)),
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), offlineServiceWorker()],
})
