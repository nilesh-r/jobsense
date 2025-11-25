import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { File } from 'multer';

export async function extractTextFromResume(file: File): Promise<string> {
  try {
    if (file.mimetype === 'application/pdf') {
      const data = await pdfParse(file.buffer);
      return data.text;
    } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      return result.value;
    } else {
      throw new Error('Unsupported file type');
    }
  } catch (error) {
    console.error('Error extracting text from resume:', error);
    throw new Error('Failed to parse resume file');
  }
}

