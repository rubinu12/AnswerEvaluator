// app/api/prepare-evaluation/route.tsx (Corrected with Bolding and Diagram Description)

import { NextRequest, NextResponse } from 'next/server';
import { VertexAI, Part } from '@google-cloud/vertexai';

// --- Initialize Vertex AI ---
const vertex_ai = new VertexAI({
  project: process.env.GOOGLE_PROJECT_ID!,
  location: 'us-central1',
});

const geminiModel = vertex_ai.getGenerativeModel({
  model: 'gemini-2.5-flash-lite',
});

// --- Helper function to extract JSON from the AI's response ---
function extractJsonFromText(text: string): string | null {
    const markdownMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (markdownMatch && markdownMatch[1]) {
        return markdownMatch[1].trim();
    }
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
        // Find the first opening bracket of an array if it exists
        const firstBracket = text.indexOf('[');
        if (firstBracket !== -1 && firstBracket < firstBrace) {
            return text.substring(firstBracket, text.lastIndexOf(']') + 1);
        }
        return text.substring(firstBrace, lastBrace + 1);
    }
    const firstBracket = text.indexOf('[');
    const lastBracket = text.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket > firstBracket) {
        return text.substring(firstBracket, lastBracket + 1);
    }
    return null;
}


// --- Main API Handler ---
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const subject = formData.get('subject') as string || 'GS1';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // --- Step 1: Get Images from Python Server ---
    console.log("Sending PDF to Python for image conversion...");
    const imageConversionResponse = await fetch('http://127.0.0.1:5001/convert_pdf_to_images', {
      method: 'POST',
      body: formData,
    });

    if (!imageConversionResponse.ok) {
        const errorData = await imageConversionResponse.json();
        throw new Error(`Python server error: ${errorData.error}`);
    }
    const { images } = await imageConversionResponse.json();
    console.log(`Received ${images.length} images from Python.`);

    // --- Step 2: Prepare the IMPROVED Prompt for JSON Output ---
    const imageParts: Part[] = images.map((img: string) => ({
        inlineData: { mimeType: 'image/jpeg', data: img }
    }));

    // Example JSON structure for the AI to follow
    const jsonStructure = `[
      {
          "questionNumber": 1,
          "questionText": "**(a) What are the ethical issues involved?\\n(b) Evaluate the behaviour of the bank manager from an ethical point of view.\\n(c) How would you react to the situation?**",
          "userAnswer": "The handwritten answer text goes here. If there is a diagram, it should be described in-place like this: [DIAGRAM: A detailed description of the mind map, chart, or diagram, explaining its components and relationships.] The rest of the answer continues here.",
          "maxMarks": 20
      }
    ]`;
    
    const prompt = `
      You are an expert AI assistant that processes handwritten exam answer sheets and converts them into a structured JSON format. Your attention to detail is critical.
      
      **TASK:** Analyze the following page images precisely and follow these steps:
      
      1.  **IDENTIFY THE COMPLETE QUESTION:**
          -   Scan all pages to find all parts of the question, including any introductory case study and all sub-questions (a), (b), (c), etc.
          -   Combine them into a single block of text.
          -   **CRITICAL:** Format the final combined question using Markdown for bolding by wrapping it in double asterisks (**). For example: "**This is a bold question.**"

      2.  **TRANSCRIBE THE HANDWRITTEN ANSWER:**
          -   Meticulously transcribe the handwritten answer exactly as it is written, preserving all formatting like paragraphs, bullet points, and numbering.
          -   **DIAGRAM HANDLING (VERY IMPORTANT):** If you see a diagram, flowchart, or mind map, you MUST describe it. Insert a placeholder tag EXACTLY where it appeared in the text. The format must be: \`[DIAGRAM: A detailed description of the diagram's content and structure.]\`. For example: \`[DIAGRAM: A mind map with '2023 CASE-1' at the center, branching out to 'Dilemma between personal values...'.]\`

      3.  **CREATE JSON OUTPUT:**
          -   Populate the collected information into the JSON structure provided below.
          -   Your final output MUST ONLY be the valid JSON array. Do not include any extra text, notes, or markdown formatting like \`\`\`json around the final output.

      **FINAL JSON OUTPUT STRUCTURE:**
      ${jsonStructure}
    `;
    
    const requestParts: Part[] = [{text: prompt}, ...imageParts];

    // --- Step 3: Call Gemini API ---
    console.log(`Sending ${images.length} images to Gemini for improved JSON structuring...`);
    const result = await geminiModel.generateContent({ contents: [{ role: 'user', parts: requestParts }] });
    const rawResponseText = result.response.candidates?.[0]?.content.parts[0].text;

    if (!rawResponseText) {
        throw new Error("Received no response text from Gemini.");
    }
    
    // --- Step 4: Extract and Parse the JSON ---
    const jsonString = extractJsonFromText(rawResponseText);

    if (!jsonString) {
      console.error("AI Prep Failed. Raw Response:", rawResponseText);
      throw new Error("The AI failed to create a valid JSON format from the document.");
    }
    
    const preparedData = JSON.parse(jsonString);

    // --- Step 5: Send Structured JSON to Frontend ---
    return NextResponse.json(preparedData);

  } catch (error: any) {
    console.error('Error in prepare-evaluation route:', error);
    return NextResponse.json({ error: error.message || 'An internal server error occurred.' }, { status: 500 });
  }
}