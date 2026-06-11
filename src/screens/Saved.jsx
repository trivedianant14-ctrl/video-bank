import { useState } from 'react'

const P = '#534AB7', PL = '#EEEDFE'
const T1 = '#1a1a2e', T2 = '#5a5a78', T3 = '#9898b0', BD = '#e8e8f2', BG2 = '#f5f5fb'

const DUMMY_RESOURCES = [
  {
    id: 'ret-res-1', videoId: 'cv-part1', type: 'slides',
    videoTitle: 'Cardiovascular System — Part 1', subject: 'Applied Anatomy',
    savedAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'ret-res-2', videoId: 'cv-part1', type: 'notes',
    videoTitle: 'Cardiovascular System — Part 1', subject: 'Applied Anatomy',
    savedAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'ret-res-3', videoId: 'resp-part1', type: 'slides',
    videoTitle: 'Respiratory Physiology — Part 1', subject: 'Physiology',
    savedAt: Date.now() - 86400000 * 1,
  },
  {
    id: 'ret-res-4', videoId: 'cardio-cycle', type: 'notes',
    videoTitle: 'Cardiac Cycle Explained', subject: 'Applied Anatomy',
    savedAt: Date.now() - 86400000 * 7,
  },
]

function ResourceRow({ r, onRemove }) {
  const isSlides = r.type === 'slides'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderBottom: `1px solid ${BD}` }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: PL, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {isSlides
          ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={P} strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={P} strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: T1 }}>{isSlides ? 'Slides' : 'Notes'}</div>
        <div style={{ fontSize: 11, color: T2, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.videoTitle}</div>
        <div style={{ fontSize: 10, color: T3, marginTop: 1 }}>
          {r.subject} · Saved {new Date(r.savedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </div>
      </div>
      {onRemove && (
        <button onClick={() => onRemove(r.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T3, padding: 4, flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="3,6 5,6 21,6"/>
            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/>
          </svg>
        </button>
      )}
    </div>
  )
}

export default function Saved({ navigate, savedVideos = [], unsaveVideo, savedResources = [], unsaveResource, isReturningUser = false }) {
  const [activeTab, setActiveTab] = useState('videos')

  const displayResources = savedResources.length > 0
    ? savedResources
    : isReturningUser ? DUMMY_RESOURCES : []

  const totalCount = savedVideos.length + displayResources.length

  const TABS = [
    { id: 'videos',    label: 'Videos'    },
    { id: 'resources', label: 'Resources' },
    { id: 'qbank',     label: 'QBank'     },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white' }}>

      {/* Status bar */}
      <div style={{ padding: '12px 20px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: T1 }}>9:41</span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', color: T2 }}>
          <svg width="16" height="11" viewBox="0 0 30 20" fill="currentColor"><rect x="0" y="8" width="4" height="12" rx="1" opacity="0.4"/><rect x="7" y="5" width="4" height="15" rx="1" opacity="0.6"/><rect x="14" y="2" width="4" height="18" rx="1" opacity="0.8"/><rect x="21" y="0" width="4" height="20" rx="1"/></svg>
          <svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="2" stroke="currentColor"/><rect x="22" y="3.5" width="2.5" height="5" rx="1" fill="currentColor" opacity="0.4"/><rect x="1.5" y="1.5" width="15" height="9" rx="1.5" fill="currentColor"/></svg>
        </div>
      </div>

      {/* Header */}
      <div style={{ padding: '6px 16px 12px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${BD}`, flexShrink: 0 }}>
        <button onClick={() => navigate('home')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T1, display: 'flex', padding: 2 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15,18 9,12 15,6"/></svg>
        </button>
        <span style={{ fontSize: 16, fontWeight: 700, color: T1, flex: 1 }}>Saved</span>
        {totalCount > 0 && (
          <span style={{ fontSize: 12, color: T3, background: BG2, padding: '3px 10px', borderRadius: 20 }}>
            {totalCount}
          </span>
        )}
      </div>

      {/* Tabs */}
      <div style={{ padding: '12px 16px', borderBottom: `1px solid ${BD}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1, padding: '9px 4px', borderRadius: 50, fontSize: 12, fontWeight: 600,
                border: `1.5px solid ${tab.id === activeTab ? P : BD}`,
                background: tab.id === activeTab ? P : 'white',
                color: tab.id === activeTab ? 'white' : T3,
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── VIDEOS TAB ── */}
      {activeTab === 'videos' && (
        savedVideos.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '0 32px' }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: BG2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={T3} strokeWidth="1.8" strokeLinecap="round"><polygon points="23,7 16,12 23,17"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: T2, marginBottom: 6 }}>No saved videos yet</div>
              <div style={{ fontSize: 12, color: T3, lineHeight: 1.6 }}>Bookmark a video from the player to save it here.</div>
            </div>
          </div>
        ) : (
          <div className="scroll" style={{ flex: 1, overflowY: 'auto', padding: '8px 16px' }}>
            {savedVideos.map(v => (
              <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderBottom: `1px solid ${BD}` }}>
                <div style={{ width: 44, height: 32, background: '#1a1a2e', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.title}</div>
                  <div style={{ fontSize: 11, color: T3, marginTop: 2 }}>{v.subject}</div>
                </div>
                <button onClick={() => unsaveVideo?.(v.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: P, padding: 4 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={P} stroke={P} strokeWidth="1.8" strokeLinecap="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
                </button>
              </div>
            ))}
          </div>
        )
      )}

      {/* ── RESOURCES TAB ── */}
      {activeTab === 'resources' && (
        displayResources.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '0 32px' }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: BG2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={T3} strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/></svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: T2, marginBottom: 6 }}>No saved resources yet</div>
              <div style={{ fontSize: 12, color: T3, lineHeight: 1.6 }}>Bookmark slides or notes from any video to access them here.</div>
            </div>
          </div>
        ) : (
          <div className="scroll" style={{ flex: 1, overflowY: 'auto', padding: '8px 16px' }}>
            {isReturningUser && savedResources.length === 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: PL, borderRadius: 10, marginBottom: 12, marginTop: 4 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={P} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span style={{ fontSize: 11, color: P, fontWeight: 500 }}>Resources you bookmarked before — tap the bookmark icon on any video to add more</span>
              </div>
            )}
            {displayResources.map(r => (
              <ResourceRow
                key={r.id}
                r={r}
                onRemove={savedResources.length > 0 ? unsaveResource : null}
              />
            ))}
          </div>
        )
      )}

      {/* ── QBANK TAB ── */}
      {activeTab === 'qbank' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '0 32px' }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: BG2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={T3} strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: T2, marginBottom: 6 }}>No saved QBank questions yet</div>
            <div style={{ fontSize: 12, color: T3, lineHeight: 1.6 }}>Bookmark questions during a QBank session to review them here.</div>
          </div>
        </div>
      )}

    </div>
  )
}
