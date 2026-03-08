import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf"
import path from "path"

export const loadPDF = async (filePath) => {

  const loader = new PDFLoader(filePath)

  const docs = await loader.load()

  // Tambahkan filename ke metadata
  const filename = path.basename(filePath)

  docs.forEach(doc => {
    doc.metadata = {
      ...doc.metadata,
      source: filename
    }
  })

  return docs
}