import { z } from 'zod';
import { protectedProcedure, t } from '~/api/trpc_init';
import { db } from '~/db/db';
import { files, folders } from '~/db/schema';
import { eq, and, isNull, ne } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  CopyObjectCommand,
  StorageClass
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import ms from 'ms';

// S3 Client Configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

const BUCKET_NAME = process.env.AWS_S3_FILES_BUCKET_NAME!;
const UPLOAD_URL_EXPIRY = ms('20mins') / 1000;
const DOWNLOAD_URL_EXPIRY = ms('2hrs') / 1000;
const STORAGE_CLASS = StorageClass.STANDARD;

// Helper function to generate S3 key
function generateS3Key(userId: string, folderId: string | null, fileId: string): string {
  // const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  if (folderId) {
    return `users/${userId}/folders/${folderId}/${fileId}`;
  } else {
    return `users/${userId}/root/${fileId}`;
  }
}

// List files in a folder
const list_files_procedure = protectedProcedure
  .input(
    z.object({
      folder_id: z.string().uuid().optional().nullable()
    })
  )
  .query(async ({ input: { folder_id }, ctx: { user } }) => {
    // Verify folder ownership if folder_id is provided
    if (folder_id) {
      const folder = await db.query.folders.findFirst({
        where: and(eq(folders.id, folder_id), eq(folders.userId, user.id))
      });

      if (!folder) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Folder not found or access denied'
        });
      }
    }

    // Get files in the specified folder (or root if folder_id is null)
    const folderCondition = folder_id ? eq(files.folderId, folder_id) : isNull(files.folderId);

    const userFiles = await db
      .select({
        id: files.id,
        name: files.name,
        mimeType: files.mimeType,
        size: files.size,
        createdAt: files.createdAt,
        updatedAt: files.updatedAt,
        folderId: files.folderId
      })
      .from(files)
      .where(and(eq(files.userId, user.id), folderCondition))
      .orderBy(files.name);

    // Get subfolders in the specified folder
    const parentCondition = folder_id ? eq(folders.parentId, folder_id) : isNull(folders.parentId);

    const subfolders = await db
      .select({
        id: folders.id,
        name: folders.name,
        createdAt: folders.createdAt,
        updatedAt: folders.updatedAt,
        parentId: folders.parentId
      })
      .from(folders)
      .where(and(eq(folders.userId, user.id), parentCondition))
      .orderBy(folders.name);

    return {
      files: userFiles,
      folders: subfolders
    };
  });

// Get upload URL for file
const get_upload_url_procedure = protectedProcedure
  .input(
    z.object({
      filename: z.string().min(1).max(255),
      size: z
        .number()
        .positive()
        .max(500 * 1024 * 1024), // 500MB max
      mime_type: z.string().min(1).max(100),
      folder_id: z.string().optional().nullable()
    })
  )
  .mutation(async ({ input: { filename, size, mime_type, folder_id }, ctx: { user } }) => {
    // Verify folder ownership if folder_id is provided
    if (folder_id) {
      const folder = await db.query.folders.findFirst({
        where: and(eq(folders.id, folder_id), eq(folders.userId, user.id))
      });

      if (!folder) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Folder not found or access denied'
        });
      }
    }

    // MIME type is now provided by the client for better accuracy

    const fileId = uuidv4();
    const s3Key = generateS3Key(user.id, folder_id || null, fileId);

    // Generate presigned URL for upload
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      ContentType: mime_type,
      ContentLength: size,
      StorageClass: STORAGE_CLASS,
      Metadata: {
        'user-id': user.id,
        'file-id': fileId,
        'original-filename': filename
      }
    });

    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: UPLOAD_URL_EXPIRY
    });

    return {
      upload_url: uploadUrl,
      file_id: fileId,
      s3_key: s3Key,
      expires_in: UPLOAD_URL_EXPIRY
    };
  });

