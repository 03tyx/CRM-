import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, VerticalAlign,
  ExternalHyperlink,
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
    verticalAlign: VerticalAlign.CENTER,
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

function para(runs, align = AlignmentType.LEFT) {
  return new Paragraph({
    alignment: align,
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

// ── Strip #FL / feedback-log prefix ──────────────────────────────────────────
// DeploymentBoard prepends "#FL001 - " or "#CustomLabel - " to remarks.
// Strip it so it doesn't appear in the Word doc. "(bug)" is preserved.
function stripFLPrefix(remark) {
  return remark.replace(/^#\S.*? - /, '').trimStart()
}

// ── Remarks cell ──────────────────────────────────────────────────────────────
// remarksList: string[] of already-formatted remark strings (non-self-disc only).
// Each string may contain "\nno testing required".
// "(bug)" suffix preserved as-is.
// Numbered 1. 2. 3. resetting per block.
function remarksCell(remarksList, opts = {}) {
  const paragraphs = []
  let idx = 0

  for (const raw of remarksList) {
    if (!raw) continue

    const lines = raw.split('\n').map(l => l.trim()).filter(Boolean)

    for (const line of lines) {
      const isNoTest = line === 'no testing required'

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
        const clean = stripFLPrefix(line)
        paragraphs.push(
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing:   { after: 20 },
            children:  [txt(`${idx}. ${clean || '(no remark)'}`, { size: 20 })],
          })
        )
      }
    }
  }

  return makeCell(paragraphs.length ? paragraphs : [para(txt(''))], opts)
}

// ── Format date ───────────────────────────────────────────────────────────────
function fmtDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function buildBlocks(tasks, deployDateStr) {
  const taskOrder = []  // taskKey in first-seen order
  const taskMap   = {} // taskKey → { taskLabel, taskUrl, hasNonSelfDisc, picOrder[], picMap{} }

  for (const t of tasks) {
    const taskLabel  = t.taskLabel || t.project || ''
    const taskUrl    = t.taskUrl   || null
    const taskKey    = `${taskLabel}||${taskUrl}`
    const isSelfDisc = t.discovery === 'self-discovered'
    const pic        = t.pic        || ' '
    const liveDate   = t.deployLiveDate || deployDateStr
    const remarks    = t.remarks    || ''

    // Register task on first encounter
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

    // Self-discovered rows: skip entirely — do not add to any PIC group
    if (isSelfDisc) continue

    const entry = taskMap[taskKey]
    entry.hasNonSelfDisc = true

    if (!entry.picMap[pic]) {
      entry.picOrder.push(pic);
      entry.picMap[pic] = { pic: t.pic || '', liveDate, remarksList: [] }; // Store original empty string for display
    }
    entry.picMap[pic].remarksList.push(remarks);
  }

  // Flatten into ordered blocks, skipping tasks that are 100% self-discovered
  const blocks = []
  for (const taskKey of taskOrder) {
    const entry = taskMap[taskKey]

    // If every row for this task was self-discovered → drop the task entirely
    if (!entry.hasNonSelfDisc) continue

    let firstForTask = true
    for (const pic of entry.picOrder) {
      const { liveDate, remarksList } = entry.picMap[pic]
      blocks.push({
        taskLabel: firstForTask ? entry.taskLabel : '',
        taskUrl:   firstForTask ? entry.taskUrl   : null,
        pic,
        liveDate,
        remarksList,
      })
      firstForTask = false
    }
  }

  return blocks
}

// ── Main export ───────────────────────────────────────────────────────────────
export async function exportDeploymentDocx({ deployment, tasks, liveDate }) {
  const deployDateStr = liveDate || deployment.deploy_date || new Date().toISOString().split('T')[0]
  const filename      = `CRM_Deployment_List_${deployDateStr}.docx`

  // Column widths (DXA): #, Task, Remarks from ASP, PIC, Deploying LIVE on
  // Total = 10026 (A4 portrait, ~1.5 cm margins)
  const CW = [400, 2400, 4000, 1500, 1726]
  const TW = CW.reduce((a, b) => a + b, 0)

  const HEADER_FILL = 'BDD7EE'

  // ── Header row ─────────────────────────────────────────────────────────────
  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      textCell('#',                 { width: CW[0], fill: HEADER_FILL, bold: true, align: AlignmentType.CENTER }),
      textCell('Task',              { width: CW[1], fill: HEADER_FILL, bold: true }),
      textCell('Remarks from ASP',  { width: CW[2], fill: HEADER_FILL, bold: true }),
      textCell('PIC',               { width: CW[3], fill: HEADER_FILL, bold: true, align: AlignmentType.CENTER }),
      textCell('Deploying LIVE on', { width: CW[4], fill: HEADER_FILL, bold: true, align: AlignmentType.CENTER }),
    ],
  })

  // ── Build blocks ───────────────────────────────────────────────────────────
  const blocks = buildBlocks(tasks, deployDateStr)

  // ── Data rows ──────────────────────────────────────────────────────────────
  const dataRows = blocks.map((block, i) => {
    // Task cell: hyperlink or plain; blank for 2nd+ blocks of same task
    let taskCell
    if (block.taskUrl) {
      taskCell = hyperlinkCell(block.taskLabel, block.taskUrl, { width: CW[1] })
    } else {
      taskCell = textCell(block.taskLabel || '', { width: CW[1] })
    }

    const remCell  = remarksCell(block.remarksList, { width: CW[2] })
    const picCell  = textCell(block.pic || '', { width: CW[3], align: AlignmentType.CENTER })
    const dateCell = makeCell(
      [para(txt(fmtDate(block.liveDate || deployDateStr), { color: 'FF0000' }), AlignmentType.CENTER)],
      { width: CW[4] }
    )

    return new TableRow({
      children: [
        textCell(i + 1, { width: CW[0], align: AlignmentType.CENTER }),
        taskCell,
        remCell,
        picCell,
        dateCell,
      ],
    })
  })

  // Empty row if no tasks survive
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

  // ── Assemble document ──────────────────────────────────────────────────────
  const mainTable = new Table({
    width:        { size: TW, type: WidthType.DXA },
    columnWidths: CW,
    rows:         [headerRow, ...dataRows],
  })

  const doc = new Document({
    styles: {
      default: { document: { run: { font: 'Arial', size: 20 } } },
    },
    sections: [{
      properties: {
        page: {
          size:   { width: 11906, height: 16838 }, // A4 portrait
          margin: { top: 851, right: 851, bottom: 851, left: 851 }, // ~1.5 cm
        },
      },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing:   { before: 0, after: 160 },
          children:  [txt('CRM Deployment List', { size: 32, bold: true })],
        }),
        mainTable,
      ],
    }],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, filename)
}
