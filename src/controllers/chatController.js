import { loadPDF } from "../utils/pdfLoader.js"
import { splitText } from "../services/textSplitter.js"

export const uploadPDF = async (req, res) => {

  try {

    if (!req.file) {
      return res.status(400).json({
        error: "No file uploaded"
      })
    }

    const filePath = req.file.path

    const text = await loadPDF(filePath)

    const chunks = await splitText(text)

    res.json({
      message: "PDF processed successfully",
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

    res.json({
      question,
      answer: "AI answer will be here"
    })

  } catch (error) {

    res.status(500).json({
      error: error.message
    })

  }

}