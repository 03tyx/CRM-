//exportDocx.js (deployment list only, single page)
// import {
//   Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
//   AlignmentType, BorderStyle, WidthType, ShadingType, VerticalAlign,
//   ExternalHyperlink,
// } from 'docx'
// import { saveAs } from 'file-saver'

// // ── Border helpers ────────────────────────────────────────────────────────────
// const B       = { style: BorderStyle.SINGLE, size: 4, color: '000000' }
// const BORDERS = { top: B, bottom: B, left: B, right: B }

// // ── Cell helpers ──────────────────────────────────────────────────────────────
// function makeCell(children, opts = {}) {
//   return new TableCell({
//     borders:       BORDERS,
//     width:         opts.width  ? { size: opts.width,  type: WidthType.DXA } : undefined,
//     shading:       opts.fill   ? { fill: opts.fill,   type: ShadingType.CLEAR } : undefined,
//     verticalAlign: VerticalAlign.CENTER,
//     margins:       { top: 80, bottom: 80, left: 120, right: 120 },
//     rowSpan:       opts.rowSpan,
//     columnSpan:    opts.colSpan,
//     children,
//   })
// }

// function txt(text, opts = {}) {
//   return new TextRun({
//     text:    String(text ?? ''),
//     font:    'Arial',
//     size:    opts.size   || 20,
//     bold:    opts.bold   || false,
//     italics: opts.italic || false,
//     color:   opts.color  || '000000',
//   })
// }

// function para(runs, align = AlignmentType.LEFT) {
//   return new Paragraph({
//     alignment: align,
//     children:  Array.isArray(runs) ? runs : [runs],
//   })
// }

// function textCell(text, opts = {}) {
//   return makeCell(
//     [para(txt(text, { bold: opts.bold, size: opts.size, color: opts.color }), opts.align || AlignmentType.LEFT)],
//     opts
//   )
// }

// // ── Hyperlink cell ────────────────────────────────────────────────────────────
// function hyperlinkCell(label, url, opts = {}) {
//   const link = new ExternalHyperlink({
//     link: url,
//     children: [
//       new TextRun({
//         text:      label,
//         font:      'Arial',
//         size:      opts.size || 20,
//         color:     '0563C1',
//         underline: { type: 'single' },
//       }),
//     ],
//   })
//   return makeCell(
//     [new Paragraph({ alignment: opts.align || AlignmentType.LEFT, children: [link] })],
//     opts
//   )
// }

// // ── Strip #FL / feedback-log prefix ──────────────────────────────────────────
// function stripFLPrefix(remark) {
//   return remark.replace(/^#\S.*? - /, '').trimStart()
// }

// // ── Remarks cell ──────────────────────────────────────────────────────────────
// function remarksCell(remarksList, opts = {}) {
//   const allLines = []

//   for (const raw of remarksList) {
//     if (!raw) continue
//     const lines = raw.split('\n').map(l => l.trim()).filter(Boolean)
//     for (const line of lines) {
//       allLines.push({ text: line, isNoTest: line === 'no testing required' })
//     }
//   }

//   const contentLineCount = allLines.filter(l => !l.isNoTest).length
//   const useNumbering     = contentLineCount > 1

//   const paragraphs = []
//   let idx = 0

//   for (const { text, isNoTest } of allLines) {
//     if (isNoTest) {
//       paragraphs.push(
//         new Paragraph({
//           alignment: AlignmentType.LEFT,
//           spacing:   { after: 40 },
//           indent:    { left: 220 },
//           children:  [txt('no testing required', { italic: true, color: 'FF0000', size: 18 })],
//         })
//       )
//     } else {
//       idx++
//       const clean = stripFLPrefix(text)
//       const label = useNumbering ? `${idx}. ${clean || '(no remark)'}` : (clean || '(no remark)')
//       paragraphs.push(
//         new Paragraph({
//           alignment: AlignmentType.LEFT,
//           spacing:   { after: 20 },
//           children:  [txt(label, { size: 20 })],
//         })
//       )
//     }
//   }

