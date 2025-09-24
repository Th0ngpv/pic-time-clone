import { google } from 'googleapis';

// Google Drive service configuration
const GOOGLE_DRIVE_CLIENT_EMAIL = process.env.GOOGLE_DRIVE_CLIENT_EMAIL;
const GOOGLE_DRIVE_PRIVATE_KEY = process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const GOOGLE_DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

if (!GOOGLE_DRIVE_CLIENT_EMAIL || !GOOGLE_DRIVE_PRIVATE_KEY) {
  console.warn('Google Drive credentials not configured');
}

// Initialize Google Drive API
export const initializeDrive = () => {
  if (!GOOGLE_DRIVE_CLIENT_EMAIL || !GOOGLE_DRIVE_PRIVATE_KEY) {
    throw new Error('Google Drive credentials not configured');
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: GOOGLE_DRIVE_CLIENT_EMAIL,
      private_key: GOOGLE_DRIVE_PRIVATE_KEY,
    },
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });

  return google.drive({ version: 'v3', auth });
};

// File interface for better type safety
export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  thumbnailLink?: string;
  webViewLink?: string;
}

// Get files from Google Drive folder
export const getFilesFromFolder = async (): Promise<DriveFile[]> => {
  try {
    const drive = initializeDrive();
    
    const response = await drive.files.list({
      q: `'${GOOGLE_DRIVE_FOLDER_ID}' in parents and mimeType contains 'image/'`,
      fields: 'files(id, name, mimeType, size, thumbnailLink, webViewLink)',
      pageSize: 100,
    });

    return (response.data.files || []) as DriveFile[];
  } catch (error) {
    console.error('Error fetching files from Google Drive:', error);
    return [];
  }
};

// Get file stream from Google Drive
export const getFileStream = async (fileId: string) => {
  try {
    const drive = initializeDrive();
    
    const response = await drive.files.get({
      fileId,
      alt: 'media',
    }, {
      responseType: 'stream',
    });

    return response.data;
  } catch (error) {
    console.error('Error getting file stream from Google Drive:', error);
    throw error;
  }
};

// Get file metadata
export const getFileMetadata = async (fileId: string): Promise<DriveFile | null> => {
  try {
    const drive = initializeDrive();
    
    const response = await drive.files.get({
      fileId,
      fields: 'id, name, mimeType, size, thumbnailLink, webViewLink',
    });

    return response.data as DriveFile;
  } catch (error) {
    console.error('Error getting file metadata from Google Drive:', error);
    return null;
  }
};