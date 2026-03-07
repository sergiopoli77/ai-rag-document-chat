export const uploadPDF = async (req, res) => {
  try {

    res.json({
      message: "PDF upload endpoint working"
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