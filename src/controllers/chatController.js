export const uploadPDF = async (req, res) => {

  try {

    if (!req.file) {
      return res.status(400).json({
        error: "No file uploaded"
      })
    }

    res.json({
      message: "PDF uploaded successfully",
      filename: req.file.filename,
      path: req.file.path
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