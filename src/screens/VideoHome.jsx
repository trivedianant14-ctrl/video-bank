import { useState } from 'react'
import { SUBJECTS } from '../data/subjects'

const P = '#534AB7', PL = '#EEEDFE'
const T1 = '#1a1a2e', T2 = '#5a5a78', T3 = '#9898b0', BD = '#e8e8f2', BG2 = '#f5f5fb'
const AMBER = '#92400E', AMBERBG = '#FFFBEB', AMBERBORDER = '#FCD34D'

// Year classification for filter chips
const YEAR_MAP = { anatomy: '1', physiology: '1', pharmacology: '2' }
const FILTERS = [
  { id: 'all', label: 'All (3)' },
  { id: '1',   label: '1st Year (2)' },
  { id: '2',   label: '2nd Year (1)' },
]

// ── Icons ─────────────────────────────────────────────────────────────────────

const IconSearch = ({ color }) => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
)

const IconDownload = ({ color }) => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
    <polyline points="7,10 12,15 17,10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
)

const IconBookmark = ({ filled, color }) => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill={filled ? color : 'none'} stroke={color} strokeWidth="2.2" strokeLinecap="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
  </svg>
)

const IconChevron = ({ color = T3 }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
    <path d="M9 18l6-6-6-6"/>
  </svg>
)

const IconLightning = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
    <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/>
  </svg>
)

const IconPlay = () => (
  <svg width="15" height="15" viewBox="0 0 20 20" fill="white">
    <polygon points="5,3 17,10 5,17"/>
  </svg>
)