// Complete file upload (save metadata to database)
const upload_complete_procedure = protectedProcedure
  .input(
    z.object({
      file_id: z.string().uuid(),
      filename: z.string().min(1).max(255),
      mime_type: z.string().min(1),
      size: z.number().positive(),
      s3_key: z.string().min(1),
      folder_id: z.string().optional().nullable()
    })
  )
  .mutation(
    async ({ input: { file_id, filename, mime_type, size, s3_key, folder_id }, ctx: { user } }) => {
      // Verify the S3 key matches expected pattern
      const expectedS3Key = generateS3Key(user.id, folder_id || null, file_id);
      if (s3_key !== expectedS3Key) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid S3 key'
        });
      }

      // Verify folder ownership if folder_id is provided
      if (folder_id) {
        const folder = await db.query.folders.findFirst({
          where: and(eq(folders.id, folder_id), eq(folders.userId, user.id))
        });

        if (!folder) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Folder not found or access denied'
          });
        }
      }

      try {
        const [newFile] = await db
          .insert(files)
          .values({
            id: file_id,
            name: filename,
            s3Key: s3_key,
            mimeType: mime_type,
            size,
            userId: user.id,
            folderId: folder_id || null
          })
          .returning();

        return newFile;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to save file metadata'
        });
      }
    }
  );

// Rename file
const rename_file_procedure = protectedProcedure
  .input(
    z.object({
      file_id: z.string().uuid(),
      new_name: z.string().min(1).max(255)
    })
  )
  .mutation(async ({ input: { file_id, new_name }, ctx: { user } }) => {
    // Get the file and verify ownership
    const [file] = await db
      .select()
      .from(files)
      .where(and(eq(files.id, file_id), eq(files.userId, user.id)))
      .limit(1);

    if (!file) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'File not found or access denied'
      });
    }

    try {
      const [updatedFile] = await db
        .update(files)
        .set({
          name: new_name,
          updatedAt: new Date()
        })
        .where(eq(files.id, file_id))
        .returning();

      return updatedFile;
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to rename file'
      });
    }
  });

// Move file
const move_file_procedure = protectedProcedure
  .input(
    z.object({
      file_id: z.string().uuid(),
      target_folder_id: z.string().optional().nullable()
    })
  )
  .mutation(async ({ input: { file_id, target_folder_id }, ctx: { user } }) => {
    // Get the file and verify ownership
    const [file] = await db
      .select()
      .from(files)
      .where(and(eq(files.id, file_id), eq(files.userId, user.id)))
      .limit(1);

    if (!file) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'File not found or access denied'
      });
    }

    // Verify target folder ownership if target_folder_id is provided
    if (target_folder_id) {
      const folder = await db
        .select()
        .from(folders)
        .where(and(eq(folders.id, target_folder_id), eq(folders.userId, user.id)))
        .limit(1);

      if (folder.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Target folder not found or access denied'
        });
      }
    }

    try {
      const [updatedFile] = await db
        .update(files)
        .set({
          folderId: target_folder_id || null,
          updatedAt: new Date()
        })
        .where(eq(files.id, file_id))
        .returning();

      return updatedFile;
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to move file'
      });
    }
  });

// Copy file
const copy_file_procedure = protectedProcedure
  .input(
    z.object({
      file_id: z.string().uuid(),
      target_folder_id: z.string().optional().nullable(),
      new_name: z.string().min(1).max(255).optional().nullable()
    })
  )
  .mutation(async ({ input: { file_id, target_folder_id, new_name }, ctx: { user } }) => {
    // Get the original file and verify ownership
    const [originalFile] = await db
      .select()
      .from(files)
      .where(and(eq(files.id, file_id), eq(files.userId, user.id)))
      .limit(1);

    if (!originalFile) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'File not found or access denied'
      });
    }

    // Verify target folder ownership if target_folder_id is provided
    if (target_folder_id) {
      const folder = await db
        .select()
        .from(folders)
        .where(and(eq(folders.id, target_folder_id), eq(folders.userId, user.id)))
        .limit(1);

      if (folder.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Target folder not found or access denied'
        });
      }
    }

    const newFileId = uuidv4();
    const copyName = new_name || `Copy of ${originalFile.name}`;
    const newS3Key = generateS3Key(user.id, target_folder_id || null, newFileId);

    try {
      // Copy the S3 object
      const copyCommand = new CopyObjectCommand({
        Bucket: BUCKET_NAME,
        CopySource: `${BUCKET_NAME}/${originalFile.s3Key}`,
        Key: newS3Key,
        StorageClass: STORAGE_CLASS,
        Metadata: {
          'user-id': user.id,
          'file-id': newFileId,
          'original-filename': copyName
        },
        MetadataDirective: 'REPLACE'
      });

      await s3Client.send(copyCommand);

      // Create database record for the copy
      const [newFile] = await db
        .insert(files)
        .values({
          id: newFileId,
          name: copyName,
          s3Key: newS3Key,
          mimeType: originalFile.mimeType,
          size: originalFile.size,
          userId: user.id,
          folderId: target_folder_id || null
        })
        .returning();

      return newFile;
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to copy file'
      });
    }
  });

