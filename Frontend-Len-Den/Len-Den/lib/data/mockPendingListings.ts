export interface PendingListing {
  id: string;
  assetName: string;
  submittedBy: string;
  submittedDate: string;
  status: 'pending-review' | 'pending-documents' | 'approved' | 'rejected';
  documentsUploaded: number;
  documentsRequired: number;
  reviewNotes: string;
}

export const mockPendingListings: PendingListing[] = [
  {
    id: 'pending-001',
    assetName: 'Bangkok Luxury Condominium',
    submittedBy: 'Prasad Holdings',
    submittedDate: '2024-04-10',
    status: 'pending-review',
    documentsUploaded: 5,
    documentsRequired: 6,
    reviewNotes: 'Awaiting environmental clearance document',
  },
  {
    id: 'pending-002',
    assetName: 'Tokyo Commercial Complex',
    submittedBy: 'Tokyo Real Estate LLC',
    submittedDate: '2024-04-08',
    status: 'pending-documents',
    documentsUploaded: 3,
    documentsRequired: 7,
    reviewNotes: 'Need structural engineering report and insurance details',
  },
  {
    id: 'pending-003',
    assetName: 'Lithium Mining Rights - Chile',
    submittedBy: 'EnergyTech Mining',
    submittedDate: '2024-04-05',
    status: 'pending-review',
    documentsUploaded: 8,
    documentsRequired: 8,
    reviewNotes: 'All documents received. Legal review in progress.',
  },
  {
    id: 'pending-004',
    assetName: 'Vintage Wine Portfolio',
    submittedBy: 'Fine Wines Collective',
    submittedDate: '2024-04-12',
    status: 'pending-documents',
    documentsUploaded: 2,
    documentsRequired: 5,
    reviewNotes: 'Please provide tasting notes and provenance certificates',
  },
  {
    id: 'pending-005',
    assetName: 'Data Center - Europe',
    submittedBy: 'CloudServe Infrastructure',
    submittedDate: '2024-04-03',
    status: 'approved',
    documentsUploaded: 9,
    documentsRequired: 9,
    reviewNotes: 'Approved. Ready for platform launch.',
  },
];
