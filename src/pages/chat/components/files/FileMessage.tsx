import React from "react";
import {
  Download,
  FileText,
  File as FileIcon,
  Image as ImageIcon,
} from "lucide-react";
import { fileService } from "../../services/fileService";
import { commandService } from "../../services/commandService";

interface FileMessageProps {
  fileId: number;
  filename: string;
  mimetype: string;
  size: number;
}

const FileMessage: React.FC<FileMessageProps> = ({
  fileId,
  filename,
  mimetype,
  size,
}) => {
  const handleDownload = () => {
    fileService.downloadFile(fileId);
  };

  const isImage = mimetype.startsWith("image/");

  return (
    <div className="flex items-center gap-3 p-2.5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow max-w-[280px] group">
      {/* Icône stylisée avec dégradé subtil en fond */}
      <div
        className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${
          isImage ? "bg-pink-50 text-pink-500" : "bg-cyan-50 text-cyan-500"
        }`}
      >
        {isImage ? (
          <ImageIcon size={20} />
        ) : mimetype.includes("pdf") || mimetype.includes("word") ? (
          <FileText size={20} />
        ) : (
          <FileIcon size={20} />
        )}
      </div>

      {/* Infos fichier */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-700 truncate group-hover:text-cyan-600 transition-colors">
          {filename}
        </p>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
          {commandService.formatBytes(size)}
        </p>
      </div>

      {/* Bouton Download avec effet Pink au hover */}
      <button
        onClick={handleDownload}
        className="p-2 text-gray-400 hover:text-pink-500 hover:bg-pink-50 rounded-xl transition-all"
        title="Télécharger"
      >
        <Download size={18} />
      </button>
    </div>
  );
};

export default FileMessage;