// Delete file
const delete_file_procedure = protectedProcedure
  .input(
    z.object({
      file_id: z.string().uuid()
    })
  )
  .mutation(async ({ input: { file_id }, ctx: { user } }) => {
    // Get the file and verify ownership
    const [file] = await db
      .select()
      .from(files)
      .where(and(eq(files.id, file_id), eq(files.userId, user.id)))
      .limit(1);

    if (!file) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'File not found or access denied'
      });
    }

    try {
      // Delete from S3
      const deleteCommand = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: file.s3Key
      });

      await s3Client.send(deleteCommand);

      // Delete from database
      await db.delete(files).where(eq(files.id, file_id));

      return { success: true };
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete file'
      });
    }
  });

// Get download URL
const get_download_url_procedure = protectedProcedure
  .input(
    z.object({
      file_id: z.string().uuid()
    })
  )
  .mutation(async ({ input: { file_id }, ctx: { user } }) => {
    // Get the file and verify ownership
    const [file] = await db
      .select()
      .from(files)
      .where(and(eq(files.id, file_id), eq(files.userId, user.id)))
      .limit(1);

    if (!file) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'File not found or access denied'
      });
    }

    try {
      // Generate presigned URL for download
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: file.s3Key,
        ResponseContentDisposition: `attachment; filename="${file.name}"`
      });

      const downloadUrl = await getSignedUrl(s3Client, command, {
        expiresIn: DOWNLOAD_URL_EXPIRY
      });

      return {
        download_url: downloadUrl,
        filename: file.name,
        mime_type: file.mimeType,
        size: file.size,
        expires_in: DOWNLOAD_URL_EXPIRY
      };
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to generate download URL'
      });
    }
  });

// Create folder
const create_folder_procedure = protectedProcedure
  .input(
    z.object({
      name: z.string().min(1).max(255),
      parent_id: z.string().uuid().optional().nullable()
    })
  )
  .mutation(async ({ input: { name, parent_id }, ctx: { user } }) => {
    // Verify parent folder ownership if parent_id is provided
    if (parent_id) {
      const parentFolder = await db.query.folders.findFirst({
        where: and(eq(folders.id, parent_id), eq(folders.userId, user.id))
      });

      if (!parentFolder) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Parent folder not found or access denied'
        });
      }
    }

    // Check if folder with same name already exists in the same parent
    const existingFolder = await db.query.folders.findFirst({
      where: and(
        eq(folders.name, name),
        eq(folders.userId, user.id),
        parent_id ? eq(folders.parentId, parent_id) : isNull(folders.parentId)
      )
    });

    if (existingFolder) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'A folder with this name already exists in this location'
      });
    }

    try {
      const [newFolder] = await db
        .insert(folders)
        .values({
          name,
          userId: user.id,
          parentId: parent_id || null
        })
        .returning();

      return newFolder;
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create folder'
      });
    }
  });

// Rename folder
const rename_folder_procedure = protectedProcedure
  .input(
    z.object({
      folder_id: z.string().uuid(),
      new_name: z.string().min(1).max(255)
    })
  )
  .mutation(async ({ input: { folder_id, new_name }, ctx: { user } }) => {
    // Get the folder and verify ownership
    const [folder] = await db
      .select()
      .from(folders)
      .where(and(eq(folders.id, folder_id), eq(folders.userId, user.id)))
      .limit(1);

    if (!folder) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Folder not found or access denied'
      });
    }

    // Check if folder with same name already exists in the same parent
    const existingFolder = await db.query.folders.findFirst({
      where: and(
        eq(folders.name, new_name),
        eq(folders.userId, user.id),
        folder.parentId ? eq(folders.parentId, folder.parentId) : isNull(folders.parentId),
        // Exclude the current folder from the check
        ne(folders.id, folder_id)
      )
    });

    if (existingFolder) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'A folder with this name already exists in this location'
      });
    }

    try {
      const [updatedFolder] = await db
        .update(folders)
        .set({
          name: new_name,
          updatedAt: new Date()
        })
        .where(eq(folders.id, folder_id))
        .returning();

      return updatedFolder;
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to rename folder'
      });
    }
  });

