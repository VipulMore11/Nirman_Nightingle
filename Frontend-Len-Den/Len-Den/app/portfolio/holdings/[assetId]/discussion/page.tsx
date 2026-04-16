'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockAssets } from '@/lib/data/mockAssets';
import { currentUser } from '@/lib/data/mockUsers';
import { formatCurrency } from '@/lib/utils/formatters';
import {
  ArrowLeft,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Plus,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Shield,
  TrendingUp,
  Users,
  Send,
  ChevronDown,
  ChevronUp,
  Award,
  Wallet,
} from 'lucide-react';

/* ────────────────────────────────────────────
   Mock data shaped after the Django models:
   Company → Proposal → Comment / VoteRecord
   ──────────────────────────────────────────── */

interface Comment {
  id: string;
  author: string;
  authorAddress: string;
  content: string;
  createdAt: string;
  tokenBalance: number; // % holding
}

interface VoteRecord {
  voter: string;
  voterAddress: string;
  choice: 'YES' | 'NO';
  weight: number;
  txHash: string;
}

interface Proposal {
  id: string;
  title: string;
  description: string;
  proposer: string;
  proposerAddress: string;
  status: 'DRAFT' | 'DISCUSSION' | 'VOTING' | 'PASSED' | 'FAILED' | 'DIED' | 'VETOED';
  discussionEnd: string;
  votingStart: string;
  votingEnd: string;
  yesVotesWeight: number;
  noVotesWeight: number;
  quorumReached: boolean;
  extensionCount: number;
  comments: Comment[];
  voteRecords: VoteRecord[];
  createdAt: string;
}

function generateMockProposals(assetName: string): Proposal[] {
  return [
    {
      id: 'prop-001',
      title: 'Approve Annual Maintenance Budget FY 2025',
      description: `This proposal seeks approval for the annual maintenance and operating budget of ₹18,50,000 for ${assetName} for FY 2025–26. The budget covers structural upkeep, security systems, landscaping, utilities, and management fees. Detailed cost breakdown is available in the attached documents.`,
      proposer: 'LenDen Management',
      proposerAddress: '0x1234...ABCD',
      status: 'PASSED',
      discussionEnd: '2025-03-01',
      votingStart: '2025-03-02',
      votingEnd: '2025-03-09',
      yesVotesWeight: 68.4,
      noVotesWeight: 12.1,
      quorumReached: true,
      extensionCount: 0,
      createdAt: '2025-02-20',
      comments: [
        {
          id: 'c1',
          author: 'Rajesh Kumar',
          authorAddress: '0xAbCd...1234',
          content: 'The budget looks reasonable. Glad to see security upgrades included.',
          createdAt: '2025-02-22',
          tokenBalance: 8.0,
        },
        {
          id: 'c2',
          author: 'Priya Nair',
          authorAddress: '0xDeFa...5678',
          content: 'Can we get a breakdown of the management fees specifically? Seems high at first glance.',
          createdAt: '2025-02-24',
          tokenBalance: 5.5,
        },
        {
          id: 'c3',
          author: 'LenDen Management',
          authorAddress: '0x1234...ABCD',
          content: 'Management fees are 2% of total asset value, consistent with industry standard. Full breakdown shared in doc portal.',
          createdAt: '2025-02-25',
          tokenBalance: 15.0,
        },
      ],
      voteRecords: [
        { voter: 'Rajesh Kumar', voterAddress: '0xAbCd...1234', choice: 'YES', weight: 8.0, txHash: '0xabc123...' },
        { voter: 'Priya Nair', voterAddress: '0xDeFa...5678', choice: 'YES', weight: 5.5, txHash: '0xdef456...' },
        { voter: 'Ankit Shah', voterAddress: '0x9876...DCBA', choice: 'NO', weight: 6.2, txHash: '0xghi789...' },
      ],
    },
    {
      id: 'prop-002',
      title: 'elect New Property Manager — Request for Proposals',
      description: `The current property management contract with Urban Estates Pvt. Ltd. expires on June 30, 2025. This proposal initiates the selection process for a new property manager for ${assetName}. Token holders with ≥5% stake can nominate candidates. Final selection vote will occur after a 14-day discussion period.`,
      proposer: 'Ankit Shah',
      proposerAddress: '0x9876...DCBA',
      status: 'VOTING',
      discussionEnd: '2025-04-10',
      votingStart: '2025-04-11',
      votingEnd: '2025-04-18',
      yesVotesWeight: 34.2,
      noVotesWeight: 18.7,
      quorumReached: false,
      extensionCount: 1,
      createdAt: '2025-03-28',
      comments: [
        {
          id: 'c4',
          author: 'Rajesh Kumar',
          authorAddress: '0xAbCd...1234',
          content: 'I nominate PropNest Solutions — very professional firm with RERA accreditation.',
          createdAt: '2025-04-02',
          tokenBalance: 8.0,
        },
        {
          id: 'c5',
          author: 'Ankit Shah',
          authorAddress: '0x9876...DCBA',
          content: 'I will be providing a structured RFP document for all stakeholders by April 5th.',
          createdAt: '2025-04-01',
          tokenBalance: 7.8,
        },
      ],
      voteRecords: [
        { voter: 'Rajesh Kumar', voterAddress: '0xAbCd...1234', choice: 'YES', weight: 8.0, txHash: '0xjkl012...' },
      ],
    },
    {
      id: 'prop-003',
      title: 'Distribute Q1 2025 Rental Income as Dividend',
      description: `Total Q1 2025 rent collected: ₹4,20,000. After deducting 8% operating expenses, the distributable amount is ₹3,86,400. This proposal authorises the distribution of this amount pro-rata to all token holders of record as of April 15, 2025.`,
      proposer: 'LenDen Management',
      proposerAddress: '0x1234...ABCD',
      status: 'DISCUSSION',
      discussionEnd: '2025-04-25',
      votingStart: '2025-04-26',
      votingEnd: '2025-05-03',
      yesVotesWeight: 0,
      noVotesWeight: 0,
      quorumReached: false,
      extensionCount: 0,
      createdAt: '2025-04-16',
      comments: [
        {
          id: 'c6',
          author: 'Rajesh Kumar',
          authorAddress: '0xAbCd...1234',
          content: 'Strongly in favour. Transparent reporting of Q1 income is appreciated.',
          createdAt: '2025-04-16',
          tokenBalance: 8.0,
        },
      ],
      voteRecords: [],
    },
  ];
}

