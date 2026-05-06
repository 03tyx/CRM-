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

// exportDocx.js (deployment list + test scenarios, 2 pages)
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

function para(runs, align = AlignmentType.LEFT, opts = {}) {
  return new Paragraph({
    alignment: align,
    spacing:   opts.spacing,
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
    [new Paragraph({ alignment: opts.align || AlignmentType.LEFT, children: [link] })],
    opts
  )
}

// ── Strip HTML → plain text (for test scenarios) ──────────────────────────────
// function htmlToPlainLines(html) {
//   if (!html) return []
//   const plain = html
//     .replace(/<br\s*\/?>/gi, '\n')
//     .replace(/<\/p>/gi, '\n')
//     .replace(/<\/li>/gi, '\n')
//     .replace(/<li[^>]*>/gi, '• ')
//     .replace(/<[^>]+>/g, '')
//     .replace(/&nbsp;/g, ' ')
//     .replace(/&amp;/g, '&')
//     .replace(/&lt;/g, '<')
//     .replace(/&gt;/g, '>')
//     .trim()
//   return plain.split('\n').map(l => l.trim()).filter(Boolean)
// }

function htmlToPlainLines(html) {
  if (!html) return []

  const container = document.createElement('div')
  container.innerHTML = html

  const lines = []

  function walk(node, context = { olStack: [] }) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent.trim()
      if (text) lines.push(text)
      return
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return

    const tag = node.tagName.toLowerCase()

    // Handle <br>
    if (tag === 'br') {
      lines.push('\n')
      return
    }

    // Handle ordered list
    if (tag === 'ol') {
      context.olStack.push(0)
      node.childNodes.forEach(child => walk(child, context))
      context.olStack.pop()
      lines.push('\n')
      return
    }

    // Handle unordered list
    if (tag === 'ul') {
      node.childNodes.forEach(child => walk(child, context))
      lines.push('\n')
      return
    }

    // Handle list item
    if (tag === 'li') {
      if (context.olStack.length > 0) {
        // Ordered list
        context.olStack[context.olStack.length - 1]++
        const num = context.olStack[context.olStack.length - 1]
        lines.push(`${num}. ${node.textContent.trim()}`)
      } else {
        // Unordered list
        lines.push(`• ${node.textContent.trim()}`)
      }
      lines.push('\n')
      return
    }

    // Block elements
    const isBlock = ['div', 'p'].includes(tag)
    if (isBlock) lines.push('\n')

    node.childNodes.forEach(child => walk(child, context))

    if (isBlock) lines.push('\n')
  }

  container.childNodes.forEach(node => walk(node))

  return lines
    .join('')
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
}

// ── Multi-line plain-text cell ────────────────────────────────────────────────
function multilineCell(lines, opts = {}) {
  if (!lines || lines.length === 0) {
    return makeCell([para(txt(''))], opts)
  }
  const paragraphs = lines.map((line, i) =>
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing:   { after: i < lines.length - 1 ? 40 : 0 },
      children:  [txt(line, { size: opts.size || 20, color: opts.color || '000000' })],
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
          spacing:   { after: 40 },
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
          spacing:   { after: 20 },
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
  // We mirror the page-1 block ordering so sequence numbers match.
  // Each entry: { taskLabel, taskUrl, remark, testScenarioLines, seqNo }
  const taskOrder = []
  const taskMap   = {}

  for (const t of tasks) {
    const taskLabel  = t.taskLabel || t.project || ''
    const taskUrl    = t.taskUrl   || null
    const taskKey    = `${taskLabel}||${taskUrl}`
    const isSelfDisc = t.discovery === 'self-discovered'
    const pic        = t.pic || '-'
    const remarks    = t.remarks || ''
    const tsLines    = htmlToPlainLines(t.testScenario || '')

    if (!taskMap[taskKey]) {
      taskOrder.push(taskKey)
      taskMap[taskKey] = { taskLabel, taskUrl, details: [] }
    }

    if (!isSelfDisc) {
      taskMap[taskKey].details.push({ remarks, tsLines, pic })
    }
  }

  // Flatten with sequential numbering matching page 1
  let seq = 0
  const rows = []

  for (const taskKey of taskOrder) {
    const entry = taskMap[taskKey]
    if (entry.details.length === 0) continue

    // How many (task, PIC) pairs exist — same logic as buildBlocks
    // For test page we keep one row per remark (not per PIC grouping)
    // but use the same seq numbers that page 1 assigns per (task, PIC) block.
    // We simplify: seq increments per unique (task, PIC) as in buildBlocks.
    const picsSeen = new Set()
    for (const d of entry.details) {
      const picKey = d.pic
      if (!picsSeen.has(picKey)) {
        picsSeen.add(picKey)
        seq++
      }
    }

    // Now emit one test-page row per remark (each remark is paired with its TS)
    // Group by PIC first (same as page 1 block grouping)
    const picOrder = []
    const picMap   = {}
    for (const d of entry.details) {
      if (!picMap[d.pic]) { picOrder.push(d.pic); picMap[d.pic] = { pic: d.pic, items: [] } }
      picMap[d.pic].items.push({ remarks: d.remarks, tsLines: d.tsLines })
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
        remarkRows: items,   // [{remarks, tsLines}]
      })
    }
  }

  return rows
}

// ── Page 1 table ──────────────────────────────────────────────────────────────
function buildPage1Table(tasks, deployDateStr) {
  const CW = [400, 2400, 4000, 1500, 1726]
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
    width:        { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: CW,
    rows:         [headerRow, ...dataRows],
  })
}

// ── Page 2 table ──────────────────────────────────────────────────────────────
// Columns: # | Task | Remarks from iFAST | Test Scenarios from iFAST | PIC
// Same task merged across its remark rows using rowSpan.
function buildPage2Table(tasks) {
  // CW: # | Task | Remarks | Test Scenarios | PIC
  const CW = [400, 2200, 2600, 3000, 1226]
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

        // Remarks — one row per remark
        const remarkLines = (item.remarks || '')
          .split('\n')
          .map(l => stripFLPrefix(l.trim()))
          .filter(Boolean)
        cells.push(multilineCell(
          remarkLines.length ? remarkLines : [''],
          { width: CW[2] }
        ))

        // Test Scenarios — one row per remark
        cells.push(multilineCell(
          item.tsLines.length ? item.tsLines : [''],
          { width: CW[3] }
        ))

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
    width:        { size: 100, type: WidthType.PERCENTAGE },
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
          spacing:   { before: 0, after: 160 },
          children:  [txt('CRM Deployment List', { size: 32, bold: true })],
        }),
        page1Table,

        // ── Page break ──────────────────────────────────────────────────────
        new Paragraph({
          children: [new PageBreak()],
          spacing:  { before: 0, after: 0 },
        }),

        // ── Page 2 ──────────────────────────────────────────────────────────
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing:   { before: 0, after: 160 },
          children:  [txt(page2Title, { size: 28, bold: true })],
        }),
        page2Table,
      ],
    }],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, filename)
}

