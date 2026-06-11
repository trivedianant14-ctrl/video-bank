import { useState, useRef, useEffect } from 'react'
import { VIDEO_DURATION_SECS, GROUP_SIZE } from '../data/subjects'

// ─── palette ──────────────────────────────────────────────────────────────────
const P = '#534AB7', PL = '#EEEDFE'
const T1 = '#1a1a2e', T2 = '#5a5a78', T3 = '#9898b0', BD = '#e8e8f2', BG2 = '#f5f5fb'
const GREEN = '#3B6D11', GREENBG = '#EAF3DE'

// ─── helpers ──────────────────────────────────────────────────────────────────
function vidStatus(id, vp) {
  const p = vp[id]
  if (!p || !p.secondsWatched) return 'not-started'
  if (p.completed) return 'completed'
  return 'paused'
}

function StatusDot({ status }) {
  if (status === 'completed') return (
    <div style={{ width: 20, height: 20, borderRadius: '50%', background: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
        <polyline points="1,4.5 4,7.5 10,1.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  )
  if (status === 'paused') return (
    <div style={{ width: 20, height: 20, borderRadius: '50%', background: PL, border: `1.5px solid ${P}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="7" height="8" viewBox="0 0 7 8" fill={P}><polygon points="0.5,0.5 6.5,4 0.5,7.5"/></svg>
    </div>
  )
  return (
    <div style={{ width: 20, height: 20, borderRadius: '50%', border: `1.5px solid ${BD}`, background: 'white', flexShrink: 0 }}/>
  )
}

// ─── main ──────────────────────────────────────────────────────────────────────
export default function PreVideoScreen({
  navigate,
  currentSubject,
  setCurrentVideo,
  isFreeTier,
  videoProgress = {},
}) {
  if (!currentSubject) return null

  const [activeFilter,    setActiveFilter]    = useState('all')
  const [showIndexSheet,    setShowIndexSheet]    = useState(false)
  const [showOrderModal,    setShowOrderModal]    = useState(false)
  const [showTutorSheet,    setShowTutorSheet]    = useState(false)
  const [showDownloadSheet, setShowDownloadSheet] = useState(false)
  const [toast,           setToast]           = useState(null)
  const [activeChapterId, setActiveChapterId] = useState(null)

  const scrollRef        = useRef(null)
  const chapterRefs      = useRef({})
  const activeChapterRef = useRef(null)

  // reset sticky header when filter changes
  useEffect(() => {
    setActiveChapterId(null)
    activeChapterRef.current = null
  }, [activeFilter])

  // ── chapters ────────────────────────────────────────────────────────────────
  const chapters  = currentSubject.chapters
    ? currentSubject.chapters
    : [{ id: 'all', name: currentSubject.name, videos: currentSubject.videos }]

  const allVideos      = chapters.flatMap(ch => ch.videos)
  const totalCount     = allVideos.length
  const completedCount = allVideos.filter(v => videoProgress[v.id]?.completed).length
  const progressPct    = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  // ── continue/resume card ────────────────────────────────────────────────────
  const inProgress = allVideos
    .filter(v => !videoProgress[v.id]?.completed && (videoProgress[v.id]?.secondsWatched || 0) > 0)
    .sort((a, b) => (videoProgress[b.id]?.lastWatched || 0) - (videoProgress[a.id]?.lastWatched || 0))

  let cta
  if (inProgress.length > 0) {
    const v   = inProgress[0]
    const pct = Math.round(((videoProgress[v.id]?.secondsWatched || 0) / VIDEO_DURATION_SECS) * 100)
    cta = { type: 'resume', video: v, pct }
  } else if (completedCount > 0) {
    const next = allVideos.find(v => !videoProgress[v.id]?.completed)
    cta = next ? { type: 'continue', video: next } : { type: 'all-done' }
  } else {
    cta = { type: 'start', video: allVideos[0] }
  }

  // ── filters ─────────────────────────────────────────────────────────────────
  const FILTERS = [
    { id: 'all',         label: 'All'         },
    ...(isFreeTier ? [{ id: 'free',        label: 'Free'        }] : []),
    { id: 'not-started', label: 'Not started' },
    { id: 'completed',   label: 'Completed'   },
    { id: 'paused',      label: 'Paused'      },
  ]

  const filteredChapters = chapters.map(ch => ({
    ...ch,
    videos: ch.videos.filter(v => {
      const s = vidStatus(v.id, videoProgress)
      if (activeFilter === 'free')        return v.free
      if (activeFilter === 'not-started') return s === 'not-started'
      if (activeFilter === 'completed')   return s === 'completed'
      if (activeFilter === 'paused')      return s === 'paused'
      return true
    }),
  })).filter(ch => ch.videos.length > 0)

  // ── suggested groups ────────────────────────────────────────────────────────
  const suggestedGroups = []
  for (let i = 0; i < allVideos.length; i += GROUP_SIZE) {
    suggestedGroups.push(allVideos.slice(i, i + GROUP_SIZE))
  }

  // ── handlers ────────────────────────────────────────────────────────────────
  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const handleVideoTap = (video) => {
    if (isFreeTier && !video.free) { showToast('This video requires a paid plan'); return }
    setCurrentVideo(video)
    navigate('videoplayer')
  }

  const jumpToChapter = (chapterId) => {
    const el  = chapterRefs.current[chapterId]
    const box = scrollRef.current
    if (el && box) box.scrollTop += el.getBoundingClientRect().top - box.getBoundingClientRect().top
    setShowIndexSheet(false)
    setActiveFilter('all')
  }

  const handleScroll = () => {
    const box = scrollRef.current
    if (!box) return
    const boxTop = box.getBoundingClientRect().top
    // threshold = filter row height so chapter name triggers at correct point
    let current = null
    for (const ch of filteredChapters) {
      const el = chapterRefs.current[ch.id]
      if (!el) continue
      if (el.getBoundingClientRect().top - boxTop <= 50) current = ch
    }
    if (current?.id !== activeChapterRef.current?.id) {
      activeChapterRef.current = current
      setActiveChapterId(current?.id ?? null)
    }
  }

  const ctaLabel = cta.type === 'resume' ? 'Resume' : cta.type === 'continue' ? 'Continue with' : 'Start with'

  // ── render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white', position: 'relative', overflow: 'hidden' }}>

      {/* Status bar */}
      <div style={{ padding: '12px 20px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: T1 }}>9:41</span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', color: T2 }}>
          <svg width="16" height="11" viewBox="0 0 30 20" fill="currentColor"><rect x="0" y="8" width="4" height="12" rx="1" opacity="0.4"/><rect x="7" y="5" width="4" height="15" rx="1" opacity="0.6"/><rect x="14" y="2" width="4" height="18" rx="1" opacity="0.8"/><rect x="21" y="0" width="4" height="20" rx="1"/></svg>
          <svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="2" stroke="currentColor"/><rect x="22" y="3.5" width="2.5" height="5" rx="1" fill="currentColor" opacity="0.4"/><rect x="1.5" y="1.5" width="15" height="9" rx="1.5" fill="currentColor"/></svg>
        </div>
      </div>

      {/* Top bar: Back · Subject + tutor byline */}
      <div style={{ padding: '4px 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${BD}`, flexShrink: 0 }}>
        <button
          onClick={() => navigate('home')}
          style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px 4px 0', flexShrink: 0 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T2} strokeWidth="2.2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
          <span style={{ fontSize: 13, color: T2 }}>Back</span>
        </button>

        {/* Subject name + tappable tutor byline */}
        <div style={{ flex: 1, textAlign: 'center', padding: '0 8px' }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: T1 }}>{currentSubject.name}</div>
          <button
            onClick={() => setShowTutorSheet(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0 0', display: 'inline-flex', alignItems: 'center', gap: 4 }}
          >
            <span style={{ fontSize: 11, color: T3 }}>🎓</span>
            <span style={{ fontSize: 11, color: T3, fontWeight: 500 }}>Dr. Amit Verma</span>
          </button>
        </div>

        {/* Download button (mirrors Back button width to keep title centred) */}
        <button
          onClick={() => navigate('downloads')}
          aria-label="Download videos"
          style={{ width: 60, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0 4px 8px' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T2} strokeWidth="2.2" strokeLinecap="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="7,10 12,15 17,10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </button>
      </div>

      {/* ── Scrollable body ──────────────────────────────────────────────── */}
      <div ref={scrollRef} onScroll={handleScroll} className="scroll" style={{ flex: 1, overflowY: 'auto' }}>

        {/* Progress summary */}
        <div style={{ padding: '16px 16px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 6 }}>
            <div>
              <span style={{ fontSize: 18, fontWeight: 800, color: completedCount > 0 ? P : T1 }}>{completedCount}</span>
              <span style={{ fontSize: 13, color: T3, fontWeight: 500 }}> of {totalCount} watched</span>
            </div>
            <span style={{ fontSize: 11, color: completedCount === totalCount && totalCount > 0 ? GREEN : T3, fontWeight: 600 }}>
              {progressPct}%{completedCount === totalCount && totalCount > 0 ? ' · All done ✓' : ''}
            </span>
          </div>
          <div style={{ height: 3, background: BD, borderRadius: 2, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 2, transition: 'width 0.4s',
              width: `${progressPct}%`,
              background: completedCount === totalCount && totalCount > 0 ? GREEN : P,
            }}/>
          </div>
        </div>

        {/* Continue/Resume card */}
        <div style={{ padding: '12px 16px 0' }}>
          {cta.type === 'all-done' ? (
            <div style={{ background: GREENBG, borderRadius: 12, border: `1.5px solid ${GREEN}44`, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" fill={GREEN}/><polyline points="5,10.5 8.5,14 15,6.5" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: GREEN }}>All done!</div>
                <div style={{ fontSize: 11, color: GREEN, opacity: 0.8 }}>You've completed all videos in this subject.</div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => handleVideoTap(cta.video)}
              style={{ width: '100%', textAlign: 'left', background: PL, borderRadius: 12, border: `1.5px solid ${P}22`, padding: '12px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
            >
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: P, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 20 20" fill="white"><polygon points="4,3 17,10 4,17"/></svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: P, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{ctaLabel}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: T1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cta.video?.title}</div>
                {cta.type === 'resume' && (
                  <div style={{ marginTop: 6 }}>
                    <div style={{ height: 3, background: `${P}33`, borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 2, background: P, width: `${cta.pct}%` }}/>
                    </div>
                    <div style={{ fontSize: 10, color: P, fontWeight: 600, marginTop: 3 }}>{cta.pct}% watched</div>
                  </div>
                )}
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={P} strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          )}
        </div>

        {/* Expert plan CTA */}
        <div style={{ padding: '10px 16px 0' }}>
          <button
            onClick={() => setShowOrderModal(true)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderRadius: 12, border: `1.5px solid ${P}28`, background: `linear-gradient(135deg, ${PL} 0%, white 100%)`, cursor: 'pointer' }}
          >
            {/* Icon */}
            <div style={{ width: 38, height: 38, borderRadius: 10, background: P, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round">
                <rect x="3" y="4" width="18" height="17" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8"  y1="2" x2="8"  y2="6"/>
                <line x1="3"  y1="10" x2="21" y2="10"/>
                <line x1="8"  y1="14" x2="8"  y2="14" strokeWidth="2.5"/>
                <line x1="12" y1="14" x2="12" y2="14" strokeWidth="2.5"/>
                <line x1="8"  y1="18" x2="8"  y2="18" strokeWidth="2.5"/>
                <line x1="12" y1="18" x2="12" y2="18" strokeWidth="2.5"/>
              </svg>
            </div>
            {/* Text */}
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T1, marginBottom: 2 }}>
                Dr. Amit's {suggestedGroups.length}-day learning plan
              </div>
              <div style={{ fontSize: 11, color: T2, lineHeight: 1.4 }}>
                Complete {currentSubject.name} step by step — see the full roadmap
              </div>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={P} strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0 }}><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>

        {/* ── Sticky filter row ────────────────────────────── */}
        <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'white', borderBottom: `1px solid ${BD}`, paddingTop: 10, paddingBottom: 10 }}>
          <div style={{ display: 'flex', gap: 6, paddingLeft: 16, overflowX: 'auto', scrollbarWidth: 'none' }}>
            {FILTERS.map(f => {
              const active = activeFilter === f.id
              return (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  style={{ flexShrink: 0, padding: '6px 14px', borderRadius: 50, cursor: 'pointer', fontSize: 12, fontWeight: 600, background: active ? P : 'white', color: active ? 'white' : T2, border: `1.5px solid ${active ? P : BD}`, transition: 'all 0.15s' }}
                >
                  {f.label}
                </button>
              )
            })}
            <div style={{ width: 8, flexShrink: 0 }}/>
          </div>
        </div>

        {/* ── Sticky chapter indicator (below filters) ─────── */}
        {activeChapterId && (() => {
          const ch = filteredChapters.find(c => c.id === activeChapterId)
          if (!ch) return null
          const done = ch.videos.filter(v => videoProgress[v.id]?.completed).length
          return (
            <div
              key={activeChapterId}
              className="chapter-header-enter"
              style={{ position: 'sticky', top: 49, zIndex: 8, background: 'white', borderBottom: `1px solid ${BD}`, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 2px 6px rgba(83,74,183,0.06)' }}
            >
              <div style={{ width: 3, height: 16, borderRadius: 2, background: currentSubject.color || P, flexShrink: 0 }}/>
              <span style={{ fontSize: 12, fontWeight: 700, color: T2, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{ch.name}</span>
              <span style={{ fontSize: 11, color: T3 }}>{done}/{ch.videos.length}</span>
            </div>
          )
        })()}

        {/* Video list */}
        {filteredChapters.length === 0 ? (
          <div style={{ padding: '40px 16px', textAlign: 'center', color: T3 }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={BD} strokeWidth="1.5" style={{ display: 'block', margin: '0 auto 10px' }}><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            <div style={{ fontSize: 14, fontWeight: 600 }}>No videos match this filter</div>
          </div>
        ) : filteredChapters.map(ch => (
          <div key={ch.id} ref={el => { chapterRefs.current[ch.id] = el }}>
            {/* Chapter divider (not sticky — handled by the single sticky header above) */}
            <div style={{ background: BG2, borderBottom: `1px solid ${BD}`, padding: '6px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 3, height: 14, borderRadius: 2, background: currentSubject.color || P, flexShrink: 0 }}/>
              <span style={{ fontSize: 11, fontWeight: 700, color: T3, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{ch.name}</span>
              <span style={{ fontSize: 11, color: T3 }}>
                {ch.videos.filter(v => videoProgress[v.id]?.completed).length}/{ch.videos.length}
              </span>
            </div>

            {/* Video rows */}
            {ch.videos.map(video => {
              const status = vidStatus(video.id, videoProgress)
              const locked = isFreeTier && !video.free
              const pct    = status === 'paused'
                ? Math.round(((videoProgress[video.id]?.secondsWatched || 0) / VIDEO_DURATION_SECS) * 100)
                : 0

              const accentColor = locked ? BD
                : status === 'completed' ? GREEN
                : status === 'paused'    ? P
                : 'transparent'

              return (
                <button
                  key={video.id}
                  onClick={() => handleVideoTap(video)}
                  style={{
                    width: '100%', textAlign: 'left', display: 'flex', alignItems: 'flex-start', gap: 12,
                    padding: '13px 16px 13px 13px',
                    background: status === 'completed' && !locked ? '#fafffe' : locked ? '#fafafa' : 'white',
                    border: 'none', borderBottom: `1px solid ${BD}`,
                    borderLeft: `3px solid ${accentColor}`,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ paddingTop: 2 }}>
                    <StatusDot status={locked ? 'not-started' : status}/>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: locked ? T3 : status === 'completed' ? T2 : T1, lineHeight: 1.35, marginBottom: 3 }}>
                      {video.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 11, color: T3 }}>Uploaded {video.uploadDate}</span>
                      <span style={{ fontSize: 11, color: T3 }}>·</span>
                      <span style={{ fontSize: 11, color: T3 }}>{video.duration}</span>
                    </div>
                    {status === 'paused' && !locked && (
                      <div style={{ marginTop: 6 }}>
                        <div style={{ height: 2.5, background: BD, borderRadius: 2, overflow: 'hidden', width: '75%' }}>
                          <div style={{ height: '100%', background: P, borderRadius: 2, width: `${pct}%` }}/>
                        </div>
                        <div style={{ fontSize: 10, color: P, fontWeight: 600, marginTop: 2 }}>{pct}% watched</div>
                      </div>
                    )}
                  </div>
                  {locked ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, paddingTop: 2, flexShrink: 0 }}>
                      <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
                        <rect x="1.5" y="6.5" width="11" height="9" rx="2" stroke={T3} strokeWidth="1.5"/>
                        <path d="M4 6.5V5a3 3 0 016 0v1.5" stroke={T3} strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      <span style={{ fontSize: 9, color: T3, fontWeight: 600 }}>Paid</span>
                    </div>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T3} strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 4 }}><path d="M9 18l6-6-6-6"/></svg>
                  )}
                </button>
              )
            })}
          </div>
        ))}

        <div style={{ height: 80 }}/>
      </div>

      {/* Floating Index button */}
      {currentSubject.chapters && (
        <button
          onClick={() => setShowIndexSheet(true)}
          style={{ position: 'absolute', bottom: 20, right: 16, width: 48, height: 48, borderRadius: '50%', background: P, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(83,74,183,0.4)', zIndex: 10 }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6"  x2="21" y2="6"/>
            <line x1="3" y1="12" x2="15" y2="12"/>
            <line x1="3" y1="18" x2="18" y2="18"/>
          </svg>
        </button>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: 'absolute', bottom: 76, left: '50%', transform: 'translateX(-50%)', background: '#1a1a2e', color: 'white', borderRadius: 20, padding: '8px 16px', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', zIndex: 50, boxShadow: '0 4px 12px rgba(0,0,0,0.25)', pointerEvents: 'none' }}>
          🔒 {toast}
        </div>
      )}

      {/* Index sheet */}
      {showIndexSheet && (
        <div onClick={() => setShowIndexSheet(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 30, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '20px 20px 0 0', paddingBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: BD }}/>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 12px' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: T1 }}>Chapters</div>
              <button onClick={() => setShowIndexSheet(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T3} strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            {chapters.map((ch, i) => (
              <button
                key={ch.id}
                onClick={() => jumpToChapter(ch.id)}
                style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 20px', background: 'none', border: 'none', borderTop: `1px solid ${BD}`, cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: PL, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: P }}>{i + 1}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: T1 }}>{ch.name}</div>
                    <div style={{ fontSize: 11, color: T3 }}>{ch.videos.length} videos</div>
                  </div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T3} strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Suggested order modal — day-wise timeline */}
      {showOrderModal && (
        <div onClick={() => setShowOrderModal(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 30, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '20px 20px 0 0', maxHeight: '82%', display: 'flex', flexDirection: 'column' }}>
            {/* Handle */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px', flexShrink: 0 }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: BD }}/>
            </div>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '6px 20px 14px', flexShrink: 0, borderBottom: `1px solid ${BD}` }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: T1 }}>Expert Learning Path</div>
                <div style={{ fontSize: 11, color: T2, marginTop: 3, lineHeight: 1.4 }}>Curated by Dr. Amit Verma · Each day builds on the last</div>
              </div>
              <button onClick={() => setShowOrderModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0, marginTop: 2 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T3} strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            {/* Timeline scroll area */}
            <div className="scroll" style={{ overflowY: 'auto', padding: '20px 20px 32px' }}>
              {suggestedGroups.map((group, gi) => {
                const dayNum    = gi + 1
                const isLast    = gi === suggestedGroups.length - 1
                const doneCount = group.filter(v => vidStatus(v.id, videoProgress) === 'completed').length
                const allDone   = doneCount === group.length
                const anyDone   = doneCount > 0
                const badgeBg   = allDone ? GREEN : anyDone ? P : 'white'
                const badgeText = allDone || anyDone ? 'white' : P

                return (
                  <div key={gi} style={{ display: 'flex', gap: 0 }}>

                    {/* ── Timeline column ───────────────────── */}
                    <div style={{ width: 44, display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                      {/* Day badge */}
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: badgeBg, border: `2px solid ${allDone ? GREEN : P}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1 }}>
                        {allDone
                          ? <svg width="13" height="10" viewBox="0 0 13 10" fill="none"><polyline points="1,5 4.5,8.5 12,1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          : <span style={{ fontSize: 11, fontWeight: 800, color: badgeText }}>{dayNum}</span>
                        }
                      </div>
                      {/* Connector line */}
                      {!isLast && (
                        <div style={{ flex: 1, minHeight: 16, width: 2, background: allDone ? GREEN + '55' : BD, borderRadius: 1, margin: '2px 0' }}/>
                      )}
                    </div>

                    {/* ── Day content ───────────────────────── */}
                    <div style={{ flex: 1, paddingBottom: isLast ? 0 : 20 }}>
                      {/* Day label row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 32, marginBottom: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: allDone ? GREEN : T1 }}>Day {dayNum}</span>
                        <span style={{ fontSize: 11, color: allDone ? GREEN : T3, fontWeight: allDone ? 600 : 400 }}>
                          {allDone ? `${group.length}/${group.length} done ✓` : anyDone ? `${doneCount}/${group.length} done` : `${group.length} video${group.length > 1 ? 's' : ''}`}
                        </span>
                      </div>

                      {/* Video list */}
                      {group.map((video, vi) => {
                        const status    = vidStatus(video.id, videoProgress)
                        const isLastVid = vi === group.length - 1
                        return (
                          <button
                            key={video.id}
                            onClick={() => { setShowOrderModal(false); handleVideoTap(video) }}
                            style={{
                              width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10,
                              padding: '9px 12px',
                              background: status === 'completed' ? GREENBG : 'white',
                              borderRadius: 10,
                              border: `1.5px solid ${status === 'completed' ? GREEN + '40' : BD}`,
                              marginBottom: isLastVid ? 0 : 6,
                              cursor: 'pointer',
                            }}
                          >
                            <StatusDot status={status}/>
                            <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: status === 'completed' ? GREEN : T1, lineHeight: 1.3 }}>
                              {video.title}
                            </div>
                            <span style={{ fontSize: 11, color: T3, flexShrink: 0, marginLeft: 4 }}>{video.duration}</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T3} strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0 }}><path d="M9 18l6-6-6-6"/></svg>
                          </button>
                        )
                      })}
                    </div>

                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tutor info sheet */}
      {showDownloadSheet && (
        <div onClick={() => setShowDownloadSheet(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 30, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '20px 20px 0 0', paddingBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: BD }}/>
            </div>
            <div style={{ padding: '8px 20px 14px', borderBottom: `1px solid ${BD}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: T1 }}>Download Videos</div>
                <div style={{ fontSize: 12, color: T3, marginTop: 3 }}>Save for offline viewing</div>
              </div>
              <button onClick={() => setShowDownloadSheet(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T3} strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            {/* Subject row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: currentSubject.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 19, fontWeight: 900, color: currentSubject.color }}>{currentSubject.name.charAt(0)}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: T1 }}>{currentSubject.name}</div>
                <div style={{ fontSize: 12, color: T3, marginTop: 2 }}>{totalCount} videos available</div>
              </div>
              <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 50, border: `1.5px solid ${P}`, background: 'white', color: P, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={P} strokeWidth="2.2" strokeLinecap="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="7,10 12,15 17,10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download all
              </button>
            </div>
            <div style={{ padding: '0 20px', borderTop: `1px solid ${BD}` }}>
              <div style={{ fontSize: 11, color: T3, padding: '10px 0', lineHeight: 1.5 }}>
                Videos will be available offline for 30 days. Requires ~{Math.round(totalCount * 150)} MB of storage.
              </div>
            </div>
          </div>
        </div>
      )}

      {showTutorSheet && (
        <div onClick={() => setShowTutorSheet(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 30, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '20px 20px 0 0', paddingBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: BD }}/>
            </div>
            <div style={{ padding: '8px 20px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: PL, border: `2px solid ${P}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>🎓</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: T1 }}>Dr. Amit Verma</div>
                  <div style={{ fontSize: 12, color: P, fontWeight: 600, marginTop: 2 }}>Lead Educator · NPrep</div>
                </div>
              </div>
              <button onClick={() => setShowTutorSheet(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0, marginTop: 4 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T3} strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div style={{ padding: '14px 20px 0' }}>
              <div style={{ fontSize: 13, color: T2, lineHeight: 1.6, marginBottom: 12 }}>
                Over 12 years teaching nursing students across India. Designed the NPrep curriculum to bridge the gap between textbook learning and clinical reasoning for Indian nursing exams.
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['B.Sc Nursing', 'M.Sc Nursing', 'Ex-AIIMS Faculty', 'NPrep Curriculum'].map(tag => (
                  <span key={tag} style={{ fontSize: 11, fontWeight: 600, color: P, background: PL, padding: '4px 10px', borderRadius: 50 }}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
