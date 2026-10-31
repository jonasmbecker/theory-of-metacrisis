// Checks map/content.json and map/layout.json. No dependencies: run with `node scripts/validate-map.mjs`.
// Mirrors the rules of the ToC editor's schema (jonasmbecker/toc-editor, src/model/schema.ts).
import { readFileSync } from 'node:fs'

const errors = []
const fail = (message) => errors.push(message)

function load(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch (error) {
    fail(`${path}: cannot be read as JSON (${error.message})`)
    return null
  }
}

const content = load('map/content.json')
const layout = load('map/layout.json')
if (!content || !layout) finish()

const HEX = /^#[0-9a-fA-F]{6}$/
const WEB_URL = /^https?:\/\/\S+$/i
const isObject = (v) => typeof v === 'object' && v !== null && !Array.isArray(v)
const isString = (v) => typeof v === 'string'

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

finish()

function finish() {
  if (errors.length > 0) {
    console.error(`Map check failed with ${errors.length} problem${errors.length === 1 ? '' : 's'}:`)
    for (const e of errors) console.error(` - ${e}`)
    process.exit(1)
  }
  console.log(`Map check passed: ${nodes.length} cards, positions complete, all web addresses are http(s).`)
  process.exit(0)
}
