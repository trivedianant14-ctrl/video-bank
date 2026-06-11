import { useState } from 'react'

const P = '#534AB7', PL = '#EEEDFE'
const T1 = '#1a1a2e', T2 = '#5a5a78', T3 = '#9898b0', BD = '#e8e8f2', BG2 = '#f5f5fb'
const GREEN = '#3B6D11', GREENBG = '#EAF3DE', GREENBORDER = '#97C459'

const MOCK_DOWNLOADS = [
  {
    id: 'anatomy',
    name: 'Applied Anatomy',
    color: '#534AB7',
    bg: '#EEEDFE',
    videos: [
      { id: 'v01', title: 'Heart Anatomy Overview',         duration: '11:20', size: '132 MB' },
      { id: 'v02', title: 'Cardiac Cycle Explained',        duration: '9:45',  size: '114 MB' },
      { id: 'v03', title: 'Conduction System of the Heart', duration: '12:00', size: '144 MB' },
    ],
  },
  {
    id: 'physiology',
    name: 'Physiology',
    color: '#1B7F4F',
    bg: '#E6F7EF',
    videos: [
      { id: 'resp-part1', title: 'Respiratory Physiology — Part 1', duration: '11:45', size: '140 MB' },
    ],
  },
]

const totalMB = MOCK_DOWNLOADS.reduce((acc, s) => acc + s.videos.reduce((a, v) => a + parseInt(v.size), 0), 0)
const totalVideos = MOCK_DOWNLOADS.reduce((acc, s) => acc + s.videos.length, 0)
const storagePct = Math.min((totalMB / 2048) * 100, 100)

export default function Downloads({ navigate }) {
  const [expanded, setExpanded] = useState('anatomy')
  const [deleted, setDeleted] = useState(new Set())

  const deleteVideo = (subjectId, videoId) => {
    setDeleted(prev => new Set([...prev, `${subjectId}-${videoId}`])  )
  }

  const visibleSubjects = MOCK_DOWNLOADS.map(s => ({
    ...s,
    videos: s.videos.filter(v => !deleted.has(`${s.id}-${v.id}`)),
  })).filter(s => s.videos.length > 0)

  const liveTotal = visibleSubjects.reduce((acc, s) => acc + s.videos.length, 0)
  const liveMB = visibleSubjects.reduce((acc, s) => acc + s.videos.reduce((a, v) => a + parseInt(v.size), 0), 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white' }}>

      {/* Header */}
      <div style={{ flexShrink: 0, background: 'white', borderBottom: `1px solid ${BD}` }}>
        <div style={{ padding: '10px 16px 10px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => navigate('home')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: T1, padding: 4, display: 'flex', alignItems: 'center' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <polyline points="15,18 9,12 15,6"/>
            </svg>
          </button>
          <div style={{ flex: 1, fontSize: 18, fontWeight: 800, color: T1, letterSpacing: '-0.3px' }}>Downloads</div>
        </div>

        {liveTotal > 0 && (
          <div style={{ padding: '0 16px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: T2, fontWeight: 500 }}>{liveTotal} videos · {liveMB} MB on device</span>
              <span style={{ fontSize: 11, color: T3 }}>2 GB available</span>
            </div>
            <div style={{ height: 4, background: BD, borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${(liveMB / 2048) * 100}%`, height: '100%', background: P, borderRadius: 2, transition: 'width 0.3s' }} />
            </div>
          </div>
        )}
      </div>

      <div className="scroll" style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>

        {liveTotal === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 24px', textAlign: 'center' }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: BG2, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={T3} strokeWidth="1.8" strokeLinecap="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: T1, marginBottom: 8 }}>No downloads</div>
            <div style={{ fontSize: 13, color: T2, lineHeight: 1.6, marginBottom: 24 }}>
              Download video lectures to watch them offline — great for studying without internet.
            </div>
            <button onClick={() => navigate('home')} className="btn-primary" style={{ padding: '12px 28px' }}>
              Browse Videos
            </button>
          </div>
        ) : (
          visibleSubjects.map(subject => {
            const isOpen = expanded === subject.id
            return (
              <div key={subject.id} style={{ marginBottom: 12, borderRadius: 14, border: `1px solid ${BD}`, overflow: 'hidden' }}>

                {/* Subject header */}
                <button
                  onClick={() => setExpanded(isOpen ? null : subject.id)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'white', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                >
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: subject.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: subject.color }}>
                      {subject.name.charAt(0)}
                    </span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: T1 }}>{subject.name}</div>
                    <div style={{ fontSize: 11, color: T3, marginTop: 2 }}>
                      {subject.videos.length} video{subject.videos.length !== 1 ? 's' : ''} · {subject.videos.reduce((a, v) => a + parseInt(v.size), 0)} MB
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: GREENBG, border: `1px solid ${GREENBORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none" stroke={GREEN} strokeWidth="1.8" strokeLinecap="round"><polyline points="1,4 3.5,7 9,1"/></svg>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T3} strokeWidth="2.5" strokeLinecap="round" style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}>
                      <polyline points="6,9 12,15 18,9"/>
                    </svg>
                  </div>
                </button>

                {/* Video list */}
                {isOpen && (
                  <div style={{ borderTop: `1px solid ${BD}` }}>
                    {subject.videos.map((video, vi) => (
                      <div
                        key={video.id}
                        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: BG2, borderBottom: vi < subject.videos.length - 1 ? `1px solid ${BD}` : 'none' }}
                      >
                        {/* Thumbnail */}
                        <div style={{ width: 58, height: 42, background: '#0d0d1a', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.55)"><polygon points="5,3 19,12 5,21"/></svg>
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: T1, lineHeight: 1.35, marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {video.title}
                          </div>
                          <div style={{ fontSize: 11, color: T3 }}>{video.duration} · {video.size}</div>
                        </div>

                        {/* Delete */}
                        <button
                          onClick={() => deleteVideo(subject.id, video.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0 }}
                          aria-label="Remove download"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T3} strokeWidth="2" strokeLinecap="round">
                            <polyline points="3,6 5,6 21,6"/>
                            <path d="M19,6l-1,14a2 2 0 01-2,2H8a2 2 0 01-2-2L5,6"/>
                            <path d="M10,11v6M14,11v6"/>
                            <path d="M9,6V4a1 1 0 011-1h4a1 1 0 011,1v2"/>
                          </svg>
                        </button>
                      </div>
                    ))}

                    {/* Delete all for subject */}
                    <button
                      onClick={() => subject.videos.forEach(v => deleteVideo(subject.id, v.id))}
                      style={{ width: '100%', padding: '10px 16px', background: 'white', border: 'none', borderTop: `1px solid ${BD}`, cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#791F1F', textAlign: 'center' }}
                    >
                      Remove all {subject.name} downloads
                    </button>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