// Move folder
const move_folder_procedure = protectedProcedure
  .input(
    z.object({
      folder_id: z.string().uuid(),
      target_folder_id: z.string().optional().nullable()
    })
  )
  .mutation(async ({ input: { folder_id, target_folder_id }, ctx: { user } }) => {
    // Get the folder and verify ownership
    const [folder] = await db
      .select()
      .from(folders)
      .where(and(eq(folders.id, folder_id), eq(folders.userId, user.id)))
      .limit(1);

    if (!folder) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Folder not found or access denied'
      });
    }

    // Cannot move folder to itself or its descendants
    if (target_folder_id === folder_id) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Cannot move folder to itself'
      });
    }

    // Verify target folder ownership if target_folder_id is provided
    if (target_folder_id) {
      const targetFolder = await db
        .select()
        .from(folders)
        .where(and(eq(folders.id, target_folder_id), eq(folders.userId, user.id)))
        .limit(1);

      if (targetFolder.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Target folder not found or access denied'
        });
      }

      // Check if moving to a descendant (would create cycle)
      const isDescendant = async (
        parentId: string,
        potentialDescendantId: string
      ): Promise<boolean> => {
        const children = await db
          .select({ id: folders.id })
          .from(folders)
          .where(and(eq(folders.parentId, parentId), eq(folders.userId, user.id)));

        for (const child of children) {
          if (child.id === potentialDescendantId) {
            return true;
          }
          if (await isDescendant(child.id, potentialDescendantId)) {
            return true;
          }
        }
        return false;
      };

      if (await isDescendant(folder_id, target_folder_id)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot move folder to its own descendant'
        });
      }
    }

    try {
      const [updatedFolder] = await db
        .update(folders)
        .set({
          parentId: target_folder_id || null,
          updatedAt: new Date()
        })
        .where(eq(folders.id, folder_id))
        .returning();

      return updatedFolder;
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to move folder'
      });
    }
  });

// Copy folder (deep copy with all contents)
const copy_folder_procedure = protectedProcedure
  .input(
    z.object({
      folder_id: z.string().uuid(),
      target_folder_id: z.string().optional().nullable(),
      new_name: z.string().min(1).max(255).optional().nullable()
    })
  )
  .mutation(async ({ input: { folder_id, target_folder_id, new_name }, ctx: { user } }) => {
    // Get the original folder and verify ownership
    const [originalFolder] = await db
      .select()
      .from(folders)
      .where(and(eq(folders.id, folder_id), eq(folders.userId, user.id)))
      .limit(1);

    if (!originalFolder) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Folder not found or access denied'
      });
    }

    // Verify target folder ownership if target_folder_id is provided
    if (target_folder_id) {
      const targetFolder = await db
        .select()
        .from(folders)
        .where(and(eq(folders.id, target_folder_id), eq(folders.userId, user.id)))
        .limit(1);

      if (targetFolder.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Target folder not found or access denied'
        });
      }
    }

    const copyName = new_name || `Copy of ${originalFolder.name}`;

    try {
      // Recursive function to copy folder and all its contents
      const copyFolderRecursive = async (
        sourceFolderId: string,
        targetParentId: string | null,
        folderName: string
      ): Promise<string> => {
        // Create the new folder
        const [newFolder] = await db
          .insert(folders)
          .values({
            name: folderName,
            userId: user.id,
            parentId: targetParentId
          })
          .returning();

        // Copy all files in this folder
        const folderFiles = await db
          .select()
          .from(files)
          .where(and(eq(files.folderId, sourceFolderId), eq(files.userId, user.id)));

        for (const file of folderFiles) {
          const newFileId = uuidv4();
          const newS3Key = generateS3Key(user.id, newFolder.id, newFileId);

          // Copy the S3 object
          const copyCommand = new CopyObjectCommand({
            Bucket: BUCKET_NAME,
            CopySource: `${BUCKET_NAME}/${file.s3Key}`,
            Key: newS3Key,
            StorageClass: STORAGE_CLASS,
            Metadata: {
              'user-id': user.id,
              'file-id': newFileId,
              'original-filename': file.name
            },
            MetadataDirective: 'REPLACE'
          });

          await s3Client.send(copyCommand);

          // Create database record for the copied file
          await db.insert(files).values({
            id: newFileId,
            name: file.name,
            s3Key: newS3Key,
            mimeType: file.mimeType,
            size: file.size,
            userId: user.id,
            folderId: newFolder.id
          });
        }

        // Copy all subfolders recursively
        const subfolders = await db
          .select()
          .from(folders)
          .where(and(eq(folders.parentId, sourceFolderId), eq(folders.userId, user.id)));

        for (const subfolder of subfolders) {
          await copyFolderRecursive(subfolder.id, newFolder.id, subfolder.name);
        }

        return newFolder.id;
      };

      await copyFolderRecursive(folder_id, target_folder_id ?? null, copyName);

      return { success: true };
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to copy folder'
      });
    }
  });

