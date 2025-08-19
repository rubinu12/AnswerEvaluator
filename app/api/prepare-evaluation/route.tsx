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

// --- The Final, Most Advanced Pre-computation Prompt ---
const getPreparationPrompt = (rawText: string) => {
    const jsonStructure = `[
    {
        "questionNumber": 1,
        "questionText": "The full text of the question.",
        "userAnswer": "The user's answer, reconstructed with proper paragraphs and bullet points.",
        "maxMarks": 10
    }
]`;
    
    return `
        **ROLE:** You are an expert AI assistant specializing in document reconstruction. Your task is to take a block of messy text extracted from a handwritten exam via OCR and reformat it into a clean, well-structured document.

        **TASK:** From the raw text, you must accurately identify each question and its answer, determine the marks, and most importantly, reconstruct the answer's original formatting.

        **CRITICAL FORMATTING RULES:**
        1.  **Identify Paragraphs:** The OCR text often merges paragraphs. You must intelligently re-introduce line breaks (\`\\n\`) to separate distinct ideas and create coherent paragraphs.
        2.  **Reconstruct Lists:** Look for list indicators like "→", "-", "*", "1)", "a)". Reformat these into clean, bulleted lists. Each list item should be on a new line.
        3.  **Preserve Headings:** The user may have written subheadings like "Introduction" or "Concerns Associated". Preserve these and place them on their own lines.
        4.  **Do Not Summarize:** Your job is to reformat the *entire* user answer, not to summarize or change its content.

        **INPUT TEXT (MESSY OCR):**
        ---
        ${rawText}
        ---

        **JSON OUTPUT INSTRUCTIONS:**
        1.  **\`questionText\`:** Capture the full text of the question.
        2.  **\`userAnswer\`:** Provide the fully reconstructed user answer with correct paragraphs and line breaks.
        3.  **\`maxMarks\`:** Determine the marks (10 or 15) from the text.
        4.  **Output Format:** Return ONLY a valid JSON array.

        **JSON OUTPUT STRUCTURE:**
        ${jsonStructure}
    `;
};

export async function POST(request: Request) {
    const { storageClient, visionClient, geminiModel, bucketName } = getClients();
    
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

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

        const prepPrompt = getPreparationPrompt(rawOcrText);
        const prepResult = await geminiModel.generateContent(prepPrompt);
        const rawPrepResponse = prepResult.response.text();
        
        const firstBracketIndex = rawPrepResponse.indexOf('[');
        const lastBracketIndex = rawPrepResponse.lastIndexOf(']');

        if (firstBracketIndex === -1 || lastBracketIndex === -1) {
            console.error("AI Prep Failed. Raw Response:", rawPrepResponse);
            throw new Error("The AI failed to reconstruct the document into a valid format.");
        }

        const jsonString = rawPrepResponse.substring(firstBracketIndex, lastBracketIndex + 1);
        const preparedData = JSON.parse(jsonString);

        return NextResponse.json(preparedData);

    } catch (error: any) {
        console.error("Error in prepare-evaluation pipeline:", error);
        return NextResponse.json({ error: `An error occurred: ${error.message}` }, { status: 500 });
    }
}