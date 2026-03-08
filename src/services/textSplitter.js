import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"

export const splitText = async (docs) => {

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200
  })

  const chunks = await splitter.splitDocuments(docs)

  // Filter out empty chunks
  const validChunks = chunks.filter(chunk => {
    const content = chunk.pageContent?.trim()
    return content && content.length > 0
  })

  console.log(`Total chunks: ${chunks.length}, Valid chunks: ${validChunks.length}`)

  return validChunks

}