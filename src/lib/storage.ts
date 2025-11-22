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
    const fileExtension = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExtension}`;
    const fullPath = `${path}/${userId}/${fileName}`;

    const storageRef = ref(storage, fullPath);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    return { url, path: fullPath };
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
    // Validate file type
    if (!file.type.startsWith('image/')) {
        throw new Error('Only image files are allowed');
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
        throw new Error('File must be less than 10MB');
    }

    return uploadFile(file, 'body-photos', userId);
}

/**
 * Delete a file from Firebase Storage
 */
export async function deleteFile(path: string): Promise<void> {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
}