// Delete folder (and all its contents)
const delete_folder_procedure = protectedProcedure
  .input(
    z.object({
      folder_id: z.string().uuid()
    })
  )
  .mutation(async ({ input: { folder_id }, ctx: { user } }) => {
    // Get the folder and verify ownership
    const [folder] = await db
      .select()
      .from(folders)
      .where(and(eq(folders.id, folder_id), eq(folders.userId, user.id)))
      .limit(1);

    if (!folder) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Folder not found or access denied'
      });
    }

    // Get all files in this folder and its subfolders recursively
    const getAllFilesInFolder = async (folderId: string): Promise<string[]> => {
      const folderFiles = await db
        .select({ s3Key: files.s3Key })
        .from(files)
        .where(and(eq(files.folderId, folderId), eq(files.userId, user.id)));

      const subfolders = await db
        .select({ id: folders.id })
        .from(folders)
        .where(and(eq(folders.parentId, folderId), eq(folders.userId, user.id)));

      let allS3Keys = folderFiles.map((f) => f.s3Key);

      for (const subfolder of subfolders) {
        const subfolderFiles = await getAllFilesInFolder(subfolder.id);
        allS3Keys = allS3Keys.concat(subfolderFiles);
      }

      return allS3Keys;
    };

    try {
      // Get all S3 keys that need to be deleted
      const s3KeysToDelete = await getAllFilesInFolder(folder_id);

      // Delete from S3 first
      if (s3KeysToDelete.length > 0) {
        const deletePromises = s3KeysToDelete.map((s3Key) =>
          s3Client.send(
            new DeleteObjectCommand({
              Bucket: BUCKET_NAME,
              Key: s3Key
            })
          )
        );

        await Promise.all(deletePromises);
      }

      // Delete from database (cascade will handle subfolders and files)
      await db.delete(folders).where(eq(folders.id, folder_id));

      return { success: true };
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete folder'
      });
    }
  });

export const files_router = t.router({
  list_files: list_files_procedure,
  get_upload_url: get_upload_url_procedure,
  upload_complete: upload_complete_procedure,
  rename_file: rename_file_procedure,
  move_file: move_file_procedure,
  copy_file: copy_file_procedure,
  delete_file: delete_file_procedure,
  get_download_url: get_download_url_procedure,
  create_folder: create_folder_procedure,
  rename_folder: rename_folder_procedure,
  move_folder: move_folder_procedure,
  copy_folder: copy_folder_procedure,
  delete_folder: delete_folder_procedure
});

// [
//   {
//     "AllowedHeaders": ["*"],
//     "AllowedMethods": ["GET", "PUT", "HEAD"],
//     "AllowedOrigins": ["http://localhost:3000", "http://localhost:5173", "https://yourdomain.com"],
//     "ExposeHeaders": ["ETag"],
//     "MaxAgeSeconds": 3000
//   }
// ]
