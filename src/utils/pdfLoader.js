import { PDFLoader } from "langchain/document_loaders/fs/pdf"

export const loadPDF = async (filePath) => {

  const loader = new PDFLoader(filePath)

  const docs = await loader.load()

  return docs

}