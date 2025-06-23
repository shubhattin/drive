import {
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Code,
  Presentation,
  Sheet,
  File,
  FileX,
  FileCode,
  FileImage,
  FileVideo,
  FileAudio,
  FileSpreadsheet,
  FileBarChart
} from 'lucide-react';

interface FileIconMap {
  [key: string]: React.ComponentType<{ className?: string }>;
}

const iconMap: FileIconMap = {
  // Images
  'image/jpeg': FileImage,
  'image/jpg': FileImage,
  'image/png': FileImage,
  'image/gif': FileImage,
  'image/svg+xml': FileImage,
  'image/webp': FileImage,
  'image/bmp': FileImage,
  'image/tiff': FileImage,

  // Videos
  'video/mp4': FileVideo,
  'video/avi': FileVideo,
  'video/mov': FileVideo,
  'video/wmv': FileVideo,
  'video/flv': FileVideo,
  'video/webm': FileVideo,
  'video/mkv': FileVideo,

  // Audio
  'audio/mp3': FileAudio,
  'audio/wav': FileAudio,
  'audio/flac': FileAudio,
  'audio/aac': FileAudio,
  'audio/ogg': FileAudio,
  'audio/wma': FileAudio,
  'audio/m4a': FileAudio,

  // Documents
  'application/pdf': FileText,
  'text/plain': FileText,
  'text/html': FileCode,
  'text/css': FileCode,
  'text/javascript': FileCode,
  'application/json': FileCode,
  'application/xml': FileCode,
  'text/xml': FileCode,

  // Microsoft Office
  'application/msword': FileText,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': FileText,
  'application/vnd.ms-excel': FileSpreadsheet,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': FileSpreadsheet,
  'application/vnd.ms-powerpoint': FileBarChart,
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': FileBarChart,

  // Code files
  'text/x-python': FileCode,
  'application/x-python': FileCode,
  'text/x-java': FileCode,
  'text/x-c': FileCode,
  'text/x-c++': FileCode,
  'text/x-csharp': FileCode,
  'text/x-php': FileCode,
  'text/x-ruby': FileCode,
  'text/x-go': FileCode,
  'text/x-rust': FileCode,

  // Archives
  'application/zip': Archive,
  'application/x-rar-compressed': Archive,
  'application/x-7z-compressed': Archive,
  'application/x-tar': Archive,
  'application/gzip': Archive,
  'application/x-gzip': Archive
};

const extensionMap: FileIconMap = {
  // Images
  '.jpg': FileImage,
  '.jpeg': FileImage,
  '.png': FileImage,
  '.gif': FileImage,
  '.svg': FileImage,
  '.webp': FileImage,
  '.bmp': FileImage,
  '.tiff': FileImage,
  '.ico': FileImage,

  // Videos
  '.mp4': FileVideo,
  '.avi': FileVideo,
  '.mov': FileVideo,
  '.wmv': FileVideo,
  '.flv': FileVideo,
  '.webm': FileVideo,
  '.mkv': FileVideo,
  '.m4v': FileVideo,

  // Audio
  '.mp3': FileAudio,
  '.wav': FileAudio,
  '.flac': FileAudio,
  '.aac': FileAudio,
  '.ogg': FileAudio,
  '.wma': FileAudio,
  '.m4a': FileAudio,

  // Documents
  '.pdf': FileText,
  '.txt': FileText,
  '.md': FileText,
  '.doc': FileText,
  '.docx': FileText,
  '.rtf': FileText,

  // Spreadsheets
  '.xls': FileSpreadsheet,
  '.xlsx': FileSpreadsheet,
  '.csv': FileSpreadsheet,
  '.ods': FileSpreadsheet,

  // Presentations
  '.ppt': FileBarChart,
  '.pptx': FileBarChart,
  '.odp': FileBarChart,

  // Code files
  '.js': FileCode,
  '.ts': FileCode,
  '.jsx': FileCode,
  '.tsx': FileCode,
  '.html': FileCode,
  '.css': FileCode,
  '.scss': FileCode,
  '.sass': FileCode,
  '.less': FileCode,
  '.py': FileCode,
  '.java': FileCode,
  '.c': FileCode,
  '.cpp': FileCode,
  '.h': FileCode,
  '.cs': FileCode,
  '.php': FileCode,
  '.rb': FileCode,
  '.go': FileCode,
  '.rs': FileCode,
  '.sh': FileCode,
  '.bat': FileCode,
  '.json': FileCode,
  '.xml': FileCode,
  '.yaml': FileCode,
  '.yml': FileCode,
  '.toml': FileCode,

  // Archives
  '.zip': Archive,
  '.rar': Archive,
  '.7z': Archive,
  '.tar': Archive,
  '.gz': Archive,
  '.bz2': Archive,
  '.xz': Archive
};

export function getFileIcon(mimeType: string, className = 'w-6 h-6'): React.ReactElement {
  // First try to get icon by MIME type
  const IconByMime = iconMap[mimeType.toLowerCase()];
  if (IconByMime) {
    return <IconByMime className={className} />;
  }

  // If no MIME type match, try to get by file extension (if available)
  // This would require parsing the filename, but since we only have mimeType here,
  // we'll use a fallback approach

  // Special handling for common MIME types that might not be in our map
  if (mimeType.startsWith('image/')) {
    return <FileImage className={className} />;
  }
  if (mimeType.startsWith('video/')) {
    return <FileVideo className={className} />;
  }
  if (mimeType.startsWith('audio/')) {
    return <FileAudio className={className} />;
  }
  if (mimeType.startsWith('text/') || mimeType.includes('document')) {
    return <FileText className={className} />;
  }
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
    return <FileSpreadsheet className={className} />;
  }
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) {
    return <FileBarChart className={className} />;
  }
  if (mimeType.includes('zip') || mimeType.includes('compressed') || mimeType.includes('archive')) {
    return <Archive className={className} />;
  }

  // Default fallback
  return <File className={className} />;
}

export function getFileIconByFilename(filename: string, className = 'w-6 h-6'): React.ReactElement {
  const extension = '.' + filename.split('.').pop()?.toLowerCase();
  const IconByExtension = extensionMap[extension];

  if (IconByExtension) {
    return <IconByExtension className={className} />;
  }

  // Default fallback
  return <File className={className} />;
}
