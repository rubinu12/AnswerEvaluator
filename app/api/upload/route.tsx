import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Helper function to convert PDF buffer to generative parts
const filesToGenerativeParts = (buffer: Buffer, mimeType: string) => {
  return [
    {
      inlineData: {
        data: buffer.toString('base64'),
        mimeType,
      },
    },
  ];
};

// Initialize the AI model
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: 'No file found' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // --- THIS IS THE ONLY SECTION THAT NEEDS TO BE CHANGED ---

    const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

    // The new, more powerful prompt
    const prompt = `You are an expert OCR and document analysis AI. Your task is to process an exam answer sheet PDF and extract its content in a structured way.

    Follow these instructions carefully:
    1.  **Extract All Text**: Read the entire document and extract all text, both printed (like the questions) and handwritten (like the answers).
    2.  **Identify Questions and Answers**: Structure the extracted content by identifying which text is a question and which is the corresponding answer.
    3.  **Describe Visuals**: If you encounter any handwritten diagrams, flowcharts, or other non-textual visual elements, describe them clearly and concisely in a structured format (e.g., "[Diagram: A flowchart showing 'Ethical Action' leading to 'Positive Outcome'.]"). Integrate this description where it appears in the answer.
    4.  **Identify Paper Type**: Based on the questions, determine the subject of the paper. It will be one of the following: GS1, GS2, GS3, GS4, or Essay.
    5.  **Format Output**: Return a JSON object with two keys: "text" and "paperType".
        - The "text" key should contain the full, structured text of all questions and answers.
        - The "paperType" key should contain the identified paper type code (e.g., "GS4").

    Example of a good "text" output:
    "Question: What are the ethical issues involved?
    Answer: The ethical issues are... [Diagram: A diagram showing X and Y.] ..."`;

    const imageParts = filesToGenerativeParts(buffer, file.type);

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const rawText = response.text();

    // Parse the JSON output from the AI
    let parsedJson;
    try {
        // The AI might return the JSON inside a markdown block, so we clean it up
        const cleanedText = rawText.replace(/^```json\n|```$/g, '');
        parsedJson = JSON.parse(cleanedText);
    } catch (e) {
        // If parsing fails, it's likely the AI didn't return valid JSON.
        // We can try to salvage the text or return an error.
        console.error("Failed to parse AI response as JSON:", rawText);
        // For now, let's fall back to using the raw text if JSON parsing fails.
        // A more robust solution could involve retrying or erroring out.
        return NextResponse.json({ text: rawText, paperType: 'GS1' }); // Default paperType
    }
    
    return NextResponse.json({ text: parsedJson.text, paperType: parsedJson.paperType });

  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}