import GenericFileIcon from './file.svg'
import PngFileIcon from './png.svg'
import JpgFileIcon from './jpg.svg'
import TifFileIcon from './tif.svg'
import GifFileIcon from './gif.svg'
import ZipFileIcon from './zip.svg'
import PdfFileIcon from './pdf.svg'
import PptFileIcon from './powerpoint.svg'
import WordFileIcon from './word.svg'
import XlsFileIcon from './excel.svg'
import ExeFileIcon from './exe.svg'
import CodeFileIcon from './code.svg'

function getFileIcon (fileName) {
  const extension = fileName.split('.').pop().toLowerCase()
  switch (extension) {
    case 'png':
      return 'PngFileIcon'
    case 'jpg':
    case 'jpeg':
      return 'JpgFileIcon'
    case 'tif':
    case 'tiff':
      return 'TifFileIcon'
    case 'gif':
      return 'GifFileIcon'
    case 'pdf':
      return 'PdfFileIcon'
    case 'zip':
    case 'rar':
    case '7z':
      return 'ZipFileIcon'
    case 'ppt':
    case 'pptx':
      return 'PptFileIcon'
    case 'doc':
    case 'docx':
      return 'WordFileIcon'
    case 'xls':
    case 'xlsx':
      return 'XlsFileIcon'
    case 'exe':
    case 'bat':
    case 'sh':
      return 'ExeFileIcon'
    case 'html':
    case 'htm':
    case 'css':
    case 'js':
    case 'json':
    case 'xml':
    case 'py':
    case 'java':
    case 'c':
    case 'cpp':
    case 'cs':
      return 'CodeFileIcon'
    default:
      return 'GenericFileIcon'
  }
}

export {
  GenericFileIcon,
  PngFileIcon,
  JpgFileIcon,
  TifFileIcon,
  GifFileIcon,
  ZipFileIcon,
  PdfFileIcon,
  PptFileIcon,
  WordFileIcon,
  XlsFileIcon,
  ExeFileIcon,
  CodeFileIcon,
  getFileIcon
}
