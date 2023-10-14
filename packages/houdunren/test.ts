import { createWorker } from 'tesseract.js'

const worker = await createWorker('eng')
const data = await worker.recognize('./demo.png')
console.log(data.data.text)
await worker.terminate()
