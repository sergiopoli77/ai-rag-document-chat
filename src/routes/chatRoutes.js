import express from "express"
import { uploadPDF, askQuestion } from "../controllers/chatController.js"

const router = express.Router()

router.post("/upload", uploadPDF)

router.post("/ask", askQuestion)

export default router