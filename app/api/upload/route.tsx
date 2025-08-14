// app/api/upload/route.tsx

import { NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';

// Function to initialize the Google Cloud Storage client
function getStorageClient() {
  // Ensure all required environment variables are set
  if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_PROJECT_ID || !process.env.GCS_BUCKET_NAME) {
    throw new Error("Google Cloud credentials or GCS bucket name are not set in .env.local");
  }

  // Format the private key, replacing escaped newlines with actual newlines
  const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');

  // Set up credentials for authentication
  const credentials = {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: privateKey,
  };

  // Create a new Storage client with the project ID and credentials
  const storageClient = new Storage({
    projectId: process.env.GOOGLE_PROJECT_ID,
    credentials,
  });

  // Return the configured client and the bucket name
  return { storageClient, bucketName: process.env.GCS_BUCKET_NAME };
}

export async function POST(request: Request) {
  try {
    // Initialize the Storage client
    const { storageClient, bucketName } = getStorageClient();
    
    // Parse the incoming form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    // Check if a file was provided in the form data
    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided.' }, { status: 400 });
    }

    // Get a reference to the GCS bucket
    const bucket = storageClient.bucket(bucketName);
    
    // Create a unique file name to avoid collisions
    const fileName = `uploads/${Date.now()}-${file.name.replace(/\s/g, '_')}`;
    const gcsFile = bucket.file(fileName);

    // Convert the file to a buffer to be uploaded
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Save the file buffer to the GCS bucket
    await gcsFile.save(fileBuffer, {
      contentType: file.type,
    });

    // --- THIS IS THE UPDATED PART ---
    // Instead of making the file public, we generate a secure, temporary Signed URL.
    // This URL will be valid for 15 minutes.
    const options = {
      version: 'v4' as const,
      action: 'read' as const,
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    };

    const [signedUrl] = await gcsFile.getSignedUrl(options);

    // Return a success response with the Signed URL of the uploaded file
    return NextResponse.json({ 
      success: true, 
      message: 'File uploaded successfully! A temporary link has been created.',
      url: signedUrl 
    });

  } catch (error: any) {
    // Log the error for debugging purposes
    console.error("Error in file upload:", error);
    
    // Return a generic error response
    return NextResponse.json({ 
      success: false, 
      error: `An error occurred during file upload: ${error.message}` 
    }, { status: 500 });
  }
}
