import { SUBJECTS } from '../data/subjects'

const P = '#534AB7', PL = '#EEEDFE'
const T1 = '#1a1a2e', T2 = '#5a5a78', T3 = '#9898b0', BD = '#e8e8f2', BG2 = '#f5f5fb'
const GREEN = '#3B6D11', GREENBG = '#EAF3DE'

export default function VideoHome({
  navigate,
  setCurrentSubject,
  savedVideos = [],
  isReturningUser, setIsReturningUser,
  isFreeTier, setIsFreeTier,
  videoProgress = {},
}) {
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
      <div style={{ padding: '6px 16px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${BD}`, flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: T1 }}>Video Bank</div>
          <div style={{ fontSize: 12, color: T3, marginTop: 2 }}>NPrep · Nursing Exam Prep</div>
        </div>
        <button
          onClick={() => navigate('saved')}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill={savedVideos.length > 0 ? P : 'none'} stroke={savedVideos.length > 0 ? P : T3} strokeWidth="1.8" strokeLinecap="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
          </svg>
          <span style={{ fontSize: 9, fontWeight: 600, color: savedVideos.length > 0 ? P : T3 }}>Saved</span>
        </button>
      </div>

      {/* Prototype toggles */}
      <div style={{ padding: '8px 16px', background: '#F8F7FF', borderBottom: `1px solid ${BD}`, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', flexShrink: 0 }}>
        {/* New / Returning toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 10, color: T3, fontWeight: 600 }}>User:</span>
          <div style={{ display: 'flex', background: BD, borderRadius: 50, padding: 2, gap: 1 }}>
            {[{ val: false, label: 'New' }, { val: true, label: 'Returning' }].map(o => (
              <button
                key={String(o.val)}
                onClick={() => setIsReturningUser(o.val)}
                style={{
                  padding: '4px 10px', borderRadius: 50, border: 'none', cursor: 'pointer',
                  fontSize: 10, fontWeight: 600,
                  background: isReturningUser === o.val ? 'white' : 'transparent',
                  color: isReturningUser === o.val ? (o.val ? P : T1) : T3,
                  boxShadow: isReturningUser === o.val ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
                  transition: 'all 0.15s',
                }}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Free / Paid toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 10, color: T3, fontWeight: 600 }}>Plan:</span>
          <div style={{ display: 'flex', background: BD, borderRadius: 50, padding: 2, gap: 1 }}>
            {[{ val: false, label: 'Paid' }, { val: true, label: 'Free' }].map(o => (
              <button
                key={String(o.val)}
                onClick={() => setIsFreeTier(o.val)}
                style={{
                  padding: '4px 10px', borderRadius: 50, border: 'none', cursor: 'pointer',
                  fontSize: 10, fontWeight: 600,
                  background: isFreeTier === o.val ? 'white' : 'transparent',
                  color: isFreeTier === o.val ? (o.val ? '#C05C0D' : T1) : T3,
                  boxShadow: isFreeTier === o.val ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
                  transition: 'all 0.15s',
                }}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Subject cards */}
      <div className="scroll" style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
        {SUBJECTS.map(subject => {
          const completedCount = subject.videos.filter(v => videoProgress[v.id]?.completed).length
          const inProgressCount = subject.videos.filter(v => !videoProgress[v.id]?.completed && videoProgress[v.id]?.secondsWatched > 0).length
          const allDone = completedCount === subject.videos.length
          const hasProgress = completedCount > 0 || inProgressCount > 0

          return (
            <button
              key={subject.id}
              onClick={() => { setCurrentSubject(subject); navigate('prevideoscreen') }}
              style={{
                width: '100%', marginBottom: 12, borderRadius: 16, border: `1.5px solid ${BD}`,
                background: 'white', cursor: 'pointer', textAlign: 'left', overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(83,74,183,0.06)',
              }}
            >
              {/* Colour bar */}
              <div style={{ height: 4, background: subject.color, width: '100%' }} />

              <div style={{ padding: '14px 16px' }}>
                {/* Subject name row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 4 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: T1, lineHeight: 1.3 }}>{subject.name}</div>
                  {allDone && (
                    <span style={{ flexShrink: 0, fontSize: 10, fontWeight: 700, color: GREEN, background: GREENBG, padding: '2px 8px', borderRadius: 50 }}>All done ✓</span>
                  )}
                </div>

                {/* Description */}
                <div style={{ fontSize: 12, color: T3, lineHeight: 1.5, marginBottom: 10 }}>{subject.description}</div>

                {/* Progress bar */}
                <div style={{ height: 3, background: BD, borderRadius: 2, overflow: 'hidden', marginBottom: 8 }}>
                  <div style={{
                    height: '100%', borderRadius: 2, transition: 'width 0.3s',
                    width: `${(completedCount / subject.videos.length) * 100}%`,
                    background: allDone ? GREEN : subject.color,
                  }} />
                </div>

                {/* Stats row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: T3 }}>{subject.videos.length} videos</span>
                    {hasProgress && (
                      <span style={{ fontSize: 11, color: completedCount > 0 ? subject.color : T3, fontWeight: 600 }}>
                        {completedCount > 0 ? `${completedCount} completed` : ''}
                        {inProgressCount > 0 && completedCount > 0 ? ' · ' : ''}
                        {inProgressCount > 0 ? `${inProgressCount} in progress` : ''}
                      </span>
                    )}
                    {!hasProgress && (
                      <span style={{ fontSize: 11, color: T3 }}>Not started</span>
                    )}
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T3} strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
                </div>
              </div>
            </button>
          )
        })}
        <div style={{ height: 16 }} />
      </div>
    </div>
  )
}
