'use client';

import { useEffect, useRef, useState } from 'react';

type Reward = {
  id: number;
  amount: number;
  title: string;
};

type Props = {
  reward: Reward;
  onClose: () => void;
};

type XamanPayload = {
  uuid: string;
  type: string;
  amount_xrp: number;
  qr_url: string;
  ws_url: string;
  sign_url: string;
};

type ConfirmedEscrow = {
  id: number;
  type: string;
  amount_xrp: number;
  sequence: number | null;
  txid: string;
};

type Stage = 'confirm' | 'loading' | 'sign-1' | 'sign-2' | 'success';

const LS_KEY  = 'xrp_user';
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5001';

export default function PledgeModal({ reward, onClose }: Props) {
  const [userId, setUserId]       = useState<number | null>(null);
  const [stage, setStage]         = useState<Stage>('confirm');
  const [error, setError]         = useState('');
  const [payloads, setPayloads]   = useState<XamanPayload[]>([]);
  const [confirmed, setConfirmed] = useState<ConfirmedEscrow[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LS_KEY);
      if (stored) {
        const user = JSON.parse(stored);
        setUserId(user.id ?? null);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    return () => { wsRef.current?.close(); };
  }, []);

  const half = reward.amount / 2;

  async function handleConfirm() {
    setStage('loading');
    setError('');
    try {
      const res = await fetch(`${API_URL}/escrow/payload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: 1,
          user_id: userId,
          amount: reward.amount,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to create payloads.');
        setStage('confirm');
        return;
      }
      setPayloads(data.payloads);
      setStage('sign-1');
      connectWs(data.payloads[0], 0, data.payloads);
    } catch {
      setError('Could not reach the server. Please try again.');
      setStage('confirm');
    }
  }

  function connectWs(payload: XamanPayload, index: number, allPayloads: XamanPayload[]) {
    wsRef.current?.close();
    const ws = new WebSocket(payload.ws_url);
    wsRef.current = ws;

    ws.onmessage = async (event) => {
      let msg: Record<string, unknown>;
      try { msg = JSON.parse(event.data as string); } catch { return; }

      if (msg.signed === true) {
        ws.close();
        try {
          const res = await fetch(`${API_URL}/escrow/confirm`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uuid: payload.uuid }),
          });
          const data = await res.json();
          if (!res.ok) {
            setError(data.error ?? 'Confirmation failed.');
            return;
          }
          setConfirmed(prev => [...prev, data]);
          if (index === 0) {
            setStage('sign-2');
            connectWs(allPayloads[1], 1, allPayloads);
          } else {
            setStage('success');
          }
        } catch {
          setError('Could not confirm escrow. Please try again.');
        }
      }

      if (msg.expired === true) {
        ws.close();
        setError('Signing request expired. Please try again.');
        setStage('confirm');
      }
    };
  }

  const currentPayload = stage === 'sign-1' ? payloads[0] : stage === 'sign-2' ? payloads[1] : null;
  const stepNum        = stage === 'sign-2' ? 2 : 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={stage === 'success' ? undefined : onClose}
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

        {/* ── SUCCESS ── */}
        {stage === 'success' && (
          <div className="text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-extrabold text-green-950 text-xl">Escrows Created!</h2>
            <p className="text-sm text-gray-500">
              Your pledge of {reward.amount} XRP has been locked into escrow on the XRP Ledger.
            </p>
            <div className="bg-green-50 border border-green-100 rounded-xl divide-y divide-green-100 text-sm text-left">
              {confirmed.map((e) => (
                <div key={e.id} className="px-4 py-3 flex justify-between">
                  <div>
                    <p className="font-semibold text-green-950 capitalize">{e.type.replace('_', '-')} escrow</p>
                    {e.sequence != null && (
                      <p className="text-xs text-gray-400 mt-0.5">Sequence #{e.sequence}</p>
                    )}
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
        )}

        {/* ── XAMAN SIGNING ── */}
        {(stage === 'sign-1' || stage === 'sign-2') && currentPayload && (
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-500 flex-shrink-0" />
              <h2 className="font-bold text-gray-900 text-lg">Sign in Xaman</h2>
            </div>
            <p className="text-xs text-gray-400">
              Step {stepNum} of 2 — {currentPayload.type.replace('_', '-')} escrow ({currentPayload.amount_xrp} XRP)
            </p>
            {/* Step dots */}
            <div className="flex justify-center gap-2">
              <div className={`w-2 h-2 rounded-full ${stepNum >= 1 ? 'bg-blue-500' : 'bg-gray-200'}`} />
              <div className={`w-2 h-2 rounded-full ${stepNum >= 2 ? 'bg-blue-500' : 'bg-gray-200'}`} />
            </div>
            {/* QR */}
            <div className="flex justify-center">
              <img
                src={currentPayload.qr_url}
                alt="Scan with Xaman"
                className="w-48 h-48 rounded-xl border border-gray-200"
              />
            </div>
            <p className="text-xs text-gray-500">Scan with your Xaman app or tap below</p>
            <a
              href={currentPayload.sign_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-full text-sm transition-colors"
            >
              Open in Xaman
            </a>
            <p className="text-xs text-gray-400 animate-pulse">Waiting for signature…</p>
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
          </div>
        )}

        {/* ── LOADING ── */}
        {stage === 'loading' && (
          <div className="text-center space-y-4 py-6">
            <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-gray-500">Creating escrow payloads…</p>
          </div>
        )}

        {/* ── CONFIRM ── */}
        {stage === 'confirm' && (
          <>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-full bg-green-500 flex-shrink-0" />
              <h2 className="font-bold text-green-950 text-lg">Confirm Pledge</h2>
            </div>
            <p className="text-sm text-gray-500 mb-6">{reward.title}</p>

            <div className="text-center mb-6">
              <p className="text-4xl font-extrabold text-green-700 mb-1">
                {reward.amount.toLocaleString()} XRP
              </p>
              <p className="text-sm font-semibold text-gray-500">Total pledge</p>
            </div>

            <div className="bg-green-50 border border-green-100 rounded-xl divide-y divide-green-100 mb-4 text-sm">
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

            <p className="text-xs text-gray-400 text-center mb-4">
              You will sign 2 transactions in your Xaman wallet
            </p>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
                {error}
              </p>
            )}

            <button
              onClick={handleConfirm}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-full text-sm transition-colors mb-2"
            >
              Confirm pledge
            </button>
            <button
              onClick={onClose}
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