const NavIcon = ({ id, active }) => {
  const c = active ? P : T3
  const w = 2
  if (id === 'home') return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9,22 9,12 15,12 15,22"/>
    </svg>
  )
  if (id === 'qbank') return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round">
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  )
  if (id === 'videos') return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" strokeLinecap="round">
      <rect x="1" y="5" width="15" height="14" rx="2" fill={active ? PL : 'none'} stroke={c} strokeWidth={w}/>
      <polygon points="23,7 16,12 23,17" fill={active ? P : 'none'} stroke={c} strokeWidth={w} strokeLinejoin="round"/>
    </svg>
  )
  if (id === 'tests') return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14,2 14,8 20,8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  )
  // buy
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.99-1.81L23 6H6"/>
    </svg>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function VideoHome({
  navigate, setCurrentSubject, savedVideos = [],
  scenario, setScenario, isFreeTier, setIsFreeTier, videoProgress = {},
}) {
  const [showDownloadSheet, setShowDownloadSheet] = useState(false)
  const [yearFilter, setYearFilter] = useState('all')

  const getStats = (subject) => {
    const completed = subject.videos.filter(v => videoProgress[v.id]?.completed).length
    return { completed, total: subject.videos.length }
  }

  // Hero card derives from anatomy (primary subject) progress
  const primary = SUBJECTS[0]
  const allVids = primary.videos
  const completedVids = allVids.filter(v => videoProgress[v.id]?.completed)
  const resumeVids = allVids
    .filter(v => !videoProgress[v.id]?.completed && (videoProgress[v.id]?.secondsWatched || 0) > 0)
    .sort((a, b) => (videoProgress[b.id]?.lastWatched || 0) - (videoProgress[a.id]?.lastWatched || 0))

  let hero
  if (resumeVids.length > 0) {
    hero = { label: 'CONTINUE LEARNING', title: resumeVids[0].title, sub: `${primary.name} · ${completedVids.length}/${allVids.length} watched`, btn: 'Resume' }
  } else if (completedVids.length > 0 && completedVids.length < allVids.length) {
    const next = allVids.find(v => !videoProgress[v.id]?.completed)
    hero = { label: 'UP NEXT', title: next.title, sub: `${primary.name} · ${completedVids.length}/${allVids.length} watched`, btn: 'Continue' }
  } else if (completedVids.length === allVids.length && allVids.length > 0) {
    hero = { label: 'COMPLETED ✓', title: "You've finished Applied Anatomy!", sub: `${allVids.length}/${allVids.length} watched`, btn: 'Review' }
  } else {
    hero = { label: 'RECOMMENDED FOR YOU', title: 'Start your first lecture', sub: `${primary.name} · ${allVids.length} lectures`, btn: 'Begin' }
  }

  const filteredSubjects = yearFilter === 'all'
    ? SUBJECTS
    : SUBJECTS.filter(s => YEAR_MAP[s.id] === yearFilter)

  const goToSubject = (subject) => {
    setCurrentSubject(subject)
    navigate('prevideoscreen')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#F8F8FC', position: 'relative' }}>

      {/* Status bar */}
      <div style={{ padding: '12px 20px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', flexShrink: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: T1 }}>9:41</span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', color: T2 }}>
          <svg width="16" height="11" viewBox="0 0 30 20" fill="currentColor">
            <rect x="0" y="8" width="4" height="12" rx="1" opacity="0.4"/>
            <rect x="7" y="5" width="4" height="15" rx="1" opacity="0.6"/>
            <rect x="14" y="2" width="4" height="18" rx="1" opacity="0.8"/>
            <rect x="21" y="0" width="4" height="20" rx="1"/>
          </svg>
          <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
            <rect x="0.5" y="0.5" width="21" height="11" rx="2" stroke="currentColor"/>
            <rect x="22" y="3.5" width="2.5" height="5" rx="1" fill="currentColor" opacity="0.4"/>
            <rect x="1.5" y="1.5" width="15" height="9" rx="1.5" fill="currentColor"/>
          </svg>
        </div>
      </div>

      {/* Prototype dev bar */}
      <div style={{ padding: '4px 14px', background: '#F0EFF8', borderBottom: `1px solid ${BD}`, display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
        <span style={{ fontSize: 9, color: T3, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Proto</span>
        <div style={{ display: 'flex', background: BD, borderRadius: 50, padding: '1px 2px', gap: 1 }}>
          {[{ val: 'new', l: 'New' }, { val: 'returning-a', l: 'Ret A' }, { val: 'returning-b', l: 'Ret B' }].map(o => (
            <button key={o.val} onClick={() => setScenario(o.val)}
              style={{ padding: '2px 8px', borderRadius: 50, border: 'none', cursor: 'pointer', fontSize: 9, fontWeight: 600,
                background: scenario === o.val ? 'white' : 'transparent',
                color: scenario === o.val ? (o.val === 'new' ? T1 : P) : T3,
                boxShadow: scenario === o.val ? '0 1px 2px rgba(0,0,0,0.1)' : 'none' }}>
              {o.l}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', background: BD, borderRadius: 50, padding: '1px 2px', gap: 1 }}>
          {[{ val: false, l: 'Paid' }, { val: true, l: 'Free' }].map(o => (
            <button key={String(o.val)} onClick={() => setIsFreeTier(o.val)}
              style={{ padding: '2px 8px', borderRadius: 50, border: 'none', cursor: 'pointer', fontSize: 9, fontWeight: 600,
                background: isFreeTier === o.val ? 'white' : 'transparent',
                color: isFreeTier === o.val ? (o.val ? '#C05C0D' : T1) : T3,
                boxShadow: isFreeTier === o.val ? '0 1px 2px rgba(0,0,0,0.1)' : 'none' }}>
              {o.l}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable body */}
      <div className="scroll" style={{ flex: 1, overflowY: 'auto' }}>

        {/* User scenario toggle — prominent pill */}
        <div style={{ padding: '12px 16px 8px', background: 'white', display: 'flex', justifyContent: 'center' }}>
          <div style={{ display: 'inline-flex', background: BD, borderRadius: 50, padding: 3 }}>
            {[
              { val: 'new',         label: 'New User' },
              { val: 'returning-a', label: 'Returning A' },
              { val: 'returning-b', label: 'Returning B' },
            ].map(o => (
              <button key={o.val} onClick={() => setScenario(o.val)}
                style={{ padding: '6px 14px', borderRadius: 50, border: 'none', cursor: 'pointer',
                  fontSize: 11, fontWeight: 700,
                  background: scenario === o.val ? P : 'transparent',
                  color: scenario === o.val ? 'white' : T3,
                  transition: 'all 0.15s' }}>
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Header: title + action icons */}
        <div style={{ padding: '4px 18px 14px', background: 'white', borderBottom: `1px solid ${BD}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 23, fontWeight: 800, color: T1, letterSpacing: '-0.4px' }}>Video Lectures</div>
          <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <button style={{ width: 36, height: 36, borderRadius: 50, border: 'none', background: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconSearch color={T2}/>
            </button>
            <button onClick={() => navigate('downloads')}
              style={{ width: 36, height: 36, borderRadius: 50, border: 'none', background: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              aria-label="Download videos">
              <IconDownload color={T2}/>
            </button>
            <button onClick={() => navigate('saved')}
              style={{ width: 36, height: 36, borderRadius: 50, border: 'none', background: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              aria-label="Saved videos">
              <IconBookmark filled={savedVideos.length > 0} color={savedVideos.length > 0 ? P : T2}/>
            </button>
          </div>
        </div>

        <div style={{ padding: '16px 16px 0' }}>

          {/* ── Hero banner ── */}
          <div style={{ borderRadius: 18, overflow: 'hidden', marginBottom: 12,
            border: '1.5px solid rgba(83,74,183,0.22)',
            boxShadow: '0 6px 24px rgba(83,74,183,0.18)' }}>

            {/* Gradient tap area */}
            <button onClick={() => goToSubject(primary)}
              style={{ width: '100%',
                background: 'linear-gradient(135deg, #2a2478 0%, #534AB7 55%, #7069CE 100%)',
                padding: '18px 16px 20px', display: 'flex', alignItems: 'center', gap: 14,
                border: 'none', cursor: 'pointer', textAlign: 'left' }}>
              <div style={{ width: 46, height: 46, borderRadius: '50%',
                background: 'rgba(255,255,255,0.16)', border: '1.5px solid rgba(255,255,255,0.42)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <IconPlay/>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.62)',
                  letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 5 }}>
                  {hero.label}
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'white', lineHeight: 1.25, marginBottom: 4,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {hero.title}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.72)' }}>{hero.sub}</div>
              </div>
            </button>

            {/* Instructor + CTA row */}
            <div style={{ background: 'white', padding: '10px 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: PL,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 800, color: P, flexShrink: 0 }}>
                  A
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: T1, lineHeight: 1 }}>Dr. Amit Verma</div>
                  <div style={{ fontSize: 10, color: T3, marginTop: 1 }}>Applied Anatomy</div>
                </div>
              </div>
              <button onClick={() => goToSubject(primary)}
                style={{ display: 'flex', alignItems: 'center', gap: 4, background: P, color: 'white',
                  border: 'none', borderRadius: 50, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                {hero.btn}
                <IconChevron color="white"/>
              </button>
            </div>
          </div>

          {/* ── Rapid Revision card ── */}
          <button style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px',
            borderRadius: 14, border: `1.5px solid ${AMBERBORDER}`, background: AMBERBG,
            marginBottom: 20, cursor: 'pointer', textAlign: 'left' }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: '#F59E0B',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <IconLightning/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: AMBER }}>Rapid Revision 2.0</div>
              <div style={{ fontSize: 11, color: '#78350F', marginTop: 2 }}>Nursing under 100 hours</div>
            </div>
            <IconChevron color={AMBER}/>
          </button>

        </div>

        {/* ── SUBJECTS section ── */}
        <div style={{ padding: '0 16px 28px' }}>

          <div style={{ fontSize: 11, fontWeight: 700, color: T3,
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
            Subjects
          </div>

          {/* Year filter chips */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 14, overflowX: 'auto', scrollbarWidth: 'none' }}>
            {FILTERS.map(f => {
              const active = yearFilter === f.id
              return (
                <button key={f.id} onClick={() => setYearFilter(f.id)}
                  style={{ flexShrink: 0, padding: '5px 13px', borderRadius: 50,
                    border: `1.5px solid ${active ? P : BD}`,
                    background: active ? P : 'white',
                    color: active ? 'white' : T2,
                    fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}>
                  {f.label}
                </button>
              )
            })}
          </div>

          {/* Subject rows */}
          <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden',
            border: `1px solid ${BD}`, boxShadow: '0 2px 8px rgba(83,74,183,0.05)' }}>
            {filteredSubjects.map((subject, i) => {
              const { completed, total } = getStats(subject)
              const pct = total > 0 ? completed / total : 0
              const isLast = i === filteredSubjects.length - 1
              return (
                <button key={subject.id} onClick={() => goToSubject(subject)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 13,
                    padding: '14px 16px', background: 'white', border: 'none',
                    borderBottom: isLast ? 'none' : `1px solid ${BD}`,
                    cursor: 'pointer', textAlign: 'left' }}>

                  {/* Letter avatar */}
                  <div style={{ width: 46, height: 46, borderRadius: 13, background: subject.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    border: `1.5px solid ${subject.color}28` }}>
                    <span style={{ fontSize: 20, fontWeight: 900, color: subject.color, lineHeight: 1 }}>
                      {subject.name.charAt(0)}
                    </span>
                  </div>

                  {/* Text + thin progress bar */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: T1, marginBottom: 3 }}>{subject.name}</div>
                    <div style={{ fontSize: 11, color: T3, marginBottom: 6 }}>
                      Dr. Amit Verma · {completed}/{total} watched
                    </div>
                    <div style={{ height: 2.5, background: BD, borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct * 100}%`, background: subject.color,
                        borderRadius: 2, transition: 'width 0.3s' }}/>
                    </div>
                  </div>

                  <IconChevron/>
                </button>
              )
            })}
          </div>

        </div>

      </div>

      {/* ── Bottom nav bar ── */}
      <div style={{ height: 62, background: 'white', borderTop: `1px solid ${BD}`,
        display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        {[
          { id: 'home',   label: 'Home'   },
          { id: 'qbank',  label: 'QBank'  },
          { id: 'videos', label: 'Videos', active: true },
          { id: 'tests',  label: 'Tests'  },
          { id: 'buy',    label: 'Buy'    },
        ].map(tab => (
          <button key={tab.id}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0' }}>
            <NavIcon id={tab.id} active={!!tab.active}/>
            <span style={{ fontSize: 10, fontWeight: tab.active ? 700 : 500, color: tab.active ? P : T3 }}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      {/* ── Download bottom sheet ── */}
      {showDownloadSheet && (
        <div onClick={() => setShowDownloadSheet(false)}
          style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 40,
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: 'white', borderRadius: '22px 22px 0 0', overflow: 'hidden' }}>

            {/* Handle */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 6px' }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: BD }}/>
            </div>

            {/* Sheet header */}
            <div style={{ padding: '4px 20px 14px', borderBottom: `1px solid ${BD}`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: T1 }}>Download Videos</div>
                <div style={{ fontSize: 12, color: T3, marginTop: 3 }}>Save subjects for offline viewing</div>
              </div>
              <button onClick={() => setShowDownloadSheet(false)}
                style={{ width: 28, height: 28, borderRadius: 50, background: BG2, border: 'none',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: T2, fontSize: 18, lineHeight: 1 }}>
                ×
              </button>
            </div>

            {/* Subject download rows */}
            {SUBJECTS.map((subject, i) => {
              const { total } = getStats(subject)
              return (
                <div key={subject.id}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 20px',
                    borderBottom: i < SUBJECTS.length - 1 ? `1px solid ${BD}` : 'none' }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: subject.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 18, fontWeight: 900, color: subject.color }}>{subject.name.charAt(0)}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T1 }}>{subject.name}</div>
                    <div style={{ fontSize: 11, color: T3, marginTop: 2 }}>{total} videos available</div>
                  </div>
                  <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px',
                    borderRadius: 50, border: `1.5px solid ${P}`, background: 'white',
                    color: P, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                    <IconDownload color={P}/>
                    Download
                  </button>
                </div>
              )
            })}

            <div style={{ height: 28 }}/>
          </div>
        </div>
      )}

    </div>
  )
}
