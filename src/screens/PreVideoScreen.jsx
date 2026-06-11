import { useState, useRef, useEffect } from 'react'

const P = '#534AB7', PL = '#EEEDFE', PD = '#3C3489'
const T1 = '#1a1a2e', T2 = '#5a5a78', T3 = '#9898b0', BD = '#e8e8f2', BG2 = '#f5f5fb'
const GREEN = '#3B6D11', GREENBG = '#EAF3DE', GREENBORDER = '#97C459'
const AMBER = '#633806', AMBERBG = '#FAEEDA', AMBERBORDER = '#FAC775'

const TOTAL_DURATION_SECS = 720

const TUTOR = {
  name: 'Dr. Priya Mehta',
  role: 'Senior Nursing Faculty · NPrep',
  bio: 'Over 14 years teaching clinical nursing in India. Known for breaking down complex physiology into exam-ready concepts — especially for tier 2/3 students preparing for NCLEX and state exams.',
  initials: 'PM',
}

const FILTERS = [
  { id: 'all',        label: 'All' },
  { id: 'notstarted', label: 'Not started' },
  { id: 'paused',     label: 'In progress' },
  { id: 'completed',  label: 'Completed' },
]

const getPercent = (prog) => {
  if (!prog) return 0
  if (prog.completed) return 100
  return Math.round((prog.secondsWatched / TOTAL_DURATION_SECS) * 100)
}

