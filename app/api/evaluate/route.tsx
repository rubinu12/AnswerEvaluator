// app/api/evaluate/route.tsx

import { NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';
import { ImageAnnotatorClient, protos } from '@google-cloud/vision';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getEvaluationPrompt } from '@/lib/prompts';

// --- Type Definitions ---
type IAnnotateImageResponse = protos.google.cloud.vision.v1.IAnnotateImageResponse;

// --- Client Initialization ---
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

// --- Main API Handler ---
export async function POST(request: Request) {
  const { storageClient, visionClient, geminiModel, bucketName } = getClients();
  
  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const subject = formData.get('subject') as string || 'GS Paper 1';

  if (!file) {
    return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
  }

  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  let combinedText = '';

  try {
    if (isPdf) {
        const fileBaseName = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
        const inputFileName = `uploads/${fileBaseName}`;
        const outputPrefix = `ocr-output/${fileBaseName}/`;
        const gcsUri = `gs://${bucketName}/${inputFileName}`;
        const gcsOutputUri = `gs://${bucketName}/${outputPrefix}`;
        const bucket = storageClient.bucket(bucketName);

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
        
        if (resultFile) {
            const [jsonData] = await resultFile.download();
            const ocrResult = JSON.parse(jsonData.toString());
            if (ocrResult && ocrResult.responses) {
            ocrResult.responses.forEach((page: any) => {
                if (page.fullTextAnnotation) {
                combinedText += page.fullTextAnnotation.text + '\n\n';
                }
            });
            }
        }
        
        await bucket.file(inputFileName).delete().catch(console.error);
        await bucket.deleteFiles({ prefix: outputPrefix }).catch(console.error);

    } else { // Image Processing
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const [result] = await visionClient.annotateImage({
        image: { content: fileBuffer },
        features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
      });
      combinedText = result.fullTextAnnotation?.text || '';
    }

    if (!combinedText.trim()) {
      return NextResponse.json({ error: "Could not extract any text from the document." }, { status: 500 });
    }

    const cleaningPrompt = `You are an expert editor tasked with cleaning up OCR text from a handwritten exam. Your goal is to make the text clean and readable. 1. Reconstruct Content: Join broken sentences and group related sentences into logical paragraphs. 2. Preserve Core Answer: Maintain original headings and list structures. 3. Remove Boilerplate: You MUST REMOVE all instructional text, headers, footers, page numbers, and any text not part of the actual answer. 4. No Commentary: Output only the cleaned-up answer. Here is the messy OCR text: --- ${combinedText} ---`;
    const cleaningResult = await geminiModel.generateContent(cleaningPrompt);
    const cleanedText = cleaningResult.response.text();

    const evaluationPrompt = getEvaluationPrompt(cleanedText, subject);
    const evaluationResult = await geminiModel.generateContent(evaluationPrompt);
    const rawResponseText = evaluationResult.response.text();
    
    try {
        // ** THE FINAL, MOST ROBUST FIX IS HERE **
        const firstBracketIndex = rawResponseText.indexOf('{');
        const lastBracketIndex = rawResponseText.lastIndexOf('}');

        if (firstBracketIndex === -1 || lastBracketIndex === -1) {
            throw new Error("Could not find a valid JSON object in the AI's response.");
        }

        const jsonString = rawResponseText.substring(firstBracketIndex, lastBracketIndex + 1);
        const evaluationJson = JSON.parse(jsonString);
        
        return NextResponse.json(evaluationJson);

    } catch (jsonError) {
        console.error("Failed to parse AI response as JSON:", rawResponseText);
        throw new Error("The AI returned an invalid format. Please try again.");
    }

  } catch (error: any) {
    console.error("Error in evaluation pipeline:", error);
    return NextResponse.json({ error: `An error occurred: ${error.message}` }, { status: 500 });
  }
}