//   return makeCell(paragraphs.length ? paragraphs : [para(txt(''))], opts)
// }

// // ── Format date ───────────────────────────────────────────────────────────────
// function fmtDate(dateStr) {
//   if (!dateStr) return ''
//   const d = new Date(dateStr)
//   return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
// }

// // ── Build blocks ──────────────────────────────────────────────────────────────
// function buildBlocks(tasks, deployDateStr) {
//   const taskOrder = []
//   const taskMap   = {}

//   for (const t of tasks) {
//     const taskLabel  = t.taskLabel || t.project || ''
//     const taskUrl    = t.taskUrl   || null
//     const taskKey    = `${taskLabel}||${taskUrl}`
//     const isSelfDisc = t.discovery === 'self-discovered'
//     const pic        = t.pic        || ' '
//     const liveDate   = t.deployLiveDate || deployDateStr
//     const remarks    = t.remarks    || ''

//     if (!taskMap[taskKey]) {
//       taskOrder.push(taskKey)
//       taskMap[taskKey] = {
//         taskLabel,
//         taskUrl,
//         hasNonSelfDisc: false,
//         picOrder: [],
//         picMap:   {},
//       }
//     }

//     if (isSelfDisc) continue

//     const entry = taskMap[taskKey]
//     entry.hasNonSelfDisc = true

//     if (!entry.picMap[pic]) {
//       entry.picOrder.push(pic)
//       entry.picMap[pic] = { pic: t.pic || '', liveDate, remarksList: [] }
//     }
//     entry.picMap[pic].remarksList.push(remarks)
//   }

//   const blocks = []
//   for (const taskKey of taskOrder) {
//     const entry = taskMap[taskKey]
//     if (!entry.hasNonSelfDisc) continue

//     for (const pic of entry.picOrder) {
//       const { liveDate, remarksList } = entry.picMap[pic]
//       blocks.push({
//         taskLabel: entry.taskLabel,
//         taskUrl:   entry.taskUrl,
//         pic,
//         liveDate,
//         remarksList,
//       })
//     }
//   }

//   return blocks
// }

// // ── Main export ───────────────────────────────────────────────────────────────
// export async function exportDeploymentDocx({ deployment, tasks, liveDate }) {
//   const deployDateStr = liveDate || deployment.deploy_date || new Date().toISOString().split('T')[0]
//   const filename      = `CRM_Deployment_List_${deployDateStr}.docx`

//   const CW = [400, 2400, 4000, 1500, 1726]
//   const TW = CW.reduce((a, b) => a + b, 0)

//   const HEADER_FILL = 'BDD7EE'

//   const headerRow = new TableRow({
//     tableHeader: true,
//     children: [
//       textCell('#',                  { width: CW[0], fill: HEADER_FILL, bold: true, align: AlignmentType.CENTER }),
//       textCell('Task',               { width: CW[1], fill: HEADER_FILL, bold: true }),
//       textCell('Remarks from iFAST', { width: CW[2], fill: HEADER_FILL, bold: true }),
//       textCell('PIC',                { width: CW[3], fill: HEADER_FILL, bold: true, align: AlignmentType.CENTER }),
//       textCell('Deploying LIVE on',  { width: CW[4], fill: HEADER_FILL, bold: true, align: AlignmentType.CENTER }),
//     ],
//   })

//   const blocks = buildBlocks(tasks, deployDateStr)

//   const dataRows = blocks.map((block, i) => {
//     let taskCell
//     if (block.taskUrl) {
//       taskCell = hyperlinkCell(block.taskLabel, block.taskUrl, { width: CW[1] })
//     } else {
//       taskCell = textCell(block.taskLabel || '', { width: CW[1] })
//     }

