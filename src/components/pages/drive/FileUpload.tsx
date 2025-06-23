'use client';

import { useState, useCallback, useRef } from 'react';
import { client_q } from '~/api/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { Progress } from '~/components/ui/progress';
import { Card, CardContent } from '~/components/ui/card';
import { getFileIcon } from './FileIcons';
import { formatFileSize } from './utils';
import { Upload, X, Play, Pause, Check, AlertCircle, FileUp } from 'lucide-react';
import { toast } from 'sonner';

interface FileUploadProps {
  isOpen: boolean;
  onClose: () => void;
  currentFolderId?: string;
}

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'paused' | 'completed' | 'error';
  uploadUrl?: string;
  s3Key?: string;
  fileId?: string;
  error?: string;
  abortController?: AbortController;
}

export function FileUpload({ isOpen, onClose, currentFolderId }: FileUploadProps) {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const utils = client_q.useUtils();

  const getUploadUrlMutation = client_q.files.get_upload_url.useMutation();
  const uploadCompleteMutation = client_q.files.upload_complete.useMutation({
    onSuccess: () => {
      utils.files.list_files.invalidate({ folder_id: currentFolderId });
    }
  });

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addFiles = useCallback((files: FileList | File[]) => {
    const newFiles: UploadFile[] = Array.from(files).map((file) => ({
      id: generateId(),
      file,
      progress: 0,
      status: 'pending'
    }));

    setUploadFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const handleFileSelect = useCallback(() => {
    if (fileInputRef.current?.files) {
      addFiles(fileInputRef.current.files);
    }
  }, [addFiles]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        addFiles(files);
      }
    },
    [addFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const uploadFile = async (fileItem: UploadFile) => {
    try {
      setUploadFiles((prev) =>
        prev.map((f) => (f.id === fileItem.id ? { ...f, status: 'uploading' } : f))
      );

      // Get upload URL
      const uploadData = await getUploadUrlMutation.mutateAsync({
        filename: fileItem.file.name,
        size: fileItem.file.size,
        mime_type: fileItem.file.type || 'application/octet-stream',
        folder_id: currentFolderId
      });

      const abortController = new AbortController();

      setUploadFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id
            ? {
                ...f,
                uploadUrl: uploadData.upload_url,
                s3Key: uploadData.s3_key,
                fileId: uploadData.file_id,
                abortController
              }
            : f
        )
      );

      // Upload to S3 with progress tracking
      const xhr = new XMLHttpRequest();

      return new Promise<void>((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            setUploadFiles((prev) =>
              prev.map((f) => (f.id === fileItem.id ? { ...f, progress } : f))
            );
          }
        });

        xhr.addEventListener('load', async () => {
          if (xhr.status === 200) {
            try {
              // Complete upload by saving metadata
              await uploadCompleteMutation.mutateAsync({
                file_id: uploadData.file_id,
                filename: fileItem.file.name,
                mime_type: fileItem.file.type || 'application/octet-stream',
                size: fileItem.file.size,
                s3_key: uploadData.s3_key,
                folder_id: currentFolderId
              });

              setUploadFiles((prev) =>
                prev.map((f) =>
                  f.id === fileItem.id ? { ...f, status: 'completed', progress: 100 } : f
                )
              );

              toast.success(`${fileItem.file.name} uploaded successfully`);
              resolve();
            } catch (error) {
              setUploadFiles((prev) =>
                prev.map((f) =>
                  f.id === fileItem.id
                    ? {
                        ...f,
                        status: 'error',
                        error: 'Failed to complete upload'
                      }
                    : f
                )
              );
              reject(error);
            }
          } else {
            setUploadFiles((prev) =>
              prev.map((f) =>
                f.id === fileItem.id
                  ? {
                      ...f,
                      status: 'error',
                      error: `Upload failed: ${xhr.statusText}`
                    }
                  : f
              )
            );
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        });

        xhr.addEventListener('error', () => {
          setUploadFiles((prev) =>
            prev.map((f) =>
              f.id === fileItem.id
                ? {
                    ...f,
                    status: 'error',
                    error: 'Network error during upload'
                  }
                : f
            )
          );
          reject(new Error('Network error during upload'));
        });

        xhr.addEventListener('abort', () => {
          setUploadFiles((prev) =>
            prev.map((f) => (f.id === fileItem.id ? { ...f, status: 'paused' } : f))
          );
        });

        // Set up abort handling
        abortController.signal.addEventListener('abort', () => {
          xhr.abort();
        });

        xhr.open('PUT', uploadData.upload_url);
        xhr.setRequestHeader('Content-Type', fileItem.file.type || 'application/octet-stream');
        xhr.send(fileItem.file);
      });
    } catch (error: any) {
      setUploadFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id
            ? {
                ...f,
                status: 'error',
                error: error.message || 'Failed to get upload URL'
              }
            : f
        )
      );
      throw error;
    }
  };

  const startUpload = async (fileId: string) => {
    const fileItem = uploadFiles.find((f) => f.id === fileId);
    if (!fileItem) return;

    try {
      await uploadFile(fileItem);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const pauseUpload = (fileId: string) => {
    const fileItem = uploadFiles.find((f) => f.id === fileId);
    if (fileItem?.abortController) {
      fileItem.abortController.abort();
    }
  };

  const resumeUpload = (fileId: string) => {
    startUpload(fileId);
  };

  const removeFile = (fileId: string) => {
    const fileItem = uploadFiles.find((f) => f.id === fileId);
    if (fileItem?.abortController) {
      fileItem.abortController.abort();
    }
    setUploadFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const startAllUploads = () => {
    const pendingFiles = uploadFiles.filter((f) => f.status === 'pending');
    pendingFiles.forEach((file) => startUpload(file.id));
  };

  const clearCompleted = () => {
    setUploadFiles((prev) => prev.filter((f) => f.status !== 'completed'));
  };

  const handleClose = () => {
    // Abort any ongoing uploads
    uploadFiles.forEach((file) => {
      if (file.abortController && file.status === 'uploading') {
        file.abortController.abort();
      }
    });
    setUploadFiles([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="flex max-h-[80vh] max-w-2xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 flex-col space-y-4 overflow-hidden">
          {/* Drop Zone */}
          <Card
            className={`cursor-pointer border-2 border-dashed transition-colors ${
              isDragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <CardContent className="flex flex-col items-center justify-center py-8">
              <FileUp className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-2 text-lg font-medium">Drop files here or click to browse</p>
              <p className="text-sm text-muted-foreground">Maximum file size: 500MB</p>
            </CardContent>
          </Card>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />

          {/* Upload Queue */}
          {uploadFiles.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Upload Queue ({uploadFiles.length})</h3>
                <div className="flex space-x-2">
                  <Button size="sm" onClick={startAllUploads}>
                    <Upload className="mr-1 h-4 w-4" />
                    Start All
                  </Button>
                  <Button size="sm" variant="outline" onClick={clearCompleted}>
                    Clear Completed
                  </Button>
                </div>
              </div>

              <div className="max-h-96 flex-1 space-y-2 overflow-y-auto">
                {uploadFiles.map((fileItem) => (
                  <FileUploadItem
                    key={fileItem.id}
                    fileItem={fileItem}
                    onStart={() => startUpload(fileItem.id)}
                    onPause={() => pauseUpload(fileItem.id)}
                    onResume={() => resumeUpload(fileItem.id)}
                    onRemove={() => removeFile(fileItem.id)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface FileUploadItemProps {
  fileItem: UploadFile;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onRemove: () => void;
}

function FileUploadItem({ fileItem, onStart, onPause, onResume, onRemove }: FileUploadItemProps) {
  const getStatusColor = () => {
    switch (fileItem.status) {
      case 'completed':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'uploading':
        return 'text-blue-600';
      case 'paused':
        return 'text-yellow-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusIcon = () => {
    switch (fileItem.status) {
      case 'completed':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'uploading':
        return <Upload className="h-4 w-4 text-blue-600" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-center space-x-3">
          {getFileIcon(fileItem.file.type, 'w-8 h-8')}

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{fileItem.file.name}</p>
            <p className="text-xs text-muted-foreground">{formatFileSize(fileItem.file.size)}</p>

            {fileItem.status === 'uploading' && (
              <Progress value={fileItem.progress} className="mt-1" />
            )}

            {fileItem.error && <p className="mt-1 text-xs text-red-600">{fileItem.error}</p>}
          </div>

          <div className="flex items-center space-x-2">
            <div className={`text-xs ${getStatusColor()}`}>
              {fileItem.status === 'uploading' && `${fileItem.progress}%`}
              {fileItem.status === 'completed' && 'Completed'}
              {fileItem.status === 'error' && 'Failed'}
              {fileItem.status === 'paused' && 'Paused'}
              {fileItem.status === 'pending' && 'Pending'}
            </div>

            {getStatusIcon()}

            {fileItem.status === 'pending' && (
              <Button size="sm" variant="ghost" onClick={onStart}>
                <Play className="h-4 w-4" />
              </Button>
            )}

            {fileItem.status === 'uploading' && (
              <Button size="sm" variant="ghost" onClick={onPause}>
                <Pause className="h-4 w-4" />
              </Button>
            )}

            {fileItem.status === 'paused' && (
              <Button size="sm" variant="ghost" onClick={onResume}>
                <Play className="h-4 w-4" />
              </Button>
            )}

            <Button
              size="sm"
              variant="ghost"
              onClick={onRemove}
              className="text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
