'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';

// ─── Project data ─────────────────────────────────────────────────────────────

const PROJECT = {
  title: 'Compact USB Wallet',
  creator: 'Crypto Collective',
  category: 'Crypto-Lifestyle',
  blurb: 'Be independent of the internet with state-of-the-art portable hardware wallets — your crypto, your keys, your rules.',
  raised: 87400,
  goal: 120000,
  backers: 742,
  daysLeft: 18,
  badge: 'Staff Pick',
  image: 'https://article.images.consumerreports.org/image/upload/t_article_tout/v1649086446/prod/content/dam/CRO-Images-2022/Audience-Growth/04Apr/CR-AG-InlineHero-Crypto-Wallets-04-22',
  location: 'San Francisco, CA',
};

const REWARDS = [
  {
    id: 1,
    amount: 1,
    title: 'Supporter',
    description: 'Show your support for offline crypto freedom. Your name in the digital credits and our eternal gratitude.',
    delivery: 'April 2026',
    backers: 134,
    limit: null,
  },
  {
    id: 2,
    amount: 89,
    title: 'Early Bird — Single Wallet',
    description: 'One Compact USB Wallet (matte black edition), USB-C cable, quick-start card, and XRP Ledger setup guide. Limited early bird pricing — save 25%.',
    delivery: 'May 2026',
    backers: 398,
    limit: 500,
  },
  {
    id: 3,
    amount: 169,
    title: 'Double Pack',
    description: 'Two Compact USB Wallets — keep one, gift one. Includes both USB-A and USB-C cables, carrying pouch, and setup guide.',
    delivery: 'May 2026',
    backers: 183,
    limit: 250,
  },
  {
    id: 4,
    amount: 299,
    title: 'Pro Kit',
    description: 'Two wallets + premium aluminium carry case, security seed backup plate, priority email support, and your name in the product credits.',
    delivery: 'June 2026',
    backers: 27,
    limit: 100,
  },
];

const TABS = ['Story', 'FAQ', 'Updates', 'Community'] as const;
type Tab = typeof TABS[number];

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProgressBar({ raised, goal }: { raised: number; goal: number }) {
  const pct = Math.min(Math.round((raised / goal) * 100), 100);
  return (
    <div className="w-full bg-green-100 rounded-full h-2 overflow-hidden">
      <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
    </div>
  );
}

function RewardCard({ reward }: { reward: typeof REWARDS[0] }) {
  const soldOut = reward.limit !== null && reward.backers >= reward.limit;
  const remaining = reward.limit !== null ? reward.limit - reward.backers : null;

  return (
    <div className={`border rounded-xl p-5 space-y-3 ${soldOut ? 'opacity-50 border-gray-200' : 'border-green-200 hover:border-green-400 hover:shadow-sm transition-all'}`}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-xl font-extrabold text-green-700">{reward.amount.toLocaleString()} XRP</span>
        {soldOut && <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Sold out</span>}
      </div>
      <p className="font-bold text-green-950">{reward.title}</p>
      <p className="text-sm text-gray-600 leading-relaxed">{reward.description}</p>
      <div className="pt-1 space-y-1 text-xs text-gray-500">
        <p>🗓 Estimated delivery: <span className="font-medium">{reward.delivery}</span></p>
        <p>👥 {reward.backers.toLocaleString()} backers{remaining !== null && !soldOut && ` · ${remaining} left`}</p>
      </div>
      <button
        disabled={soldOut}
        className="w-full mt-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-2.5 rounded-full text-sm transition-colors"
      >
        {soldOut ? 'Sold out' : 'Select this reward'}
      </button>
    </div>
  );
}

// ─── Tab content ──────────────────────────────────────────────────────────────

