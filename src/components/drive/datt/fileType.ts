import video from './typ/video.svg';
import music from './typ/music.svg';
import photo from './typ/photo.svg';
import pdf from './typ/pdf.svg';
import word from './typ/word.svg';
import power from './typ/power.svg';
import excel from './typ/excel.svg';
import file from './typ/file.svg';
import folder from './typ/folder.svg';

const types = {
  chala: video,
  mkv: video,
  mp4: video,
  shr: music,
  mp3: music,
  m4a: music,
  wav: music,
  aac: music,
  jpg: photo,
  jpeg: photo,
  svg: photo,
  gif: photo,
  ico: photo,
  png: photo,
  pdf: pdf,
  doc: word,
  docx: word,
  ppt: power,
  pptx: power,
  xlsx: excel,
  xls: excel
};
export default types;
export const fileImg = file;
export const folderImg = folder;
