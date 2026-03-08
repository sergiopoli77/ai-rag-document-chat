import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai"
import { Document } from "@langchain/core/documents"
import { CloudClient } from "chromadb"
import { DefaultEmbeddingFunction } from "@chroma-core/default-embed"

let embeddings = null
let chromaClient = null
let collection = null

const getEmbeddings = () => {
  if (!embeddings) {
    embeddings = new GoogleGenerativeAIEmbeddings({
      model: "gemini-embedding-001",
      apiKey: process.env.GOOGLE_API_KEY
    })
  }
  return embeddings
}

const getChromaClient = () => {
  if (!chromaClient) {
    console.log('Connecting to Chroma Cloud...')
    console.log('Tenant:', process.env.CHROMA_TENANT)
    console.log('Database:', process.env.CHROMA_DATABASE)
    console.log('API Key exists:', !!process.env.CHROMA_API_KEY)
    
    try {
      chromaClient = new CloudClient({
        tenant: process.env.CHROMA_TENANT,
        database: process.env.CHROMA_DATABASE,
        apiKey: process.env.CHROMA_API_KEY
      })
      console.log('Client created successfully')
    } catch (error) {
      console.error('Error creating client:', error.message)
      throw error
    }
  }
  return chromaClient
}

export const createVectorStore = async (chunks) => {

  if (!chunks || chunks.length === 0) {
    throw new Error("No valid chunks to create embeddings")
  }

  const docs = chunks
    .map(chunk =>
      new Document({
        pageContent: (chunk.pageContent || chunk).trim(),
        metadata: chunk.metadata || {}
      })
    )
    .filter(doc => doc.pageContent.length > 0)

  console.log(`Creating embeddings for ${docs.length} documents`)

  // Get embeddings for all documents
  const texts = docs.map(doc => doc.pageContent)
  
  console.log('Sample text to embed:', texts[0]?.substring(0, 100))
  
  let embeddingsArray
  try {
    const embeddingModel = getEmbeddings()
    console.log('Embedding model:', embeddingModel.model)
    
    // Try single embedding first to test
    console.log('Testing single embedding...')
    const testEmbed = await embeddingModel.embedQuery('test text')
    console.log('Test embedding length:', testEmbed?.length)
    console.log('Test embedding sample:', testEmbed?.slice(0, 5))
    
    embeddingsArray = await embeddingModel.embedDocuments(texts)
    
    console.log(`Generated ${embeddingsArray.length} embeddings`)
    console.log('Embeddings type:', typeof embeddingsArray)
    console.log('Embeddings is array:', Array.isArray(embeddingsArray))
    console.log('First embedding length:', embeddingsArray[0]?.length)
    console.log('First embedding type:', typeof embeddingsArray[0])
    console.log('First embedding is array:', Array.isArray(embeddingsArray[0]))
    console.log('First embedding sample:', embeddingsArray[0]?.slice(0, 5))
    
    // Try to inspect the actual response
    console.log('Full first embedding:', JSON.stringify(embeddingsArray[0]))
  } catch (embedError) {
    console.error('Error generating embeddings:', embedError.message)
    console.error('Full error:', embedError)
    throw embedError
  }
  
  // Validate embeddings
  if (!embeddingsArray || embeddingsArray.length === 0) {
    throw new Error('No embeddings generated')
  }
  
  for (let i = 0; i < embeddingsArray.length; i++) {
    if (!embeddingsArray[i] || embeddingsArray[i].length === 0) {
      console.error(`Empty embedding at index ${i}`)
      throw new Error(`Empty embedding at index ${i}. This likely means Google API Key is invalid or the embedding model is not accessible.`)
    }
  }

  // Get or create collection with default embedding function (we'll override it)
  const client = getChromaClient()
  
  try {
    // Try to get existing collection first
    console.log('Trying to get existing collection...')
    collection = await client.getCollection({
      name: "pdf-documents",
      embeddingFunction: new DefaultEmbeddingFunction()
    })
    console.log('Found existing collection')
  } catch (getError) {
    console.log('Collection not found, creating new one...')
    try {
      collection = await client.createCollection({
        name: "pdf-documents",
        embeddingFunction: new DefaultEmbeddingFunction()
      })
      console.log('Collection created successfully')
    } catch (createError) {
      console.error('Error creating collection:', createError.message)
      console.error('Full error:', createError)
      throw createError
    }
  }

  // Add documents to collection with our custom embeddings
  const ids = docs.map((_, i) => `doc_${Date.now()}_${i}`)
  
  // Sanitize metadata - only keep simple types (string, number, boolean)
  const metadatas = docs.map(doc => {
    const sanitized = {}
    for (const [key, value] of Object.entries(doc.metadata)) {
      // Only include simple types
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        sanitized[key] = value
      } else if (value === null) {
        sanitized[key] = null
      } else if (Array.isArray(value)) {
        // Only include arrays of simple types
        if (value.every(v => typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean')) {
          sanitized[key] = value
        }
      }
      // Skip complex objects
    }
    return sanitized
  })
  
  console.log('Sample metadata:', JSON.stringify(metadatas[0]))

  await collection.add({
    ids: ids,
    embeddings: embeddingsArray,
    documents: texts,
    metadatas: metadatas
  })

  console.log(`Added ${ids.length} documents to Chroma Cloud`)
}

export const getVectorStore = async () => {
  if (!collection) {
    const client = getChromaClient()
    collection = await client.getCollection({ 
      name: "pdf-documents",
      embeddingFunction: new DefaultEmbeddingFunction()
    })
  }
  return collection
}

export const similaritySearch = async (query, k = 3) => {
  const col = await getVectorStore()
  
  // Generate embedding for query
  const queryEmbedding = await getEmbeddings().embedQuery(query)
  
  // Query collection
  const results = await col.query({
    queryEmbeddings: [queryEmbedding],
    nResults: k
  })
  
  // Format results to match LangChain format
  const docs = []
  if (results.documents && results.documents[0]) {
    for (let i = 0; i < results.documents[0].length; i++) {
      docs.push({
        pageContent: results.documents[0][i],
        metadata: results.metadatas?.[0]?.[i] || {}
      })
    }
  }
  
  return docs
}