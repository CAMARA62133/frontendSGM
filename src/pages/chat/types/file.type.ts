// -------------------------
export interface FileData {
  id: number;
  filename: string;
  path: string;
  size: number;
  mimetype: string;
  uploadedBy: number;
  conversationId: string;
  createdAt: string;
  updatedAt: string;
  uploader?: {
    id: number;
    nom: string;
    prenom: string;
    photo?: string;
  };
}

export interface UploadFileResponse {
  success: boolean;
  data: FileData;
}

export interface GetFilesResponse {
  success: boolean;
  data: FileData[];
}
