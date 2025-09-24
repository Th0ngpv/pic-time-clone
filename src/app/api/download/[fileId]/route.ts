import { NextRequest, NextResponse } from 'next/server';
import { getFileStream, getFileMetadata } from '@/lib/googleDrive';
import { Readable } from 'stream';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;
    
    // Get file metadata first
    const metadata = await getFileMetadata(fileId);
    if (!metadata) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Get file stream
    const fileStream = await getFileStream(fileId);
    
    // Convert the stream to a ReadableStream for the Response
    const readableStream = new ReadableStream({
      start(controller) {
        if (fileStream instanceof Readable) {
          fileStream.on('data', (chunk) => {
            controller.enqueue(new Uint8Array(chunk));
          });
          
          fileStream.on('end', () => {
            controller.close();
          });
          
          fileStream.on('error', (error) => {
            controller.error(error);
          });
        }
      }
    });

    // Return the file as a stream with proper headers
    return new Response(readableStream, {
      headers: {
        'Content-Type': metadata.mimeType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${metadata.name}"`,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error downloading file:', error);
    return NextResponse.json(
      { error: 'Failed to download file' },
      { status: 500 }
    );
  }
}