const STATUS_CONFIG: Record<
  Proposal['status'],
  { label: string; icon: React.ElementType; className: string }
> = {
  DRAFT:      { label: 'Draft',      icon: Clock,          className: 'bg-slate-100 text-slate-600' },
  DISCUSSION: { label: 'Discussion', icon: MessageSquare,   className: 'bg-blue-100 text-blue-700' },
  VOTING:     { label: 'Voting',     icon: Shield,          className: 'bg-orange-100 text-orange-700' },
  PASSED:     { label: 'Passed',     icon: CheckCircle,     className: 'bg-green-100 text-green-700' },
  FAILED:     { label: 'Failed',     icon: XCircle,         className: 'bg-red-100 text-red-700' },
  DIED:       { label: 'Died',       icon: AlertTriangle,   className: 'bg-red-100 text-red-600' },
  VETOED:     { label: 'Vetoed',     icon: XCircle,         className: 'bg-red-100 text-red-700' },
};

/* ── single proposal card ── */
function ProposalCard({
  proposal,
  userHolding,
  onVote,
  onComment,
}: {
  proposal: Proposal;
  userHolding: number; // % owned
  onVote: (proposalId: string, choice: 'YES' | 'NO') => void;
  onComment: (proposalId: string, text: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [hasVoted, setHasVoted] = useState(
    proposal.voteRecords.some((v) => v.voterAddress === '0xAbCd...1234')
  );

  const cfg = STATUS_CONFIG[proposal.status];
  const StatusIcon = cfg.icon;
  const totalVotes = proposal.yesVotesWeight + proposal.noVotesWeight;
  const yesPct = totalVotes > 0 ? (proposal.yesVotesWeight / totalVotes) * 100 : 0;
  const canComment = userHolding >= 5;
  const canVote = proposal.status === 'VOTING' && !hasVoted && userHolding > 0;

  function handleVote(choice: 'YES' | 'NO') {
    onVote(proposal.id, choice);
    setHasVoted(true);
  }

  function handleComment() {
    if (!commentText.trim()) return;
    onComment(proposal.id, commentText.trim());
    setCommentText('');
  }

  return (
    <Card className="border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex flex-wrap items-start gap-3 mb-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.className}`}>
            <StatusIcon className="w-3 h-3" />
            {cfg.label}
          </span>
          {proposal.extensionCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">
              Extended ×{proposal.extensionCount}
            </span>
          )}
          {proposal.quorumReached && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
              <CheckCircle className="w-3 h-3" /> Quorum Reached
            </span>
          )}
        </div>

        <h3 className="text-lg font-bold mb-1">{proposal.title}</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Proposed by <span className="font-mono">{proposal.proposerAddress}</span> ({proposal.proposer}) · {proposal.createdAt}
        </p>

        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{proposal.description}</p>

        {/* Timeline */}
        <div className="grid grid-cols-3 gap-3 mt-5 text-xs text-center">
          {[
            { label: 'Discussion ends', value: proposal.discussionEnd },
            { label: 'Voting starts', value: proposal.votingStart },
            { label: 'Voting ends', value: proposal.votingEnd },
          ].map(t => (
            <div key={t.label} className="rounded-lg bg-muted/50 border border-border p-2">
              <p className="text-muted-foreground mb-0.5">{t.label}</p>
              <p className="font-semibold">{t.value}</p>
            </div>
          ))}
        </div>

        {/* Vote tally */}
        {totalVotes > 0 && (
          <div className="mt-5">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-green-600 font-semibold">YES — {proposal.yesVotesWeight.toFixed(1)}% weight</span>
              <span className="text-red-500 font-semibold">NO — {proposal.noVotesWeight.toFixed(1)}% weight</span>
            </div>
            <div className="h-2.5 rounded-full bg-red-100 overflow-hidden">
              <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${yesPct}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{proposal.voteRecords.length} voters · {totalVotes.toFixed(1)}% total weight cast</p>
          </div>
        )}

        {/* Vote buttons */}
        {proposal.status === 'VOTING' && (
          <div className="mt-5 flex gap-3">
            {hasVoted ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-green-500" />
                You have voted on this proposal
              </div>
            ) : (
              <>
                <Button
                  className="flex-1 gap-2 bg-green-600 hover:bg-green-700 text-white"
                  disabled={!canVote}
                  onClick={() => handleVote('YES')}
                >
                  <ThumbsUp className="w-4 h-4" /> Vote YES
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 gap-2 border-red-400 text-red-600 hover:bg-red-50"
                  disabled={!canVote}
                  onClick={() => handleVote('NO')}
                >
                  <ThumbsDown className="w-4 h-4" /> Vote NO
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Expand / collapse comments & votes */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-6 py-3 border-t border-border hover:bg-muted/40 text-sm text-muted-foreground transition-colors"
      >
        <span className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          {proposal.comments.length} comments · {proposal.voteRecords.length} votes
        </span>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {expanded && (
        <div className="border-t border-border p-6 space-y-6">

          {/* Comments list */}
          <div>
            <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-accent" /> Discussion Comments
            </h4>
            {proposal.comments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No comments yet. Be the first to comment (≥5% holding required).</p>
            ) : (
              <div className="space-y-4">
                {proposal.comments.map(c => (
                  <div key={c.id} className="flex gap-3">
                    <div className="w-9 h-9 rounded-full bg-accent/15 flex items-center justify-center text-xs font-bold text-accent shrink-0">
                      {c.author.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold">{c.author}</span>
                        <span className="font-mono text-xs text-muted-foreground">{c.authorAddress}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-accent/10 text-accent font-semibold">{c.tokenBalance}% stake</span>
                        <span className="text-xs text-muted-foreground ml-auto">{c.createdAt}</span>
                      </div>
                      <p className="text-sm text-foreground bg-muted/40 rounded-xl px-4 py-2.5">{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add comment */}
            {canComment ? (
              <div className="mt-4 flex gap-3">
                <div className="w-9 h-9 rounded-full bg-accent/15 flex items-center justify-center text-xs font-bold text-accent shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="flex-1 flex gap-2">
                  <input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleComment()}
                    placeholder="Share your thoughts…"
                    className="flex-1 px-4 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <Button size="sm" className="gap-1.5 bg-accent hover:bg-accent/90" onClick={handleComment} disabled={!commentText.trim()}>
                    <Send className="w-3.5 h-3.5" /> Send
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-4 p-3 rounded-lg bg-orange-50 border border-orange-200 text-xs text-orange-700 flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 shrink-0" />
                You need ≥5% token holding to comment on proposals.
              </div>
            )}
          </div>

          {/* Vote records */}
          {proposal.voteRecords.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-accent" /> On-chain Vote Records
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {['Voter', 'Address', 'Vote', 'Weight (%)', 'Tx Hash'].map(h => (
                        <th key={h} className="text-left py-2 px-3 text-xs text-muted-foreground font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {proposal.voteRecords.map((v, i) => (
                      <tr key={i} className="hover:bg-muted/40">
                        <td className="py-2.5 px-3 font-medium">{v.voter}</td>
                        <td className="py-2.5 px-3 font-mono text-xs text-muted-foreground">{v.voterAddress}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${v.choice === 'YES' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                            {v.choice}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">{v.weight}%</td>
                        <td className="py-2.5 px-3 font-mono text-xs text-muted-foreground">{v.txHash}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

/* ── Main Discussion Page ── */
export default function DiscussionPage() {
  const params = useParams();
  const router = useRouter();
  const assetId = params.assetId as string;

  const asset = mockAssets.find((a) => a.id === assetId);
  const holding = currentUser.portfolio.find((h) => h.assetId === assetId);

  const [proposals, setProposals] = useState<Proposal[]>(
    asset ? generateMockProposals(asset.name) : []
  );
  const [filter, setFilter] = useState<'ALL' | Proposal['status']>('ALL');
  const [showNewForm, setShowNewForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  if (!asset) {
    return (
      <div className="p-8 text-center">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <p className="text-muted-foreground">Asset not found</p>
      </div>
    );
  }

  const ownershipPct = holding ? (holding.unitsOwned / asset.totalUnits) * 100 : 0;

  function handleVote(proposalId: string, choice: 'YES' | 'NO') {
    setProposals(prev =>
      prev.map(p => {
        if (p.id !== proposalId) return p;
        const newRec: VoteRecord = {
          voter: currentUser.name,
          voterAddress: '0xAbCd...1234',
          choice,
          weight: ownershipPct,
          txHash: `0x${Math.random().toString(16).slice(2, 12)}...`,
        };
        return {
          ...p,
          yesVotesWeight: choice === 'YES' ? p.yesVotesWeight + ownershipPct : p.yesVotesWeight,
          noVotesWeight: choice === 'NO' ? p.noVotesWeight + ownershipPct : p.noVotesWeight,
          voteRecords: [...p.voteRecords, newRec],
        };
      })
    );
  }

  function handleComment(proposalId: string, text: string) {
    setProposals(prev =>
      prev.map(p => {
        if (p.id !== proposalId) return p;
        const newComment: Comment = {
          id: `c-${Date.now()}`,
          author: currentUser.name,
          authorAddress: '0xAbCd...1234',
          content: text,
          createdAt: new Date().toISOString().slice(0, 10),
          tokenBalance: parseFloat(ownershipPct.toFixed(2)),
        };
        return { ...p, comments: [...p.comments, newComment] };
      })
    );
  }

  function handleCreateProposal() {
    if (!newTitle.trim() || !newDesc.trim()) return;
    const np: Proposal = {
      id: `prop-${Date.now()}`,
      title: newTitle.trim(),
      description: newDesc.trim(),
      proposer: currentUser.name,
      proposerAddress: '0xAbCd...1234',
      status: 'DISCUSSION',
      discussionEnd: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      votingStart: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
      votingEnd: new Date(Date.now() + 22 * 86400000).toISOString().slice(0, 10),
      yesVotesWeight: 0,
      noVotesWeight: 0,
      quorumReached: false,
      extensionCount: 0,
      createdAt: new Date().toISOString().slice(0, 10),
      comments: [],
      voteRecords: [],
    };
    setProposals(prev => [np, ...prev]);
    setNewTitle('');
    setNewDesc('');
    setShowNewForm(false);
  }

  const filtered = filter === 'ALL' ? proposals : proposals.filter(p => p.status === filter);
  const FILTERS: Array<{ id: 'ALL' | Proposal['status']; label: string }> = [
    { id: 'ALL', label: 'All' },
    { id: 'DISCUSSION', label: 'Discussion' },
    { id: 'VOTING', label: 'Voting' },
    { id: 'PASSED', label: 'Passed' },
    { id: 'FAILED', label: 'Failed' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">

      {/* Back */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2 text-muted-foreground hover:text-foreground -ml-2">
          <ArrowLeft className="w-4 h-4" /> Back to Holding
        </Button>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="w-5 h-5 text-accent" />
            <h1 className="text-2xl font-bold">Governance & Discussion</h1>
          </div>
          <p className="text-muted-foreground text-sm">{asset.name} — Proposals, votes &amp; token-holder discussions</p>
        </div>
        {ownershipPct >= 5 && (
          <Button className="gap-2 bg-accent hover:bg-accent/90 shrink-0" onClick={() => setShowNewForm(!showNewForm)}>
            <Plus className="w-4 h-4" />
            New Proposal
          </Button>
        )}
      </div>

      {/* Your governance snapshot */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { icon: Award, label: 'Your Stake', value: `${ownershipPct.toFixed(4)}%`, color: 'accent' },
          { icon: Wallet, label: 'Units Held', value: holding?.unitsOwned.toLocaleString() ?? '—', color: 'blue' },
          { icon: TrendingUp, label: 'Voting Weight', value: ownershipPct >= 5 ? `${ownershipPct.toFixed(2)}%` : 'Below threshold', color: 'green' },
          { icon: Users, label: 'Total Proposals', value: proposals.length.toString(), color: 'purple' },
        ].map(s => (
          <Card key={s.label} className="p-4 border-border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <p className="font-bold text-sm">{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Info banner for low-stake holders */}
      {ownershipPct < 5 && (
        <div className="mb-6 p-4 rounded-xl bg-orange-50 border border-orange-200 flex gap-3">
          <Shield className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
          <p className="text-sm text-orange-800">
            You hold <strong>{ownershipPct.toFixed(4)}%</strong> of this asset. You need ≥5% to comment or vote on proposals. You can still view all discussions.
          </p>
        </div>
      )}

      {/* New proposal form */}
      {showNewForm && (
        <Card className="p-6 border-accent/30 border-2 bg-card mb-6 space-y-4">
          <h3 className="font-bold text-lg flex items-center gap-2"><Plus className="w-4 h-4 text-accent" /> Create New Proposal</h3>
          <div className="space-y-2">
            <label className="text-sm font-medium">Proposal Title</label>
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Approve Q2 maintenance spend"
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              rows={5}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Provide a detailed description of the proposal…"
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
            />
          </div>
          <div className="flex gap-3">
            <Button onClick={handleCreateProposal} disabled={!newTitle.trim() || !newDesc.trim()} className="bg-accent hover:bg-accent/90 gap-2">
              <Send className="w-4 h-4" /> Submit Proposal
            </Button>
            <Button variant="outline" onClick={() => setShowNewForm(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto border-b border-border">
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${filter === f.id ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            {f.label}
            {f.id !== 'ALL' && (
              <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full bg-muted">{proposals.filter(p => p.status === f.id).length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Proposal list */}
      <div className="space-y-5">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No proposals in this category yet.</p>
          </div>
        ) : (
          filtered.map(p => (
            <ProposalCard
              key={p.id}
              proposal={p}
              userHolding={ownershipPct}
              onVote={handleVote}
              onComment={handleComment}
            />
          ))
        )}
      </div>
    </div>
  );
}
