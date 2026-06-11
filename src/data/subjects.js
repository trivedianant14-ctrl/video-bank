// ─── CONSTANTS ────────────────────────────────────────────────────────────────
export const VIDEO_DURATION_SECS = 720 // 12-min placeholder for all videos
export const FREE_VIDEO_COUNT    = 3   // first N videos across the subject are free
export const GROUP_SIZE          = 2   // videos per suggested-order group

// ─── APPLIED ANATOMY: chapters + videos ───────────────────────────────────────
const RAW_CHAPTERS = [
  {
    id: 'ch-cardio',
    name: 'Cardiovascular System',
    videos: [
      { id: 'v01', title: 'Heart Anatomy Overview',               uploadDate: 'Jan 8,  2025', duration: '11:20' },
      { id: 'v02', title: 'Cardiac Cycle Explained',              uploadDate: 'Jan 10, 2025', duration: '9:45'  },
      { id: 'v03', title: 'Conduction System of the Heart',       uploadDate: 'Jan 12, 2025', duration: '12:00' },
      { id: 'v04', title: 'Blood Pressure Regulation',            uploadDate: 'Jan 15, 2025', duration: '10:30' },
      { id: 'v05', title: 'Heart Failure — Pathophysiology',      uploadDate: 'Jan 18, 2025', duration: '13:15' },
      { id: 'v06', title: 'ECG Interpretation Basics',            uploadDate: 'Jan 22, 2025', duration: '14:00' },
    ],
  },
  {
    id: 'ch-renal',
    name: 'Renal Physiology',
    videos: [
      { id: 'v07', title: 'Nephron Structure and Function',       uploadDate: 'Feb 3,  2025', duration: '10:15' },
      { id: 'v08', title: 'Glomerular Filtration Rate',           uploadDate: 'Feb 7,  2025', duration: '9:00'  },
      { id: 'v09', title: 'Tubular Reabsorption and Secretion',   uploadDate: 'Feb 10, 2025', duration: '11:30' },
      { id: 'v10', title: 'Acid-Base Balance',                    uploadDate: 'Feb 14, 2025', duration: '12:45' },
      { id: 'v11', title: 'Fluid and Electrolyte Disorders',      uploadDate: 'Feb 18, 2025', duration: '13:00' },
    ],
  },
  {
    id: 'ch-respiratory',
    name: 'Respiratory System',
    videos: [
      { id: 'v12', title: 'Lung Anatomy and Mechanics',           uploadDate: 'Mar 3,  2025', duration: '10:50' },
      { id: 'v13', title: 'Gas Exchange at the Alveolar Level',   uploadDate: 'Mar 7,  2025', duration: '9:20'  },
      { id: 'v14', title: 'Oxygen and CO2 Transport in Blood',    uploadDate: 'Mar 10, 2025', duration: '11:00' },
      { id: 'v15', title: 'Ventilation-Perfusion Mismatch',       uploadDate: 'Mar 14, 2025', duration: '10:30' },
    ],
  },
  {
    id: 'ch-musculo',
    name: 'Musculoskeletal System',
    videos: [
      { id: 'v16', title: 'Skeletal Muscle Contraction',          uploadDate: 'Apr 1,  2025', duration: '9:45'  },
      { id: 'v17', title: 'Bone Remodelling and Calcium Homeostasis', uploadDate: 'Apr 5, 2025', duration: '11:15' },
      { id: 'v18', title: 'Joint Types and Clinical Relevance',   uploadDate: 'Apr 8,  2025', duration: '10:00' },
      { id: 'v19', title: 'Neuromuscular Junction',               uploadDate: 'Apr 12, 2025', duration: '12:20' },
    ],
  },
]

// Tag first FREE_VIDEO_COUNT videos (across all chapters) as free
const tagFreeVideos = (chapters) => {
  let count = 0
  return chapters.map(ch => ({
    ...ch,
    videos: ch.videos.map(v => ({ ...v, free: count++ < FREE_VIDEO_COUNT })),
  }))
}

export const ANATOMY_CHAPTERS = tagFreeVideos(RAW_CHAPTERS)

// Flat list for all anatomy videos (used for stats, resume card, etc.)
export const ANATOMY_ALL_VIDEOS = ANATOMY_CHAPTERS.flatMap(ch =>
  ch.videos.map(v => ({ ...v, chapterId: ch.id, chapterName: ch.name }))
)

// ─── DATA SCENARIOS ───────────────────────────────────────────────────────────
export const SCENARIO_NEW = {}

// Returning A: 3 completed (all in chapter 1), rest not started
export const SCENARIO_RETURNING_A = {
  v01: { secondsWatched: VIDEO_DURATION_SECS, completed: true,  lastWatched: Date.now() - 86400000 * 5 },
  v02: { secondsWatched: VIDEO_DURATION_SECS, completed: true,  lastWatched: Date.now() - 86400000 * 3 },
  v03: { secondsWatched: VIDEO_DURATION_SECS, completed: true,  lastWatched: Date.now() - 86400000 * 2 },
}

// Returning B: 3 completed + 1 video at 50% in chapter 1
export const SCENARIO_RETURNING_B = {
  v01: { secondsWatched: VIDEO_DURATION_SECS, completed: true,  lastWatched: Date.now() - 86400000 * 5 },
  v02: { secondsWatched: VIDEO_DURATION_SECS, completed: true,  lastWatched: Date.now() - 86400000 * 3 },
  v03: { secondsWatched: VIDEO_DURATION_SECS, completed: true,  lastWatched: Date.now() - 86400000 * 2 },
  v04: { secondsWatched: 360,                 completed: false, lastWatched: Date.now() - 86400000     },
}

// ─── SUBJECTS LIST (VideoHome cards) ──────────────────────────────────────────
export const SUBJECTS = [
  {
    id:          'anatomy',
    name:        'Applied Anatomy',
    description: 'Cardiovascular, renal, respiratory, and musculoskeletal structures for clinical nursing.',
    color:       '#534AB7',
    bg:          '#EEEDFE',
    chapters:    ANATOMY_CHAPTERS,
    videos:      ANATOMY_ALL_VIDEOS,
  },
  {
    id:          'physiology',
    name:        'Physiology',
    description: 'Respiratory mechanics, neurophysiology, and fluid balance fundamentals.',
    color:       '#1B7F4F',
    bg:          '#E6F7EF',
    chapters:    null,
    videos: [
      { id: 'resp-part1',  title: 'Respiratory Physiology — Part 1', uploadDate: 'Feb 3,  2025', duration: '11:45', subject: 'Physiology', free: true  },
      { id: 'neuro-part1', title: 'Neurophysiology — Basics',        uploadDate: 'Feb 10, 2025', duration: '9:20',  subject: 'Physiology', free: false },
    ],
  },
  {
    id:          'pharmacology',
    name:        'Pharmacology',
    description: 'Drug absorption, distribution, metabolism, and common drug interactions.',
    color:       '#C0500D',
    bg:          '#FFF0E6',
    chapters:    null,
    videos: [
      { id: 'pharm-part1', title: 'Drug Absorption & Distribution', uploadDate: 'Mar 1, 2025', duration: '13:00', subject: 'Pharmacology', free: true },
    ],
  },
]
