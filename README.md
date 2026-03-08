# AI RAG Backend – PDF Question Answering System

AI RAG Backend adalah sistem backend berbasis **Retrieval-Augmented Generation (RAG)** yang memungkinkan pengguna **mengunggah dokumen PDF dan mengajukan pertanyaan berdasarkan isi dokumen tersebut**.

Sistem akan membaca dokumen PDF, memecah teks menjadi beberapa bagian, mengubahnya menjadi **vector embeddings**, lalu menyimpannya dalam **vector database**. Ketika pengguna mengajukan pertanyaan, sistem akan mencari potongan teks yang paling relevan dan menggunakannya sebagai konteks untuk menghasilkan jawaban menggunakan **Large Language Model (LLM)**.

---

## Cara Kerja Sistem

Alur kerja sistem:
Upload PDF
↓
Extract Text
↓
Text Chunking
↓
Generate Embeddings
↓
Vector Database (Chroma)
↓
User Bertanya
↓
Vector Similarity Search
↓
Ambil Context Relevan
↓
LLM (Gemini)
↓
Generate Jawaban


Dengan pendekatan ini, AI dapat menjawab pertanyaan **berdasarkan dokumen yang diunggah**, bukan hanya dari pengetahuan umum model.

---

## Teknologi yang Digunakan

Backend:
- Node.js
- Express.js

AI Tools:
- LangChain
- Google Gemini API

Vector Database:
- Chroma

Document Processing:
- PDF Loader
- Text Splitter

---

## Fitur Utama

- Upload dokumen PDF
- Pemrosesan otomatis teks dokumen
- Text chunking untuk dokumen besar
- Pembuatan embeddings
- Penyimpanan embeddings di vector database
- Semantic search berbasis kemiripan makna
- AI menjawab pertanyaan berdasarkan dokumen


## Sedang tahap pengembangan
