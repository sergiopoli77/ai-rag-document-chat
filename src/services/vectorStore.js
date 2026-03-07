import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai"
import { MemoryVectorStore } from "langchain/vectorstores/memory"
import { Document } from "langchain/document"

let embeddings = null
let vectorStore = null

const getEmbeddings = () => {
  if (!embeddings) {
    embeddings = new GoogleGenerativeAIEmbeddings({
      model: "gemini-embedding-001",
      apiKey: process.env.GOOGLE_API_KEY
    })
  }
  return embeddings
}

export const createVectorStore = async (chunks) => {

  const docs = chunks.map(chunk =>
    new Document({
      pageContent: chunk
    })
  )

  vectorStore = await MemoryVectorStore.fromDocuments(
    docs,
    getEmbeddings()
  )
}

export const getVectorStore = () => {
  return vectorStore
}