//     const remCell  = remarksCell(block.remarksList, { width: CW[2] })
//     const picCell  = textCell(block.pic || '', { width: CW[3], align: AlignmentType.CENTER })
//     const dateCell = makeCell(
//       [para(txt(fmtDate(block.liveDate || deployDateStr), { color: 'FF0000' }), AlignmentType.CENTER)],
//       { width: CW[4] }
//     )

//     return new TableRow({
//       children: [
//         textCell(i + 1, { width: CW[0], align: AlignmentType.CENTER }),
//         taskCell,
//         remCell,
//         picCell,
//         dateCell,
//       ],
//     })
//   })

//   if (blocks.length === 0) {
//     dataRows.push(new TableRow({
//       children: [
//         makeCell(
//           [para(txt('No tasks linked to this deployment', { color: 'AAAAAA' }), AlignmentType.CENTER)],
//           { colSpan: 5, width: TW }
//         ),
//       ],
//     }))
//   }

//   const mainTable = new Table({
//     width:        { size: TW, type: WidthType.DXA },
//     columnWidths: CW,
//     rows:         [headerRow, ...dataRows],
//   })

//   const doc = new Document({
//     styles: {
//       default: { document: { run: { font: 'Arial', size: 20 } } },
//     },
//     sections: [{
//       properties: {
//         page: {
//           size:   { width: 11906, height: 16838 },
//           margin: { top: 851, right: 851, bottom: 851, left: 851 },
//         },
//       },
//       children: [
//         new Paragraph({
//           alignment: AlignmentType.CENTER,
//           spacing:   { before: 0, after: 160 },
//           children:  [txt('CRM Go-Live Deployment List', { size: 32, color: '#1c4592', bold: true })],
//         }),
//         mainTable,
//       ],
//     }],
//   })

//   const blob = await Packer.toBlob(doc)
//   saveAs(blob, filename)
// }

// exportDocx.js
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, VerticalAlign,
  ExternalHyperlink, PageBreak,
} from 'docx'
import { saveAs } from 'file-saver'

// ── Border helpers ────────────────────────────────────────────────────────────
const B       = { style: BorderStyle.SINGLE, size: 4, color: '000000' }
const BORDERS = { top: B, bottom: B, left: B, right: B }

// ── Cell helpers ──────────────────────────────────────────────────────────────
function makeCell(children, opts = {}) {
  return new TableCell({
    borders:       BORDERS,
    width:         opts.width  ? { size: opts.width,  type: WidthType.DXA } : undefined,
    shading:       opts.fill   ? { fill: opts.fill,   type: ShadingType.CLEAR } : undefined,
    verticalAlign: opts.vAlign || VerticalAlign.CENTER,
    margins:       { top: 80, bottom: 80, left: 120, right: 120 },
    rowSpan:       opts.rowSpan,
    columnSpan:    opts.colSpan,
    children,
  })
}

function txt(text, opts = {}) {
  return new TextRun({
    text:    String(text ?? ''),
    font:    'Arial',
    size:    opts.size   || 20,
    bold:    opts.bold   || false,
    italics: opts.italic || false,
    color:   opts.color  || '000000',
  })
}

// ── Shared paragraph spacing — single line, no extra gaps ────────────────────
// Google Docs interprets Word's spacing.after as margin. Setting everything to
// line:240 (single) with before/after:0 produces clean paste into Google Docs.
const SP = { before: 0, after: 0, line: 240, lineRule: 'auto' }

function para(runs, align = AlignmentType.LEFT, opts = {}) {
  return new Paragraph({
    alignment: align,
    spacing:   opts.spacing || SP,
    indent:    opts.indent,
    children:  Array.isArray(runs) ? runs : [runs],
  })
}

function textCell(text, opts = {}) {
  return makeCell(
    [para(txt(text, { bold: opts.bold, size: opts.size, color: opts.color }), opts.align || AlignmentType.LEFT)],
    opts
  )
}

