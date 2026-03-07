import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai"
import { MemoryVectorStore } from "langchain/vectorstores/memory"

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

  // chunks sudah berupa Document objects dari splitText
  vectorStore = await MemoryVectorStore.fromDocuments(
    chunks,
    getEmbeddings()
  )
}

export const getVectorStore = () => {
  return vectorStore
}