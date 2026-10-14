import React, { useState } from 'react';
import {
  FileText,
  Upload,
  X,
  Eye,
  Download,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Calendar,
  Clock,
  User
} from 'lucide-react';
import { PaymentProof } from '../../types';
import { formatDateTime, formatFileSize } from '../../utils/formatters';

interface PaymentProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  referenceNumber: string;
  proof?: PaymentProof;
  onUploadProof?: (proof: PaymentProof) => void;
  readOnly?: boolean;
  currentUserName: string;
  currentUserId: string;
}

export const PaymentProofModal: React.FC<PaymentProofModalProps> = ({
  isOpen,
  onClose,
  title,
  referenceNumber,
  proof,
  onUploadProof,
  readOnly = false,
  currentUserName,
  currentUserId
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(proof?.dataUrl || null);
  const [fileType, setFileType] = useState<string>(proof?.fileType || '');
  const [fileName, setFileName] = useState<string>(proof?.fileName || '');
  const [fileSize, setFileSize] = useState<number>(proof?.fileSize || 0);
  const [proofNotes, setProofNotes] = useState<string>(proof?.notes || '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);

  if (!isOpen) return null;

  const validateAndProcessFile = (file: File) => {
    setErrorMsg(null);
    const validMimes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validMimes.includes(file.type)) {
      setErrorMsg('Invalid file format. Please upload JPG, PNG or PDF.');
      return;
    }

    // 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('File size exceeds 10MB limit.');
      return;
    }

    setSelectedFile(file);
    setFileName(file.name);
    setFileSize(file.size);
    setFileType(file.type);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const handleSaveUpload = () => {
    if (!previewUrl || !fileName) {
      setErrorMsg('Please select a receipt or payment document first.');
      return;
    }

    if (!onUploadProof) return;

    const newProof: PaymentProof = {
      id: proof?.id || `proof-${Date.now()}`,
      fileName,
      fileType,
      fileSize,
      dataUrl: previewUrl,
      uploadedBy: currentUserId,
      uploadedByName: currentUserName,
      uploadedAt: new Date().toISOString(),
      notes: proofNotes
    };

    onUploadProof(newProof);
    onClose();
  };

  const handleDownload = () => {
    const url = previewUrl || proof?.dataUrl;
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || proof?.fileName || 'payment_proof.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const activeProof = proof || (previewUrl ? {
    fileName,
    fileType,
    fileSize,
    uploadedByName: currentUserName,
    uploadedAt: new Date().toISOString(),
    notes: proofNotes
  } : null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#202321]/50 p-4 backdrop-blur-2xs font-sans">
      <div className="w-full max-w-lg rounded-lg border border-[#DCDDD9] bg-white p-5 shadow-2xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#DCDDD9] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded bg-[#E8F0EC] text-[#1B4D3E]">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#202321]">{title}</h3>
              <p className="text-xs text-[#6B706D] font-mono">
                Ref: {referenceNumber}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-[#6B706D] hover:bg-[#F5F5F3] hover:text-[#202321]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-3 rounded border border-[#FECACA] bg-[#FEE2E2] p-2.5 text-xs text-[#DC2626] flex items-center gap-2 font-medium">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
          {/* If proof already exists or is selected */}
          {activeProof && (activeProof.fileName || previewUrl) ? (
            <div className="rounded border border-[#DCDDD9] bg-[#FAFAF9] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#202321]">
                  Verified Payment Document
                </span>
                <span className="rounded bg-[#DCFCE7] px-2 py-0.5 text-[10px] font-bold text-[#15803D] uppercase">
                  Attached to Transaction
                </span>
              </div>

              {/* Preview Thumbnail */}
              <div className="rounded border border-[#DCDDD9] bg-white p-2 flex items-center justify-center min-h-[160px] max-h-[220px] overflow-hidden">
                {activeProof.fileType?.includes('pdf') ? (
                  <div className="text-center p-4">
                    <FileText className="h-12 w-12 mx-auto text-[#DC2626] mb-1" />
                    <span className="font-bold text-xs text-[#202321] block">
                      {activeProof.fileName}
                    </span>
                    <span className="text-[10px] text-[#6B706D]">
                      PDF Document ({formatFileSize(activeProof.fileSize)})
                    </span>
                  </div>
                ) : (
                  <img
                    src={previewUrl || proof?.dataUrl}
                    alt="Payment receipt proof"
                    className="max-h-[200px] w-auto object-contain rounded cursor-pointer hover:opacity-90"
                    onClick={() => setIsFullscreenPreview(true)}
                  />
                )}
              </div>

              {/* Upload Meta details */}
              <div className="rounded border border-[#DCDDD9] bg-white p-2.5 space-y-1.5 text-[11px]">
                <div className="flex justify-between items-center">
                  <span className="text-[#6B706D]">File Name:</span>
                  <span className="font-mono font-semibold text-[#202321] truncate max-w-[200px]">
                    {activeProof.fileName}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#6B706D]">File Size:</span>
                  <span className="font-mono text-[#202321]">
                    {formatFileSize(activeProof.fileSize)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#6B706D]">Uploaded By:</span>
                  <span className="font-semibold text-[#1B4D3E]">
                    {activeProof.uploadedByName || currentUserName}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#6B706D]">Uploaded Date & Time:</span>
                  <span className="font-mono text-[#202321]">
                    {formatDateTime(activeProof.uploadedAt)}
                  </span>
                </div>
              </div>

              {/* Actions on attached proof */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsFullscreenPreview(true)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded border border-[#DCDDD9] bg-white py-1.5 text-xs font-semibold text-[#202321] hover:bg-[#F5F5F3]"
                >
                  <Eye className="h-3.5 w-3.5 text-[#1B4D3E]" />
                  <span>View Fullscreen</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded bg-[#1B4D3E] py-1.5 text-xs font-semibold text-white hover:bg-[#153E32]"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download File</span>
                </button>
              </div>
            </div>
          ) : null}

          {/* Upload Input Area if not read-only */}
          {!readOnly && (
            <div className="space-y-3">
              <label className="text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider block">
                {activeProof?.fileName ? 'Replace / Upload New Proof' : 'Upload Payment Receipt Proof *'}
              </label>

              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-all ${
                  dragActive
                    ? 'border-[#1B4D3E] bg-[#E8F0EC]'
                    : 'border-[#DCDDD9] bg-[#FAFAF9] hover:bg-white'
                }`}
              >
                <Upload className="h-8 w-8 text-[#6B706D] mb-2" />
                <p className="text-xs font-semibold text-[#202321]">
                  Drag and drop receipt, or <label htmlFor="file-upload" className="text-[#1B4D3E] font-bold cursor-pointer underline">browse</label>
                </p>
                <p className="text-[10px] text-[#6B706D] mt-1">
                  Supported formats: JPG, PNG, PDF (Max 10MB)
                </p>
                <p className="text-[10px] text-[#6B706D]">
                  e.g. Bank transfer slip, JazzCash / EasyPaisa screenshot, ATM receipt
                </p>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,application/pdf"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider block mb-1">
                  Payment Verification Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bank Alfalah Txn #TRX-94821, verified with branch"
                  value={proofNotes}
                  onChange={e => setProofNotes(e.target.value)}
                  className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 text-xs text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-3 border-t border-[#DCDDD9] mt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold text-[#6B706D] hover:text-[#202321]"
          >
            {readOnly ? 'Close' : 'Cancel'}
          </button>
          {!readOnly && selectedFile && (
            <button
              type="button"
              onClick={handleSaveUpload}
              className="rounded bg-[#1B4D3E] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#153E32] transition-colors shadow-xs"
            >
              Attach Payment Proof
            </button>
          )}
        </div>
      </div>

      {/* Fullscreen Preview Modal */}
      {isFullscreenPreview && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg p-2 overflow-auto">
            <button
              type="button"
              onClick={() => setIsFullscreenPreview(false)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black"
            >
              <X className="h-5 w-5" />
            </button>
            {activeProof?.fileType?.includes('pdf') ? (
              <iframe
                src={previewUrl || proof?.dataUrl}
                title="Payment Proof PDF"
                className="w-[80vw] h-[80vh] border-0"
              />
            ) : (
              <img
                src={previewUrl || proof?.dataUrl}
                alt="Payment receipt proof"
                className="max-h-[85vh] w-auto mx-auto object-contain rounded"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