export default function PreVideoScreen({
  navigate,
  currentSubject,
  setCurrentVideo,
  savedVideos = [],
  isReturningUser = false,
  isFreeTier = false,
  videoProgress = {},
}) {
  const [activeFilter, setActiveFilter] = useState('all')
  const [showLockedVideos, setShowLockedVideos] = useState(false)
  const [stickyLabel, setStickyLabel] = useState('')
  const scrollRef = useRef(null)
  const listHeaderRef = useRef(null)

  if (!currentSubject) return null
  const { name: subjectName, color: subjectColor, videos } = currentSubject

  // Free-tier: lock the last third of videos
  const lockThreshold = Math.ceil(videos.length * 0.66)
  const videosWithMeta = videos.map((v, i) => ({
    ...v,
    locked: isFreeTier && !showLockedVideos && i >= lockThreshold,
    lockedHidden: isFreeTier && !showLockedVideos && i >= lockThreshold,
    prog: videoProgress[v.id] || { secondsWatched: 0, completed: false, lastWatched: null },
  }))
  const visibleVideos = videosWithMeta.filter(v => !v.lockedHidden || showLockedVideos)

  // Filtered list (progress filters)
  const filteredVideos = visibleVideos.filter(v => {
    if (activeFilter === 'notstarted') return !v.prog.completed && v.prog.secondsWatched === 0
    if (activeFilter === 'completed')  return v.prog.completed
    if (activeFilter === 'paused')     return !v.prog.completed && v.prog.secondsWatched > 0
    return true
  })

  // Progress summary
  const completedCount = videosWithMeta.filter(v => v.prog.completed).length
  const inProgressCount = videosWithMeta.filter(v => !v.prog.completed && v.prog.secondsWatched > 0).length
  const totalCount = videos.length

  // Continue / Resume card
  const resumeCard = (() => {
    const inProgress = videosWithMeta
      .filter(v => !v.prog.completed && v.prog.secondsWatched > 0)
      .sort((a, b) => (b.prog.lastWatched || 0) - (a.prog.lastWatched || 0))
    if (inProgress.length > 0) return { type: 'resume', video: inProgress[0] }
    const nextUp = videosWithMeta.find(v => !v.prog.completed)
    if (!nextUp) return { type: 'allDone' }
    return { type: completedCount > 0 ? 'continue' : 'start', video: nextUp }
  })()

  // Suggested order: pair videos
  const suggestedGroups = []
  for (let i = 0; i < videos.length; i += 2) suggestedGroups.push(videos.slice(i, i + 2))

  // Sticky label from scroll
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onScroll = () => {
      if (listHeaderRef.current) {
        const rect = listHeaderRef.current.getBoundingClientRect()
        setStickyLabel(rect.top <= 56 ? subjectName : '')
      }
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [subjectName])

  const handleVideoTap = (v) => {
    if (v.locked) return
    setCurrentVideo(v)
    navigate('videoplayer')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white', position: 'relative' }}>

      {/* ── FIXED HEADER ── */}
      <div style={{
        flexShrink: 0, borderBottom: `1px solid ${BD}`,
        background: 'white', zIndex: 10,
      }}>
        <div style={{ padding: '12px 16px 10px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => navigate('home')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: T1, display: 'flex', padding: 2 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15,18 9,12 15,6"/></svg>
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: T1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {stickyLabel || subjectName}
            </div>
            <div style={{ fontSize: 11, color: T3, marginTop: 1 }}>NPrep · Video Bank</div>
          </div>
          <button
            onClick={() => navigate('saved')}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={savedVideos.length > 0 ? P : 'none'} stroke={savedVideos.length > 0 ? P : T3} strokeWidth="1.8" strokeLinecap="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
            </svg>
            <span style={{ fontSize: 9, color: savedVideos.length > 0 ? P : T3, fontWeight: 600 }}>Saved</span>
          </button>
        </div>

        {/* Free preview banner */}
        {isFreeTier && (
          <div style={{ padding: '8px 16px', background: AMBERBG, borderTop: `1px solid ${AMBERBORDER}`, display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span style={{ fontSize: 12, color: AMBER, flex: 1, lineHeight: 1.4 }}>
              Free preview · <strong>{lockThreshold} of {totalCount}</strong> videos unlocked
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <span style={{ fontSize: 11, color: AMBER, fontWeight: 500 }}>Show all</span>
              <div
                onClick={() => setShowLockedVideos(v => !v)}
                style={{
                  width: 34, height: 18, borderRadius: 9, cursor: 'pointer',
                  background: showLockedVideos ? '#C05C0D' : AMBERBORDER,
                  position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                }}
              >
                <div style={{ position: 'absolute', top: 2, left: showLockedVideos ? 18 : 2, width: 14, height: 14, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── SCROLLABLE BODY ── */}
      <div ref={scrollRef} className="scroll" style={{ flex: 1, overflowY: 'auto' }}>

        {/* Progress summary */}
        <div style={{ padding: '14px 16px 12px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: T1, marginBottom: 6 }}>
              {completedCount === 0
                ? `${totalCount} video${totalCount > 1 ? 's' : ''} in this subject`
                : `${completedCount} of ${totalCount} watched`}
            </div>
            <div style={{ height: 4, background: BD, borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 2,
                width: `${(completedCount / totalCount) * 100}%`,
                background: completedCount === totalCount ? GREEN : P,
                transition: 'width 0.3s',
              }} />
            </div>
          </div>
          {inProgressCount > 0 && (
            <div style={{ fontSize: 11, color: T3, background: BG2, padding: '4px 9px', borderRadius: 50, flexShrink: 0 }}>
              {inProgressCount} in progress
            </div>
          )}
        </div>

        {/* Continue / Resume card */}
        <div style={{ padding: '0 16px 14px' }}>
          {resumeCard.type === 'allDone' ? (
            <div style={{ padding: '14px 16px', borderRadius: 14, background: GREENBG, border: `1.5px solid ${GREENBORDER}`, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: GREEN }}>All videos completed!</div>
                <div style={{ fontSize: 11, color: GREEN, opacity: 0.8, marginTop: 2 }}>You can rewatch any video from the list below.</div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => handleVideoTap(resumeCard.video)}
              style={{
                width: '100%', padding: '14px 16px', borderRadius: 14,
                background: PL, border: `1.5px solid ${P}44`,
                textAlign: 'left', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 12,
              }}
            >
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: P, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white" style={{ marginLeft: resumeCard.type === 'resume' ? 2 : 0 }}><polygon points="5,3 19,12 5,21"/></svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: PD, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
                  {resumeCard.type === 'resume' ? 'Resume where you left off' : resumeCard.type === 'continue' ? 'Continue with' : 'Start with'}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: T1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {resumeCard.video.title}
                </div>
                {resumeCard.type === 'resume' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                    <div style={{ flex: 1, height: 3, background: `${P}30`, borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${getPercent(resumeCard.video.prog)}%`, background: P, borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: 10, color: PD, fontWeight: 600, flexShrink: 0 }}>{getPercent(resumeCard.video.prog)}%</span>
                  </div>
                )}
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={P} strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0 }}><path d="M9 18l6-6-6-6"/></svg>
            </button>
          )}
        </div>

        {/* Suggested order */}
        <div style={{ padding: '4px 16px 16px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T3, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Suggested order</div>
          {suggestedGroups.map((group, gi) => {
            const groupAllDone = group.every(v => videoProgress[v.id]?.completed)
            const groupStarted = group.some(v => videoProgress[v.id]?.secondsWatched > 0)
            return (
              <div key={gi} style={{ marginBottom: 8, borderRadius: 12, border: `1px solid ${BD}`, overflow: 'hidden' }}>
                {/* Group header */}
                <div style={{ padding: '9px 14px', background: groupAllDone ? GREENBG : BG2, display: 'flex', alignItems: 'center', gap: 8, borderBottom: `1px solid ${BD}` }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                    background: groupAllDone ? GREEN : groupStarted ? P : BD,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {groupAllDone
                      ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>
                      : <span style={{ fontSize: 10, fontWeight: 800, color: groupStarted ? 'white' : T3 }}>{gi + 1}</span>}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: groupAllDone ? GREEN : T2, flex: 1 }}>
                    {group.length === 1
                      ? `Video ${gi * 2 + 1}`
                      : `Videos ${gi * 2 + 1} – ${gi * 2 + group.length}`}
                  </span>
                  <span style={{ fontSize: 10, color: groupAllDone ? GREEN : T3, fontWeight: 600 }}>
                    {groupAllDone ? 'Done ✓' : `${group.reduce((sum, v) => sum + (videoProgress[v.id]?.completed ? 1 : 0), 0)}/${group.length}`}
                  </span>
                </div>
                {/* Group videos */}
                {group.map((v) => {
                  const prog = videoProgress[v.id] || {}
                  const pct = getPercent(prog)
                  return (
                    <div
                      key={v.id}
                      onClick={() => { setCurrentVideo(v); navigate('videoplayer') }}
                      style={{ padding: '10px 14px', background: 'white', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', borderTop: `1px solid ${BD}` }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: prog.completed ? 500 : 500, color: prog.completed ? T2 : T1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {v.title}
                        </div>
                        <div style={{ fontSize: 11, color: T3, marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>{v.duration}</span>
                          {prog.completed && <span style={{ color: GREEN, fontWeight: 600 }}>· Completed</span>}
                          {!prog.completed && pct > 0 && <span style={{ color: P, fontWeight: 600 }}>· {pct}% watched</span>}
                        </div>
                      </div>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T3} strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>

        {/* Progress filters — positioned above the full video list, within comfortable thumb reach */}
        <div ref={listHeaderRef} style={{ padding: '0 16px 10px', display: 'flex', gap: 6, overflowX: 'auto' }}>
          {FILTERS.map(f => {
            const count = videosWithMeta.filter(v => {
              if (f.id === 'all')        return true
              if (f.id === 'notstarted') return !v.prog.completed && v.prog.secondsWatched === 0
              if (f.id === 'completed')  return v.prog.completed
              if (f.id === 'paused')     return !v.prog.completed && v.prog.secondsWatched > 0
              return true
            }).length
            const active = activeFilter === f.id
            return (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                style={{
                  padding: '7px 13px', borderRadius: 50, flexShrink: 0, cursor: 'pointer',
                  border: `1.5px solid ${active ? P : BD}`,
                  background: active ? PL : 'white',
                  color: active ? PD : T3,
                  fontSize: 12, fontWeight: active ? 700 : 500,
                  display: 'flex', alignItems: 'center', gap: 5,
                }}
              >
                {f.label}
                <span style={{ fontSize: 10, fontWeight: 700, color: active ? PD : T3, background: active ? `${P}22` : BD, borderRadius: 50, padding: '1px 5px' }}>{count}</span>
              </button>
            )
          })}
        </div>

        {/* Video list */}
        <div style={{ padding: '0 16px' }}>
          {filteredVideos.length === 0 ? (
            <div style={{ padding: '32px 0', textAlign: 'center', color: T3, fontSize: 13 }}>
              No videos match this filter.
            </div>
          ) : filteredVideos.map((v, i) => {
            const pct = getPercent(v.prog)
            const isLast = i === filteredVideos.length - 1
            return (
              <div
                key={v.id}
                onClick={() => handleVideoTap(v)}
                style={{
                  padding: '13px 0',
                  borderBottom: isLast ? 'none' : `1px solid ${BD}`,
                  cursor: v.locked ? 'default' : 'pointer',
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  opacity: v.locked ? 0.55 : 1,
                }}
              >
                {/* Status circle */}
                <div style={{
                  width: 30, height: 30, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                  background: v.prog.completed ? GREEN : v.prog.secondsWatched > 0 ? P : v.locked ? BD : BG2,
                  border: v.locked || (!v.prog.completed && v.prog.secondsWatched === 0) ? `1.5px solid ${BD}` : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {v.locked
                    ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={T3} strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                    : v.prog.completed
                    ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>
                    : v.prog.secondsWatched > 0
                    ? <svg width="10" height="10" viewBox="0 0 24 24" fill="white" style={{ marginLeft: 1 }}><polygon points="5,3 19,12 5,21"/></svg>
                    : <span style={{ fontSize: 10, fontWeight: 700, color: T3 }}>{videos.indexOf(v) + 1}</span>}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: T1, lineHeight: 1.35, marginBottom: 2 }}>{v.title}</div>
                  <div style={{ fontSize: 11, color: T3, marginBottom: v.prog.secondsWatched > 0 && !v.prog.completed ? 6 : 0 }}>
                    Uploaded {v.uploadDate} · {v.duration}
                    {v.locked && <span style={{ color: AMBER, fontWeight: 600, marginLeft: 6 }}>· Locked</span>}
                  </div>
                  {/* Progress bar (in-progress only) */}
                  {v.prog.secondsWatched > 0 && !v.prog.completed && (
                    <div style={{ height: 3, background: `${P}25`, borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: P, borderRadius: 2 }} />
                    </div>
                  )}
                </div>

                {!v.locked && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T3} strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 4 }}><path d="M9 18l6-6-6-6"/></svg>
                )}
              </div>
            )
          })}
        </div>

        {/* Tutor card — low emphasis, bottom of screen */}
        <div style={{ margin: '16px 16px 32px', padding: '14px 14px', borderRadius: 14, border: `1px solid ${BD}`, background: BG2, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: PL, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13, fontWeight: 800, color: PD }}>
            {TUTOR.initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T1 }}>{TUTOR.name}</div>
            <div style={{ fontSize: 11, color: P, fontWeight: 600, marginBottom: 5 }}>{TUTOR.role}</div>
            <div style={{ fontSize: 12, color: T2, lineHeight: 1.6 }}>{TUTOR.bio}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