// ── Hyperlink cell ────────────────────────────────────────────────────────────
function hyperlinkCell(label, url, opts = {}) {
  const link = new ExternalHyperlink({
    link: url,
    children: [
      new TextRun({
        text:      label,
        font:      'Arial',
        size:      opts.size || 20,
        color:     '0563C1',
        underline: { type: 'single' },
      }),
    ],
  })
  return makeCell(
    [new Paragraph({ alignment: opts.align || AlignmentType.LEFT, spacing: SP, children: [link] })],
    opts
  )
}

// ── HTML → docx Paragraphs (rich: bold, italic, underline, lists, blank lines) ─
// Walks the contentEditable HTML and produces an array of docx Paragraph objects
// preserving all inline formatting exactly as the user typed/styled it.
// Rules:
//   • Each <div>/<p> → one Paragraph (no injected blank lines between them)
//   • Blank <div>/<p> with no text → one empty Paragraph (preserves intentional blank lines)
//   • <br> → ends the current paragraph, starts a new one
//   • <ol><li> → numbered Paragraph with "N. " prefix built into the first TextRun
//   • <ul><li> → bulleted Paragraph with "• " prefix
//   • <b>/<strong> → bold TextRun
//   • <i>/<em> → italic TextRun
//   • <u> → underline TextRun
//   • combinations (bold+italic etc.) → nested flags merged correctly
function htmlToDocxParagraphs(html, baseSize = 20) {
  if (!html) return [new Paragraph({ spacing: SP, children: [txt('')] })]

  const container = document.createElement('div')
  container.innerHTML = html

  const paragraphs = []

  // Collect TextRuns for the current paragraph then flush it
  function flushParagraph(runs, opts = {}) {
    if (runs.length === 0) {
      // Empty paragraph = intentional blank line
      paragraphs.push(new Paragraph({ spacing: SP, children: [txt('')] }))
      return
    }
    paragraphs.push(new Paragraph({
      spacing:  SP,
      indent:   opts.indent,
      children: runs,
    }))
  }

  // Walk a node tree collecting TextRun objects into `runs`.
  // `fmt` carries the current inherited formatting flags.
  function collectRuns(node, runs, fmt = {}) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g,  '&')
        .replace(/&lt;/g,   '<')
        .replace(/&gt;/g,   '>')
        .replace(/&#39;/g,  "'")
        .replace(/&quot;/g, '"')
      if (text) {
        runs.push(new TextRun({
          text,
          font:    'Arial',
          size:    baseSize,
          bold:    fmt.bold    || false,
          italics: fmt.italic  || false,
          underline: fmt.underline ? { type: 'single' } : undefined,
          color:   fmt.color   || '000000',
        }))
      }
      return
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return

    const tag = node.tagName.toLowerCase()

    // Inline formatting tags — merge flags and recurse
    if (tag === 'b' || tag === 'strong') {
      node.childNodes.forEach(c => collectRuns(c, runs, { ...fmt, bold: true }))
      return
    }
    if (tag === 'i' || tag === 'em') {
      node.childNodes.forEach(c => collectRuns(c, runs, { ...fmt, italic: true }))
      return
    }
    if (tag === 'u') {
      node.childNodes.forEach(c => collectRuns(c, runs, { ...fmt, underline: true }))
      return
    }
    if (tag === 'span') {
      // Handle inline style color if present
      const color = node.style?.color
      const hex   = color ? rgbToHex(color) : null
      node.childNodes.forEach(c => collectRuns(c, runs, { ...fmt, ...(hex ? { color: hex } : {}) }))
      return
    }

    // <br> inside a block → flush current runs as a paragraph, start fresh
    if (tag === 'br') {
      flushParagraph(runs.splice(0))
      return
    }

    // Everything else — just recurse (don't produce block breaks inside collectRuns)
    node.childNodes.forEach(c => collectRuns(c, runs, fmt))
  }

  function processListItem(node, listType, counter) {
    const runs = []
    // Build prefix TextRun
    let prefix
    if (listType === 'ol') {
      counter.n++
      prefix = `${counter.n}. `
    } else {
      prefix = '• '
    }
    runs.push(new TextRun({ text: prefix, font: 'Arial', size: baseSize, color: '000000' }))
    node.childNodes.forEach(c => collectRuns(c, runs, {}))
    flushParagraph(runs)
  }

  function processListNode(node, listType) {
    const counter = { n: 0 }
    node.childNodes.forEach(child => {
      if (child.nodeType === Node.ELEMENT_NODE && child.tagName.toLowerCase() === 'li') {
        processListItem(child, listType, counter)
      }
    })
  }

  function processBlock(node) {
    // Collect all child content into runs for this block
    const runs = []
    node.childNodes.forEach(c => collectRuns(c, runs, {}))
    flushParagraph(runs)
  }

  // Top-level walk
  container.childNodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent.trim()
      if (text) {
        const runs = []
        collectRuns(node, runs, {})
        flushParagraph(runs)
      }
      return
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return

    const tag = node.tagName.toLowerCase()
    if (tag === 'ol') { processListNode(node, 'ol'); return }
    if (tag === 'ul') { processListNode(node, 'ul'); return }
    if (tag === 'div' || tag === 'p') { processBlock(node); return }
    if (tag === 'br') { flushParagraph([]); return }
    // Inline at top level (shouldn't happen but handle gracefully)
    const runs = []
    collectRuns(node, runs, {})
    if (runs.length) flushParagraph(runs)
  })

  return paragraphs.length
    ? paragraphs
    : [new Paragraph({ spacing: SP, children: [txt('')] })]
}

