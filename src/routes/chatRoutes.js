import express from "express"
import { uploadPDF, askQuestion } from "../controllers/chatController.js"
import upload from "../config/multer.js"

const router = express.Router()

router.post("/upload", upload.single("file"), uploadPDF)

router.post("/ask", askQuestion)

export default router