import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import workerSource from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import type { TextItem } from 'pdfjs-dist/types/src/display/api.js'
import type { ExtractedPdfPage, ExtractionTextItem } from '../types/transactions.js'

GlobalWorkerOptions.workerSrc = workerSource

function isTextItem(item: unknown): item is TextItem {
  return typeof item === 'object' && item !== null && 'str' in item && 'transform' in item
}

export async function extractPdfText(file: File): Promise<ExtractedPdfPage[]> {
  const data = new Uint8Array(await file.arrayBuffer())
  const loadingTask = getDocument({ data })

  try {
    const document = await loadingTask.promise
    const pages: ExtractedPdfPage[] = []

    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber)
      const content = await page.getTextContent()
      const items: ExtractionTextItem[] = content.items.filter(isTextItem).map((item) => ({
        text: item.str,
        x: item.transform[4],
        y: item.transform[5],
      }))
      pages.push({ pageNumber, items })
    }

    if (!pages.some((page) => page.items.some((item) => item.text.trim()))) {
      throw new Error('O PDF não possui texto extraível. Esta versão não oferece suporte a documentos digitalizados.')
    }

    return pages
  } catch (error) {
    await loadingTask.destroy()
    if (error instanceof Error && error.message.includes('texto extraível')) throw error
    throw new Error('Não foi possível ler este PDF. Verifique se o arquivo está íntegro e protegido por senha.')
  }
}