// ── RGB string → hex (for span color) ────────────────────────────────────────
function rgbToHex(rgb) {
  if (!rgb) return null
  // Already hex?
  if (rgb.startsWith('#')) return rgb.replace('#', '').toUpperCase()
  const m = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
  if (!m) return null
  return [m[1], m[2], m[3]].map(n => parseInt(n).toString(16).padStart(2, '0')).join('').toUpperCase()
}

// ── Rich test-scenario cell ────────────────────────────────────────────────────
function testScenarioCell(html, opts = {}) {
  const paragraphs = htmlToDocxParagraphs(html, opts.size || 20)
  return makeCell(paragraphs, opts)
}

// ── Multi-line plain-text cell (used for remarks in page 2) ───────────────────
// Lines are plain strings; '' = intentional blank line.
function multilineCell(lines, opts = {}) {
  if (!lines || lines.length === 0) {
    return makeCell([new Paragraph({ spacing: SP, children: [txt('')] })], opts)
  }
  const paragraphs = lines.map(line =>
    new Paragraph({
      spacing:  SP,
      children: [txt(line, { size: opts.size || 20, color: opts.color || '000000' })],
    })
  )
  return makeCell(paragraphs, opts)
}

// ── Strip #FL / feedback-log prefix ──────────────────────────────────────────
function stripFLPrefix(remark) {
  return remark.replace(/^#\S.*? - /, '').trimStart()
}

// ── Remarks cell (numbered if multiple) ──────────────────────────────────────
function remarksCell(remarksList, opts = {}) {
  const allLines = []

  for (const raw of remarksList) {
    if (!raw) continue
    const lines = raw.split('\n').map(l => l.trim()).filter(Boolean)
    for (const line of lines) {
      allLines.push({ text: line, isNoTest: line === 'no testing required' })
    }
  }

  const contentLineCount = allLines.filter(l => !l.isNoTest).length
  const useNumbering     = contentLineCount > 1

  const paragraphs = []
  let idx = 0

  for (const { text, isNoTest } of allLines) {
    if (isNoTest) {
      paragraphs.push(
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing:   SP,
          indent:    { left: 220 },
          children:  [txt('no testing required', { italic: true, color: 'FF0000', size: 18 })],
        })
      )
    } else {
      idx++
      const clean = stripFLPrefix(text)
      const label = useNumbering ? `${idx}. ${clean || '(no remark)'}` : (clean || '(no remark)')
      paragraphs.push(
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing:   SP,
          children:  [txt(label, { size: 20 })],
        })
      )
    }
  }

  return makeCell(paragraphs.length ? paragraphs : [para(txt(''))], opts)
}