function StoryTab() {
  return (
    <article className="prose prose-green max-w-none text-gray-700 space-y-8">

      <img
        src={PROJECT.image}
        alt="Compact USB Wallet hero"
        className="w-full rounded-xl object-cover max-h-96"
      />

      <section>
        <h2 className="text-2xl font-extrabold text-green-950 mb-3">The Problem</h2>
        <p className="leading-relaxed">
          Every time you store crypto on an exchange or internet-connected wallet, you're trusting someone else with your keys.
          Hacks, exchange collapses, and frozen accounts have cost the industry billions. The only truly secure wallet is one
          that never touches the internet — but existing hardware wallets are bulky, expensive, and complicated.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-extrabold text-green-950 mb-3">Introducing the Compact USB Wallet</h2>
        <p className="leading-relaxed">
          We've engineered a hardware wallet the size of a USB flash drive. Plug it in to sign a transaction, unplug it and
          your keys are completely air-gapped from the internet. It supports XRP Ledger natively — the first hardware wallet
          built specifically around XRPL's account model and multi-signing.
        </p>
        <div className="grid grid-cols-2 gap-4 mt-5">
          <div className="bg-green-50 rounded-xl p-4 border border-green-100">
            <p className="text-2xl font-black text-green-600">AES-256</p>
            <p className="text-sm text-gray-600 mt-1">Military-grade encryption for your seed phrase</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4 border border-green-100">
            <p className="text-2xl font-black text-green-600">Air-gapped</p>
            <p className="text-sm text-gray-600 mt-1">Keys never touch the internet — ever</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4 border border-green-100">
            <p className="text-2xl font-black text-green-600">USB-C</p>
            <p className="text-sm text-gray-600 mt-1">Universal connector, works on Mac, PC, and Android</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4 border border-green-100">
            <p className="text-2xl font-black text-green-600">XRPL Native</p>
            <p className="text-sm text-gray-600 mt-1">First wallet built specifically for XRP Ledger</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-extrabold text-green-950 mb-3">How It Works</h2>
        <ol className="space-y-4">
          {[
            ['Set up offline', 'Plug in during first-time setup. Generate your seed phrase — it never leaves the device.'],
            ['Unplug & store', 'Keep the wallet in your pocket, a safe, or anywhere physical. Your keys are offline.'],
            ['Sign transactions', 'Plug in only when you want to send XRP. Confirm on the device\'s tactile button. Done.'],
            ['Unplug again', 'Disconnect and your keys are air-gapped once more. No residue, no exposure.'],
          ].map(([title, desc], i) => (
            <li key={i} className="flex gap-4">
              <span className="w-8 h-8 rounded-full bg-green-600 text-white font-bold text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <div>
                <p className="font-bold text-green-950">{title}</p>
                <p className="text-sm text-gray-600 mt-0.5">{desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="text-2xl font-extrabold text-green-950 mb-3">Technical Specs</h2>
        <div className="border border-green-100 rounded-xl overflow-hidden text-sm">
          {[
            ['Dimensions', '62mm × 20mm × 9mm'],
            ['Weight', '11g'],
            ['Connector', 'USB-C (USB-A adapter included)'],
            ['Chip', 'Secure Element ST33 (EAL5+)'],
            ['Encryption', 'AES-256-CBC, ECDSA secp256k1'],
            ['Ledger support', 'XRP Ledger (native), Ethereum, Bitcoin'],
            ['OS support', 'Windows 10+, macOS 12+, Linux, Android 10+'],
            ['Battery', 'None — bus-powered only when plugged in'],
          ].map(([label, value], i) => (
            <div key={i} className={`flex justify-between px-4 py-3 ${i % 2 === 0 ? 'bg-green-50' : 'bg-white'}`}>
              <span className="text-gray-500 font-medium">{label}</span>
              <span className="text-green-950 font-semibold">{value}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-extrabold text-green-950 mb-3">About Crypto Collective</h2>
        <p className="leading-relaxed">
          We're a team of five engineers and designers who have spent the last decade building security tools for financial
          institutions. After watching the 2022 exchange collapses first-hand, we decided the ecosystem needed a simple,
          affordable, no-compromise hardware wallet built around self-custody from day one.
        </p>
        <p className="leading-relaxed mt-3">
          This is our second crowdfunded product — our first, a mobile seed-backup tool, shipped on time to 1,200 backers
          in 2024. We know how to deliver.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-extrabold text-green-950 mb-3">Risks & Challenges</h2>
        <p className="leading-relaxed">
          Hardware manufacturing always carries supply chain risk. We've mitigated this by sourcing our Secure Element chips
          directly from ST Microelectronics with a 6-month buffer order already placed. Final tooling for the enclosure is
          complete. Our primary risk is shipping delays — we've built a 6-week buffer into our timeline.
        </p>
      </section>
    </article>
  );
}

function FAQTab() {
  const faqs = [
    ['Does it work with wallets other than XRP?', 'Yes. While XRPL is our primary focus and has native support, the device also works with Ethereum and Bitcoin via our companion app.'],
    ['What happens if I lose the device?', 'Your seed phrase is the master backup. As long as you\'ve stored it safely (we include a laminated backup card), you can recover all funds on any compatible wallet.'],
    ['Is the firmware open source?', 'Yes. All firmware is MIT-licensed and available on GitHub. You can audit, compile, and flash it yourself.'],
    ['Does it work on iPhone?', 'Not yet — Apple\'s Lightning/USB-C restrictions make this complex. Android 10+ with USB OTG works today. iOS support is on our roadmap.'],
    ['When will it ship?', 'Early Bird backers receive devices in May 2026. Pro Kit rewards ship June 2026 due to the additional accessories.'],
  ];

  return (
    <div className="space-y-4">
      {faqs.map(([q, a], i) => (
        <div key={i} className="border border-green-100 rounded-xl p-5">
          <p className="font-bold text-green-950 mb-2">{q}</p>
          <p className="text-sm text-gray-600 leading-relaxed">{a}</p>
        </div>
      ))}
    </div>
  );
}

function PlaceholderTab({ label }: { label: string }) {
  return (
    <div className="py-16 text-center text-gray-400">
      <p className="text-4xl mb-3">📭</p>
      <p className="font-semibold">{label} coming soon</p>
      <p className="text-sm mt-1">Check back once the campaign is live.</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CampaignPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Story');
  const pct = Math.min(Math.round((PROJECT.raised / PROJECT.goal) * 100), 100);

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      {/* Breadcrumb */}
      <div className="border-b border-gray-100 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-2 text-xs text-gray-500 flex items-center gap-1.5">
          <Link href="/" className="hover:text-green-700 transition-colors">Home</Link>
          <span>›</span>
          <span className="hover:text-green-700 transition-colors cursor-pointer">Crypto-Lifestyle</span>
          <span>›</span>
          <span className="text-gray-800 font-medium">{PROJECT.title}</span>
        </div>
      </div>

      {/* ── HERO ── */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Left: image */}
          <div className="lg:col-span-3">
            <img
              src={PROJECT.image}
              alt={PROJECT.title}
              className="w-full rounded-xl object-cover aspect-video"
            />
          </div>

          {/* Right: info + stats */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div>
              <span className="text-xs font-semibold bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full">
                {PROJECT.category}
              </span>
              {PROJECT.badge && (
                <span className="ml-2 text-xs font-bold bg-green-600 text-white px-2.5 py-0.5 rounded-full">
                  {PROJECT.badge}
                </span>
              )}
            </div>

            <h1 className="text-2xl font-extrabold text-gray-900 leading-snug">{PROJECT.title}</h1>
            <p className="text-gray-600 leading-relaxed">{PROJECT.blurb}</p>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-7 h-7 rounded-full bg-green-200 flex items-center justify-center text-green-800 font-bold text-xs flex-shrink-0">
                {PROJECT.creator[0]}
              </div>
              <span>by <span className="font-semibold text-gray-800">{PROJECT.creator}</span></span>
              <span>·</span>
              <span>📍 {PROJECT.location}</span>
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-3">
              <ProgressBar raised={PROJECT.raised} goal={PROJECT.goal} />

              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xl font-extrabold text-green-700">{PROJECT.raised.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">XRP pledged</p>
                </div>
                <div>
                  <p className="text-xl font-extrabold text-gray-900">{PROJECT.backers.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">backers</p>
                </div>
                <div>
                  <p className="text-xl font-extrabold text-gray-900">{PROJECT.daysLeft}</p>
                  <p className="text-xs text-gray-500">days to go</p>
                </div>
              </div>

              <p className="text-xs text-gray-500 text-center">
                {pct}% of {PROJECT.goal.toLocaleString()} XRP goal
              </p>

              <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-full text-sm transition-colors shadow-sm">
                Back this project
              </button>
              <button className="w-full border border-gray-200 hover:border-green-300 text-gray-600 hover:text-green-700 font-semibold py-2.5 rounded-full text-sm transition-colors">
                ♡ Save to favourites
              </button>

              <p className="text-xs text-center text-gray-400">
                All or nothing. This project will only be funded if it reaches its goal by{' '}
                <span className="font-medium text-gray-600">March 18, 2026</span>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── TABS + CONTENT ── */}
      <div className="border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6">

          {/* Tab bar */}
          <div className="flex gap-0 border-b border-gray-100">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3.5 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-green-600 text-green-700'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 py-10">

            {/* Left: tab content */}
            <div className="lg:col-span-3">
              {activeTab === 'Story' && <StoryTab />}
              {activeTab === 'FAQ' && <FAQTab />}
              {activeTab === 'Updates' && <PlaceholderTab label="Updates" />}
              {activeTab === 'Community' && <PlaceholderTab label="Community" />}
            </div>

            {/* Right: rewards (sticky) */}
            <div className="lg:col-span-2">
              <div className="sticky top-24 space-y-4">
                <h3 className="font-extrabold text-gray-900 text-lg">Select a reward</h3>

                {/* No reward option */}
                <div className="border border-gray-200 rounded-xl p-5 hover:border-green-300 hover:shadow-sm transition-all cursor-pointer">
                  <p className="font-bold text-gray-700 mb-1">Pledge without a reward</p>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Back the project with any amount — no reward, just belief in what we're building.
                  </p>
                  <button className="mt-3 w-full border border-green-200 hover:bg-green-50 text-green-700 font-semibold py-2 rounded-full text-sm transition-colors">
                    Continue
                  </button>
                </div>

                {REWARDS.map((r) => <RewardCard key={r.id} reward={r} />)}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="bg-green-950 text-green-400 py-10 mt-4">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-green-600" />
            <span className="font-bold text-white">XRP Creates</span>
          </div>
          <p className="text-green-600">© 2026 XRP Creates. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-green-300 transition-colors">Privacy</a>
            <a href="#" className="hover:text-green-300 transition-colors">Terms</a>
            <a href="#" className="hover:text-green-300 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
