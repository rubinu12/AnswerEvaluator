// app/api/evaluate/route.tsx

import { NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';
import { ImageAnnotatorClient, protos } from '@google-cloud/vision';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Define the specific types we will use from the Vision API
type IAnnotateFileResponse = protos.google.cloud.vision.v1.IAnnotateFileResponse;
type IAnnotateImageResponse = protos.google.cloud.vision.v1.IAnnotateImageResponse;

// Function to initialize all Google Cloud clients
function getClients() {
  if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_PROJECT_ID || !process.env.GCS_BUCKET_NAME || !process.env.GEMINI_API_KEY) {
    throw new Error("A required environment variable is not set in .env.local");
  }
  const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
  const credentials = {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: privateKey,
  };
  const storageClient = new Storage({ projectId: process.env.GOOGLE_PROJECT_ID, credentials });
  const visionClient = new ImageAnnotatorClient({ projectId: process.env.GOOGLE_PROJECT_ID, credentials });
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
  const bucketName = process.env.GCS_BUCKET_NAME;
  return { storageClient, visionClient, geminiModel, bucketName };
}

export async function POST(request: Request) {
  const { storageClient, visionClient, geminiModel, bucketName } = getClients();
  
  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
  }

  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  
  let combinedText = '';

  if (isPdf) {
    // --- PDF Processing Path (using GCS and async OCR) ---
    const fileBaseName = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
    const inputFileName = `uploads/${fileBaseName}`;
    const outputPrefix = `ocr-output/${fileBaseName}/`;
    const gcsUri = `gs://${bucketName}/${inputFileName}`;
    const gcsOutputUri = `gs://${bucketName}/${outputPrefix}`;
    const bucket = storageClient.bucket(bucketName);

    try {
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      await bucket.file(inputFileName).save(fileBuffer, { contentType: 'application/pdf' });

      const visionRequest = {
        requests: [{
          inputConfig: { gcsSource: { uri: gcsUri }, mimeType: 'application/pdf' },
          features: [{ type: 'DOCUMENT_TEXT_DETECTION' as const }],
          outputConfig: { gcsDestination: { uri: gcsOutputUri }, batchSize: 100 },
        }],
      };
      const [operation] = await visionClient.asyncBatchAnnotateFiles(visionRequest);
      await operation.promise();

      const [outputFiles] = await bucket.getFiles({ prefix: outputPrefix });
      const resultFile = outputFiles.find(f => f.name.endsWith('.json'));
      
      if (!resultFile) throw new Error("OCR result file not found for PDF.");

      const [jsonData] = await resultFile.download();
      const ocrResult = JSON.parse(jsonData.toString()) as { responses: IAnnotateFileResponse[] };
      
      // **FIXED**: Using a simpler, more direct method to get text from each page.
      const pageResponses = ocrResult.responses[0]?.responses;
      if (pageResponses) {
        for (const pageResponse of pageResponses) {
          if (pageResponse.fullTextAnnotation?.text) {
            combinedText += pageResponse.fullTextAnnotation.text + '\n';
          }
        }
      }
    } finally {
      // Cleanup GCS files for the PDF process
      const bucket = storageClient.bucket(bucketName);
      await bucket.file(inputFileName).delete().catch(e => console.error(`Failed to delete input file: ${e.message}`));
      await bucket.deleteFiles({ prefix: outputPrefix }).catch(e => console.error(`Failed to delete output files: ${e.message}`));
    }
  } else {
    // --- Image Processing Path (direct, no GCS upload) ---
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const imageRequest = {
      image: { content: fileBuffer },
      features: [{ type: 'DOCUMENT_TEXT_DETECTION' as const }],
    };
    const [result] = await visionClient.batchAnnotateImages({ requests: [imageRequest] });
    const responses = result.responses as IAnnotateImageResponse[];
    if (responses && responses.length > 0) {
      combinedText = responses[0].fullTextAnnotation?.text || '';
    }
  }

  if (!combinedText.trim()) {
    return NextResponse.json({ error: "Could not extract any text from the document. It might be blank or unreadable." }, { status: 500 });
  }

  try {
    // --- Step 4: Format Text with Gemini API (same for both paths) ---
    const prompt = `You are an expert editor tasked with cleaning up text from a scanned handwritten exam answer.
      Follow these rules strictly:
      1.  **Reconstruct Content:** Re-join broken sentences. Group related sentences into logical paragraphs. Use a single newline character to separate paragraphs for clean formatting.
      2.  **Preserve Core Answer:** Maintain the original headings and list structures (like bullet points) that are part of the actual answer.
      3.  **Remove Boilerplate:** You MUST identify and completely REMOVE all instructional text, headers, footers, and margin notes from the answer sheet template. This includes, but is not limited to, phrases like: "Specimen Answer Booklet - For Practice Purpose Only", "Candidates must not write on this margin", "UPSC", any text in Hindi, and any standalone page numbers.
      4.  **No Commentary:** Do not add any introductions, summaries, or comments like "Here is the cleaned text:". Output only the student's cleaned-up answer.
      Here is the messy OCR text to be cleaned:
      ---
      ${combinedText}
      ---
    `;

    const result = await geminiModel.generateContent(prompt);
    const formattedText = result.response.text();

    return NextResponse.json({ formattedText });

  } catch (error: any) {
    console.error("Error in evaluation pipeline:", error);
    return NextResponse.json({ error: `An error occurred: ${error.message}` }, { status: 500 });
  }
}
