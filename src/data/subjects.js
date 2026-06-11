export const SUBJECTS = [
  {
    id: 'anatomy',
    name: 'Applied Anatomy',
    description: 'Cardiovascular, renal, and musculoskeletal structures for clinical nursing.',
    color: '#534AB7', bg: '#EEEDFE',
    videos: [
      { id: 'cv-part1',    title: 'Cardiovascular System — Part 1', uploadDate: 'Jan 12, 2025', duration: '12:00', subject: 'Applied Anatomy' },
      { id: 'cv-part2',    title: 'Cardiovascular System — Part 2', uploadDate: 'Jan 15, 2025', duration: '10:30', subject: 'Applied Anatomy' },
      { id: 'renal-part1', title: 'Renal System — Part 1',          uploadDate: 'Jan 20, 2025', duration: '14:15', subject: 'Applied Anatomy' },
    ],
  },
  {
    id: 'physiology',
    name: 'Physiology',
    description: 'Respiratory mechanics, neurophysiology, and fluid balance fundamentals.',
    color: '#1B7F4F', bg: '#E6F7EF',
    videos: [
      { id: 'resp-part1',  title: 'Respiratory Physiology — Part 1', uploadDate: 'Feb 3,  2025', duration: '11:45', subject: 'Physiology' },
      { id: 'neuro-part1', title: 'Neurophysiology — Basics',        uploadDate: 'Feb 10, 2025', duration: '9:20',  subject: 'Physiology' },
    ],
  },
  {
    id: 'pharmacology',
    name: 'Pharmacology',
    description: 'Drug absorption, distribution, metabolism, and common drug interactions.',
    color: '#C0500D', bg: '#FFF0E6',
    videos: [
      { id: 'pharm-part1', title: 'Drug Absorption & Distribution',  uploadDate: 'Mar 1,  2025', duration: '13:00', subject: 'Pharmacology' },
    ],
  },
]
