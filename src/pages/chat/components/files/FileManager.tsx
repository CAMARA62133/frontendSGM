import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Search,
  Download,
  FileText,
  Image as ImageIcon,
  FolderOpen,
  Loader2,
} from "lucide-react";
import { fileService } from "../../services/fileService";
import { commandService } from "../../services/commandService";
import type { FileData } from "../../types/file.type";

interface FileManagerProps {
  conversationId: string;
  onClose: () => void;
}

const FileManager: React.FC<FileManagerProps> = ({
  conversationId,
  onClose,
}) => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "images" | "documents">("all");
  const [search, setSearch] = useState("");

  const loadFiles = useCallback(async () => {
    setLoading(true);
    try {
      const response: FileData[] =
        await fileService.getConversationFiles(conversationId);
      setFiles(response);
    } catch (error) {
      console.error("Erreur chargement fichiers:", error);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.filename
      .toLowerCase()
      .includes(search.toLowerCase());
    if (filter === "images")
      return file.mimetype.startsWith("image/") && matchesSearch;
    if (filter === "documents")
      return !file.mimetype.startsWith("image/") && matchesSearch;
    return matchesSearch;
  });

  const handleDownload = (fileId: number) => {
    fileService.downloadFile(fileId);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100">
        {/* Header Style Dashboard */}
        <div className="bg-gradient-to-r from-cyan-500 to-pink-500 p-5 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <FolderOpen size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold leading-none">
                Gestionnaire de Fichiers
              </h2>
              <p className="text-[11px] text-white/70 font-medium uppercase tracking-wider mt-1">
                {files.length} éléments partagés
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-2 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Barre d'outils / Filtres */}
        <div className="p-4 border-b bg-gray-50/50 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative group">
            <Search
              size={18}
              className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-cyan-500 transition-colors"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all text-sm"
            />
          </div>

          <div className="flex bg-white border border-gray-200 p-1 rounded-xl shrink-0">
            {(["all", "images", "documents"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  filter === t
                    ? "bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-md shadow-cyan-100"
                    : "text-gray-500 hover:text-cyan-500"
                }`}
              >
                {t === "all" ? "Tous" : t === "images" ? "Images" : "Docs"}
              </button>
            ))}
          </div>
        </div>

        {/* Liste des fichiers */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-white">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
              <Loader2 size={40} className="animate-spin text-cyan-500" />
              <p className="text-sm font-medium">
                Synchronisation des données...
              </p>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 opacity-60">
              <Search size={48} className="mb-4 text-pink-200" />
              <p className="text-sm font-medium">
                Aucun fichier ne correspond à votre recherche
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="group flex items-center justify-between p-3 rounded-2xl border border-transparent hover:border-pink-100 hover:bg-pink-50/30 transition-all"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Icone dynamique */}
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-100">
                      {file.mimetype.startsWith("image/") ? (
                        <ImageIcon size={24} className="text-pink-400" />
                      ) : (
                        <FileText size={24} className="text-cyan-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-700 truncate group-hover:text-pink-600 transition-colors">
                        {file.filename}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] font-medium text-gray-400 mt-0.5">
                        <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">
                          {commandService.formatBytes(file.size)}
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(file.createdAt).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span className="text-cyan-500">
                          {file.uploader?.prenom} {file.uploader?.nom}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownload(file.id)}
                    className="ml-4 p-3 bg-white border border-gray-100 text-cyan-500 rounded-xl hover:bg-cyan-500 hover:text-white hover:shadow-lg hover:shadow-cyan-100 transition-all"
                    title="Télécharger"
                  >
                    <Download size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer simple */}
        <div className="p-3 bg-gray-50 border-t flex justify-center">
          <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
            Sécurisé par votre service de fichiers
          </p>
        </div>
      </div>
    </div>
  );
};

export default FileManager;
