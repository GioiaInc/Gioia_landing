'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_ARCHIVE_API || 'http://localhost:3001';
const TOKEN_KEY = 'gioia-docs-token';

function getToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(TOKEN_KEY) || '';
}

function headers(): HeadersInit {
  return { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' };
}

// ── Action items data ──────────────────────────────────────────────

interface ActionItem {
  id: string;
  main: string;
  detail: string;
  tags: { label: string; type: string }[];
}

interface Section {
  id: string;
  title: string;
  items: ActionItem[];
}

const sections: Section[] = [
  {
    id: 'glances',
    title: 'Glances (Video Circles)',
    items: [
      { id: 'g1', main: 'Mute glances by default; user taps to unmute', detail: 'Videos auto-play with sound currently. Should be muted like Snapchat/Instagram stories — tap to unmute.', tags: [{ label: 'BUG', type: 'bug' }, { label: 'ROMAN', type: 'roman' }] },
      { id: 'g2', main: 'Fix audio coming from top speaker instead of bottom', detail: 'Circle audio plays from the earpiece/top speaker rather than the main speaker. Possibly iOS version-specific.', tags: [{ label: 'BUG', type: 'bug' }, { label: 'ROMAN', type: 'roman' }] },
      { id: 'g3', main: 'Fix crash on rejoin due to server caching', detail: "Server thinks user is still connected after closing. On rejoin in same session, app crashes because it doesn't know what to do.", tags: [{ label: 'BUG', type: 'bug' }, { label: 'ROMAN', type: 'roman' }] },
      { id: 'g4', main: 'Fix group chat glances (LiveKit configuration)', detail: 'Group glances use LiveKit (third-party). Configuration is wrong causing bad video quality and setup/join issues.', tags: [{ label: 'BUG', type: 'bug' }, { label: 'ROMAN', type: 'roman' }] },
      { id: 'g5', main: 'Fix caching issue — glance still briefly visible after ending', detail: 'When a glance ends, it still shows briefly for other users before disappearing. Clean up caching.', tags: [{ label: 'BUG', type: 'bug' }, { label: 'ROMAN', type: 'roman' }] },
      { id: 'g6', main: 'Tapping a glance should make it full screen', detail: 'Currently tapping a glance does nothing. Tapping should expand to full screen view.', tags: [{ label: 'FEATURE', type: 'feature' }, { label: 'ROMAN', type: 'roman' }, { label: 'ENIS', type: 'enis' }] },
      { id: 'g7', main: 'Remove glance option from Bello Ball menu', detail: 'Glance will be triggered by pulling the avatar down instead. Remove it from ball to reduce clutter.', tags: [{ label: 'DESIGN', type: 'design' }, { label: 'ENIS', type: 'enis' }] },
    ],
  },
  {
    id: 'pops',
    title: 'Pops',
    items: [
      { id: 'p1', main: 'Fix one-way contact visibility — make two-way by default', detail: "Currently if user A adds user B, B can't see A's pops until B also adds A. Should be two-way automatically.", tags: [{ label: 'BUG', type: 'bug' }, { label: 'ROMAN', type: 'roman' }] },
      { id: 'p2', main: 'Enable video capture through camera for Pops', detail: 'Currently video only works through gallery upload. Enable the camera to record video directly.', tags: [{ label: 'FEATURE', type: 'feature' }, { label: 'ROMAN', type: 'roman' }] },
      { id: 'p4', main: 'Remove WhatsApp-style border/highlight on profile when pop is posted', detail: "AI copied WhatsApp's status highlight ring. Remove it — looks inconsistent.", tags: [{ label: 'DESIGN', type: 'design' }, { label: 'ENIS', type: 'enis' }] },
      { id: 'p5', main: "Remove press-and-hold action on person's icon in Pops", detail: "Press and hold shows their settings, which doesn't make sense. Remove this behavior.", tags: [{ label: 'BUG', type: 'bug' }, { label: 'ENIS', type: 'enis' }] },
      { id: 'p6', main: 'Redesign entire Pops UI', detail: 'Plus button, layout, everything looks vibe-coded. Full redesign needed.', tags: [{ label: 'DESIGN', type: 'design' }, { label: 'ENIS', type: 'enis' }] },
      { id: 'p7', main: "View user's posts from their profile", detail: "Create an API so that tapping on someone's profile shows all their pops/posts.", tags: [{ label: 'FEATURE', type: 'feature' }, { label: 'ROMAN', type: 'roman' }] },
      { id: 'p8', main: 'Fix likes caching issue (count not updating on refresh)', detail: 'Like count sometimes shows wrong number until refresh. Aggressive caching causing stale data.', tags: [{ label: 'BUG', type: 'bug' }, { label: 'ROMAN', type: 'roman' }] },
      { id: 'p9', main: 'Fix comment caching issue', detail: 'Comments not updating properly due to caching — related to the same caching area as contact visibility. Stale comment data shown.', tags: [{ label: 'BUG', type: 'bug' }, { label: 'ROMAN', type: 'roman' }] },
    ],
  },
  {
    id: 'flows',
    title: 'Flows',
    items: [
      { id: 'f1', main: 'Fix rooms not loading / infinite loading when joining', detail: 'Multiple users unable to join flow rooms — just shows loading forever.', tags: [{ label: 'BUG', type: 'bug' }, { label: 'ROMAN', type: 'roman' }] },
      { id: 'f2', main: 'Fix wrong UI in some flow rooms (names not visible)', detail: '"First Flow" uses wrong UI — can\'t see anyone\'s name. Other flows work fine.', tags: [{ label: 'BUG', type: 'bug' }, { label: 'ENIS', type: 'enis' }] },
      { id: 'f3', main: 'Redesign Flows UI', detail: 'Enis to redesign flows working with Saeed. Make it look less vibe-coded and more polished.', tags: [{ label: 'DESIGN', type: 'design' }, { label: 'ENIS', type: 'enis' }, { label: 'SAEED', type: 'saeed' }] },
      { id: 'f4', main: 'Add ability to delete flows', detail: 'Currently no way to delete flows. Coming in next update.', tags: [{ label: 'FEATURE', type: 'feature' }, { label: 'ROMAN', type: 'roman' }] },
      { id: 'f5', main: 'Fix search keyboard staying open in Flows', detail: "When searching flows and keyboard pops up, it won't dismiss. Need to auto-close when navigating away.", tags: [{ label: 'BUG', type: 'bug' }, { label: 'ENIS', type: 'enis' }] },
      { id: 'f6', main: 'Delete all broken flows from the database', detail: 'Clean up broken/corrupt flow entries in the database that are causing issues.', tags: [{ label: 'BUG', type: 'bug' }, { label: 'ROMAN', type: 'roman' }, { label: 'ENIS', type: 'enis' }] },
      { id: 'f7', main: 'Remove the "For You" page — keep only Following and Open Flows', detail: 'Flows should only have Following and Open Flows tabs. Remove the For You page entirely.', tags: [{ label: 'DESIGN', type: 'design' }, { label: 'ROMAN', type: 'roman' }, { label: 'ENIS', type: 'enis' }] },
    ],
  },
  {
    id: 'peak',
    title: 'Peak',
    items: [
      { id: 'pk1', main: 'Fix Peak not working in group chats', detail: 'Peak is bugging out in group chats — works momentarily then stops. May have been broken during merges.', tags: [{ label: 'BUG', type: 'bug' }, { label: 'ROMAN', type: 'roman' }] },
      { id: 'pk2', main: 'Fix Peak notifications not showing for group chats', detail: "Peak notifications only appear if you're already in the tab. Not working for group chats.", tags: [{ label: 'BUG', type: 'bug' }, { label: 'ROMAN', type: 'roman' }] },
      { id: 'pk3', main: 'Design Peak UX — drag up to shrink, tap to fullscreen', detail: 'When in a peak, drag up to make it small (mini view with audio). Tap the mini view to go full screen again.', tags: [{ label: 'FEATURE', type: 'feature' }, { label: 'ENIS', type: 'enis' }] },
    ],
  },
  {
    id: 'calls',
    title: 'Video & Audio Calling',
    items: [
      { id: 'c1', main: 'Fix audio routing — sound from earpiece instead of main speaker', detail: 'During calls, audio comes from top earpiece speaker on some devices. Should use main bottom speaker by default.', tags: [{ label: 'BUG', type: 'bug' }, { label: 'ROMAN', type: 'roman' }] },
      { id: 'c2', main: 'Fix LiveKit config for group video calls', detail: 'Group calls use LiveKit (free tier). Config is wrong causing bad video quality and join issues.', tags: [{ label: 'BUG', type: 'bug' }, { label: 'ROMAN', type: 'roman' }] },
      { id: 'c3', main: 'Fix keyboard not closing when call comes in', detail: "If keyboard is open when a call starts, it doesn't automatically dismiss.", tags: [{ label: 'BUG', type: 'bug' }, { label: 'ENIS', type: 'enis' }] },
      { id: 'c4', main: 'Address latency for international users (single Virginia server)', detail: '1-on-1 calls use proprietary WebRTC with only one server in Virginia. International users experience significant lag.', tags: [{ label: 'BUG', type: 'bug' }, { label: 'ROMAN', type: 'roman' }] },
      { id: 'c5', main: 'Make web version more similar to Discord — full screen, better UI/UX', detail: 'Web calling experience needs to be more polished. Allow full screen, improve layout and controls to match Discord-level quality.', tags: [{ label: 'FEATURE', type: 'feature' }, { label: 'ROMAN', type: 'roman' }, { label: 'ENIS', type: 'enis' }] },
    ],
  },
  {
    id: 'ball',
    title: 'Bello Ball',
    items: [
      { id: 'b1', main: 'Reduce items in Ball menu (too cluttered)', detail: 'Too many options. Remove glance (use avatar pull-down) and circle send (use hold camera). Only keep essential actions.', tags: [{ label: 'DESIGN', type: 'design' }, { label: 'ENIS', type: 'enis' }] },
      { id: 'b2', main: 'Fix menu text overlap ("glance" text gets cut off)', detail: 'Menu item labels are stacking under one another. "Glance" text is cut off / not fully visible.', tags: [{ label: 'BUG', type: 'bug' }, { label: 'ENIS', type: 'enis' }] },
      { id: 'b3', main: 'Fix Ball not vertically centered with "Bello" text', detail: 'Ball appears slightly off-center relative to the Bello text. Alignment issue likely caused by font metrics.', tags: [{ label: 'DESIGN', type: 'design' }, { label: 'ENIS', type: 'enis' }] },
      { id: 'b4', main: 'Make microphone button match Ball style', detail: 'Mic button style doesn\'t match the ball. Currently mic is filled; should be outlined in next version.', tags: [{ label: 'DESIGN', type: 'design' }, { label: 'ENIS', type: 'enis' }] },
      { id: 'b5', main: 'Implement joystick-style interaction for Ball', detail: 'Hold ball and it becomes a joystick: drag up = open menu, drag side = peak. Tap = camera. Makes actions parallel and deliberate.', tags: [{ label: 'FEATURE', type: 'feature' }, { label: 'ENIS', type: 'enis' }] },
      { id: 'b6', main: 'Add exit ring for deselection', detail: 'Currently if you move finger far from ball, it still selects an option. Should have a ring boundary — exiting cancels selection.', tags: [{ label: 'FEATURE', type: 'feature' }, { label: 'ENIS', type: 'enis' }] },
      { id: 'b7', main: 'Match top icons (video, voice) with Ball design style', detail: 'If mic gets Ball-style treatment, the top icons should also be updated for consistency.', tags: [{ label: 'DESIGN', type: 'design' }, { label: 'ENIS', type: 'enis' }] },
      { id: 'b8', main: 'Blur background should be a local circle around radial options only', detail: 'When ball menu opens, the blur should be contained in a circle just around the radial action options — not blur the entire background/top area. Fading off at the edges.', tags: [{ label: 'DESIGN', type: 'design' }, { label: 'ENIS', type: 'enis' }] },
    ],
  },
  {
    id: 'chat',
    title: 'Chat & Messaging',
    items: [
      { id: 'ch1', main: 'Remove duplicate send button (keep only on keyboard)', detail: 'Send button appears both on keyboard and in the top area. Keep only the keyboard one.', tags: [{ label: 'DESIGN', type: 'design' }, { label: 'ENIS', type: 'enis' }] },
      { id: 'ch2', main: 'Fix "Bello" text larger than message text / alignment', detail: 'The Bello shade/header text is bigger than the actual message text. Needs proper alignment.', tags: [{ label: 'BUG', type: 'bug' }, { label: 'ENIS', type: 'enis' }] },
      { id: 'ch3', main: 'Fix keyboard not auto-closing on navigation', detail: "Since Enis changed the search bar on the home page, the keyboard doesn't auto-close on tons of things.", tags: [{ label: 'BUG', type: 'bug' }, { label: 'ENIS', type: 'enis' }] },
      { id: 'ch4', main: 'Add notification distinction: DM vs group chat message', detail: 'Notifications just say "Kambar sent a message" with no way to know if it\'s a DM or group chat.', tags: [{ label: 'FEATURE', type: 'feature' }, { label: 'ROMAN', type: 'roman' }] },
      { id: 'ch5', main: 'Add press-and-hold profile preview (read without opening)', detail: "Like WhatsApp/iMessage — press and hold someone's chat to preview messages without fully opening.", tags: [{ label: 'FEATURE', type: 'feature' }, { label: 'ENIS', type: 'enis' }] },
      { id: 'ch6', main: 'Fix message flash/flicker when sent or seen', detail: "There's a visible flash/flicker effect when a message gets sent or marked as seen.", tags: [{ label: 'BUG', type: 'bug' }, { label: 'ENIS', type: 'enis' }] },
      { id: 'ch7', main: 'Fix choppy keyboard opening animation on Android', detail: 'The keyboard open animation has choppiness at the end on Android. Needs to be smoother.', tags: [{ label: 'BUG', type: 'bug' }, { label: 'ENIS', type: 'enis' }] },
      { id: 'ch8', main: 'Swipe up on input bar to send message', detail: 'Swiping up with your thumb on the input bar should automatically send the message (text, voice message, anything) with a nice animation. Quick, natural gesture.', tags: [{ label: 'FEATURE', type: 'feature' }, { label: 'ENIS', type: 'enis' }] },
    ],
  },
  {
    id: 'ui',
    title: 'UI & Design (General)',
    items: [
      { id: 'u1', main: 'Remove profile waves', detail: 'Profile waves should be gone. Looks cleaner without them.', tags: [{ label: 'DESIGN', type: 'design' }, { label: 'ENIS', type: 'enis' }] },
      { id: 'u2', main: 'Change app icon to purple (lavender white + purple text)', detail: "Current black/white icon doesn't \"scream Bello.\" Change to match light mode colors.", tags: [{ label: 'DESIGN', type: 'design' }, { label: 'ENIS', type: 'enis' }] },
      { id: 'u3', main: 'Remove green online indicator dots', detail: "Green online dots look ugly and aren't necessary. Most apps don't need them.", tags: [{ label: 'DESIGN', type: 'design' }, { label: 'ENIS', type: 'enis' }] },
      { id: 'u4', main: 'Remove borders around profile pictures', detail: 'Borders/outlines around profile pictures are ruining the aesthetic. These are being caused by users having active pops, but should still be removed. Should only have the background glow effect, no borders.', tags: [{ label: 'DESIGN', type: 'design' }, { label: 'ENIS', type: 'enis' }] },
      { id: 'u5', main: 'Fix Gaussian blur at top of chat (visible cut line)', detail: 'The blur layer at the top has a clear separation/cut line instead of smoothly fading.', tags: [{ label: 'BUG', type: 'bug' }, { label: 'ENIS', type: 'enis' }] },
      { id: 'u6', main: 'Fix blur not working in DMs and group chats', detail: "Top blur doesn't apply at all in DMs or group chats on latest update.", tags: [{ label: 'BUG', type: 'bug' }, { label: 'ENIS', type: 'enis' }] },
      { id: 'u7', main: 'Redesign bottom navigation bar (looks vibe-coded)', detail: 'Font is too thin, movement feels off. Need better fonts, more creative design, proper spacing.', tags: [{ label: 'DESIGN', type: 'design' }, { label: 'ENIS', type: 'enis' }] },
      { id: 'u8', main: 'Make swipe-down bounding box larger', detail: 'The touch target for swiping down is way too small. Have to press a very specific part of the golden circle.', tags: [{ label: 'BUG', type: 'bug' }, { label: 'ENIS', type: 'enis' }] },
      { id: 'u10', main: 'Overall polish to not look "vibe-coded"', detail: "Saeed's key ask: \"I open it and feel like this was not vibe coded.\" Fix fonts, spacing, animations, transitions.", tags: [{ label: 'DESIGN', type: 'design' }, { label: 'ENIS', type: 'enis' }] },
    ],
  },
  {
    id: 'features',
    title: 'Features & Ambient AI',
    items: [
      { id: 'ft1', main: 'Re-enable Ambient AI background', detail: 'Already built, just needs to be turned back on. Will give full control over the background.', tags: [{ label: 'FEATURE', type: 'feature' }, { label: 'ENIS', type: 'enis' }] },
      { id: 'ft2', main: 'Wire up AI mood features', detail: 'Reconnect the AI mood stuff. Should be done by Tuesday along with completing all features.', tags: [{ label: 'FEATURE', type: 'feature' }, { label: 'ROMAN', type: 'roman' }] },
      { id: 'ft3', main: 'Implement decaying UI cues (future idea)', detail: 'UI elements that are prominent at first but gradually decay/disappear as users learn the app.', tags: [{ label: 'FEATURE', type: 'feature' }, { label: 'ROMAN', type: 'roman' }, { label: 'ENIS', type: 'enis' }] },
      { id: 'ft4', main: 'Double-tap nudge feature (already working)', detail: "Double-tap on a person's profile picture in DM sends a nudge. Confirmed working — just noting it exists.", tags: [{ label: 'FEATURE', type: 'feature' }, { label: 'ROMAN', type: 'roman' }, { label: 'ENIS', type: 'enis' }] },
    ],
  },
];

const deadlines = [
  { date: 'March 20', text: 'Roman & Saeed sync call' },
  { date: 'March 21–22', text: 'Full team reconnect — major improvements expected' },
  { date: 'March 24', text: 'Design-wise everything should be DONE' },
  { date: 'After March 24', text: 'Small bugs, polish, and ambient AI work' },
];

type FilterMode = 'all' | 'remaining' | 'completed';

// ── Component ──────────────────────────────────────────────────────

export default function ActionsPage() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<FilterMode>('all');
  const [loaded, setLoaded] = useState(false);

  // Load state from backend
  useEffect(() => {
    fetch(`${API_BASE}/api/actions`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then((r) => r.ok ? r.json() : {})
      .then((state) => { setChecked(state); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, []);

  // Toggle a single item
  const toggle = useCallback((id: string) => {
    setChecked((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      // Fire-and-forget save
      fetch(`${API_BASE}/api/actions`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ id, checked: next[id] }),
      }).catch(() => {});
      return next;
    });
  }, []);

  const toggleSection = (id: string) => {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => setCollapsed({});
  const collapseAll = () => {
    const c: Record<string, boolean> = {};
    sections.forEach((s) => (c[s.id] = true));
    setCollapsed(c);
  };

  const resetAll = () => {
    if (!confirm('Reset all checkboxes? This cannot be undone.')) return;
    const empty: Record<string, boolean> = {};
    setChecked(empty);
    // Bulk-clear on backend
    const items: Record<string, boolean> = {};
    sections.forEach((s) => s.items.forEach((i) => (items[i.id] = false)));
    fetch(`${API_BASE}/api/actions/bulk`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ items }),
    }).catch(() => {});
  };

  // Stats
  const allItems = sections.flatMap((s) => s.items);
  const totalCount = allItems.length;
  const doneCount = allItems.filter((i) => checked[i.id]).length;
  const pct = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;

  const sectionStats = (s: Section) => {
    const done = s.items.filter((i) => checked[i.id]).length;
    return { done, total: s.items.length };
  };

  const filteredItems = (items: ActionItem[]) => {
    if (filter === 'remaining') return items.filter((i) => !checked[i.id]);
    if (filter === 'completed') return items.filter((i) => checked[i.id]);
    return items;
  };

  const tagColor = (type: string) => {
    switch (type) {
      case 'bug': return { bg: '#f3e8e8', color: '#b44' };
      case 'design': return { bg: '#e8eef3', color: '#4478a4' };
      case 'feature': return { bg: '#e8f3eb', color: '#3a8a4f' };
      case 'enis': return { bg: '#f3ede8', color: '#b48a44' };
      case 'roman': return { bg: '#ede8f3', color: '#8a5cb4' };
      case 'saeed': return { bg: '#e8f0f3', color: '#4a9a8a' };
      default: return { bg: '#f0ece7', color: '#8a8580' };
    }
  };

  if (!loaded) return null;

  return (
    <>
      <nav className="docs-topbar">
        <Link href="/docs" className="docs-topbar-brand">GIOIA Docs</Link>
        <div className="docs-topbar-nav">
          <Link href="/docs/actions" className="docs-topbar-link" style={{ color: '#1a1a1a' }}>Actions</Link>
          <Link href="/docs/spec" className="docs-topbar-link">Spec</Link>
          <Link href="/docs" className="docs-topbar-link">Docs</Link>
          <Link href="/" className="docs-topbar-link">Home</Link>
        </div>
      </nav>

      <div className="actions-page">
        <div className="actions-header">
          <p className="actions-label">March 19, 2026</p>
          <h1 className="actions-title">Bello Action Items</h1>
          <p className="actions-subtitle">Full Team Review & Testing Session</p>
        </div>

        {/* ── Progress ── */}
        <div className="actions-progress">
          <div className="actions-progress-top">
            <span className="actions-progress-label">Overall Progress</span>
            <span className="actions-progress-count">{doneCount} / {totalCount} completed ({pct}%)</span>
          </div>
          <div className="actions-progress-track">
            <div className="actions-progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="actions-btn-row">
            <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>Show All</button>
            <button className={filter === 'remaining' ? 'active' : ''} onClick={() => setFilter('remaining')}>Remaining</button>
            <button className={filter === 'completed' ? 'active' : ''} onClick={() => setFilter('completed')}>Completed</button>
            <button onClick={expandAll}>Expand All</button>
            <button onClick={collapseAll}>Collapse All</button>
            <button onClick={resetAll}>Reset All</button>
          </div>
        </div>

        {/* ── Deadlines ── */}
        <div className="actions-deadlines">
          <h3 className="actions-deadlines-title">Key Deadlines</h3>
          <ul>
            {deadlines.map((d, i) => (
              <li key={i}><strong>{d.date}:</strong> {d.text}</li>
            ))}
          </ul>
        </div>

        {/* ── Sections ── */}
        {sections.map((section) => {
          const stats = sectionStats(section);
          const items = filteredItems(section.items);
          const isCollapsed = collapsed[section.id];

          return (
            <div key={section.id} className="actions-section">
              <div className="actions-section-header" onClick={() => toggleSection(section.id)}>
                <span className="actions-section-title">{section.title}</span>
                <div className="actions-section-right">
                  <span className="actions-section-badge">{stats.done}/{stats.total}</span>
                  <span className={`actions-section-arrow ${isCollapsed ? 'collapsed' : ''}`}>&#9660;</span>
                </div>
              </div>

              {!isCollapsed && (
                <div className="actions-section-body">
                  {items.length === 0 && (
                    <p className="actions-empty">
                      {filter === 'remaining' ? 'All done!' : 'No completed items yet.'}
                    </p>
                  )}
                  {items.map((item) => (
                    <div key={item.id} className={`actions-item ${checked[item.id] ? 'is-checked' : ''}`}>
                      <button
                        className={`actions-checkbox ${checked[item.id] ? 'checked' : ''}`}
                        onClick={() => toggle(item.id)}
                        aria-label={checked[item.id] ? 'Uncheck' : 'Check'}
                      >
                        {checked[item.id] && (
                          <svg width="12" height="10" viewBox="0 0 12 10" fill="none"><path d="M1 5L4.5 8.5L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        )}
                      </button>
                      <div className="actions-item-content">
                        <div className="actions-item-main">
                          <span>{item.main}</span>
                          {item.tags.map((tag, i) => {
                            const c = tagColor(tag.type);
                            return (
                              <span key={i} className="actions-tag" style={{ background: c.bg, color: c.color }}>
                                {tag.label}
                              </span>
                            );
                          })}
                        </div>
                        <p className="actions-item-detail">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <footer className="docs-footer">
        <p className="docs-footer-text">&copy; 2026 GIOIA</p>
      </footer>

      <style jsx>{`
        .actions-page {
          max-width: 720px;
          margin: 0 auto;
          padding: 3rem 2rem 6rem;
        }

        /* ── Header ── */
        .actions-header {
          margin-bottom: 2.5rem;
        }
        .actions-label {
          font-family: 'Montserrat', sans-serif;
          font-weight: 600;
          font-size: 0.6rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #c17c5f;
          margin: 0 0 0.75rem;
        }
        .actions-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 300;
          font-size: 2.8rem;
          line-height: 1.15;
          color: #1a1a1a;
          margin: 0 0 0.4rem;
        }
        .actions-subtitle {
          font-size: 1.1rem;
          color: #8a8580;
          font-style: italic;
          margin: 0;
        }

        /* ── Progress ── */
        .actions-progress {
          border: 1px solid #e8e4df;
          border-radius: 8px;
          padding: 1.25rem 1.5rem;
          margin-bottom: 1.5rem;
          position: sticky;
          top: 0;
          background: #faf9f6;
          z-index: 10;
        }
        .actions-progress-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.6rem;
        }
        .actions-progress-label {
          font-family: 'Montserrat', sans-serif;
          font-weight: 600;
          font-size: 0.65rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #c17c5f;
        }
        .actions-progress-count {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.65rem;
          color: #a09890;
        }
        .actions-progress-track {
          width: 100%;
          height: 6px;
          background: #e8e4df;
          border-radius: 3px;
          overflow: hidden;
        }
        .actions-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #c17c5f, #d4a088);
          border-radius: 3px;
          transition: width 0.4s ease;
        }
        .actions-btn-row {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.8rem;
          flex-wrap: wrap;
        }
        .actions-btn-row button {
          padding: 0.35rem 0.75rem;
          border: 1px solid #ddd8d2;
          border-radius: 4px;
          background: transparent;
          color: #8a8580;
          cursor: pointer;
          font-family: 'Montserrat', sans-serif;
          font-size: 0.6rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          transition: all 0.2s;
        }
        .actions-btn-row button:hover {
          border-color: #c17c5f;
          color: #c17c5f;
        }
        .actions-btn-row button.active {
          border-color: #c17c5f;
          color: #c17c5f;
          background: rgba(193, 124, 95, 0.06);
        }

        /* ── Deadlines ── */
        .actions-deadlines {
          border: 1px solid #e8e4df;
          border-left: 3px solid #c17c5f;
          border-radius: 4px;
          padding: 1.25rem 1.5rem;
          margin-bottom: 2rem;
        }
        .actions-deadlines-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 600;
          font-size: 1.15rem;
          color: #1a1a1a;
          margin: 0 0 0.75rem;
        }
        .actions-deadlines ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .actions-deadlines li {
          padding: 0.3rem 0;
          font-size: 0.95rem;
          color: #4a4540;
          line-height: 1.5;
        }
        .actions-deadlines li::before {
          content: '';
          display: inline-block;
          width: 6px;
          height: 6px;
          background: #c17c5f;
          border-radius: 50%;
          margin-right: 0.75rem;
          vertical-align: middle;
        }
        .actions-deadlines strong {
          color: #1a1a1a;
        }

        /* ── Sections ── */
        .actions-section {
          border: 1px solid #e8e4df;
          border-radius: 6px;
          margin-bottom: 1rem;
          overflow: hidden;
        }
        .actions-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.9rem 1.25rem;
          cursor: pointer;
          user-select: none;
          transition: background 0.2s;
        }
        .actions-section-header:hover {
          background: rgba(0,0,0,0.015);
        }
        .actions-section-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 600;
          font-size: 1.2rem;
          color: #1a1a1a;
        }
        .actions-section-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .actions-section-badge {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.6rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          color: #c17c5f;
          background: rgba(193, 124, 95, 0.08);
          padding: 0.15rem 0.5rem;
          border-radius: 10px;
        }
        .actions-section-arrow {
          font-size: 0.7rem;
          color: #b0aaa4;
          transition: transform 0.25s;
        }
        .actions-section-arrow.collapsed {
          transform: rotate(-90deg);
        }
        .actions-section-body {
          padding: 0 1.25rem 0.75rem;
        }
        .actions-empty {
          font-style: italic;
          color: #b0aaa4;
          font-size: 0.95rem;
          padding: 0.5rem 0;
          margin: 0;
        }

        /* ── Items ── */
        .actions-item {
          display: flex;
          align-items: flex-start;
          gap: 0.85rem;
          padding: 0.85rem 0;
          border-bottom: 1px solid #f0ece7;
          transition: opacity 0.3s;
        }
        .actions-item:last-child {
          border-bottom: none;
        }
        .actions-item.is-checked {
          opacity: 0.45;
        }
        .actions-item.is-checked .actions-item-main span:first-child {
          text-decoration: line-through;
          color: #a09890;
        }

        /* ── Checkbox ── */
        .actions-checkbox {
          width: 20px;
          height: 20px;
          min-width: 20px;
          border: 1.5px solid #ccc8c2;
          border-radius: 4px;
          background: transparent;
          cursor: pointer;
          margin-top: 0.1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          padding: 0;
          color: #fff;
        }
        .actions-checkbox:hover {
          border-color: #c17c5f;
        }
        .actions-checkbox.checked {
          background: #c17c5f;
          border-color: #c17c5f;
        }

        /* ── Item content ── */
        .actions-item-content {
          flex: 1;
          min-width: 0;
        }
        .actions-item-main {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 1.05rem;
          line-height: 1.45;
          color: #2a2a2a;
        }
        .actions-tag {
          display: inline-block;
          padding: 0.05rem 0.45rem;
          border-radius: 3px;
          font-family: 'Montserrat', sans-serif;
          font-size: 0.5rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          margin-left: 0.4rem;
          vertical-align: middle;
          position: relative;
          top: -1px;
        }
        .actions-item-detail {
          font-size: 0.88rem;
          color: #8a8580;
          margin: 0.2rem 0 0;
          line-height: 1.5;
        }

        /* ── Responsive ── */
        @media (max-width: 540px) {
          .actions-page {
            padding: 2rem 1.25rem 4rem;
          }
          .actions-title {
            font-size: 2.2rem;
          }
          .actions-progress {
            padding: 1rem;
          }
          .actions-btn-row {
            gap: 0.35rem;
          }
          .actions-btn-row button {
            padding: 0.3rem 0.55rem;
            font-size: 0.55rem;
          }
          .actions-section-header {
            padding: 0.75rem 1rem;
          }
          .actions-section-body {
            padding: 0 1rem 0.5rem;
          }
        }
      `}</style>
    </>
  );
}
