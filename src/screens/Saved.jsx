const P = '#534AB7', PL = '#EEEDFE', PD = '#3C3489'
const T1 = '#1a1a2e', T2 = '#5a5a78', T3 = '#9898b0', BD = '#e8e8f2', BG2 = '#f5f5fb'

export default function Saved({ navigate, savedVideos = [], unsaveVideo, savedResources = [], unsaveResource }) {
  const activeTab = 'videos'

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
        {(savedVideos.length + savedResources.length) > 0 && (
          <span style={{ fontSize: 12, color: T3, background: BG2, padding: '3px 10px', borderRadius: 20 }}>
            {savedVideos.length + savedResources.length}
          </span>
        )}
      </div>

      {/* Tab toggles */}
      <div style={{ padding: '12px 16px', borderBottom: `1px solid ${BD}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { id: 'qbank', label: 'QBank' },
            { id: 'videos', label: 'Videos' },
            { id: 'resources', label: 'Resources' },
          ].map(tab => (
            <button
              key={tab.id}
              style={{
                flex: 1, padding: '9px 4px', borderRadius: 50, fontSize: 12, fontWeight: 600,
                border: `1.5px solid ${tab.id === activeTab ? P : BD}`,
                background: tab.id === activeTab ? P : 'white',
                color: tab.id === activeTab ? 'white' : T3,
                cursor: 'default',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Videos tab */}
      {savedVideos.length === 0 ? (
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

          {savedResources.length > 0 && (
            <>
              <div style={{ padding: '16px 0 8px', fontSize: 11, fontWeight: 700, color: T3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resources</div>
              {savedResources.map(r => (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderBottom: `1px solid ${BD}` }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: BG2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: P }}>
                    {r.type === 'slides'
                      ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                      : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T1 }}>{r.type === 'slides' ? 'Slides' : 'Notes'}</div>
                    <div style={{ fontSize: 11, color: T3, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.videoTitle} · {r.subject}</div>
                    <div style={{ fontSize: 10, color: T3, marginTop: 1 }}>
                      Saved on {new Date(r.savedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  <button onClick={() => unsaveResource?.(r.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T3, padding: 4 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
