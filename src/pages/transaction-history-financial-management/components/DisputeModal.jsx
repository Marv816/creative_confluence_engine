import { X, AlertTriangle, Upload } from 'lucide-react';
import { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import paymentService from '../../../services/paymentService';

export default function DisputeModal({ transaction, onClose, onSuccess }) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [evidenceUrls, setEvidenceUrls] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!reason?.trim()) {
      setError('Please provide a reason for the dispute');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await paymentService?.createDispute({
        transactionId: transaction?.id,
        purchaseId: transaction?.purchaseId,
        producerId: transaction?.producerId,
        reason,
        description,
        evidenceUrls
      });

      onSuccess();
    } catch (err) {
      setError(err?.message || 'Failed to create dispute');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 border border-white/10 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-orange-500" />
            </div>
            <h2 className="text-2xl font-bold text-white">Initiate Dispute</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Transaction Info */}
          <div className="mb-6 p-4 bg-white/5 rounded-lg">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Transaction Details</h3>
            <div className="space-y-1">
              <p className="text-white font-medium">{transaction?.sound?.title}</p>
              <p className="text-gray-400 text-sm">Amount: ${transaction?.amount?.toFixed(2)}</p>
              <p className="text-gray-400 text-sm">
                Date: {new Date(transaction?.createdAt)?.toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Dispute Reason */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-400 mb-2 block">
              Reason for Dispute *
            </label>
            <Input
              type="text"
              value={reason}
              onChange={(e) => setReason(e?.target?.value)}
              placeholder="e.g., File not received, Quality issues, Wrong license"
              className="w-full bg-white/5 border-white/10 text-white"
              required
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-400 mb-2 block">
              Detailed Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e?.target?.value)}
              placeholder="Provide detailed information about the issue..."
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Evidence Upload Note */}
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex gap-3">
              <Upload className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-400 text-sm font-medium mb-1">Evidence Upload</p>
                <p className="text-gray-400 text-xs">
                  After submitting, you can upload evidence files through the dispute management interface.
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1 text-white border-white/10"
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-orange-500 text-white hover:bg-orange-400 font-bold"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Dispute'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}