// ── Format date — "30 Apr 2026" ───────────────────────────────────────────────
function fmtDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ── Build blocks for page 1 (deployment list) ─────────────────────────────────
// Groups by taskLabel+taskUrl, then by PIC within each task.
// Returns one block per unique (task, PIC) pair.
function buildBlocks(tasks, deployDateStr) {
  const taskOrder = []
  const taskMap   = {}

  for (const t of tasks) {
    const taskLabel  = t.taskLabel || t.project || ''
    const taskUrl    = t.taskUrl   || null
    const taskKey    = `${taskLabel}||${taskUrl}`
    const isSelfDisc = t.discovery === 'self-discovered'
    // PIC: empty → "-"
    const pic        = t.pic || '-'
    const liveDate   = t.deployLiveDate || deployDateStr
    const remarks    = t.remarks    || ''

    if (!taskMap[taskKey]) {
      taskOrder.push(taskKey)
      taskMap[taskKey] = {
        taskLabel,
        taskUrl,
        hasNonSelfDisc: false,
        picOrder: [],
        picMap:   {},
      }
    }

    if (isSelfDisc) continue

    const entry = taskMap[taskKey]
    entry.hasNonSelfDisc = true

    if (!entry.picMap[pic]) {
      entry.picOrder.push(pic)
      entry.picMap[pic] = { pic, liveDate, remarksList: [] }
    }
    entry.picMap[pic].remarksList.push(remarks)
  }

  const blocks = []
  for (const taskKey of taskOrder) {
    const entry = taskMap[taskKey]
    if (!entry.hasNonSelfDisc) continue
    for (const pic of entry.picOrder) {
      const { liveDate, remarksList } = entry.picMap[pic]
      blocks.push({
        taskLabel: entry.taskLabel,
        taskUrl:   entry.taskUrl,
        pic,
        liveDate,
        remarksList,
      })
    }
  }

  return blocks
}

// ── Build blocks for page 2 (test scenarios) ──────────────────────────────────
// Groups by taskLabel+taskUrl. Within each task, each remark gets its own row
// with its paired test scenario. Uses same sequential numbering as page 1.
function buildTestBlocks(tasks) {
  const taskOrder = []
  const taskMap   = {}

  for (const t of tasks) {
    const taskLabel  = t.taskLabel || t.project || ''
    const taskUrl    = t.taskUrl   || null
    const taskKey    = `${taskLabel}||${taskUrl}`
    const isSelfDisc = t.discovery === 'self-discovered'
    const pic        = t.pic || '-'
    const remarks    = t.remarks || ''
    // Store raw HTML — rich formatting preserved for docx rendering
    const testScenarioHtml = t.testScenario || ''

    if (!taskMap[taskKey]) {
      taskOrder.push(taskKey)
      taskMap[taskKey] = { taskLabel, taskUrl, details: [] }
    }

    if (!isSelfDisc) {
      taskMap[taskKey].details.push({ remarks, testScenarioHtml, pic })
    }
  }

  let seq = 0
  const rows = []

  for (const taskKey of taskOrder) {
    const entry = taskMap[taskKey]
    if (entry.details.length === 0) continue

    const picsSeen = new Set()
    for (const d of entry.details) {
      if (!picsSeen.has(d.pic)) { picsSeen.add(d.pic); seq++ }
    }

    const picOrder = []
    const picMap   = {}
    for (const d of entry.details) {
      if (!picMap[d.pic]) { picOrder.push(d.pic); picMap[d.pic] = { pic: d.pic, items: [] } }
      picMap[d.pic].items.push({ remarks: d.remarks, testScenarioHtml: d.testScenarioHtml })
    }

    const startSeq = seq - picsSeen.size + 1
    let localSeq   = startSeq

    for (const pic of picOrder) {
      const { items } = picMap[pic]
      rows.push({
        taskLabel:  entry.taskLabel,
        taskUrl:    entry.taskUrl,
        pic,
        seqNo:      localSeq++,
        remarkRows: items,   // [{ remarks, testScenarioHtml }]
      })
    }
  }

  return rows
}

