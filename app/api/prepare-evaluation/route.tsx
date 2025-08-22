// app/api/prepare-evaluation/route.tsx

import { NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { GoogleGenerativeAI } from '@google/generative-ai';

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
  const bucketName = process.env.GCS_BUCKET_NAME as string;
  return { storageClient, visionClient, geminiModel, bucketName };
}

// --- Robust JSON Extraction ---
function extractJsonFromText(text: string): string | null {
    const markdownMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (markdownMatch && markdownMatch[1]) {
        return markdownMatch[1].trim();
    }
    const firstBracket = text.indexOf('[');
    const lastBracket = text.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket > firstBracket) {
        return text.substring(firstBracket, lastBracket + 1);
    }
    return null;
}

// --- FINAL "CHAIN OF THOUGHT" DYNAMIC PROMPT ---
const getPreparationPrompt = (rawText: string, subject: string) => {
    const isEssay = subject === 'Essay';

    // **CORRECTED PART**: The JSON structure for GS now shows a multi-question example.
    const jsonStructure = isEssay
        ? `[
    {
        "questionNumber": 1,
        "questionText": "Topic of the first essay (e.g., from Section A).",
        "userAnswer": "The full reconstructed text of the first essay.",
        "maxMarks": 125
    }
]`
        : `[
    {
        "questionNumber": 1,
        "questionText": "The full text of the first question.",
        "userAnswer": "The user's answer for the first question.",
        "maxMarks": 10
    },
    {
        "questionNumber": 2,
        "questionText": "The full text of the second question.",
        "userAnswer": "The user's answer for the second question.",
        "maxMarks": 15
    }
]`;

    const taskInstructions = isEssay
        ? `**Step 1: Identify Content.** From the messy text, identify the single essay topic and reconstruct the full text of the essay answer with proper paragraph breaks.
           **Step 2: Create JSON.** Take the topic and the reconstructed answer from Step 1 and place them into the JSON structure provided below. The 'maxMarks' must be 125.`
        : `**Step 1: Identify Content.** From the messy text, identify each question, its corresponding answer, and the marks allocated (10 or 15). Reconstruct the answer text with proper paragraphs and lists.
           **Step 2: Create JSON.** Take the content from Step 1 and create a JSON object for each question-answer pair. Place these objects into the JSON array structure provided below.`;

    return `
        **ROLE:** You are an expert AI assistant that flawlessly converts messy OCR text from handwritten exams into a structured JSON format.

        **TASK:** Follow these two steps precisely.
        ${taskInstructions}

        **INPUT TEXT (MESSY OCR):**
        ---
        ${rawText}
        ---

        **CRITICAL OUTPUT INSTRUCTIONS:**
        - Your final output must ONLY be the valid JSON array.
        - Do not include any explanatory text, notes, or markdown formatting around the final JSON.

        **FINAL JSON OUTPUT STRUCTURE:**
        ${jsonStructure}
    `;
};


export async function POST(request: Request) {
    const { storageClient, visionClient, geminiModel, bucketName } = getClients();
    
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const subject = formData.get('subject') as string || 'GS1';

    if (!file) {
        return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    let rawOcrText = '';
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    try {
        if (isPdf) {
            const bucket = storageClient.bucket(bucketName);
            const fileBaseName = `${Date.now()}-temp-upload`;
            const gcsInputUri = `gs://${bucketName}/${fileBaseName}.pdf`;
            const gcsOutputUri = `gs://${bucketName}/${fileBaseName}-output/`;

            await bucket.file(`${fileBaseName}.pdf`).save(fileBuffer, { contentType: 'application/pdf' });

            const [operation] = await visionClient.asyncBatchAnnotateFiles({
                requests: [{
                    inputConfig: { gcsSource: { uri: gcsInputUri }, mimeType: 'application/pdf' },
                    features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
                    outputConfig: { gcsDestination: { uri: gcsOutputUri }, batchSize: 100 },
                }],
            });
            await operation.promise();

            const [outputFiles] = await bucket.getFiles({ prefix: `${fileBaseName}-output/` });
            for (const outputFile of outputFiles) {
                if (outputFile.name.endsWith('.json')) {
                    const [jsonData] = await outputFile.download();
                    const ocrResult = JSON.parse(jsonData.toString());
                    ocrResult.responses.forEach((page: any) => {
                        if (page.fullTextAnnotation) {
                            rawOcrText += page.fullTextAnnotation.text + '\n\n';
                        }
                    });
                }
            }
            
            await bucket.deleteFiles({ prefix: fileBaseName }).catch(console.error);

        } else {
            const [result] = await visionClient.annotateImage({
                image: { content: fileBuffer },
                features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
            });
            rawOcrText = result.fullTextAnnotation?.text || '';
        }

        if (!rawOcrText || !rawOcrText.trim()) {
            return NextResponse.json({ error: "Could not extract any text from the document." }, { status: 500 });
        }

        const prepPrompt = getPreparationPrompt(rawOcrText, subject);
        const prepResult = await geminiModel.generateContent(prepPrompt);
        const rawPrepResponse = prepResult.response.text();
        
        const jsonString = extractJsonFromText(rawPrepResponse);

        if (!jsonString) {
            console.error("AI Prep Failed. Raw Response:", rawPrepResponse);
            throw new Error("The AI failed to reconstruct the document into a valid format.");
        }

        const preparedData = JSON.parse(jsonString);

        return NextResponse.json(preparedData);

    } catch (error: any) {
        console.error("Error in prepare-evaluation pipeline:", error);
        return NextResponse.json({ error: `An error occurred: ${error.message}` }, { status: 500 });
    }
}