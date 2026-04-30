'use client';

/**
 * components/console/panels/QRPanel.js
 *
 * Generates QR codes pointing at the hotel's public menu URL.
 * Uses the free QRCode.js-compatible API via canvas approach.
 * Stores generated QRs in Supabase qr_codes table for history.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  QrCode, Download, Trash2, Plus, Loader2,
  ExternalLink, Copy, Check, Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getSupabaseClient } from '../../../lib/supabase/client';
import { useApp } from '../../../context/AppContext';
import { Card, Button, EmptyState, Alert, Badge, Select } from '../../shared/ui';

// Simple QR generation using a free public API
function qrUrl(text, size = 256) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&color=000000&bgcolor=ffffff&qzone=2&format=png`;
}

function QRCard({ qr, onDelete }) {
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(qr.target_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Copy failed');
    }
  }

  async function download() {
    try {
      const res = await fetch(qrUrl(qr.target_url, 512));
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scanify-qr-${qr.label || 'menu'}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Download failed');
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this QR code?')) return;
    setDeleting(true);
    await onDelete(qr.id);
    setDeleting(false);
  }

  return (
    <Card className="flex flex-col items-center gap-4 text-center">
      <div className="w-full flex items-center justify-between">
        <div className="text-left">
          <p className="text-sm font-semibold text-theme">{qr.label || 'Menu QR'}</p>
          <p className="text-xs text-theme2 truncate max-w-[160px]">{qr.target_url}</p>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 transition"
        >
          {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
        </button>
      </div>

      <img
        src={qrUrl(qr.target_url)}
        alt="QR Code"
        className="w-40 h-40 rounded-xl border"
        style={{ borderColor: 'var(--border)' }}
      />

      <div className="flex gap-2 w-full">
        <Button variant="secondary" size="sm" className="flex-1" onClick={copy}>
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? 'Copied' : 'Copy URL'}
        </Button>
        <Button variant="primary" size="sm" className="flex-1" onClick={download}>
          <Download size={13} /> Download
        </Button>
      </div>

      <p className="text-xs text-theme2">
        Created {new Date(qr.created_at).toLocaleDateString()}
      </p>
    </Card>
  );
}

export default function QRPanel() {
  const { hotel, plan, limits } = useApp();
  const supabase = getSupabaseClient();
  const [qrCodes, setQrCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [label, setLabel] = useState('');

  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'scanify.co.in';
  const menuUrl = hotel?.slug ? `https://${hotel.slug}.${appDomain}` : null;

  const isAtLimit = qrCodes.length >= (limits.qrCodes ?? 1);

  const loadQRs = useCallback(async () => {
    if (!hotel?.id) return;
    try {
      const { data, error } = await supabase
        .from('qr_codes')
        .select('id, label, target_url, created_at')
        .eq('hotel_id', hotel.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setQrCodes(data ?? []);
    } catch (err) {
      toast.error('Failed to load QR codes');
    } finally {
      setLoading(false);
    }
  }, [hotel?.id, supabase]);

  useEffect(() => { loadQRs(); }, [loadQRs]);

  async function generate() {
    if (!menuUrl) { toast.error('No menu URL found — complete onboarding first'); return; }
    if (isAtLimit) { toast.error(`QR code limit reached for ${plan} plan`); return; }

    setGenerating(true);
    try {
      const { data, error } = await supabase
        .from('qr_codes')
        .insert({
          hotel_id: hotel.id,
          label: label.trim() || 'Menu QR',
          target_url: menuUrl,
        })
        .select()
        .single();
      if (error) throw error;
      setQrCodes((prev) => [data, ...prev]);
      setLabel('');
      toast.success('QR code generated');
    } catch (err) {
      toast.error(err.message || 'Failed to generate QR');
    } finally {
      setGenerating(false);
    }
  }

  async function deleteQR(id) {
    try {
      const { error } = await supabase.from('qr_codes').delete().eq('id', id);
      if (error) throw error;
      setQrCodes((prev) => prev.filter((q) => q.id !== id));
      toast.success('QR code deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-syne font-bold text-2xl text-theme">QR Codes</h1>
        <p className="text-sm text-theme2 mt-0.5">
          {qrCodes.length} / {limits.qrCodes === Infinity ? '∞' : limits.qrCodes} generated
        </p>
      </div>

      {/* Generate form */}
      <Card>
        <p className="text-sm font-semibold text-theme mb-3">Generate New QR Code</p>
        {menuUrl ? (
          <>
            <div className="flex gap-2 mb-3">
              <input
                placeholder="Label (e.g. Table 4, Takeaway)"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && generate()}
                className="flex-1 px-4 py-2.5 rounded-xl border bg-card text-theme text-sm placeholder:text-theme2 outline-none focus:ring-2 focus:ring-[var(--accent)]/30 transition"
                style={{ borderColor: 'var(--border)' }}
                disabled={isAtLimit}
              />
              <Button
                variant="primary"
                loading={generating}
                onClick={generate}
                disabled={isAtLimit}
              >
                <Plus size={15} /> Generate
              </Button>
            </div>
            <p className="text-xs text-theme2">
              Points to: <code className="font-mono">{menuUrl}</code>
            </p>
          </>
        ) : (
          <Alert type="warning" title="No menu URL" message="Complete onboarding to get your menu URL, then generate QR codes." />
        )}
      </Card>

      {/* Limit warning */}
      {isAtLimit && plan === 'free' && (
        <Alert
          type="info"
          title="QR code limit reached on Free plan"
          message="Upgrade to Starter for up to 10 QR codes or Pro for unlimited."
          action={
            <button className="flex-shrink-0 flex items-center gap-1 text-xs font-bold" style={{ color: 'var(--accent)' }}>
              <Zap size={12} /> Upgrade
            </button>
          }
        />
      )}

      {/* QR grid */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 size={24} className="animate-spin" style={{ color: 'var(--accent)' }} />
        </div>
      ) : qrCodes.length === 0 ? (
        <EmptyState
          icon={QrCode}
          title="No QR codes yet"
          description="Generate your first QR code and place it on tables, menus, or marketing materials."
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {qrCodes.map((qr) => (
            <QRCard key={qr.id} qr={qr} onDelete={deleteQR} />
          ))}
        </div>
      )}
    </div>
  );
}