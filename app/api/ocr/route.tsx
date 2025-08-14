// app/api/ocr/route.ts

import { NextResponse } from 'next/server';
import { ImageAnnotatorClient, protos } from '@google-cloud/vision';
import { Storage } from '@google-cloud/storage';

// Define the specific types we will use
type ISymbol = protos.google.cloud.vision.v1.ISymbol;
type IWord = protos.google.cloud.vision.v1.IWord;
type IParagraph = protos.google.cloud.vision.v1.IParagraph;
type IBlock = protos.google.cloud.vision.v1.IBlock;
type IAnnotateFileResponse = protos.google.cloud.vision.v1.IAnnotateFileResponse;

// Function to initialize clients
function getClients() {
  if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_PROJECT_ID || !process.env.GCS_BUCKET_NAME) {
    throw new Error("Google Cloud credentials or GCS bucket name are not set in .env.local");
  }
  const credentials = {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  };
  const visionClient = new ImageAnnotatorClient({ projectId: process.env.GOOGLE_PROJECT_ID, credentials });
  const storageClient = new Storage({ projectId: process.env.GOOGLE_PROJECT_ID, credentials });
  const bucketName = process.env.GCS_BUCKET_NAME;

  return { visionClient, storageClient, bucketName };
}

export async function POST(request: Request) {
  const { visionClient, storageClient, bucketName } = getClients();
  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
  }

  const fileName = `input/${Date.now()}-${file.name.replace(/\s/g, '_')}`;
  const outputPrefix = `output/${Date.now()}-${file.name.replace(/\s/g, '_')}/`;
  const gcsUri = `gs://${bucketName}/${fileName}`;
  const gcsOutputUri = `gs://${bucketName}/${outputPrefix}`;
  const bucket = storageClient.bucket(bucketName);

  try {
    // 1. Upload file to GCS
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await bucket.file(fileName).save(fileBuffer, { contentType: file.type });

    // 2. Create and start an ASYNCHRONOUS request
    const visionRequest = {
      requests: [{
        inputConfig: { gcsSource: { uri: gcsUri }, mimeType: file.type },
        features: [{ type: 'DOCUMENT_TEXT_DETECTION' as const }],
        outputConfig: { gcsDestination: { uri: gcsOutputUri }, batchSize: 100 },
      }],
    };
    const [operation] = await visionClient.asyncBatchAnnotateFiles(visionRequest);
    await operation.promise();

    // 3. Fetch and parse the result JSON from the output location
    const [outputFiles] = await bucket.getFiles({ prefix: outputPrefix });
    const resultFile = outputFiles.find(f => f.name.endsWith('.json'));
    if (!resultFile) throw new Error("OCR result file not found.");
    
    const [jsonData] = await resultFile.download();
    const ocrResult = JSON.parse(jsonData.toString()) as { responses: IAnnotateFileResponse[] };

    // ** THIS IS THE CORRECTED PART **
    // The main result contains a list of file responses (we only have 1)
    // Inside that file response is the list of page responses.
    const fileResponse = ocrResult.responses[0];
    const pageResponses = fileResponse.responses;
    
    if (!pageResponses) {
      return NextResponse.json({ text: 'No text could be extracted.' });
    }

    let extractedText = '';
    // 4. Process the page responses (this logic is now correct)
    for (const pageResponse of pageResponses) {
      const annotation = pageResponse.fullTextAnnotation; // This will now work
      if (annotation?.pages) {
        for (const page of annotation.pages) {
          for (const block of page.blocks as IBlock[]) {
            for (const paragraph of block.paragraphs as IParagraph[]) {
              let paragraphText = '';
              if (paragraph.words) {
                for (const word of paragraph.words as IWord[]) {
                  const wordText = (word.symbols as ISymbol[]).map(s => s.text).join('');
                  paragraphText += wordText + ' ';
                }
              }
              const trimmedParagraph = paragraphText.trim();
              if (trimmedParagraph.toLowerCase().includes('scanned with')) continue;
              if (trimmedParagraph.startsWith('→') || trimmedParagraph.startsWith('-')) {
                extractedText += `* ${trimmedParagraph.substring(1).trim()}\n`;
              } else if (/^\d+[).]\s/.test(trimmedParagraph)) {
                 extractedText += `- ${trimmedParagraph}\n`;
              } else {
                extractedText += trimmedParagraph + '\n\n';
              }
            }
          }
        }
      }
    }
    
    return NextResponse.json({ text: extractedText.trim() });

  } catch (error: any) {
    console.error("Error in async OCR processing:", error);
    return NextResponse.json({ error: `An error occurred during async OCR processing: ${error.message}` }, { status: 500 });
  } finally {
    // 5. Clean up all temporary files from GCS
    await bucket.deleteFiles({ prefix: `input/${fileName.split('/')[1]}` });
    await bucket.deleteFiles({ prefix: outputPrefix });
  }
}