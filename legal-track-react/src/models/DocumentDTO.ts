// Shape of a document as returned by GET /api/document (camelCase JSON)
type DocumentDTO = {
    documentId: number;
    documentName: string;
    filePath: string;
    uploadDate: string;
    folderId: number;
}

export default DocumentDTO;
