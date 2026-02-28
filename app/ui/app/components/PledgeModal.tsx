'use client';

import { useEffect, useState } from 'react';

type Reward = {
  id: number;
  amount: number;
  title: string;
};

type Props = {
  reward: Reward;
  onClose: () => void;
};

type EscrowResult = { id: number; type: string; amount_xrp: number; sequence: number };

const LS_KEY = 'xrp_user';
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5001';

export default function PledgeModal({ reward, onClose }: Props) {
  const [walletSeed, setWalletSeed]   = useState<string | null>(null);
  const [userId, setUserId]           = useState<number | null>(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [escrows, setEscrows]         = useState<EscrowResult[] | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LS_KEY);
      if (stored) {
        const user = JSON.parse(stored);
        setWalletSeed(user.user_wallet_seed ?? null);
        setUserId(user.id ?? null);
      }
    } catch { /* ignore */ }
  }, []);

  const half = reward.amount / 2;

  async function handleConfirm() {
    if (!walletSeed) {
      setError('No wallet found — please sign in first.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/escrow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: 1,
          user_id: userId,
          user_wallet_seed: walletSeed,
          amount: reward.amount,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setEscrows(data.escrows);
      } else {
        setError(data.error ?? 'Escrow creation failed.');
      }
    } catch {
      setError('Could not reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={escrows ? undefined : onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* ── SUCCESS STATE ── */}
        {escrows ? (
          <div className="text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-extrabold text-green-950 text-xl">Escrows Created!</h2>
            <p className="text-sm text-gray-500">Your pledge of {reward.amount} XRP has been locked into escrow on the XRP Ledger.</p>
            <div className="bg-green-50 border border-green-100 rounded-xl divide-y divide-green-100 text-sm text-left">
              {escrows.map((e) => (
                <div key={e.id} className="px-4 py-3 flex justify-between">
                  <div>
                    <p className="font-semibold text-green-950 capitalize">{e.type.replace('_', '-')} escrow</p>
                    <p className="text-xs text-gray-400 mt-0.5">Sequence #{e.sequence}</p>
                  </div>
                  <span className="font-bold text-green-700">{e.amount_xrp} XRP</span>
                </div>
              ))}
            </div>
            <button
              onClick={onClose}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-full text-sm transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-full bg-green-500 flex-shrink-0" />
              <h2 className="font-bold text-green-950 text-lg">Confirm Pledge</h2>
            </div>
            <p className="text-sm text-gray-500 mb-6">{reward.title}</p>

            {/* Wallet */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-6">
              <p className="text-xs text-gray-400 mb-0.5">Wallet</p>
              <p className="text-sm font-mono text-gray-800 truncate">
                {walletSeed ?? <span className="italic text-gray-400">Not logged in</span>}
              </p>
            </div>

            {/* Pledge amount */}
            <div className="text-center mb-6">
              <p className="text-4xl font-extrabold text-green-700 mb-1">
                {reward.amount.toLocaleString()} XRP
              </p>
              <p className="text-sm font-semibold text-gray-500">Total pledge</p>
            </div>

            {/* Escrow breakdown */}
            <div className="bg-green-50 border border-green-100 rounded-xl divide-y divide-green-100 mb-6 text-sm">
              <div className="flex justify-between items-center px-4 py-3">
                <div>
                  <p className="font-semibold text-green-950">Fund-reaching escrow</p>
                  <p className="text-xs text-gray-500 mt-0.5">Released when funding goal is met</p>
                </div>
                <span className="font-bold text-green-700 flex-shrink-0 ml-4">{half.toLocaleString()} XRP</span>
              </div>
              <div className="flex justify-between items-center px-4 py-3">
                <div>
                  <p className="font-semibold text-green-950">On-shipment escrow</p>
                  <p className="text-xs text-gray-500 mt-0.5">Released when reward is delivered</p>
                </div>
                <span className="font-bold text-green-700 flex-shrink-0 ml-4">{half.toLocaleString()} XRP</span>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
                {error}
              </p>
            )}

            {/* Actions */}
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-bold py-3 rounded-full text-sm transition-colors mb-2"
            >
              {loading ? 'Submitting to XRP Ledger…' : 'Confirm pledge'}
            </button>
            <button
              onClick={onClose}
              disabled={loading}
              className="w-full border border-gray-200 hover:border-gray-300 text-gray-500 font-semibold py-2.5 rounded-full text-sm transition-colors"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}
