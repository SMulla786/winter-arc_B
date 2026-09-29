import fs from 'fs';
import { PROJECT_NAME } from './constants';
import logger from '../config/logger';

const uploadFileOnCloudinary = async (
    localFilePath: string,
    folderName: string,
): Promise<{ url: string; public_id: string } | null> => {
    try {
        if (!localFilePath) return null;

        logger.info(`Processing file for ${PROJECT_NAME}/${folderName}: ${localFilePath}`);
        return {
            url: localFilePath,
            public_id: localFilePath,
        };
    } catch (error) {
        if (localFilePath && fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        logger.error('Error processing file upload', error);
        return null;
    }
};

const deleteFileFromCloudinary = async (
    folderName: string,
    url: string,
): Promise<{ result: string } | null> => {
    try {
        logger.info(`Deleting file ${url} from ${folderName}`);
        return { result: 'ok' };
    } catch (error) {
        logger.error('Error deleting file', error);
        return null;
    }
};

export { uploadFileOnCloudinary, deleteFileFromCloudinary };

