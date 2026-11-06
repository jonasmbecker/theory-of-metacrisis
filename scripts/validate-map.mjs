// Checks every theory listed in theories/index.json (each folder's content.json and layout.json),
// the index itself, and the legacy map/ copy while it is still kept for old links.
// No dependencies: run with `node scripts/validate-map.mjs`.
// Mirrors the rules of the ToC editor's schema (jonasmbecker/toc-editor, src/model/schema.ts).
import { existsSync, lstatSync, readdirSync, readFileSync } from 'node:fs'

const errors = []
const fail = (message) => errors.push(message)
let cardCount = 0
const checked = []

function load(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch (error) {
    fail(`${path}: cannot be read as JSON (${error.message})`)
    return null
  }
}

const HEX = /^#[0-9a-fA-F]{6}$/
const WEB_URL = /^https?:\/\/\S+$/i
// Lower-case words joined by single hyphens, at most 64 characters (the editor's own rule).
const SLUG = /^(?=.{1,64}$)[a-z0-9]+(-[a-z0-9]+)*$/
const STATUSES = ['author', 'reconstructed']
const LAYOUTS = ['stages', 'free']
const isObject = (v) => typeof v === 'object' && v !== null && !Array.isArray(v)
const isString = (v) => typeof v === 'string'

function checkMap(dir) {
  const contentPath = `${dir}/content.json`
  const layoutPath = `${dir}/layout.json`
  const content = load(contentPath)
  const layout = load(layoutPath)
  if (!content || !layout) return
  const fail = (message) => errors.push(`${dir}: ${message}`)

  if (!isString(content.title)) fail('content.json: "title" must be text')
  if (!HEX.test(content.color ?? '')) fail('content.json: "color" must be a hex colour like #2F2D2E')
  if (!Array.isArray(content.sections)) fail('content.json: "sections" must be a list')

  const nodes = []
  for (const [si, section] of (Array.isArray(content.sections) ? content.sections : []).entries()) {
    if (!isString(section.title)) fail(`section ${si + 1}: "title" must be text`)
    for (const [ci, column] of (section.columns ?? []).entries()) {
      for (const [ni, node] of (column.nodes ?? []).entries()) {
        nodes.push({ node, where: `section ${si + 1}, column ${ci + 1}, card ${ni + 1}` })
      }
    }
  }

  const ids = new Set()
  for (const { node, where } of nodes) {
    const name = `card "${node.id ?? where}"`
    if (!isString(node.id) || node.id === '') fail(`${where}: card has no id`)
    else if (ids.has(node.id)) fail(`${name}: id is used twice`)
    else ids.add(node.id)
    if (!isString(node.title)) fail(`${name}: "title" must be text`)
    if (!isString(node.text)) fail(`${name}: "text" must be text`)
    if (!HEX.test(node.color ?? '')) fail(`${name}: "color" must be a hex colour like #E3F2FD`)
    if ('width' in node || 'yPosition' in node) {
      fail(`${name}: positions belong in layout.json, not content.json`)
    }
    if (!Array.isArray(node.connections)) fail(`${name}: "connections" must be a list`)
  }

  for (const { node } of nodes) {
    const name = `card "${node.id}"`
    for (const connection of node.connections ?? []) {
      if (!ids.has(connection.targetId)) {
        fail(`${name}: a link points at "${connection.targetId}", which is not a card`)
      }
      if (typeof connection.confidence === 'number' && (connection.confidence < 0 || connection.confidence > 100)) {
        fail(`${name}: confidence must be between 0 and 100`)
      }
    }
    if (node.groupId !== undefined && !ids.has(node.groupId)) {
      fail(`${name}: groupId "${node.groupId}" is not a card`)
    }
  }

  // Every web address anywhere in the content must start with http:// or https://.
  function checkUrls(value, path) {
    if (Array.isArray(value)) value.forEach((v, i) => checkUrls(v, `${path}[${i}]`))
    else if (isObject(value)) {
      for (const [key, v] of Object.entries(value)) {
        if (key === 'url') {
          if (!isString(v) || !WEB_URL.test(v)) fail(`${path}: web address "${v}" must start with http:// or https://`)
        } else checkUrls(v, `${path}.${key}`)
      }
    }
  }
  checkUrls(content.sections ?? [], 'content')

  // layout.json: one position per card, nothing extra, numbers only.
  if (!isObject(layout.cards)) fail('layout.json: "cards" must be an object keyed by card id')
  else {
    for (const id of ids) {
      const place = layout.cards[id]
      if (!place) fail(`layout.json: no position for card "${id}"`)
      else if (!Number.isFinite(place.width) || !Number.isFinite(place.yPosition)) {
        fail(`layout.json: card "${id}" needs numeric "width" and "yPosition"`)
      }
    }
    for (const id of Object.keys(layout.cards)) {
      if (!ids.has(id)) fail(`layout.json: position for "${id}", which is not a card in content.json`)
    }
    const keys = Object.keys(layout.cards)
    if (keys.join('\n') !== [...keys].sort().join('\n')) fail('layout.json: card ids must be in alphabetical order')
  }
  cardCount += nodes.length
  checked.push(dir)
}

