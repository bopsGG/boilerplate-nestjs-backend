import * as fs from 'fs';
import { ReadStream } from 'fs';
import * as fs_promises from 'fs/promises';
import * as path from 'path';
import { rimraf } from 'rimraf';
import { InternalErrorException } from '../dto';
import { PrefixFilenameByActionEnum } from '../enum';
import { UploadFileResponseDto } from './dto';

export const saveFile = async (
  file: Express.Multer.File,
  filename: string,
  uploadDir: string,
): Promise<string> => {
  if (!fs.existsSync(uploadDir)) {
    await fs_promises.mkdir(uploadDir, { recursive: true });
  }

  const filePath = getPathFile(uploadDir, filename);
  await fs_promises.writeFile(filePath, file.buffer);

  return filePath;
};

export const getFile = async (
  filename: string,
  uploadDir: string,
): Promise<ReadStream> => {
  const filePath = getPathFile(uploadDir, filename);
  if (fs.existsSync(filePath)) {
    return fs.createReadStream(filePath);
  }
};

export const renameFile = async (
  oldFilename: string,
  newFilename: string,
  uploadDir: string,
): Promise<void> => {
  const oldFilePath = getPathFile(uploadDir, oldFilename);
  const newFilePath = getPathFile(uploadDir, newFilename);

  return await fs.promises.rename(oldFilePath, newFilePath);
};

export const deleteFile = async (
  filename: string,
  uploadDir: string,
): Promise<boolean> => {
  const filePath = getPathFile(uploadDir, filename);

  try {
    if (await fs_promises.stat(filePath).catch(() => false)) {
      await fs_promises.rm(filePath, { recursive: true, force: true });
    }

    return true;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    return false;
  }
};

export function getPathFile(uploadDir: string, filename: string): string {
  const filePath = path.join(uploadDir, filename);

  return path.join(process.cwd(), filePath);
}

export const deleteFileByPrefix = async (
  prefix: PrefixFilenameByActionEnum,
  uploadDir: string,
): Promise<boolean> => {
  const filePath = getPathFile(uploadDir, uploadDir);

  if (!fs.existsSync(filePath)) return false;

  return rimraf.sync(filePath);
};

export const uploadFile = async (
  file: Express.Multer.File,
  uploadDir: string,
  userId: string,
): Promise<UploadFileResponseDto> => {
  const publicId = `${Date.now()}-${userId}`;
  const filename = `${Date.now()}-${userId}${path.extname(file.originalname)}`;

  try {
    await saveFile(file, filename, uploadDir);
    await getFile(filename, uploadDir);

    return {
      id: publicId,
      url: `${uploadDir}/${filename}`,
    };
  } catch (error) {
    throw new InternalErrorException({ message: error.message });
  }
};
