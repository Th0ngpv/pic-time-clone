import { NextRequest, NextResponse } from 'next/server';
import { getFileStream, getFileMetadata } from '@/lib/googleDrive';
import archiver from 'archiver';
import { Readable, PassThrough } from 'stream';

export async function POST(request: NextRequest) {
  try {
    const { fileIds }: { fileIds: string[] } = await request.json();
    
    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return NextResponse.json(
        { error: 'No file IDs provided' },
        { status: 400 }
      );
    }

    // Create a pass-through stream for the ZIP
    const passThrough = new PassThrough();
    
    // Create archiver instance
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });

    // Pipe archive data to the pass-through stream
    archive.pipe(passThrough);

    // Handle archiver errors
    archive.on('error', (err) => {
      console.error('Archive error:', err);
      passThrough.destroy(err);
    });

    // Process files concurrently but limit to avoid overwhelming the API
    const processFiles = async () => {
      const promises = fileIds.map(async (fileId, index) => {
        try {
          const metadata = await getFileMetadata(fileId);
          if (!metadata) {
            console.warn(`File not found: ${fileId}`);
            return;
          }

          const fileStream = await getFileStream(fileId);
          const fileName = metadata.name || `file_${index + 1}`;
          
          // Add file to archive
          archive.append(fileStream as Readable, { name: fileName });
        } catch (error) {
          console.error(`Error processing file ${fileId}:`, error);
        }
      });

      await Promise.all(promises);
      
      // Finalize the archive
      await archive.finalize();
    };

    // Start processing files
    processFiles().catch((error) => {
      console.error('Error processing files:', error);
      passThrough.destroy(error);
    });

    // Convert pass-through stream to ReadableStream
    const readableStream = new ReadableStream({
      start(controller) {
        passThrough.on('data', (chunk) => {
          controller.enqueue(new Uint8Array(chunk));
        });
        
        passThrough.on('end', () => {
          controller.close();
        });
        
        passThrough.on('error', (error) => {
          controller.error(error);
        });
      }
    });

    // Return the ZIP file as a stream
    const timestamp = new Date().toISOString().split('T')[0];
    return new Response(readableStream, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="photos_${timestamp}.zip"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Error creating ZIP download:', error);
    return NextResponse.json(
      { error: 'Failed to create ZIP download' },
      { status: 500 }
    );
  }
}