// theories/index.json: which theories exist, which one opens first, and how each is marked.
function checkIndex() {
  const path = 'theories/index.json'
  const index = load(path)
  if (!index) return []
  if (!Array.isArray(index.theories) || index.theories.length === 0) {
    fail(`${path}: "theories" must be a non-empty list`)
    return []
  }
  const slugs = new Set()
  for (const [i, theory] of index.theories.entries()) {
    const name = `${path}: theory ${i + 1}`
    if (!isObject(theory)) {
      fail(`${name}: must be an object with a slug, title, status and layout`)
      continue
    }
    if (!isString(theory.slug) || !SLUG.test(theory.slug)) {
      fail(`${name}: "slug" must be lowercase letters, digits and dashes, at most 64 characters`)
      continue
    }
    if (slugs.has(theory.slug)) fail(`${name}: slug "${theory.slug}" is used twice`)
    slugs.add(theory.slug)
    if (!isString(theory.title) || theory.title === '') fail(`${name}: "title" must be text`)
    if (!STATUSES.includes(theory.status)) fail(`${name}: "status" must be one of ${STATUSES.join(', ')}`)
    if (!LAYOUTS.includes(theory.layout)) fail(`${name}: "layout" must be one of ${LAYOUTS.join(', ')}`)
    if (theory.statusNote !== undefined && !isString(theory.statusNote)) {
      fail(`${name}: "statusNote" must be text`)
    }
  }
  if (!slugs.has(index.default)) fail(`${path}: "default" must be the slug of a listed theory`)
  return [...slugs]
}

// A symbolic link would let one theory's folder stand for another's (the suggestion bot reads
// and writes through it), so the theory folders hold plain files and folders only.
function checkNoLinks(dir) {
  if (!existsSync(dir)) return
  for (const entry of readdirSync(dir)) {
    const path = `${dir}/${entry}`
    const stat = lstatSync(path)
    if (stat.isSymbolicLink()) fail(`${path}: symbolic links are not allowed`)
    else if (stat.isDirectory()) checkNoLinks(path)
  }
}
checkNoLinks('theories')
checkNoLinks('map')

for (const slug of checkIndex()) checkMap(`theories/${slug}`)
// The old single map stays for one release so earlier links keep working.
if (existsSync('map/content.json')) checkMap('map')

finish()

function finish() {
  if (errors.length > 0) {
    console.error(`Map check failed with ${errors.length} problem${errors.length === 1 ? '' : 's'}:`)
    for (const e of errors) console.error(` - ${e}`)
    process.exit(1)
  }
  console.log(
    `Map check passed: ${checked.join(', ')}; ${cardCount} cards, positions complete, all web addresses are http(s).`,
  )
  process.exit(0)
}
