import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

export interface UploadResult {
    url: string;
    path: string;
}

/**
 * Upload a file to Firebase Storage
 */
export async function uploadFile(
    file: File,
    path: string,
    userId: string
): Promise<UploadResult> {
    console.log('uploadFile called:', { fileName: file.name, path, userId });
    
    const fileExtension = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExtension}`;
    const fullPath = `${path}/${userId}/${fileName}`;
    console.log('Upload path:', fullPath);

    try {
        const storageRef = ref(storage, fullPath);
        console.log('Uploading bytes to Firebase...');
        await uploadBytes(storageRef, file);
        console.log('Getting download URL...');
        const url = await getDownloadURL(storageRef);
        console.log('Download URL obtained:', url);

        return { url, path: fullPath };
    } catch (error: any) {
        console.error('Upload error details:', {
            code: error.code,
            message: error.message,
            name: error.name,
            fullError: error
        });
        throw error;
    }
}

/**
 * Upload avatar image
 */
export async function uploadAvatar(file: File, userId: string): Promise<string> {
    // Validate file type
    if (!file.type.startsWith('image/')) {
        throw new Error('Only image files are allowed for avatars');
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
        throw new Error('Avatar image must be less than 5MB');
    }

    const result = await uploadFile(file, 'avatars', userId);
    return result.url;
}

/**
 * Upload journal attachment
 */
export async function uploadJournalAttachment(
    file: File,
    userId: string
): Promise<UploadResult> {
    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
        throw new Error('File must be less than 10MB');
    }

    return uploadFile(file, 'journal-attachments', userId);
}

/**
 * Upload plan attachment (diet/workout plans)
 */
export async function uploadPlanAttachment(
    file: File,
    userId: string
): Promise<UploadResult> {
    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
        throw new Error('File must be less than 10MB');
    }

    return uploadFile(file, 'plan-attachments', userId);
}

/**
 * Upload body photo for evolution gallery
 */
export async function uploadBodyPhoto(
    file: File,
    userId: string
): Promise<UploadResult> {
    console.log('uploadBodyPhoto called:', { fileName: file.name, userId });
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        console.error('Invalid file type:', file.type);
        throw new Error('Apenas arquivos de imagem são permitidos');
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
        console.error('File too large:', file.size);
        throw new Error('O arquivo deve ter menos de 10MB');
    }

    try {
        const result = await uploadFile(file, 'body-photos', userId);
        console.log('Upload completed successfully:', result);
        return result;
    } catch (error: any) {
        console.error('Firebase upload error:', error);
        if (error.code === 'storage/unauthorized') {
            throw new Error('Permissão negada. Verifique as regras do Firebase Storage.');
        }
        throw error;
    }
}

/**
 * Delete a file from Firebase Storage
 */
export async function deleteFile(path: string): Promise<void> {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
}
