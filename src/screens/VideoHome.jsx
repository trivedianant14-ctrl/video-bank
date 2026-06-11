const P = '#534AB7', PL = '#EEEDFE', PD = '#3C3489'
const T1 = '#1a1a2e', T2 = '#5a5a78', T3 = '#9898b0', BD = '#e8e8f2', BG2 = '#f5f5fb'

const SUBJECTS = [
  {
    id: 'anatomy',
    name: 'Applied Anatomy',
    color: '#534AB7',
    bg: '#EEEDFE',
    videos: [
      { id: 'cv-part1', title: 'Cardiovascular System — Part 1', uploadDate: 'Jan 12, 2025', duration: '12:00', subject: 'Applied Anatomy' },
      { id: 'cv-part2', title: 'Cardiovascular System — Part 2', uploadDate: 'Jan 15, 2025', duration: '10:30', subject: 'Applied Anatomy' },
      { id: 'renal-part1', title: 'Renal System — Part 1', uploadDate: 'Jan 20, 2025', duration: '14:15', subject: 'Applied Anatomy' },
    ],
  },
  {
    id: 'physiology',
    name: 'Physiology',
    color: '#1B7F4F',
    bg: '#E6F7EF',
    videos: [
      { id: 'resp-part1', title: 'Respiratory Physiology — Part 1', uploadDate: 'Feb 3, 2025', duration: '11:45', subject: 'Physiology' },
      { id: 'neuro-part1', title: 'Neurophysiology — Basics', uploadDate: 'Feb 10, 2025', duration: '9:20', subject: 'Physiology' },
    ],
  },
  {
    id: 'pharmacology',
    name: 'Pharmacology',
    color: '#C0500D',
    bg: '#FFF0E6',
    videos: [
      { id: 'pharm-part1', title: 'Drug Absorption & Distribution', uploadDate: 'Mar 1, 2025', duration: '13:00', subject: 'Pharmacology' },
    ],
  },
]

export default function VideoHome({ navigate, setCurrentVideo, savedVideos }) {
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

      {/* Video list */}
      <div className="scroll" style={{ flex: 1, overflowY: 'auto' }}>
        {SUBJECTS.map(subject => (
          <div key={subject.id} style={{ marginBottom: 4 }}>
            {/* Subject heading */}
            <div style={{ padding: '14px 16px 8px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: subject.color, flexShrink: 0 }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: subject.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {subject.name}
              </span>
              <span style={{ fontSize: 11, color: T3 }}>{subject.videos.length} videos</span>
            </div>

            {/* Video cards */}
            {subject.videos.map((video, i) => (
              <button
                key={video.id}
                onClick={() => { setCurrentVideo(video); navigate('videoplayer') }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer',
                  borderBottom: i < subject.videos.length - 1 ? `1px solid ${BG2}` : 'none',
                  textAlign: 'left',
                }}
              >
                {/* Thumbnail */}
                <div style={{
                  width: 72, height: 48, borderRadius: 8, background: subject.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: `linear-gradient(135deg, ${subject.bg} 0%, ${subject.color}22 100%)`,
                  }} />
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%', background: subject.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
                  }}>
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="white" style={{ marginLeft: 1 }}><polygon points="5,3 19,12 5,21"/></svg>
                  </div>
                  <div style={{
                    position: 'absolute', bottom: 4, right: 5, fontSize: 9, fontWeight: 700,
                    color: subject.color, background: 'white', padding: '1px 4px', borderRadius: 3,
                  }}>
                    {video.duration}
                  </div>
                </div>

                {/* Meta */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T1, lineHeight: 1.4, marginBottom: 3 }}>
                    {video.title}
                  </div>
                  <div style={{ fontSize: 11, color: T3 }}>Uploaded {video.uploadDate}</div>
                </div>

                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T3} strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0 }}>
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
            ))}
          </div>
        ))}
        <div style={{ height: 24 }} />
      </div>
    </div>
  )
}
