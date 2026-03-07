import { loadPDF } from "../utils/pdfLoader.js"
import { splitText } from "../services/textSplitter.js"

import { createVectorStore, getVectorStore } from "../services/vectorStore.js"

import { ChatGoogleGenerativeAI } from "@langchain/google-genai"


export const uploadPDF = async (req, res) => {

  try {

    if (!req.file) {
      return res.status(400).json({
        error: "No file uploaded"
      })
    }

    const filePath = req.file.path

    // 1. Load PDF
    const docs = await loadPDF(filePath)

    // 2. Split text menjadi chunks
    const chunks = await splitText(docs)

    // 3. Buat embedding + simpan ke vector store
    await createVectorStore(chunks)

    res.json({
      message: "PDF processed and embeddings created",
      chunks: chunks.length
    })

  } catch (error) {

    res.status(500).json({
      error: error.message
    })

  }

}


export const askQuestion = async (req, res) => {

  try {

    const { question } = req.body

    if (!question) {
      return res.status(400).json({
        error: "Question is required"
      })
    }

    const vectorStore = getVectorStore()

    if (!vectorStore) {
      return res.status(400).json({
        error: "No document indexed yet. Upload a PDF first."
      })
    }

    // 1. Cari context paling relevan
    const results = await vectorStore.similaritySearch(question, 3)

    const context = results
      .map(doc => doc.pageContent)
      .join("\n")

    // Ambil source information
    const sources = results.map(doc => {
      const page = doc.metadata?.loc?.pageNumber || doc.metadata?.page || 'unknown'
      const source = doc.metadata?.source || 'document'
      return {
        page,
        source: source.split('\\').pop() // Ambil filename saja
      }
    })

    // Deduplicate sources
    const uniqueSources = [...new Map(sources.map(s => 
      [`${s.source}-${s.page}`, s]
    )).values()]

    // 2. Inisialisasi model Gemini
    const model = new ChatGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_API_KEY,
      model: "gemini-2.5-flash"
    })

    // 3. Kirim context + pertanyaan ke LLM
    const response = await model.invoke(`
You are an AI assistant answering questions based only on the provided context.

Context:
${context}

Question:
${question}
`)

    res.json({
      answer: response.content,
      sources: uniqueSources.map(s => `${s.source} halaman ${s.page}`)
    })

  } catch (error) {

    res.status(500).json({
      error: error.message
    })

  }

}