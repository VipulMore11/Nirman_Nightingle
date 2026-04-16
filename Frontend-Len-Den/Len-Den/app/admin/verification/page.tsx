'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockPendingListings } from '@/lib/data/mockPendingListings';
import { mockAssets } from '@/lib/data/mockAssets';
import { formatDate } from '@/lib/utils/formatters';
import { CheckCircle, XCircle, Clock, AlertCircle, FileText } from 'lucide-react';

export default function AdminVerificationPage() {
  const [selectedListing, setSelectedListing] = useState(mockPendingListings[0]?.id);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'more-docs' | null>(null);

  const currentListing = mockPendingListings.find((l) => l.id === selectedListing);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending-review':
        return <Clock className="w-4 h-4 text-orange-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
      case 'pending-review':
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Pending Review</Badge>;
      case 'pending-documents':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Pending Docs</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Verification Queue</h1>
        <p className="text-muted-foreground">Review and approve new asset listings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Listings List */}
        <Card className="border-border bg-card">
          <div className="p-6 border-b border-border">
            <h2 className="font-semibold">Pending Listings</h2>
          </div>

          <div className="divide-y divide-border max-h-96 overflow-y-auto">
            {mockPendingListings.map((listing) => (
              <button
                key={listing.id}
                onClick={() => setSelectedListing(listing.id)}
                className={`w-full p-4 text-left hover:bg-card/50 transition-colors border-l-4 ${
                  selectedListing === listing.id
                    ? 'border-l-accent bg-card/50'
                    : 'border-l-transparent'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{listing.assetName}</p>
                    <p className="text-xs text-muted-foreground">{listing.submittedBy}</p>
                  </div>
                  {getStatusIcon(listing.status)}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {getStatusBadge(listing.status)}
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Details Panel */}
        {currentListing && (
          <Card className="lg:col-span-2 border-border bg-card">
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-semibold mb-2">{currentListing.assetName}</h2>
              <p className="text-sm text-muted-foreground">
                Submitted by: {currentListing.submittedBy}
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Overview */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 border-border bg-background/50">
                  <p className="text-xs text-muted-foreground mb-1">Submission Date</p>
                  <p className="font-semibold">{formatDate(currentListing.submittedDate)}</p>
                </Card>
                <Card className="p-4 border-border bg-background/50">
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  {getStatusBadge(currentListing.status)}
                </Card>
              </div>

              {/* Documents */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Documents ({currentListing.documentsUploaded}/{currentListing.documentsRequired})
                </h3>
                <div className="space-y-2">
                  {Array.from({ length: currentListing.documentsUploaded }).map((_, i) => (
                    <div
                      key={i}
                      className="p-3 rounded border border-border flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Document {i + 1}</span>
                      </div>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                  ))}
                  {currentListing.documentsRequired - currentListing.documentsUploaded > 0 && (
                    Array.from({
                      length:
                        currentListing.documentsRequired -
                        currentListing.documentsUploaded,
                    }).map((_, i) => (
                      <div
                        key={`missing-${i}`}
                        className="p-3 rounded border border-border flex items-center justify-between opacity-50"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Document {currentListing.documentsUploaded + i + 1}
                          </span>
                        </div>
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Review Notes */}
              <div>
                <h3 className="font-semibold mb-2">Review Notes</h3>
                <p className="text-sm text-muted-foreground p-3 rounded bg-background/50 border border-border">
                  {currentListing.reviewNotes || 'No notes yet.'}
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-4 border-t border-border">
                <div className="flex gap-2">
                  <Button
                    onClick={() => setActionType('approve')}
                    className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
                    disabled={
                      currentListing.documentsUploaded < currentListing.documentsRequired
                    }
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve Listing
                  </Button>
                  <Button
                    onClick={() => setActionType('reject')}
                    variant="destructive"
                    className="flex-1 gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </Button>
                </div>
                <Button
                  onClick={() => setActionType('more-docs')}
                  variant="outline"
                  className="w-full"
                >
                  Request More Documents
                </Button>
              </div>

              {/* Action Confirmation */}
              {actionType && (
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <p className="text-sm text-blue-900">
                    {actionType === 'approve'
                      ? 'Approve this listing for platform launch?'
                      : actionType === 'reject'
                      ? 'Reject this listing?'
                      : 'Request additional documents from the asset owner?'}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      className={
                        actionType === 'approve'
                          ? 'bg-green-600 hover:bg-green-700'
                          : actionType === 'reject'
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }
                    >
                      Confirm
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setActionType(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
