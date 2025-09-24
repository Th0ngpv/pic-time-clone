import { NextResponse } from 'next/server';
import { getFilesFromFolder } from '@/lib/googleDrive';

export async function GET() {
  try {
    const files = await getFilesFromFolder();
    return NextResponse.json({ files });
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    );
  }
}