// ── Page 1 table ──────────────────────────────────────────────────────────────
function buildPage1Table(tasks, deployDateStr) {
  // Landscape page: 15840 DXA wide, 720 margins each side → 14400 usable DXA
  const CW = [400, 2400, 6274, 2200, 3126]  // # | Task | Remarks | PIC | Live on  → sum = 14400
  const TW = CW.reduce((a, b) => a + b, 0)
  const HEADER_FILL = 'BDD7EE'

  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      textCell('#',                  { width: CW[0], fill: HEADER_FILL, bold: true, align: AlignmentType.CENTER }),
      textCell('Task',               { width: CW[1], fill: HEADER_FILL, bold: true }),
      textCell('Remarks from iFAST', { width: CW[2], fill: HEADER_FILL, bold: true }),
      textCell('PIC',                { width: CW[3], fill: HEADER_FILL, bold: true, align: AlignmentType.CENTER }),
      textCell('Deploying LIVE on',  { width: CW[4], fill: HEADER_FILL, bold: true, align: AlignmentType.CENTER }),
    ],
  })

  const blocks   = buildBlocks(tasks, deployDateStr)
  const dataRows = blocks.map((block, i) => {
    const taskCell = block.taskUrl
      ? hyperlinkCell(block.taskLabel, block.taskUrl, { width: CW[1] })
      : textCell(block.taskLabel || '', { width: CW[1] })

    return new TableRow({
      children: [
        textCell(String(i + 1),         { width: CW[0], align: AlignmentType.CENTER }),
        taskCell,
        remarksCell(block.remarksList,   { width: CW[2] }),
        textCell(block.pic,              { width: CW[3], align: AlignmentType.CENTER }),
        makeCell(
          [para(txt(fmtDate(block.liveDate || deployDateStr), { color: 'FF0000' }), AlignmentType.CENTER)],
          { width: CW[4] }
        ),
      ],
    })
  })

  if (blocks.length === 0) {
    dataRows.push(new TableRow({
      children: [
        makeCell(
          [para(txt('No tasks linked to this deployment', { color: 'AAAAAA' }), AlignmentType.CENTER)],
          { colSpan: 5, width: TW }
        ),
      ],
    }))
  }

  return new Table({
    width:        { size: TW, type: WidthType.DXA },
    columnWidths: CW,
    rows:         [headerRow, ...dataRows],
  })
}

