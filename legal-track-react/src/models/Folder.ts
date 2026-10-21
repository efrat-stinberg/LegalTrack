import MyDocument from "./Document";

// Values the server accepts for Folder.Status
export type CaseStatus = 'open' | 'in_progress' | 'waiting' | 'closed';

export interface MyFolder {
  folderId: number;
  folderName: string;
  createdDate: string;
  clientId: number;
  clientName?: string; // Filled by GET /api/folders/{id}
  groupId: number;
  documents: MyDocument[];
  status: CaseStatus;
  nextDeadline?: string | null; // "YYYY-MM-DDT00:00:00"
  nextDeadlineNote?: string | null;
}