// ── Page 2 table ──────────────────────────────────────────────────────────────
// Columns: # | Task | Remarks from iFAST | Test Scenarios from iFAST | PIC
// Same task merged across its remark rows using rowSpan.
function buildPage2Table(tasks) {
  // Landscape page: 14400 DXA usable → # | Task | Remarks | Test Scenarios | PIC
  const CW = [400, 2800, 3500, 5500, 2200]  // sum = 14400
  const TW = CW.reduce((a, b) => a + b, 0)
  const HEADER_FILL = 'E2EFDA'   // light green to distinguish from page 1

  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      textCell('#',                          { width: CW[0], fill: HEADER_FILL, bold: true, align: AlignmentType.CENTER }),
      textCell('Task',                       { width: CW[1], fill: HEADER_FILL, bold: true }),
      textCell('Remarks from iFAST',         { width: CW[2], fill: HEADER_FILL, bold: true }),
      textCell('Test Scenarios from iFAST',  { width: CW[3], fill: HEADER_FILL, bold: true }),
      textCell('PIC',                        { width: CW[4], fill: HEADER_FILL, bold: true, align: AlignmentType.CENTER }),
    ],
  })

  const testBlocks = buildTestBlocks(tasks)
  const dataRows   = []

  if (testBlocks.length === 0) {
    dataRows.push(new TableRow({
      children: [
        makeCell(
          [para(txt('No test scenarios available', { color: 'AAAAAA' }), AlignmentType.CENTER)],
          { colSpan: 5, width: TW }
        ),
      ],
    }))
  } else {
    for (const block of testBlocks) {
      const remarkCount = block.remarkRows.length

      block.remarkRows.forEach((item, ri) => {
        const isFirst = ri === 0
        const cells   = []

        // # and Task columns — rowSpan the entire block (all remarks for this seq/task/PIC)
        if (isFirst) {
          cells.push(
            textCell(String(block.seqNo), {
              width: CW[0], align: AlignmentType.CENTER,
              rowSpan: remarkCount,
            })
          )

          const taskCell = block.taskUrl
            ? hyperlinkCell(block.taskLabel, block.taskUrl, { width: CW[1], rowSpan: remarkCount, vAlign: VerticalAlign.TOP })
            : makeCell(
                [para(txt(block.taskLabel || '', { size: 20 }))],
                { width: CW[1], rowSpan: remarkCount, vAlign: VerticalAlign.TOP }
              )
          cells.push(taskCell)
        }

        // Remarks — strip FL prefix, one line per remark entry
        const remarkLines = (item.remarks || '')
          .split('\n')
          .map(l => stripFLPrefix(l.trim()))
          .filter(Boolean)
        cells.push(multilineCell(
          remarkLines.length ? remarkLines : [''],
          { width: CW[2] }
        ))

        // Test Scenarios — rich HTML → docx paragraphs with bold/italic/underline/lists
        cells.push(testScenarioCell(item.testScenarioHtml || '', { width: CW[3] }))

        // PIC — rowSpan the entire block
        if (isFirst) {
          cells.push(
            textCell(block.pic || '-', {
              width: CW[4], align: AlignmentType.CENTER,
              rowSpan: remarkCount,
            })
          )
        }

        dataRows.push(new TableRow({ children: cells }))
      })
    }
  }

  return new Table({
    width:        { size: TW, type: WidthType.DXA },
    columnWidths: CW,
    rows:         [headerRow, ...dataRows],
  })
}

// ── Main export ───────────────────────────────────────────────────────────────
export async function exportDeploymentDocx({ deployment, tasks, liveDate }) {
  const deployDateStr = liveDate || deployment.deploy_date || new Date().toISOString().split('T')[0]
  const filename      = `CRM_Deployment_List_${deployDateStr}.docx`

  // Title for page 2: "CRM Go-Live Deployment List | 30 Apr 2026"
  const page2Title    = `CRM Go-Live Deployment List | ${fmtDate(deployDateStr)}`

  const page1Table = buildPage1Table(tasks, deployDateStr)
  const page2Table = buildPage2Table(tasks)

  const doc = new Document({
    styles: {
      default: { document: { run: { font: 'Arial', size: 20 } } },
    },
    sections: [{
      properties: {
        page: {
          size:   { width: 15840, height: 12240 },   // landscape
          margin: { top: 720, right: 720, bottom: 720, left: 720 },
        },
      },
      children: [
        // ── Page 1 ──────────────────────────────────────────────────────────
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing:   { before: 0, after: 160, line: 240, lineRule: 'auto' },
          children:  [txt('CRM Deployment List', { size: 32, bold: true })],
        }),
        page1Table,

        // ── Page break ──────────────────────────────────────────────────────
        new Paragraph({
          spacing: SP,
          children: [new PageBreak()],
        }),

        // ── Page 2 ──────────────────────────────────────────────────────────
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing:   { before: 0, after: 160, line: 240, lineRule: 'auto' },
          children:  [txt(page2Title, { size: 28, bold: true })],
        }),
        page2Table,
      ],
    }],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, filename)
}