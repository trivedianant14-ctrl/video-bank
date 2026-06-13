import { useState, useEffect, useRef } from 'react'

const COMPLETION_THRESHOLD = 0.95
const PASS_THRESHOLD = 0.66
const TOTAL_DURATION = 720 // 12 min placeholder

const P = '#534AB7', PL = '#EEEDFE', PD = '#3C3489'
const T1 = '#1a1a2e', T2 = '#5a5a78', T3 = '#9898b0', BD = '#e8e8f2', BG2 = '#f5f5fb'
const GREEN = '#3B6D11', GREENBG = '#EAF3DE', GREENBORDER = '#A5D6A7'

// Mock data for returning-user view
const MOCK_PREV_SCORE = 3
const MOCK_PREV_DATE = 'Jan 12, 2025'
const MOCK_PREV_ANSWERS = { 0: 2, 1: 1, 2: 2, 3: 1 } // Q1 wrong (Bundle of His), Q2-Q4 correct

const TOPICS_COVERED = [
  { name: 'Introduction & Overview', ts: '0:00' },
  { name: 'Cardiac Anatomy', ts: '2:45' },
  { name: 'Conduction System', ts: '6:30', hasQuestion: true },
  { name: 'Cardiac Cycle', ts: '9:15' },
  { name: 'Clinical Correlations', ts: '11:00' },
]

const VIDEO_TOPICS = {
  v02: [
    { name: 'Introduction & Overview', ts: '0:00' },
    { name: 'Phases of the Cardiac Cycle', ts: '0:55' },
    { name: 'Atrial Systole', ts: '2:30' },
    { name: 'Ventricular Systole', ts: '4:15' },
    { name: 'Isovolumetric Relaxation', ts: '6:00', hasQuestion: true },
    { name: 'Ventricular Filling (Diastole)', ts: '7:30' },
    { name: 'Heart Sounds — S1 & S2', ts: '8:30' },
  ],
}

const TEACHER_QUESTION = {
  askedAt: '6:30',
  askedAtSecs: 390,
  endsAtSecs: 555,
  text: 'Which of the following initiates the heartbeat?',
  options: ['AV Node', 'SA Node', 'Bundle of His', 'Purkinje Fibers'],
  correct: 1,
  explanation: 'The SA node fires spontaneously at 60–100 bpm — the fastest intrinsic rate in the conduction system, so it drives the heart\'s rhythm under normal conditions.',
}

const QUIZ_QUESTIONS = [
  {
    text: 'Which of the following is the primary pacemaker of the heart?',
    options: ['AV node', 'SA node', 'Bundle of His', 'Purkinje fibers'],
    correct: 1,
    explanation: 'The SA node fires at 60–100 bpm — the fastest intrinsic rate in the conduction system — so it drives the heart\'s rhythm under normal conditions.',
    optionExplanations: [
      'The AV node is the secondary pacemaker (40–60 bpm). It takes over only if the SA node fails — it doesn\'t normally initiate rhythm.',
      'Correct. The SA node fires at 60–100 bpm, the fastest spontaneous rate, so it dominates and sets the heart\'s rhythm.',
      'The Bundle of His is a conduction pathway that carries impulses from the AV node to the ventricles. It doesn\'t generate rhythm on its own.',
      'Purkinje fibers distribute impulses to ventricular muscle. Their intrinsic escape rate is only 20–40 bpm — a last-resort backup, not a pacemaker.',
    ],
    optPcts: [20, 62, 12, 6],
  },
  {
    text: 'The mitral valve separates which two chambers?',
    options: ['Right atrium and right ventricle', 'Left atrium and left ventricle', 'Left ventricle and aorta', 'Right ventricle and pulmonary artery'],
    correct: 1,
    explanation: 'The mitral (bicuspid) valve sits at the left atrioventricular junction and prevents backflow from the left ventricle into the left atrium during systole.',
    optionExplanations: [
      'Those two chambers are separated by the tricuspid valve — on the right side of the heart, not the left.',
      'Correct. The mitral (bicuspid) valve sits between the left atrium and left ventricle, preventing backflow during ventricular systole.',
      'That junction is guarded by the aortic (semilunar) valve, which controls blood leaving the left ventricle into the aorta.',
      'That junction is controlled by the pulmonary valve, which regulates blood flowing from the right ventricle into the pulmonary artery.',
    ],
    optPcts: [8, 78, 9, 5],
  },
  {
    text: 'Which layer of the heart wall is responsible for contraction?',
    options: ['Epicardium', 'Pericardium', 'Myocardium', 'Endocardium'],
    correct: 2,
    explanation: 'The myocardium is the thick middle muscular layer. Its coordinated contraction — powered by cardiac muscle fibres — generates the force that pumps blood.',
    optionExplanations: [
      'The epicardium is the outermost, protective layer of the heart wall. It contains connective tissue and fat but is not contractile.',
      'The pericardium is the fibrous sac surrounding the entire heart — not one of the wall layers. It provides protection and anchors the heart.',
      'Correct. The myocardium is the thick muscular middle layer. Its specialised cardiac muscle cells contract in a coordinated wave to pump blood.',
      'The endocardium is the smooth inner lining of the heart chambers. It reduces friction as blood flows through — it has no contractile function.',
    ],
    optPcts: [14, 4, 71, 11],
  },
  {
    text: 'Absent P waves with an irregularly irregular R-R interval most likely indicates:',
    options: ['Ventricular fibrillation', 'Atrial fibrillation', 'Third-degree heart block', 'Sinus tachycardia'],
    correct: 1,
    explanation: 'In atrial fibrillation, chaotic atrial firing replaces organised P waves, and the AV node is bombarded irregularly — producing the hallmark irregularly irregular rhythm.',
    optionExplanations: [
      'Ventricular fibrillation produces a chaotic, undulating ECG with no recognisable QRS complexes — not a structured irregular pattern. It\'s immediately life-threatening.',
      'Correct. AF eliminates organised P waves (replaced by fibrillatory baseline) and gives an irregularly irregular R-R interval — the classic ECG signature.',
      'Third-degree (complete) heart block shows regular P waves and regular QRS complexes — but they\'re dissociated from each other. Both intervals are regular, not irregular.',
      'Sinus tachycardia has normal, regular P waves before every QRS and a consistently fast but regular rate. The R-R interval is uniform.',
    ],
    optPcts: [18, 52, 22, 8],
  },
]

const Toggle = ({ value, onChange }) => (
  <div
    onClick={() => onChange(!value)}
    style={{
      width: 40, height: 22, borderRadius: 11,
      background: value ? P : BD,
      position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0,
    }}
  >
    <div style={{
      position: 'absolute', top: 3, left: value ? 21 : 3, width: 16, height: 16,
      borderRadius: '50%', background: 'white', transition: 'left 0.2s',
      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
    }} />
  </div>
)

function QuizTimerRing({ timeLeft }) {
  const r = 12, size = 34, cx = 17
  const circumference = 2 * Math.PI * r
  const dashOffset = circumference * (1 - timeLeft / 60)
  const urgent = timeLeft <= 10
  const color = urgent ? '#A32D2D' : P
  const trackColor = urgent ? '#FCEBEB' : PL
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke={trackColor} strokeWidth="3" />
        <circle cx={cx} cy={cx} r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cx}px`, transition: 'stroke-dashoffset 0.9s linear, stroke 0.3s' }}
        />
      </svg>
      <span style={{ fontSize: 11, fontWeight: 700, color, minWidth: 22 }}>
        {String(Math.floor(timeLeft / 60)).padStart(2,'0')}:{String(timeLeft % 60).padStart(2,'0')}
      </span>
    </div>
  )
}

const DOWNLOAD_QUALITIES = [
  { id: 'auto',   label: 'Auto',   desc: 'Adjusts to your connection · may use more space', size: '~150 MB avg', badge: null },
  { id: 'low',    label: 'Low',    desc: '360p · Smaller file, fastest download',            size: '~70 MB',      badge: null },
  { id: 'medium', label: 'Medium', desc: '720p · Good balance of quality and size',          size: '~150 MB',     badge: 'Suggested' },
  { id: 'high',   label: 'High',   desc: '1080p · Best quality, largest file',               size: '~280 MB',     badge: 'Wi-Fi Suggested' },
]

export default function VideoPlayer({
  navigate, currentVideo, currentSubject, setCurrentVideo,
  savedVideos = [], saveVideo, unsaveVideo,
  savedResources = [], saveResource, unsaveResource,
  isReturningUser = false,
}) {
  const [phase, setPhase] = useState('player')
  const [isPlaying, setIsPlaying] = useState(false)
  const progressRef = useRef(0)
  const [displayProgress, setDisplayProgress] = useState(0)
  const completionTriggeredRef = useRef(false)
  const [showControls, setShowControls] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const playerContainerRef = useRef(null)
  const scrubberRef = useRef(null)
  const [playerDims, setPlayerDims] = useState({ w: 430, h: 844 })

  const [showSettings, setShowSettings] = useState(false)
  const [showCompletionOverlay, setShowCompletionOverlay] = useState(false)
  const [countdown, setCountdown] = useState(10)
  const [teacherQAnswer, setTeacherQAnswer] = useState(null)
  const [showDoubtPopup, setShowDoubtPopup] = useState(false)
  const [showDoubtToast, setShowDoubtToast] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportSelectedIssue, setReportSelectedIssue] = useState('')
  const [reportDetailText, setReportDetailText] = useState('')
  const [showReportSuccessPopup, setShowReportSuccessPopup] = useState(false)
  const [showResourceModal, setShowResourceModal] = useState(null)

  const [liked, setLiked] = useState(false)
  const [disliked, setDisliked] = useState(false)
  const [showDislikeFeedback, setShowDislikeFeedback] = useState(false)
  const [dislikeFeedbackText, setDislikeFeedbackText] = useState('')
  const [showLikeFeedback, setShowLikeFeedback] = useState(false)
  const [likeRating, setLikeRating] = useState(0)
  const [likeComment, setLikeComment] = useState('')

  const [showSavedToast, setShowSavedToast] = useState(false)
  const savedToastTimerRef = useRef(null)

  const [showDownloadQualitySheet, setShowDownloadQualitySheet] = useState(false)
  const [downloadQuality, setDownloadQuality] = useState('medium')
  const [saveQualitySetting, setSaveQualitySetting] = useState(true)
  const [showDownloadToast, setShowDownloadToast] = useState(false)
  const downloadToastTimerRef = useRef(null)

  const [showResourceSavedToast, setShowResourceSavedToast] = useState(false)
  const [resourceSavedType, setResourceSavedType] = useState('')
  const resourceSavedTimerRef = useRef(null)

  const [pendingSeek, setPendingSeek] = useState(null) // { ts, name }

  const [language, setLanguage] = useState('HI')
  const [darkMode, setDarkMode] = useState(false)
  const [subtitlesOn, setSubtitlesOn] = useState(true)
  const [playbackSpeed, setPlaybackSpeed] = useState('1x')
  const [seekInterval, setSeekInterval] = useState(10)
  const [videoQuality, setVideoQuality] = useState('Auto')

  const [activeTab, setActiveTab] = useState('topics')
  const [selfNotes, setSelfNotes] = useState('')
  const [notesSaved, setNotesSaved] = useState(false)
  const notesTimerRef = useRef(null)

  const [capturedPhoto, setCapturedPhoto] = useState(null)
  const captureInputRef = useRef(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordedVoice, setRecordedVoice] = useState(null) // { duration: '0:12' }
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const recordingIntervalRef = useRef(null)

  const [quizQIndex, setQuizQIndex] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState({})
  const [quizPhase, setQuizPhase] = useState('questions')
  const [quizTimeLeft, setQuizTimeLeft] = useState(60)
  const [savedQuestions, setSavedQuestions] = useState(new Set())
  const [questionTags, setQuestionTags] = useState({})
  const [showMarkMenu, setShowMarkMenu] = useState(false)
  const [showImageViewer, setShowImageViewer] = useState(null)
  const [expandedResult, setExpandedResult] = useState(null)
  const [expandedPractice, setExpandedPractice] = useState(null)

  const [showUpdateRequestSent, setShowUpdateRequestSent] = useState(false)
  const updateRequestTimerRef = useRef(null)

  const [autoplay, setAutoplay] = useState(true)
  const [videoEndedNoAutoplay, setVideoEndedNoAutoplay] = useState(false)
  const [notesExpanded, setNotesExpanded] = useState(false)
  const [slidesExpanded, setSlidesExpanded] = useState(true)
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false)
  const [pdfCurrentPage, setPdfCurrentPage] = useState(0)

  const bg = darkMode ? '#0d0d1a' : 'white'
  const cardBg = darkMode ? '#1e1e30' : BG2
  const borderClr = darkMode ? '#2e2e48' : BD
  // Brighter text values in dark mode for contrast
  const text1 = darkMode ? '#f0f0f8' : T1
  const text2 = darkMode ? '#c0bfe0' : T2
  const text3 = darkMode ? '#9090b8' : T3

  const videoId = currentVideo?.id || 'cv-part1'
  const title = currentVideo?.title || 'Cardiovascular System — Part 1'
  const uploadDate = currentVideo?.uploadDate || 'Jan 12, 2025'

  // Compute next video in subject sequence
  const subjectVideos = currentSubject?.videos || []
  const currentIdx = subjectVideos.findIndex(v => v.id === videoId)
  const nextVideo = (currentIdx >= 0 && currentIdx < subjectVideos.length - 1)
    ? { ...subjectVideos[currentIdx + 1], subject: currentSubject?.name }
    : null

  const isSaved = savedVideos.some(v => v.id === videoId)
  const isSlidesSaved = savedResources.some(r => r.videoId === videoId && r.type === 'slides')
  const isNotesSaved = savedResources.some(r => r.videoId === videoId && r.type === 'notes')

  const currentSecs = Math.floor(displayProgress * TOTAL_DURATION)
  const currentTime = `${Math.floor(currentSecs / 60)}:${String(currentSecs % 60).padStart(2, '0')}`
  const teacherQActive = videoId !== 'v02'
    && displayProgress >= TEACHER_QUESTION.askedAtSecs / TOTAL_DURATION
    && displayProgress < TEACHER_QUESTION.endsAtSecs / TOTAL_DURATION
  // In fullscreen every overlay (gear, ?, progress, time) stays visible regardless of tap state
  const ctrlsVisible = isFullscreen || showControls

  // Measure phone container once on mount for landscape rotation
  useEffect(() => {
    const el = playerContainerRef.current
    if (el) setPlayerDims({ w: el.offsetWidth, h: el.offsetHeight })
  }, [])

  // Reset all playback state when the video changes (auto-advance or hero jump)
  useEffect(() => {
    progressRef.current = 0
    completionTriggeredRef.current = false
    setDisplayProgress(0)
    setIsPlaying(false)
    setShowCompletionOverlay(false)
    setVideoEndedNoAutoplay(false)
    setCountdown(5)
    setPhase('player')
    setActiveTab('topics')
    setTeacherQAnswer(null)
    setShowSettings(false)
  }, [videoId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Simulate playback
  useEffect(() => {
    if (!isPlaying) return
    const capturedAutoplay = autoplay
    const capturedNextVideo = nextVideo
    const t = setInterval(() => {
      const next = Math.min(progressRef.current + 0.005, 1)
      progressRef.current = next
      setDisplayProgress(next)
      if (next >= COMPLETION_THRESHOLD && !completionTriggeredRef.current) {
        completionTriggeredRef.current = true
        setIsPlaying(false)
        if (capturedAutoplay && capturedNextVideo) {
          setShowCompletionOverlay(true)
          setCountdown(5)
        } else {
          setVideoEndedNoAutoplay(true)
        }
      }
    }, 200)
    return () => clearInterval(t)
  }, [isPlaying]) // autoplay / nextVideo captured at play-start via local vars

  // Completion countdown → auto-advance to next video
  useEffect(() => {
    if (!showCompletionOverlay) return
    if (countdown <= 0) {
      setShowCompletionOverlay(false)
      if (nextVideo && setCurrentVideo) setCurrentVideo(nextVideo)
      else navigate('prevideoscreen')
      return
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [showCompletionOverlay, countdown])

  // Doubt toast auto-dismiss
  useEffect(() => {
    if (!showDoubtToast) return
    const t = setTimeout(() => setShowDoubtToast(false), 3000)
    return () => clearTimeout(t)
  }, [showDoubtToast])

  // Quiz per-question countdown timer
  useEffect(() => {
    if (phase !== 'quiz' || quizPhase !== 'questions') return
    if (quizAnswers[quizQIndex] !== undefined) return
    setQuizTimeLeft(60)
    const t = setInterval(() => setQuizTimeLeft(p => (p <= 1 ? 0 : p - 1)), 1000)
    return () => clearInterval(t)
  }, [phase, quizQIndex, quizPhase, quizAnswers])

  const handleSelfNotesChange = (val) => {
    setSelfNotes(val)
    setNotesSaved(false)
    if (notesTimerRef.current) clearTimeout(notesTimerRef.current)
  }

  const handleCapturePhoto = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => { setCapturedPhoto(ev.target.result); setNotesSaved(false) }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleVoiceToggle = () => {
    if (isRecording) {
      clearInterval(recordingIntervalRef.current)
      const mins = Math.floor(recordingSeconds / 60)
      const secs = recordingSeconds % 60
      setRecordedVoice({ duration: `${mins}:${String(secs).padStart(2, '0')}` })
      setIsRecording(false)
      setRecordingSeconds(0)
      setNotesSaved(false)
    } else {
      setRecordingSeconds(0)
      setIsRecording(true)
      recordingIntervalRef.current = setInterval(() => setRecordingSeconds(s => s + 1), 1000)
    }
  }

  const hasAnyNotes = selfNotes.trim() || capturedPhoto || recordedVoice

  const handleSaveNotes = () => {
    if (notesTimerRef.current) clearTimeout(notesTimerRef.current)
    setNotesSaved(true)
  }

  const fmtRecording = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  const handleSaveVideo = () => {
    if (isSaved) {
      unsaveVideo?.(videoId)
    } else {
      saveVideo?.({ id: videoId, title, subject: currentVideo?.subject || 'Applied Anatomy', savedAt: Date.now() })
      if (savedToastTimerRef.current) clearTimeout(savedToastTimerRef.current)
      setShowSavedToast(true)
      savedToastTimerRef.current = setTimeout(() => setShowSavedToast(false), 3000)
    }
  }

  const handleSaveResource = (type) => {
    const saved = type === 'slides' ? isSlidesSaved : isNotesSaved
    if (saved) { unsaveResource?.(`${videoId}-${type}`) }
    else {
      saveResource?.({
        id: `${videoId}-${type}`, videoId, type,
        videoTitle: title, subject: currentVideo?.subject || 'Applied Anatomy',
        savedAt: Date.now(),
      })
      setResourceSavedType(type)
      setShowResourceSavedToast(true)
      clearTimeout(resourceSavedTimerRef.current)
      resourceSavedTimerRef.current = setTimeout(() => setShowResourceSavedToast(false), 3000)
    }
  }

  // Like: set liked immediately, then open feedback popup (optional)
  const handleLike = () => {
    if (!liked) {
      setLiked(true)
      setDisliked(false)
      setShowLikeFeedback(true)
    } else {
      setLiked(false)
    }
  }

  // Dislike: open popup WITHOUT marking as disliked yet — only Submit confirms it
  const handleDislike = () => {
    if (!disliked) {
      setLiked(false)
      setShowDislikeFeedback(true)
    } else {
      setDisliked(false)
    }
  }

  const seekBy = (delta) => {
    const next = Math.max(0, Math.min(1, progressRef.current + delta / TOTAL_DURATION))
    progressRef.current = next
    setDisplayProgress(next)
  }

  const seekToTimestamp = (ts) => {
    const parts = ts.split(':')
    const secs = parseInt(parts[0]) * 60 + parseInt(parts[1])
    progressRef.current = secs / TOTAL_DURATION
    setDisplayProgress(progressRef.current)
  }

  const handleTopicClick = (topic) => {
    seekToTimestamp(topic.ts)
  }

  // Scrubber seek — pointer capture lets drag work without global listeners
  const seekFromPointer = (clientX) => {
    if (!scrubberRef.current) return
    const rect = scrubberRef.current.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    progressRef.current = pct
    setDisplayProgress(pct)
    if (pct < COMPLETION_THRESHOLD) {
      completionTriggeredRef.current = false
      setShowCompletionOverlay(false)
      setVideoEndedNoAutoplay(false)
    }
  }

  const handleScrubberPointerDown = (e) => {
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    seekFromPointer(e.clientX)
  }

  const handleScrubberPointerMove = (e) => {
    if (e.buttons === 0) return
    e.stopPropagation()
    seekFromPointer(e.clientX)
  }

  const handleWatchAgain = () => {
    progressRef.current = 0; completionTriggeredRef.current = false
    setDisplayProgress(0); setPhase('player')
    setQuizQIndex(0); setQuizAnswers({}); setQuizPhase('questions')
    setShowCompletionOverlay(false); setVideoEndedNoAutoplay(false); setIsPlaying(false)
  }

  const currentQuizQ = QUIZ_QUESTIONS[quizQIndex]
  const hasAnswered = quizAnswers[quizQIndex] !== undefined
  const isLastQ = quizQIndex === QUIZ_QUESTIONS.length - 1
  const quizScore = Object.keys(quizAnswers).filter(i => quizAnswers[+i] === QUIZ_QUESTIONS[+i].correct).length
  const passed = quizScore / QUIZ_QUESTIONS.length >= PASS_THRESHOLD

  // ─── QUIZ PHASE ───────────────────────────────────────────────────────────
  if (phase === 'quiz') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: bg }}>
        <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${borderClr}`, flexShrink: 0 }}>
          <button
            onClick={() => { setPhase('player'); setQuizQIndex(0); setQuizAnswers({}); setQuizPhase('questions') }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: text1, display: 'flex' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15,18 9,12 15,6"/></svg>
          </button>
          <span style={{ fontSize: 15, fontWeight: 700, color: text1, flex: 1 }}>Quick Test</span>
          {quizPhase === 'questions' && (
            <>
              {quizAnswers[quizQIndex] === undefined && <QuizTimerRing timeLeft={quizTimeLeft} />}
              <button
                onClick={() => setSavedQuestions(prev => { const s = new Set(prev); s.has(quizQIndex) ? s.delete(quizQIndex) : s.add(quizQIndex); return s })}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill={savedQuestions.has(quizQIndex) ? P : 'none'} stroke={savedQuestions.has(quizQIndex) ? P : text3} strokeWidth="1.8" strokeLinecap="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
                </svg>
              </button>
            </>
          )}
        </div>

        <div className="scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px 16px' }}>
          {quizPhase === 'questions' ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 20 }}>
                {QUIZ_QUESTIONS.map((_, i) => {
                  const ans = quizAnswers[i]
                  let dotBg = i === quizQIndex ? PL : (darkMode ? '#1e1e30' : BG2)
                  let dotBorder = i === quizQIndex ? P : borderClr
                  let dotColor = i === quizQIndex ? P : text3
                  if (ans !== undefined) {
                    if (ans === QUIZ_QUESTIONS[i].correct) { dotBg = '#EAF3DE'; dotBorder = '#97C459'; dotColor = '#27500A' }
                    else { dotBg = '#FCEBEB'; dotBorder = '#F09595'; dotColor = '#791F1F' }
                  }
                  return (
                    <div key={i} style={{ width: 34, height: 34, borderRadius: '50%', border: `1.5px solid ${dotBorder}`, background: dotBg, color: dotColor, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {i + 1}
                    </div>
                  )
                })}
              </div>

              <div style={{ fontSize: 15, fontWeight: 600, color: text1, lineHeight: 1.6, marginBottom: 20 }}>
                {currentQuizQ.text}
              </div>

              {/* Optional question image */}
              {currentQuizQ.image && (
                <div
                  onClick={() => setShowImageViewer(currentQuizQ.image)}
                  style={{ marginBottom: 16, borderRadius: 12, overflow: 'hidden', border: `1px solid ${borderClr}`, cursor: 'zoom-in', position: 'relative' }}
                >
                  <img src={currentQuizQ.image} alt="Question diagram" style={{ width: '100%', display: 'block', maxHeight: 180, objectFit: 'contain', background: cardBg }} />
                  <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.5)', borderRadius: 6, padding: '3px 8px', fontSize: 10, color: 'white', fontWeight: 600 }}>
                    Tap to zoom
                  </div>
                </div>
              )}

              {currentQuizQ.options.map((opt, i) => {
                const selected = quizAnswers[quizQIndex] === i
                const isCorrect = i === currentQuizQ.correct
                let optBg = cardBg, optBorder = borderClr, optColor = text2
                if (hasAnswered) {
                  if (isCorrect) { optBg = '#EAF3DE'; optBorder = '#97C459'; optColor = '#3B6D11' }
                  else if (selected) { optBg = '#FCEBEB'; optBorder = '#F09595'; optColor = '#791F1F' }
                } else if (selected) { optBg = PL; optBorder = P; optColor = PD }
                return (
                  <div key={i} style={{ marginBottom: hasAnswered ? 6 : 10 }}>
                    <button
                      onClick={() => { if (!hasAnswered) setQuizAnswers(prev => ({ ...prev, [quizQIndex]: i })) }}
                      style={{
                        width: '100%', padding: '13px 14px',
                        borderRadius: hasAnswered ? '12px 12px 0 0' : 12,
                        border: `1.5px solid ${optBorder}`, borderBottom: hasAnswered ? 'none' : `1.5px solid ${optBorder}`,
                        background: optBg, color: optColor,
                        fontSize: 14, fontWeight: selected || (hasAnswered && isCorrect) ? 600 : 400,
                        textAlign: 'left', cursor: hasAnswered ? 'default' : 'pointer',
                        display: 'flex', alignItems: 'center', gap: 10,
                      }}
                    >
                      <span style={{
                        width: 22, height: 22, borderRadius: '50%',
                        background: hasAnswered && isCorrect ? '#3B6D11' : hasAnswered && selected ? '#791F1F' : 'transparent',
                        border: `1.5px solid ${optBorder}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, fontSize: 11, fontWeight: 700,
                        color: hasAnswered && (isCorrect || selected) ? 'white' : optColor,
                      }}>
                        {['A', 'B', 'C', 'D'][i]}
                      </span>
                      <span style={{ flex: 1 }}>{opt}</span>
                      {hasAnswered && (
                        <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.65, flexShrink: 0, color: optColor }}>
                          {currentQuizQ.optPcts?.[i]}%
                        </span>
                      )}
                      {hasAnswered && isCorrect && (
                        <svg style={{ flexShrink: 0 }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3B6D11" strokeWidth="2.5" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>
                      )}
                      {hasAnswered && selected && !isCorrect && (
                        <svg style={{ flexShrink: 0 }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#791F1F" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      )}
                    </button>
                    {/* Per-option explanation */}
                    {hasAnswered && currentQuizQ.optionExplanations?.[i] && (
                      <div style={{
                        padding: '8px 14px 10px',
                        borderRadius: '0 0 12px 12px',
                        border: `1.5px solid ${optBorder}`, borderTop: `1px dashed ${optBorder}`,
                        background: isCorrect ? '#f2fae8' : selected ? '#fff5f5' : darkMode ? '#1e1e30' : '#fafafa',
                        fontSize: 12, color: isCorrect ? '#3B6D11' : selected ? '#791F1F' : text3,
                        lineHeight: 1.6, marginBottom: 4,
                      }}>
                        {currentQuizQ.optionExplanations[i]}
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Summary + bookmark + mark-as after answering */}
              {hasAnswered && (
                <div style={{ marginTop: 10, marginBottom: 16 }}>
                  {/* Correct answer summary */}
                  <div style={{ background: '#EAF3DE', border: '1px solid #97C459', borderRadius: 12, padding: '12px 14px', marginBottom: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#3B6D11', marginBottom: 4 }}>
                      {quizAnswers[quizQIndex] === currentQuizQ.correct ? '✓ Correct — here\'s why:' : '✗ Not quite — the correct answer:'}
                    </div>
                    <div style={{ fontSize: 13, color: '#3B6D11', lineHeight: 1.6 }}>{currentQuizQ.explanation}</div>
                  </div>

                  {/* Mark as row */}
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: text3, fontWeight: 600, flexShrink: 0 }}>Mark as:</span>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {['Important', 'Tricky', 'Missed', 'Didn\'t know'].map(tag => {
                        const isActive = questionTags[quizQIndex] === tag
                        return (
                          <button
                            key={tag}
                            onClick={() => setQuestionTags(prev => ({ ...prev, [quizQIndex]: isActive ? null : tag }))}
                            style={{
                              padding: '5px 10px', borderRadius: 50, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                              border: `1.5px solid ${isActive ? P : borderClr}`,
                              background: isActive ? PL : 'transparent',
                              color: isActive ? PD : text3,
                              transition: 'all 0.15s',
                            }}
                          >
                            {tag}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {hasAnswered && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                  {isLastQ ? (
                    <>
                      <button
                        onClick={() => setQuizPhase('result')}
                        className="btn-primary" style={{ width: '100%' }}
                      >
                        View Analysis
                      </button>
                      {quizQIndex > 0 && (
                        <button
                          onClick={() => setQuizQIndex(i => i - 1)}
                          className="btn-outline" style={{ width: '100%' }}
                        >
                          ← Previous question
                        </button>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={() => setQuizQIndex(i => i + 1)}
                      className="btn-primary" style={{ width: '100%' }}
                    >
                      Next question →
                    </button>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <div style={{ textAlign: 'center', padding: '24px 0 20px' }}>
                <div style={{ fontSize: 44, marginBottom: 12 }}>{passed ? '👌' : '🙂'}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: text1, marginBottom: 8 }}>
                  {passed ? 'That went well.' : 'A couple of these need another look.'}
                </div>
                <div style={{ fontSize: 14, color: text2, lineHeight: 1.6, marginBottom: 20 }}>
                  {passed ? 'Ready to keep going?' : 'Want to go through the video again?'}
                </div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: passed ? '#EAF3DE' : PL,
                  border: `1.5px solid ${passed ? '#97C459' : P}`,
                  borderRadius: 50, padding: '8px 20px', marginBottom: 24,
                }}>
                  <span style={{ fontSize: 22, fontWeight: 800, color: passed ? '#3B6D11' : PD }}>{quizScore}</span>
                  <span style={{ fontSize: 13, color: passed ? '#3B6D11' : PD }}>/ {QUIZ_QUESTIONS.length} correct</span>
                </div>

                <div style={{ textAlign: 'left', marginBottom: 20 }}>
                  {QUIZ_QUESTIONS.map((q, i) => {
                    const correct = quizAnswers[i] === q.correct
                    const isOpen = expandedResult === i
                    const accentColor = correct ? '#3B6D11' : '#791F1F'
                    const accentBg = correct ? '#EAF3DE' : '#FCEBEB'
                    const accentBorder = correct ? '#97C459' : '#F09595'
                    const accentBorderLight = correct ? '#c7e8a0' : '#f8bfbf'
                    return (
                      <div key={i} style={{ marginBottom: 8, borderRadius: 12, overflow: 'hidden', border: `1px solid ${accentBorder}` }}>
                        {/* Row header — always visible, tap to expand */}
                        <button
                          onClick={() => setExpandedResult(isOpen ? null : i)}
                          style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                            padding: '11px 14px', background: accentBg,
                            border: 'none', cursor: 'pointer', textAlign: 'left',
                          }}
                        >
                          <span style={{ fontSize: 12, color: accentColor, flex: 1, lineHeight: 1.4, fontWeight: 500 }}>
                            Q{i + 1}: {q.text}
                          </span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: accentColor, flexShrink: 0 }}>{correct ? '✓' : '✗'}</span>
                          <svg
                            width="14" height="14" viewBox="0 0 24 24" fill="none"
                            stroke={accentColor} strokeWidth="2.5" strokeLinecap="round"
                            style={{ flexShrink: 0, transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                          >
                            <polyline points="6,9 12,15 18,9"/>
                          </svg>
                        </button>

                        {/* Expanded: options + explanation */}
                        {isOpen && (
                          <div style={{ background: 'white', padding: '12px 14px 14px', borderTop: `1px solid ${accentBorderLight}` }}>
                            {q.options.map((opt, j) => {
                              const isCorrectOpt = j === q.correct
                              const wasSelected = quizAnswers[i] === j
                              let bg = BG2, border = borderClr, color = text2
                              if (isCorrectOpt) { bg = '#EAF3DE'; border = '#97C459'; color = '#3B6D11' }
                              else if (wasSelected) { bg = '#FCEBEB'; border = '#F09595'; color = '#791F1F' }
                              return (
                                <div key={j} style={{ marginBottom: 6 }}>
                                  <div style={{
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    padding: '9px 12px',
                                    borderRadius: q.optionExplanations ? '8px 8px 0 0' : 8,
                                    background: bg, border: `1px solid ${border}`,
                                    borderBottom: q.optionExplanations ? 'none' : `1px solid ${border}`,
                                  }}>
                                    <span style={{
                                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0, fontSize: 10, fontWeight: 700,
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      background: isCorrectOpt ? '#3B6D11' : wasSelected ? '#791F1F' : 'transparent',
                                      border: `1.5px solid ${border}`,
                                      color: (isCorrectOpt || wasSelected) ? 'white' : color,
                                    }}>
                                      {['A', 'B', 'C', 'D'][j]}
                                    </span>
                                    <span style={{ fontSize: 12, color, fontWeight: isCorrectOpt || wasSelected ? 600 : 400, flex: 1 }}>{opt}</span>
                                    {isCorrectOpt && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3B6D11" strokeWidth="2.5" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>}
                                    {wasSelected && !isCorrectOpt && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#791F1F" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
                                  </div>
                                  {q.optionExplanations?.[j] && (
                                    <div style={{
                                      padding: '7px 12px 9px', fontSize: 11, lineHeight: 1.6,
                                      borderRadius: '0 0 8px 8px', border: `1px solid ${border}`, borderTop: `1px dashed ${border}`,
                                      background: isCorrectOpt ? '#f2fae8' : wasSelected ? '#fff5f5' : '#fafafa',
                                      color: isCorrectOpt ? '#3B6D11' : wasSelected ? '#791F1F' : T3,
                                    }}>
                                      {q.optionExplanations[j]}
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                            <div style={{ marginTop: 10, padding: '10px 12px', borderRadius: 8, background: '#EAF3DE', border: '1px solid #97C459' }}>
                              <div style={{ fontSize: 11, fontWeight: 700, color: '#3B6D11', marginBottom: 3 }}>Key takeaway</div>
                              <div style={{ fontSize: 12, color: '#3B6D11', lineHeight: 1.6 }}>{q.explanation}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 28 }}>
                <button onClick={() => navigate('prevideoscreen')} className="btn-primary" style={{ width: '100%' }}>
                  Continue to Video
                </button>
                <button onClick={handleWatchAgain} className="btn-outline" style={{ width: '100%' }}>
                  Watch this again
                </button>
              </div>
            </>
          )}
        </div>

        {/* ── IMAGE VIEWER MODAL ── */}
        {showImageViewer && (
          <div
            onClick={() => setShowImageViewer(null)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }}
          >
            <button
              onClick={() => setShowImageViewer(null)}
              style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', fontSize: 18 }}
            >
              ×
            </button>
            <div
              onClick={e => e.stopPropagation()}
              style={{ maxWidth: '90%', maxHeight: '80%', overflow: 'auto', touchAction: 'pinch-zoom' }}
            >
              <img
                src={showImageViewer} alt="Zoomed diagram"
                style={{ width: '100%', borderRadius: 8, display: 'block', touchAction: 'pinch-zoom' }}
              />
            </div>
            <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', fontSize: 11, color: 'rgba(255,255,255,0.45)', whiteSpace: 'nowrap' }}>
              Pinch to zoom · Tap outside to close
            </div>
          </div>
        )}
      </div>
    )
  }

  // ─── PLAYER PHASE ─────────────────────────────────────────────────────────
  return (
    <div ref={playerContainerRef} style={{ display: 'flex', flexDirection: 'column', height: '100%', background: bg, position: 'relative' }}>

      {/* VIDEO AREA */}
      <div
        onClick={() => setShowControls(c => !c)}
        style={{ background: '#0d0d1a', flexShrink: 0, position: 'relative', width: '100%', aspectRatio: isFullscreen ? undefined : '16/9', flex: isFullscreen ? 1 : undefined, cursor: 'pointer', overflow: 'hidden' }}
      >
        {/* ── LANDSCAPE WRAPPER: identity in portrait, rotated -90° in fullscreen ── */}
        <div style={isFullscreen ? {
          position: 'absolute',
          width: playerDims.h,
          height: playerDims.w,
          top: '50%',
          left: '50%',
          marginLeft: -(playerDims.h / 2),
          marginTop: -(playerDims.w / 2),
          transform: 'rotate(-90deg)',
          background: '#0d0d1a',
          overflow: 'hidden',
        } : {
          position: 'absolute',
          inset: 0,
        }}>

        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, transparent 100%)', pointerEvents: 'none', opacity: ctrlsVisible ? 1 : 0, transition: 'opacity 0.22s' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%', background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)', pointerEvents: 'none' }} />

        {/* Top bar: back · EN/HI · ? · gear */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, padding: '10px 12px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          opacity: ctrlsVisible ? 1 : 0, transition: 'opacity 0.22s',
          pointerEvents: ctrlsVisible ? 'auto' : 'none',
        }}>
          <button
            onClick={e => { e.stopPropagation(); navigate('prevideoscreen') }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', display: 'flex', padding: 4 }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15,18 9,12 15,6"/></svg>
          </button>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              onClick={e => { e.stopPropagation(); setIsPlaying(false); setShowDoubtPopup(true) }}
              style={{
                background: 'rgba(0,0,0,0.35)', border: '1.5px solid rgba(255,255,255,0.4)',
                borderRadius: '50%', width: 26, height: 26,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: 700,
              }}
            >
              ?
            </button>
            <button
              onClick={e => { e.stopPropagation(); setShowSettings(true) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.8)', display: 'flex' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Centre controls */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          display: 'flex', alignItems: 'center', gap: 36,
          opacity: ctrlsVisible ? 1 : 0, transition: 'opacity 0.22s',
          pointerEvents: ctrlsVisible ? 'auto' : 'none',
        }}>
          <button
            onClick={e => { e.stopPropagation(); seekBy(-seekInterval) }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
            </svg>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>{seekInterval}</span>
          </button>

          <button
            onClick={e => { e.stopPropagation(); setIsPlaying(p => !p) }}
            style={{
              width: 62, height: 62, borderRadius: '50%',
              background: 'rgba(255,255,255,0.18)', border: '2px solid rgba(255,255,255,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}
          >
            {isPlaying
              ? <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
              : <svg width="22" height="22" viewBox="0 0 24 24" fill="white" style={{ marginLeft: 3 }}><polygon points="5,3 19,12 5,21"/></svg>}
          </button>

          <button
            onClick={e => { e.stopPropagation(); seekBy(seekInterval) }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
            </svg>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>{seekInterval}</span>
          </button>
        </div>

        {/* Bottom: time + scrubber + fullscreen */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 12px 10px' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 6, opacity: ctrlsVisible ? 1 : 0, transition: 'opacity 0.22s',
            pointerEvents: ctrlsVisible ? 'auto' : 'none',
          }}>
            <span style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.85)' }}>{currentTime}</span>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>12:00</span>
              <button
                onClick={e => { e.stopPropagation(); setShowDownloadQualitySheet(true) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.65)', display: 'flex', padding: 2 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="7,10 12,15 17,10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </button>
              <button
                onClick={e => { e.stopPropagation(); setIsFullscreen(f => !f); setShowControls(true) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.65)', display: 'flex' }}
              >
                {isFullscreen ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <polyline points="4,14 10,14 10,20"/><polyline points="20,10 14,10 14,4"/>
                    <line x1="10" y1="14" x2="3" y2="21"/><line x1="21" y1="3" x2="14" y2="10"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <polyline points="15,3 21,3 21,9"/><polyline points="9,21 3,21 3,15"/>
                    <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div
            ref={scrubberRef}
            onPointerDown={handleScrubberPointerDown}
            onPointerMove={handleScrubberPointerMove}
            style={{ position: 'relative', height: 20, display: 'flex', alignItems: 'center', cursor: 'pointer', touchAction: 'none' }}
          >
            <div style={{ position: 'absolute', left: 0, right: 0, height: ctrlsVisible ? 4 : 2, background: 'rgba(255,255,255,0.25)', borderRadius: 2, transition: 'height 0.15s' }}>
              <div style={{ height: '100%', width: `${displayProgress * 100}%`, background: P, borderRadius: 2 }} />
            </div>
            <div style={{ position: 'absolute', left: `calc(${displayProgress * 100}% - 7px)`, width: 14, height: 14, borderRadius: '50%', background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.5)', pointerEvents: 'none', opacity: ctrlsVisible ? 1 : 0, transition: 'opacity 0.22s' }} />
          </div>
        </div>

        {/* Completion overlay — autoplay ON */}
        {showCompletionOverlay && (
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'absolute', inset: 0, background: 'rgba(10,10,30,0.9)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 10, zIndex: 20, padding: '0 28px',
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.45)', marginBottom: 10, textTransform: 'uppercase' }}>
              Up Next
            </div>

            {/* Next video card */}
            <div style={{ width: '100%', maxWidth: 280, background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ width: 64, height: 46, background: 'rgba(255,255,255,0.07)', borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="rgba(255,255,255,0.4)"><polygon points="5,3 19,12 5,21"/></svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'white', lineHeight: 1.35, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {nextVideo?.title || 'Cardiovascular System — Part 2'}
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>
                  {nextVideo?.subject || currentSubject?.name || 'Applied Anatomy'} · 14 min
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 280 }}>
              {/* Tap to skip countdown and go immediately */}
              <button
                onClick={() => {
                  setShowCompletionOverlay(false)
                  if (nextVideo && setCurrentVideo) setCurrentVideo(nextVideo)
                  else navigate('prevideoscreen')
                }}
                style={{ width: '100%', padding: '12px 16px', borderRadius: 50, background: 'white', border: 'none', color: T1, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill={P}><polygon points="5,3 19,12 5,21"/></svg>
                Starting next video
                <span style={{ fontSize: 11, fontWeight: 700, background: P, borderRadius: 50, padding: '2px 9px', color: 'white' }}>
                  {countdown}s
                </span>
              </button>
              <button
                onClick={() => { setShowCompletionOverlay(false); setQuizQIndex(0); setQuizAnswers({}); setQuizPhase('questions'); setPhase('quiz') }}
                style={{ width: '100%', padding: '12px', borderRadius: 50, background: 'transparent', border: '1.5px solid rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                🎯 Practice this topic first
              </button>
            </div>
          </div>
        )}

        {/* End screen — autoplay OFF */}
        {videoEndedNoAutoplay && (
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'absolute', inset: 0, background: 'rgba(10,10,30,0.9)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 10, zIndex: 20, padding: '0 28px',
            }}
          >
            {/* Back button — top-left */}
            <button
              onClick={e => { e.stopPropagation(); navigate('prevideoscreen') }}
              style={{ position: 'absolute', top: 10, left: 12, background: 'none', border: 'none', cursor: 'pointer', color: 'white', display: 'flex', padding: 4 }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15,18 9,12 15,6"/></svg>
            </button>

            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.45)', marginBottom: 8, textTransform: 'uppercase' }}>
              Video Complete
            </div>
            <div style={{ fontSize: 26, marginBottom: 4 }}>✓</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 280 }}>
              <button
                onClick={handleWatchAgain}
                style={{ width: '100%', padding: '12px 16px', borderRadius: 50, background: 'transparent', border: '1.5px solid rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
                Replay
              </button>
              {nextVideo && (
                <button
                  onClick={() => { setVideoEndedNoAutoplay(false); if (setCurrentVideo) setCurrentVideo(nextVideo) }}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 50, background: 'white', border: 'none', color: T1, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill={P}><polygon points="5,3 19,12 5,21"/></svg>
                  Continue to next video
                </button>
              )}
            </div>
          </div>
        )}

        {/* Landscape ABCD overlay — stacked vertically on the right side */}
        {isFullscreen && teacherQActive && (
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'absolute', top: 48, right: 12, zIndex: 15,
              background: 'rgba(10,10,28,0.88)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 12, padding: '8px 10px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {TEACHER_QUESTION.options.map((opt, i) => {
                const selected = teacherQAnswer === i
                const isCorrect = i === TEACHER_QUESTION.correct
                let bg = 'rgba(255,255,255,0.08)', border = 'rgba(255,255,255,0.2)', color = 'rgba(255,255,255,0.85)'
                if (teacherQAnswer !== null) {
                  if (isCorrect) { bg = 'rgba(80,180,80,0.35)'; border = '#97C459'; color = '#7FD654' }
                  else if (selected) { bg = 'rgba(200,60,60,0.35)'; border = '#F09595'; color = '#F09595' }
                }
                return (
                  <button key={i}
                    onClick={() => { if (teacherQAnswer === null) setTeacherQAnswer(i) }}
                    style={{
                      width: 36, height: 30, borderRadius: 8,
                      background: bg, border: `1.5px solid ${border}`, color: color,
                      fontSize: 13, fontWeight: 800,
                      cursor: teacherQAnswer === null ? 'pointer' : 'default',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {['A', 'B', 'C', 'D'][i]}
                  </button>
                )
              })}
            </div>
            {teacherQAnswer !== null && (
              <div style={{ fontSize: 9, color: teacherQAnswer === TEACHER_QUESTION.correct ? '#7FD654' : '#F09595', marginTop: 5, fontWeight: 600, textAlign: 'center' }}>
                {teacherQAnswer === TEACHER_QUESTION.correct ? '✓ Correct!' : `✗ ${['A','B','C','D'][TEACHER_QUESTION.correct]}`}
              </div>
            )}
          </div>
        )}

        </div>{/* end landscape wrapper */}
      </div>

      {/* Doubt toast */}
      {showDoubtToast && (
        <div style={{
          position: 'absolute', bottom: 80, left: '50%', transform: 'translateX(-50%)',
          background: '#1a1a2e', color: 'white', padding: '10px 18px', borderRadius: 50,
          fontSize: 12, fontWeight: 600, zIndex: 200, whiteSpace: 'nowrap',
          boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
        }}>
          Noted — we'll take a look
        </div>
      )}

      {/* Saved toast */}
      {showSavedToast && (
        <div style={{
          position: 'absolute', bottom: 80, left: '50%', transform: 'translateX(-50%)',
          background: '#1a1a2e', color: 'white', padding: '10px 20px', borderRadius: 50,
          fontSize: 12, fontWeight: 600, zIndex: 200, whiteSpace: 'nowrap',
          boxShadow: '0 4px 16px rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill={P} stroke={P} strokeWidth="1.8" strokeLinecap="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
          Video added to your save list
        </div>
      )}

      {/* Resource saved toast */}
      {showResourceSavedToast && (
        <div style={{
          position: 'absolute', bottom: 80, left: '50%', transform: 'translateX(-50%)',
          background: '#1a1a2e', color: 'white', padding: '10px 20px', borderRadius: 50,
          fontSize: 12, fontWeight: 600, zIndex: 200, whiteSpace: 'nowrap',
          boxShadow: '0 4px 16px rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill={P} stroke={P} strokeWidth="1.8" strokeLinecap="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
          </svg>
          {resourceSavedType === 'slides' ? 'Slides' : 'Notes'} added to your saved resources
        </div>
      )}

      {/* Download toast */}
      {showDownloadToast && (
        <div style={{
          position: 'absolute', bottom: 80, left: '50%', transform: 'translateX(-50%)',
          background: '#1a1a2e', color: 'white', padding: '10px 20px', borderRadius: 50,
          fontSize: 12, fontWeight: 600, zIndex: 200, whiteSpace: 'nowrap',
          boxShadow: '0 4px 16px rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={P} strokeWidth="2.2" strokeLinecap="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="7,10 12,15 17,10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Downloading · {DOWNLOAD_QUALITIES.find(q => q.id === downloadQuality)?.label} quality
        </div>
      )}

      {/* SCROLLABLE CONTENT */}
      <div className="scroll" style={{ flex: 1, overflowY: 'auto', background: bg, display: isFullscreen ? 'none' : undefined }}>

        {/* Title + meta + Save/Share */}
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${borderClr}`, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: text1, lineHeight: 1.35, marginBottom: 3 }}>{title}</div>
            <div style={{ fontSize: 11, color: text3 }}>Uploaded on: {uploadDate}</div>
          </div>
          <div style={{ display: 'flex', gap: 2, alignItems: 'center', flexShrink: 0, paddingTop: 2 }}>
            <button onClick={handleSaveVideo}
              style={{ width: 36, height: 36, borderRadius: '50%', background: isSaved ? PL : 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill={isSaved ? P : 'none'} stroke={isSaved ? P : text2} strokeWidth="1.8" strokeLinecap="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
              </svg>
            </button>
            <button onClick={() => {}}
              style={{ width: 36, height: 36, borderRadius: '50%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={text2} strokeWidth="1.8" strokeLinecap="round">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Teacher Question — shown when video reaches 6:30 */}
        {teacherQActive && (

          /* Teacher's Question card — ABCD blocks only */
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${borderClr}`, background: darkMode ? '#16162a' : '#FAFAFF' }}>
            {/* ABCD square blocks row */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              {TEACHER_QUESTION.options.map((opt, i) => {
                const selected = teacherQAnswer === i
                const isCorrect = i === TEACHER_QUESTION.correct
                let bg = darkMode ? '#1e1e30' : 'white', border = borderClr, color = text2
                if (teacherQAnswer !== null) {
                  if (isCorrect) { bg = '#EAF3DE'; border = '#97C459'; color = GREEN }
                  else if (selected) { bg = '#FCEBEB'; border = '#F09595'; color = '#791F1F' }
                } else if (selected) { bg = PL; border = P; color = PD }
                return (
                  <button key={i}
                    onClick={() => { if (teacherQAnswer === null) setTeacherQAnswer(i) }}
                    style={{
                      flex: 1, height: 48, borderRadius: 10,
                      border: `2px solid ${border}`, background: bg, color: color,
                      fontSize: 16, fontWeight: 800,
                      cursor: teacherQAnswer === null ? 'pointer' : 'default',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {['A', 'B', 'C', 'D'][i]}
                  </button>
                )
              })}
            </div>
            {/* Show selected option text after answering */}
            {teacherQAnswer !== null && (
              <div style={{ marginBottom: 8, fontSize: 12, color: teacherQAnswer === TEACHER_QUESTION.correct ? GREEN : '#791F1F', fontWeight: 600 }}>
                {['A', 'B', 'C', 'D'][teacherQAnswer]}. {TEACHER_QUESTION.options[teacherQAnswer]}
                {teacherQAnswer !== TEACHER_QUESTION.correct && (
                  <span style={{ color: GREEN, fontWeight: 600 }}> · Correct: {['A', 'B', 'C', 'D'][TEACHER_QUESTION.correct]}. {TEACHER_QUESTION.options[TEACHER_QUESTION.correct]}</span>
                )}
              </div>
            )}

            {teacherQAnswer !== null && (
              <div style={{ marginTop: 10, padding: '10px 13px', borderRadius: 10, background: '#EAF3DE', border: '1px solid #97C459' }}>
                <div style={{ fontSize: 12, color: GREEN, lineHeight: 1.6 }}>
                  {TEACHER_QUESTION.explanation}
                </div>
              </div>
            )}
          </div>

        )}

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${borderClr}` }}>
          {[
            { id: 'topics',    label: 'Topics' },
            { id: 'resources', label: 'Resources' },
            { id: 'selfnotes', label: 'Notes' },
            { id: 'practice',  label: 'Practice' },
          ].map(tab => (
            <button
              key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1, padding: '11px 2px', fontSize: isReturningUser ? 11 : 12,
                fontWeight: activeTab === tab.id ? 700 : 500,
                color: activeTab === tab.id ? (tab.id === 'practice' ? '#C05C0D' : P) : text3,
                background: 'none', border: 'none',
                borderBottom: `2.5px solid ${activeTab === tab.id ? (tab.id === 'practice' ? '#C05C0D' : P) : 'transparent'}`,
                cursor: 'pointer', transition: 'all 0.15s',
                position: 'relative',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ padding: '12px 16px' }}>

          {activeTab === 'topics' && videoId === 'v02' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '28px 8px 12px', textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: 18, background: PL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={P} strokeWidth="1.8" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: text1, marginBottom: 6 }}>Topics coming soon</div>
                <div style={{ fontSize: 12, color: text2, lineHeight: 1.65, maxWidth: 240, margin: '0 auto' }}>
                  We're adding chapter topics for this video and they'll appear here very soon.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'topics' && videoId !== 'v02' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {(VIDEO_TOPICS[videoId] || TOPICS_COVERED).map((topic, i) => (
                <button
                  key={i} onClick={() => handleTopicClick(topic)}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px', borderRadius: 10, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}
                >
                  <span style={{ fontSize: 11, fontWeight: 700, color: P, minWidth: 30, flexShrink: 0 }}>{topic.ts}</span>
                  <div style={{ width: 1, height: 16, background: borderClr, flexShrink: 0 }} />
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                    <span style={{ fontSize: 13, color: text1 }}>{topic.name}</span>
                    {topic.hasQuestion && (
                      <span style={{ fontSize: 9, fontWeight: 700, color: P, background: PL, padding: '2px 7px', borderRadius: 50, flexShrink: 0 }}>Q</span>
                    )}
                  </div>
                  <svg style={{ flexShrink: 0 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={text3} strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
                </button>
              ))}
            </div>
          )}

          {activeTab === 'resources' && videoId === 'v02' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '28px 8px 12px', textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: 18, background: PL, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={P} strokeWidth="1.8" strokeLinecap="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/>
                  <line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: text1, marginBottom: 6 }}>We're adding resources quickly</div>
                <div style={{ fontSize: 12, color: text2, lineHeight: 1.65, maxWidth: 240, margin: '0 auto' }}>
                  Slides & notes for this video are on their way. We're covering 1,400+ videos as fast as we can.
                </div>
              </div>
              {showUpdateRequestSent ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 50, background: '#EAF3DE', border: '1.5px solid #A8D57C' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3B6D11" strokeWidth="2.5" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#3B6D11' }}>Request received! We'll prioritize this.</span>
                </div>
              ) : (
                <button
                  onClick={() => { setShowUpdateRequestSent(true); clearTimeout(updateRequestTimerRef.current) }}
                  style={{ padding: '11px 22px', borderRadius: 50, border: `1.5px solid ${P}`, background: 'none', color: P, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={P} strokeWidth="2" strokeLinecap="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                  Request faster update
                </button>
              )}
            </div>
          )}

          {activeTab === 'resources' && videoId !== 'v02' && (() => {
            const PDF_RED = '#E53935'
            const DUMMY_SLIDES = [
              { id: 1, title: 'Heart Anatomy', subtitle: 'Overview', lines: ['4-chamber structure', 'Valves & septa', 'Coronary supply'] },
              { id: 2, title: 'Conduction', subtitle: 'System', lines: ['SA → AV node', 'Purkinje network', 'HV interval norms'] },
              { id: 3, title: 'Cardiac Cycle', subtitle: 'Phases', lines: ['Systole & diastole', 'P-V loop', 'Starling\'s law'] },
              { id: 4, title: 'ECG Basics', subtitle: 'Waveforms', lines: ['P-QRS-T waves', 'Normal intervals', 'Axis deviation'] },
              { id: 5, title: 'Clinical', subtitle: 'Correlates', lines: ['Heart failure', 'Arrhythmias', 'Murmurs'] },
            ]
            const DUMMY_NOTES = [
              'The heart has four chambers: two atria (upper) and two ventricles (lower). The right side pumps deoxygenated blood to the lungs; the left side pumps oxygenated blood to the body.',
              'The SA node (sinoatrial node) is the natural pacemaker — it fires at 60–100 bpm and initiates each heartbeat. Impulses travel to the AV node, then down the Bundle of His to the Purkinje fibres.',
              'Key valves: Tricuspid (RA→RV), Pulmonary (RV→pulmonary artery), Mitral (LA→LV), Aortic (LV→aorta). "Try Pulling My Aorta" — classic mnemonic.',
              'Cardiac output = Heart Rate × Stroke Volume. Normal CO ≈ 4–8 L/min at rest.',
            ]
            /* PDF badge — small red pill */
            const PdfBadge = () => (
              <span style={{ fontSize: 8, fontWeight: 800, color: 'white', background: PDF_RED, padding: '1px 5px', borderRadius: 3, letterSpacing: '0.04em' }}>PDF</span>
            )
            /* Full-screen PDF preview modal */
            const PDF_PAGES = [
              {
                title: 'Heart Anatomy',
                heading: 'THE 4-CHAMBER HEART',
                body: 'The human heart consists of four chambers: two atria (right and left) and two ventricles (right and left). The right atrium receives deoxygenated blood from the systemic circulation via the superior and inferior vena cava.',
                bullets: ['Right side → pulmonary circulation (lungs)', 'Left side → systemic circulation (body)', 'Interventricular septum separates the ventricles', 'AV valves prevent backflow between chambers'],
                note: 'Remember: "Right receives, Left leaves" — right side receives deoxygenated blood, left side delivers oxygenated blood.',
              },
              {
                title: 'Conduction System',
                heading: 'ELECTRICAL PATHWAY OF THE HEART',
                body: 'The sinoatrial (SA) node is the natural pacemaker located in the right atrium. It generates impulses at 60–100 bpm. The signal travels to the AV node (40–60 bpm backup), then down the Bundle of His into left and right bundle branches, finally reaching the Purkinje fibres.',
                bullets: ['SA node → AV node → Bundle of His', 'Left & right bundle branches', 'Purkinje fibre network → ventricular myocytes', 'Depolarisation precedes mechanical contraction'],
                note: 'Key ECG correlation: PR interval = AV node conduction delay. Normal: 120–200 ms.',
              },
              {
                title: 'Cardiac Cycle',
                heading: 'SYSTOLE & DIASTOLE',
                body: 'The cardiac cycle comprises two phases: systole (contraction) and diastole (relaxation). During systole, ventricular pressure rises above aortic pressure, opening the aortic valve. During diastole, the ventricles fill with blood from the atria.',
                bullets: ['Isovolumetric contraction → ejection phase', 'Isovolumetric relaxation → rapid filling', 'Cardiac output = HR × Stroke Volume', 'Normal CO at rest: 4–8 L/min'],
                note: 'Starling\'s Law: the more the ventricle is filled during diastole, the greater the force of contraction during systole.',
              },
              {
                title: 'ECG Basics',
                heading: 'P-QRS-T WAVEFORM ANALYSIS',
                body: 'An electrocardiogram (ECG) records the electrical activity of the heart. The P wave represents atrial depolarisation, the QRS complex represents ventricular depolarisation, and the T wave represents ventricular repolarisation.',
                bullets: ['P wave: atrial depolarisation (80 ms)', 'QRS complex: ventricular depolarisation (<120 ms)', 'T wave: ventricular repolarisation', 'QT interval: total ventricular electrical activity'],
                note: 'Normal sinus rhythm: rate 60–100 bpm, P before every QRS, PR interval 120–200 ms, QRS < 120 ms.',
              },
              {
                title: 'Clinical Correlates',
                heading: 'CARDIAC PATHOLOGY OVERVIEW',
                body: 'Common cardiac conditions include heart failure (inability to pump sufficient blood), arrhythmias (abnormal heart rhythms), and valvular diseases. Heart failure is classified as systolic (reduced EF < 40%) or diastolic (preserved EF ≥ 50%).',
                bullets: ['Heart failure: reduced or preserved EF', 'Atrial fibrillation: irregular rhythm, stroke risk', 'Mitral stenosis: rheumatic fever sequela', 'Aortic regurgitation: diastolic murmur'],
                note: 'USMLE tip: New York Heart Association (NYHA) classifies HF severity I–IV based on functional limitation.',
              },
            ]

            const openPdf = (idx) => { setPdfCurrentPage(idx); setPdfPreviewOpen(true) }

            return (
              <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

                {/* ── Slides PDF — collapsible ── */}
                <div style={{ borderRadius: 12, border: `1px solid ${borderClr}`, overflow: 'hidden', background: cardBg }}>
                  <button
                    onClick={() => setSlidesExpanded(v => !v)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', borderBottom: slidesExpanded ? `1px solid ${borderClr}` : 'none' }}
                  >
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: '#FFF0F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={PDF_RED} strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: text1, display: 'flex', alignItems: 'center', gap: 6 }}>
                        Slides <PdfBadge />
                      </div>
                      <div style={{ fontSize: 11, color: text3, marginTop: 1 }}>24 pages · Heart Anatomy Overview</div>
                    </div>
                    <button onClick={e => { e.stopPropagation(); handleSaveResource('slides') }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill={isSlidesSaved ? P : 'none'} stroke={isSlidesSaved ? P : text3} strokeWidth="1.8" strokeLinecap="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
                    </button>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={text3} strokeWidth="2.2" strokeLinecap="round" style={{ flexShrink: 0, transition: 'transform 0.2s', transform: slidesExpanded ? 'rotate(180deg)' : 'rotate(0deg)', marginLeft: 2 }}>
                      <polyline points="6,9 12,15 18,9"/>
                    </svg>
                  </button>
                  {slidesExpanded && (
                    <div style={{ display: 'flex', gap: 10, padding: '12px 14px', overflowX: 'auto', scrollbarWidth: 'none' }}>
                      {DUMMY_SLIDES.map((s, idx) => (
                        <div
                          key={s.id}
                          onClick={() => openPdf(idx)}
                          style={{
                            flexShrink: 0, width: 90, cursor: 'pointer',
                            borderRadius: 6, overflow: 'hidden',
                            border: `1px solid ${darkMode ? '#2e2e48' : '#d4d4e8'}`,
                            boxShadow: '1px 2px 6px rgba(0,0,0,0.10)',
                            background: darkMode ? '#1a1a2e' : 'white',
                          }}
                        >
                          <div style={{ padding: '8px 8px 6px', borderBottom: `2px solid ${PDF_RED}` }}>
                            <div style={{ fontSize: 8, fontWeight: 800, color: darkMode ? '#aaa' : '#999', marginBottom: 4, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                              Slide {s.id}
                            </div>
                            <div style={{ fontSize: 10, fontWeight: 800, color: text1, lineHeight: 1.25, marginBottom: 3 }}>{s.title}</div>
                            <div style={{ fontSize: 9, color: text3, fontStyle: 'italic', marginBottom: 5 }}>{s.subtitle}</div>
                            {s.lines.map((l, li) => (
                              <div key={li} style={{ display: 'flex', alignItems: 'flex-start', gap: 4, marginBottom: 2 }}>
                                <span style={{ fontSize: 8, color: PDF_RED, fontWeight: 700, marginTop: 1, flexShrink: 0 }}>•</span>
                                <span style={{ fontSize: 8, color: text2, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l}</span>
                              </div>
                            ))}
                          </div>
                          <div style={{ padding: '3px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 7, color: text3 }}>NPrep</span>
                            <span style={{ fontSize: 7, color: text3 }}>{s.id}/24</span>
                          </div>
                        </div>
                      ))}
                      <div
                        onClick={() => openPdf(0)}
                        style={{ flexShrink: 0, width: 72, borderRadius: 6, border: `1.5px dashed ${borderClr}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, cursor: 'pointer' }}
                      >
                        <span style={{ fontSize: 16, color: text3, lineHeight: 1 }}>+</span>
                        <span style={{ fontSize: 9, color: text3, textAlign: 'center', lineHeight: 1.3 }}>19 more</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Notes PDF — collapsible ── */}
                <div style={{ borderRadius: 12, border: `1px solid ${borderClr}`, overflow: 'hidden', background: cardBg }}>
                  <button
                    onClick={() => setNotesExpanded(n => !n)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: '#FFF0F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={PDF_RED} strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/></svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: text1, display: 'flex', alignItems: 'center', gap: 6 }}>
                        Notes <PdfBadge />
                      </div>
                      <div style={{ fontSize: 11, color: text3, marginTop: 1 }}>4 pages · by content team</div>
                    </div>
                    <button onClick={e => { e.stopPropagation(); handleSaveResource('notes') }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill={isNotesSaved ? P : 'none'} stroke={isNotesSaved ? P : text3} strokeWidth="1.8" strokeLinecap="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
                    </button>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={text3} strokeWidth="2.2" strokeLinecap="round" style={{ flexShrink: 0, transition: 'transform 0.2s', transform: notesExpanded ? 'rotate(180deg)' : 'rotate(0deg)', marginLeft: 2 }}>
                      <polyline points="6,9 12,15 18,9"/>
                    </svg>
                  </button>
                  {notesExpanded && (
                    <div style={{ borderTop: `1px solid ${borderClr}` }}>
                      {DUMMY_NOTES.map((note, ni) => (
                        <div key={ni} style={{ display: 'flex', gap: 0, borderBottom: ni < DUMMY_NOTES.length - 1 ? `1px solid ${borderClr}` : 'none' }}>
                          <div style={{ width: 30, flexShrink: 0, background: darkMode ? '#16162a' : '#f9f9fe', borderRight: `1px solid ${borderClr}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 12 }}>
                            <span style={{ fontSize: 9, color: text3, fontWeight: 600 }}>p{ni + 1}</span>
                          </div>
                          <div style={{ flex: 1, padding: '10px 12px' }}>
                            <p style={{ fontSize: 12, color: text2, lineHeight: 1.7, margin: 0 }}>{note}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* ── PDF Preview Modal ── */}
              {pdfPreviewOpen && (() => {
                const page = PDF_PAGES[pdfCurrentPage]
                const total = PDF_PAGES.length
                return (
                  <div style={{
                    position: 'absolute', inset: 0, zIndex: 500,
                    background: '#3a3a3a',
                    display: 'flex', flexDirection: 'column',
                  }}>
                    {/* Modal header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#2a2a2a', flexShrink: 0 }}>
                      <button onClick={() => setPdfPreviewOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.8)', display: 'flex', padding: 4 }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15,18 9,12 15,6"/></svg>
                      </button>
                      <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>PDF Preview</span>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.08)', padding: '3px 10px', borderRadius: 50 }}>
                        {pdfCurrentPage + 1} / {total}
                      </span>
                    </div>

                    {/* Page content */}
                    <div className="scroll" style={{ flex: 1, overflowY: 'auto', padding: '16px 14px' }}>
                      <div style={{
                        background: 'white', borderRadius: 4,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                        overflow: 'hidden', minHeight: 480,
                      }}>
                        {/* PDF page header band */}
                        <div style={{ background: '#1a1a2e', padding: '14px 18px 12px' }}>
                          <div style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>NPrep · Heart Anatomy Overview</div>
                          <div style={{ fontSize: 16, fontWeight: 800, color: 'white', lineHeight: 1.35 }}>{page.title}</div>
                        </div>
                        {/* Page body */}
                        <div style={{ padding: '18px 18px 24px' }}>
                          <div style={{ fontSize: 10, fontWeight: 800, color: PDF_RED, letterSpacing: '0.1em', marginBottom: 10 }}>{page.heading}</div>
                          <p style={{ fontSize: 13, color: '#333', lineHeight: 1.75, margin: '0 0 16px' }}>{page.body}</p>
                          {/* Bullet list block */}
                          <div style={{ borderLeft: `3px solid ${PDF_RED}`, paddingLeft: 14, marginBottom: 16 }}>
                            {page.bullets.map((b, bi) => (
                              <div key={bi} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                                <svg width="10" height="10" viewBox="0 0 10 10" style={{ flexShrink: 0, marginTop: 4 }}>
                                  <polygon points="0,0 10,5 0,10" fill={PDF_RED}/>
                                </svg>
                                <span style={{ fontSize: 12, color: '#222', lineHeight: 1.6 }}>{b}</span>
                              </div>
                            ))}
                          </div>
                          {/* Note callout */}
                          <div style={{ background: '#FFF8E1', border: '1px solid #FFD54F', borderRadius: 8, padding: '10px 14px' }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: '#F57F17', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Study Note</div>
                            <p style={{ fontSize: 12, color: '#5D4037', lineHeight: 1.65, margin: 0 }}>{page.note}</p>
                          </div>
                        </div>
                        {/* Page footer */}
                        <div style={{ padding: '8px 18px', background: '#f5f5f5', borderTop: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 10, color: '#999' }}>NPrep Nursing · Heart Anatomy Overview</span>
                          <span style={{ fontSize: 10, color: '#999' }}>{pdfCurrentPage + 1}</span>
                        </div>
                      </div>
                    </div>

                    {/* Navigation bar */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', background: '#2a2a2a', flexShrink: 0 }}>
                      <button
                        onClick={() => setPdfCurrentPage(p => Math.max(0, p - 1))}
                        disabled={pdfCurrentPage === 0}
                        style={{ width: 40, height: 40, borderRadius: '50%', background: pdfCurrentPage === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.12)', border: 'none', cursor: pdfCurrentPage === 0 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: pdfCurrentPage === 0 ? 'rgba(255,255,255,0.2)' : 'white' }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15,18 9,12 15,6"/></svg>
                      </button>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {PDF_PAGES.map((_, pi) => (
                          <button key={pi} onClick={() => setPdfCurrentPage(pi)}
                            style={{ width: pi === pdfCurrentPage ? 20 : 6, height: 6, borderRadius: 3, background: pi === pdfCurrentPage ? PDF_RED : 'rgba(255,255,255,0.25)', border: 'none', cursor: 'pointer', transition: 'width 0.2s', padding: 0 }}
                          />
                        ))}
                      </div>
                      <button
                        onClick={() => setPdfCurrentPage(p => Math.min(total - 1, p + 1))}
                        disabled={pdfCurrentPage === total - 1}
                        style={{ width: 40, height: 40, borderRadius: '50%', background: pdfCurrentPage === total - 1 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.12)', border: 'none', cursor: pdfCurrentPage === total - 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: pdfCurrentPage === total - 1 ? 'rgba(255,255,255,0.2)' : 'white' }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="9,18 15,12 9,6"/></svg>
                      </button>
                    </div>
                  </div>
                )
              })()}
              </>
            )
          })()}

          {activeTab === 'selfnotes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

              {/* Hidden file input */}
              <input ref={captureInputRef} type="file" accept="image/*" capture="environment" onChange={handleCapturePhoto} style={{ display: 'none' }} />

              {/* Typed notes */}
              <textarea
                value={selfNotes} onChange={e => handleSelfNotesChange(e.target.value)}
                placeholder="Type your notes here…"
                style={{ width: '100%', minHeight: 110, padding: '12px 14px', border: `1px solid ${borderClr}`, borderRadius: 12, fontSize: 13, color: text1, background: cardBg, resize: 'none', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
              />

              {/* Captured photo preview */}
              {capturedPhoto && (
                <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: `1px solid ${borderClr}` }}>
                  <img src={capturedPhoto} alt="Handwritten notes" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', display: 'block' }} />
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '8px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 100%)' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'white' }}>📷 Handwritten notes</span>
                    <button
                      onClick={() => { setCapturedPhoto(null); setNotesSaved(false) }}
                      style={{ background: 'rgba(0,0,0,0.4)', border: 'none', borderRadius: '50%', width: 22, height: 22, color: 'white', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
                    >×</button>
                  </div>
                  <button
                    onClick={() => captureInputRef.current?.click()}
                    style={{ position: 'absolute', bottom: 8, right: 8, padding: '5px 10px', borderRadius: 50, background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', fontSize: 10, fontWeight: 600, cursor: 'pointer' }}
                  >
                    Retake
                  </button>
                </div>
              )}

              {/* Voice note preview */}
              {recordedVoice && !isRecording && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, border: `1px solid ${borderClr}`, background: cardBg }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: PL, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={P}><polygon points="5,3 19,12 5,21"/></svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: text1 }}>Voice note</div>
                    <div style={{ fontSize: 11, color: text3 }}>{recordedVoice.duration}</div>
                  </div>
                  <button
                    onClick={() => { setRecordedVoice(null); setNotesSaved(false) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: text3, padding: 4 }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              )}

              {/* OR divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1, height: 1, background: borderClr }} />
                <span style={{ fontSize: 11, color: text3, fontWeight: 600 }}>OR</span>
                <div style={{ flex: 1, height: 1, background: borderClr }} />
              </div>

              {/* Capture & upload | Record voice */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => captureInputRef.current?.click()}
                  style={{ flex: 1, padding: '14px 8px', borderRadius: 12, border: `1.5px dashed ${capturedPhoto ? P : borderClr}`, background: capturedPhoto ? PL : 'none', color: capturedPhoto ? PD : text2, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                  <span>{capturedPhoto ? 'Change photo' : 'Capture & upload'}</span>
                </button>

                <button
                  onClick={handleVoiceToggle}
                  style={{ flex: 1, padding: '14px 8px', borderRadius: 12, border: `1.5px dashed ${isRecording ? '#DC2626' : recordedVoice ? P : borderClr}`, background: isRecording ? '#FEF2F2' : recordedVoice ? PL : 'none', color: isRecording ? '#DC2626' : recordedVoice ? PD : text2, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, position: 'relative', overflow: 'hidden' }}
                >
                  {isRecording ? (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#DC2626', animation: 'pulse 1s infinite' }} />
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="1.8" strokeLinecap="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                      </div>
                      <span>{fmtRecording(recordingSeconds)} · Tap to stop</span>
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                      <span>{recordedVoice ? 'Re-record' : 'Record voice'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Save notes — always at bottom, covers all three input types */}
              <button
                onClick={handleSaveNotes}
                disabled={!hasAnyNotes}
                style={{
                  width: '100%', padding: '12px', borderRadius: 50,
                  background: notesSaved ? GREENBG : hasAnyNotes ? P : borderClr,
                  border: `1.5px solid ${notesSaved ? GREENBORDER : hasAnyNotes ? P : borderClr}`,
                  color: notesSaved ? GREEN : hasAnyNotes ? 'white' : text3,
                  fontSize: 13, fontWeight: 600,
                  cursor: hasAnyNotes ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  transition: 'all 0.2s',
                }}
              >
                {notesSaved ? (
                  <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.5" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg> Notes saved</>
                ) : 'Save notes'}
              </button>

            </div>
          )}

          {activeTab === 'practice' && videoId === 'v02' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '28px 8px 12px', textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: 18, background: '#FFF0E6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C05C0D" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: text1, marginBottom: 6 }}>Practice questions coming soon</div>
                <div style={{ fontSize: 12, color: text2, lineHeight: 1.65, maxWidth: 240, margin: '0 auto' }}>
                  We're writing quiz questions for this video. They'll be ready very soon.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'practice' && videoId !== 'v02' && !isReturningUser && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '36px 0', textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 14 }}>📝</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: text1, marginBottom: 8 }}>Test yourself</div>
              <div style={{ fontSize: 13, color: text2, lineHeight: 1.6, marginBottom: 24, maxWidth: 240 }}>
                {QUIZ_QUESTIONS.length} questions on this video — see how much you've absorbed.
              </div>
              <button
                onClick={() => { setQuizQIndex(0); setQuizAnswers({}); setQuizPhase('questions'); setPhase('quiz') }}
                className="btn-primary" style={{ padding: '12px 32px' }}
              >
                Start Practice
              </button>
            </div>
          )}

          {activeTab === 'practice' && videoId !== 'v02' && isReturningUser && (
            <div>
              {/* Previous attempt summary */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, background: '#FFF8F0', border: '1.5px solid #F0C080', marginBottom: 14 }}>
                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#C05C0D' }}>{MOCK_PREV_SCORE}/{QUIZ_QUESTIONS.length}</div>
                  <div style={{ fontSize: 9, color: '#C05C0D', fontWeight: 600 }}>LAST SCORE</div>
                </div>
                <div style={{ width: 1, height: 32, background: '#F0C080' }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#633806' }}>Previous attempt</div>
                  <div style={{ fontSize: 11, color: '#C05C0D', marginTop: 1 }}>{MOCK_PREV_DATE} · {QUIZ_QUESTIONS.length} questions</div>
                </div>
                <button
                  onClick={() => { setQuizQIndex(0); setQuizAnswers({}); setQuizPhase('questions'); setPhase('quiz') }}
                  style={{ marginLeft: 'auto', padding: '7px 14px', borderRadius: 50, background: '#C05C0D', border: 'none', color: 'white', fontSize: 11, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}
                >
                  Retake
                </button>
              </div>

              {/* Question review accordion */}
              <div style={{ fontSize: 11, fontWeight: 700, color: text3, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Review last attempt</div>
              {QUIZ_QUESTIONS.map((q, i) => {
                const correct = MOCK_PREV_ANSWERS[i] === q.correct
                const isOpen = expandedPractice === i
                const accentColor = correct ? '#3B6D11' : '#791F1F'
                const accentBg = correct ? '#EAF3DE' : '#FCEBEB'
                const accentBorder = correct ? '#97C459' : '#F09595'
                const accentBorderLight = correct ? '#c7e8a0' : '#f8bfbf'
                return (
                  <div key={i} style={{ marginBottom: 8, borderRadius: 12, overflow: 'hidden', border: `1px solid ${accentBorder}` }}>
                    <button
                      onClick={() => setExpandedPractice(isOpen ? null : i)}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', background: accentBg, border: 'none', cursor: 'pointer', textAlign: 'left' }}
                    >
                      <span style={{ fontSize: 12, color: accentColor, flex: 1, lineHeight: 1.4, fontWeight: 500 }}>Q{i + 1}: {q.text}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: accentColor, flexShrink: 0 }}>{correct ? '✓' : '✗'}</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                        <polyline points="6,9 12,15 18,9"/>
                      </svg>
                    </button>
                    {isOpen && (
                      <div style={{ background: 'white', padding: '12px 14px 14px', borderTop: `1px solid ${accentBorderLight}` }}>
                        {q.options.map((opt, j) => {
                          const isCorrectOpt = j === q.correct
                          const wasSelected = MOCK_PREV_ANSWERS[i] === j
                          let bg = BG2, border = borderClr, color = text2
                          if (isCorrectOpt) { bg = '#EAF3DE'; border = '#97C459'; color = '#3B6D11' }
                          else if (wasSelected) { bg = '#FCEBEB'; border = '#F09595'; color = '#791F1F' }
                          return (
                            <div key={j} style={{ marginBottom: 6 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: q.optionExplanations ? '8px 8px 0 0' : 8, background: bg, border: `1px solid ${border}`, borderBottom: q.optionExplanations ? 'none' : `1px solid ${border}` }}>
                                <span style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isCorrectOpt ? '#3B6D11' : wasSelected ? '#791F1F' : 'transparent', border: `1.5px solid ${border}`, color: (isCorrectOpt || wasSelected) ? 'white' : color }}>
                                  {['A', 'B', 'C', 'D'][j]}
                                </span>
                                <span style={{ fontSize: 12, color, fontWeight: isCorrectOpt || wasSelected ? 600 : 400, flex: 1 }}>{opt}</span>
                                {isCorrectOpt && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3B6D11" strokeWidth="2.5" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>}
                                {wasSelected && !isCorrectOpt && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#791F1F" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
                              </div>
                              {q.optionExplanations?.[j] && (
                                <div style={{ padding: '7px 12px 9px', fontSize: 11, lineHeight: 1.6, borderRadius: '0 0 8px 8px', border: `1px solid ${border}`, borderTop: `1px dashed ${border}`, background: isCorrectOpt ? '#f2fae8' : wasSelected ? '#fff5f5' : '#fafafa', color: isCorrectOpt ? '#3B6D11' : wasSelected ? '#791F1F' : T3 }}>
                                  {q.optionExplanations[j]}
                                </div>
                              )}
                            </div>
                          )
                        })}
                        <div style={{ marginTop: 10, padding: '10px 12px', borderRadius: 8, background: '#EAF3DE', border: '1px solid #97C459' }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#3B6D11', marginBottom: 3 }}>Key takeaway</div>
                          <div style={{ fontSize: 12, color: '#3B6D11', lineHeight: 1.6 }}>{q.explanation}</div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

        </div>
        <div style={{ height: 8 }} />
      </div>

      {/* REPORT BAR */}
      <button
        onClick={() => setShowReportModal(true)}
        style={{ flexShrink: 0, width: '100%', padding: '13px', background: GREENBG, borderTop: `1px solid ${GREENBORDER}`, borderLeft: 'none', borderRight: 'none', borderBottom: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: GREEN, textAlign: 'center', display: isFullscreen ? 'none' : 'block' }}
      >
        Having an issue? Tap to report
      </button>

      {/* ── DOWNLOAD QUALITY SHEET ── */}
      {showDownloadQualitySheet && (
        <div
          onClick={() => setShowDownloadQualitySheet(false)}
          style={{ position: 'absolute', inset: 0, background: 'rgba(10,10,30,0.55)', zIndex: 300, display: 'flex', alignItems: 'flex-end' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: 'white', borderRadius: '20px 20px 0 0', padding: '20px 20px 32px', width: '100%' }}
          >
            <div style={{ width: 36, height: 4, borderRadius: 2, background: BD, margin: '0 auto 18px' }} />
            <div style={{ fontSize: 16, fontWeight: 800, color: T1, marginBottom: 3 }}>Download Quality</div>
            <div style={{ fontSize: 12, color: T2, marginBottom: 18 }}>Choose the video quality for offline viewing</div>

            {DOWNLOAD_QUALITIES.map(q => {
              const sel = downloadQuality === q.id
              return (
                <button
                  key={q.id}
                  onClick={() => setDownloadQuality(q.id)}
                  style={{
                    width: '100%', textAlign: 'left', cursor: 'pointer', marginBottom: 10,
                    border: `1.5px solid ${sel ? P : BD}`,
                    background: sel ? PL : 'white',
                    borderRadius: 12, padding: '12px 14px',
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}
                >
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                    border: `2px solid ${sel ? P : '#c0c0d8'}`,
                    background: sel ? P : 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {sel && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: sel ? P : T1 }}>{q.label}</span>
                      {q.badge && (
                        <span style={{ fontSize: 10, fontWeight: 600, color: '#1B7F4F', background: '#E6F7EF', border: '1px solid #5EB88A', borderRadius: 20, padding: '1px 8px' }}>
                          {q.badge}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: T3 }}>{q.desc}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: T2, flexShrink: 0 }}>{q.size}</span>
                </button>
              )
            })}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0 18px', borderTop: `1px solid ${BD}`, marginTop: 4 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: T1 }}>Save as default quality</div>
                <div style={{ fontSize: 11, color: T3, marginTop: 2 }}>Use this setting for future downloads</div>
              </div>
              <Toggle value={saveQualitySetting} onChange={setSaveQualitySetting} />
            </div>

            <button
              onClick={() => {
                setShowDownloadQualitySheet(false)
                setShowDownloadToast(true)
                clearTimeout(downloadToastTimerRef.current)
                downloadToastTimerRef.current = setTimeout(() => setShowDownloadToast(false), 3000)
              }}
              className="btn-primary"
              style={{ width: '100%', padding: 14, fontSize: 14, fontWeight: 700 }}
            >
              Download · {DOWNLOAD_QUALITIES.find(q => q.id === downloadQuality)?.label} quality
            </button>
          </div>
        </div>
      )}

      {/* ── DOUBT POPUP ── */}
      {showDoubtPopup && (
        <div onClick={() => setShowDoubtPopup(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(10,10,30,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '0 20px' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 18, padding: '22px 18px', width: '100%', maxWidth: 340 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: T1, marginBottom: 8, textAlign: 'center', lineHeight: 1.4 }}>
              Did you not understand this part of the video?
            </div>
            <div style={{ fontSize: 13, color: T2, marginBottom: 20, textAlign: 'center', lineHeight: 1.5 }}>
              We'll note where you flagged this and review it.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowDoubtPopup(false)} style={{ flex: 1, padding: '11px', borderRadius: 10, border: `1px solid ${BD}`, background: 'white', fontSize: 13, fontWeight: 600, color: T2, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={() => { setShowDoubtPopup(false); setShowDoubtToast(true) }} className="btn-primary" style={{ flex: 1.5, fontSize: 13 }}>
                Yes, flag this
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DISLIKE FEEDBACK — Cancel does NOT apply dislike ── */}
      {showDislikeFeedback && (
        <div onClick={() => setShowDislikeFeedback(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(10,10,30,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '0 20px' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 18, padding: '22px 18px', width: '100%', maxWidth: 340 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: T1, marginBottom: 4 }}>What didn't work for you?</div>
            <div style={{ fontSize: 12, color: T3, marginBottom: 12, lineHeight: 1.5 }}>This is optional — helps us improve the content.</div>
            <textarea
              value={dislikeFeedbackText} onChange={e => setDislikeFeedbackText(e.target.value)}
              placeholder="Tell us what felt off… (optional)"
              style={{ width: '100%', minHeight: 80, padding: '10px 12px', border: `1px solid ${BD}`, borderRadius: 10, fontSize: 13, color: T1, resize: 'none', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', marginBottom: 12 }}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => { setShowDislikeFeedback(false); setDislikeFeedbackText('') }}
                style={{ flex: 1, padding: '11px', borderRadius: 10, border: `1px solid ${BD}`, background: 'white', fontSize: 13, fontWeight: 600, color: T2, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={() => { setDisliked(true); setShowDislikeFeedback(false); setDislikeFeedbackText('') }}
                className="btn-primary" style={{ flex: 1.5, fontSize: 13 }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── LIKE FEEDBACK (optional) ── */}
      {showLikeFeedback && (
        <div onClick={() => { setShowLikeFeedback(false); setLikeRating(0); setLikeComment('') }} style={{ position: 'absolute', inset: 0, background: 'rgba(10,10,30,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '0 20px' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 18, padding: '24px 18px', width: '100%', maxWidth: 340 }}>
            <div style={{ fontSize: 28, textAlign: 'center', marginBottom: 10 }}>🙌</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: T1, textAlign: 'center', marginBottom: 6, lineHeight: 1.4 }}>
              Glad this one clicked for you!
            </div>
            <div style={{ fontSize: 13, color: T2, textAlign: 'center', marginBottom: 18, lineHeight: 1.6 }}>
              Want to tell us what made it good? Helps us make more videos like this. (Bilkul optional hai.)
            </div>

            {/* Star rating */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 16 }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star} onClick={() => setLikeRating(star)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 28, lineHeight: 1, color: star <= likeRating ? '#F4C430' : BD, transition: 'color 0.15s' }}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea
              value={likeComment} onChange={e => setLikeComment(e.target.value)}
              placeholder="Kya acha laga? (optional)"
              style={{ width: '100%', minHeight: 70, padding: '10px 12px', border: `1px solid ${BD}`, borderRadius: 10, fontSize: 13, color: T1, resize: 'none', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', marginBottom: 14 }}
            />

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => { setShowLikeFeedback(false); setLikeRating(0); setLikeComment('') }}
                style={{ flex: 1, padding: '11px', borderRadius: 10, border: `1px solid ${BD}`, background: 'white', fontSize: 13, fontWeight: 600, color: T2, cursor: 'pointer' }}
              >
                Skip
              </button>
              <button
                onClick={() => { console.log('like feedback', { likeRating, likeComment }); setShowLikeFeedback(false); setLikeRating(0); setLikeComment('') }}
                className="btn-primary" style={{ flex: 1.5, fontSize: 13 }}
              >
                Send feedback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TIMESTAMP SKIP WARNING ── */}
      {pendingSeek && (
        <div onClick={() => setPendingSeek(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(10,10,30,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '0 20px' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 18, padding: '22px 18px', width: '100%', maxWidth: 340 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: T1, marginBottom: 8, lineHeight: 1.4 }}>
              Skip ahead to {pendingSeek.ts}?
            </div>
            <div style={{ fontSize: 13, color: T2, marginBottom: 20, lineHeight: 1.6 }}>
              You'll jump to <span style={{ fontWeight: 600, color: T1 }}>"{pendingSeek.name}"</span>. The content in between will be skipped.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setPendingSeek(null)}
                style={{ flex: 1, padding: '11px', borderRadius: 10, border: `1px solid ${BD}`, background: 'white', fontSize: 13, fontWeight: 600, color: T2, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={() => { seekToTimestamp(pendingSeek.ts); setPendingSeek(null) }}
                className="btn-primary" style={{ flex: 1.5, fontSize: 13 }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── RESOURCE VIEWER MODAL ── */}
      {showResourceModal && (
        <div onClick={() => setShowResourceModal(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(10,10,30,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '0 20px' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 18, padding: '22px 18px', width: '100%', maxWidth: 340, textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: PL, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', color: P }}>
              {showResourceModal === 'slides'
                ? <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: T1, marginBottom: 4 }}>
              {showResourceModal === 'slides' ? 'Slides Viewer' : 'Notes PDF'}
            </div>
            <div style={{ fontSize: 13, color: T2, marginBottom: 16, lineHeight: 1.5 }}>
              {showResourceModal === 'slides' ? '24 slides · auto-captured from lecture' : 'PDF by content team · 8 pages'}
            </div>
            <div style={{ background: BG2, borderRadius: 10, padding: '28px 16px', color: T3, fontSize: 13, marginBottom: 16 }}>
              [{showResourceModal === 'slides' ? 'Slides' : 'Notes PDF'} viewer — placeholder]
            </div>
            <button onClick={() => setShowResourceModal(null)} className="btn-primary" style={{ width: '100%' }}>Done</button>
          </div>
        </div>
      )}

      {/* ── REPORT MODAL ── */}
      {showReportModal && (
        <div
          onClick={() => { setShowReportModal(false); setReportSelectedIssue(''); setReportDetailText('') }}
          style={{ position: 'absolute', inset: 0, background: 'rgba(10,10,30,0.55)', display: 'flex', alignItems: 'flex-end', zIndex: 200 }}
        >
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '20px 20px 0 0', padding: '8px 20px 32px', width: '100%', maxHeight: '85vh', overflowY: 'auto' }}>
            <div className="sheet-handle" />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '14px 0 4px' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: T1 }}>Report an issue</div>
              <button
                onClick={() => { setShowReportModal(false); setReportSelectedIssue(''); setReportDetailText('') }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: T2, padding: '4px 0' }}
              >
                Cancel
              </button>
            </div>
            <div style={{ fontSize: 13, color: T2, marginBottom: 14, lineHeight: 1.5 }}>What's the problem with this video?</div>

            {['Video not loading', 'Audio issue', 'Wrong content', 'Subtitles incorrect', 'Other'].map(opt => {
              const sel = reportSelectedIssue === opt
              return (
                <button
                  key={opt}
                  onClick={() => setReportSelectedIssue(opt)}
                  style={{
                    width: '100%', padding: '12px 14px', marginBottom: 8,
                    borderRadius: 10, border: `1.5px solid ${sel ? P : BD}`,
                    background: sel ? PL : BG2, color: sel ? P : T1,
                    fontSize: 13, fontWeight: sel ? 600 : 400,
                    textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                  }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                    border: `2px solid ${sel ? P : '#c0c0d8'}`, background: sel ? P : 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {sel && <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'white' }} />}
                  </div>
                  {opt}
                </button>
              )
            })}

            <textarea
              placeholder="Add more details... (optional)"
              value={reportDetailText}
              onChange={e => setReportDetailText(e.target.value)}
              rows={3}
              style={{
                width: '100%', marginTop: 4, marginBottom: 18, padding: '11px 14px',
                borderRadius: 10, border: `1.5px solid ${BD}`, background: BG2,
                fontSize: 13, color: T1, resize: 'none', outline: 'none',
                fontFamily: 'inherit', lineHeight: 1.5,
              }}
            />

            <button
              onClick={() => {
                setShowReportModal(false)
                setReportSelectedIssue('')
                setReportDetailText('')
                setShowReportSuccessPopup(true)
              }}
              disabled={!reportSelectedIssue}
              className="btn-primary"
              style={{ width: '100%', padding: 14, fontSize: 14, fontWeight: 700, opacity: reportSelectedIssue ? 1 : 0.45 }}
            >
              Submit report
            </button>
          </div>
        </div>
      )}

      {/* ── REPORT SUCCESS POPUP ── */}
      {showReportSuccessPopup && (
        <div
          onClick={() => setShowReportSuccessPopup(false)}
          style={{ position: 'absolute', inset: 0, background: 'rgba(10,10,30,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 250, padding: '0 28px' }}
        >
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 20, padding: '32px 24px 28px', width: '100%', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#EAF3DE', border: '2px solid #97C459', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B6D11" strokeWidth="2.5" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: T1, marginBottom: 8 }}>Issue reported</div>
            <div style={{ fontSize: 13, color: T2, lineHeight: 1.6, marginBottom: 24 }}>
              Thank you for your feedback. Our team will review it and get back to you shortly.
            </div>
            <button
              onClick={() => setShowReportSuccessPopup(false)}
              className="btn-primary"
              style={{ width: '100%', padding: 14, fontSize: 14, fontWeight: 700 }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ── SETTINGS SHEET ── */}
      {showSettings && (() => {
        const settingsContent = (
          <div style={{ padding: '14px 20px 32px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: T1 }}>Settings</span>
              <button onClick={() => setShowSettings(false)} style={{ background: 'none', border: 'none', fontSize: 22, color: T3, cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>

            <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: `1px solid ${BD}` }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: T1, marginBottom: 10 }}>Video Language</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[{ id: 'EN', label: 'English' }, { id: 'HI', label: 'Hinglish' }].map(opt => (
                  <button key={opt.id} onClick={() => setLanguage(opt.id)}
                    style={{ flex: 1, padding: '9px 4px', borderRadius: 8, border: `1.5px solid ${language === opt.id ? P : BD}`, background: language === opt.id ? PL : 'white', color: language === opt.id ? PD : T2, fontSize: 12, fontWeight: language === opt.id ? 700 : 400, cursor: 'pointer' }}>
                    {opt.label}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 10, color: T3, marginTop: 6 }}>
                {language === 'EN' ? 'Lectures play in English' : 'Lectures play in Hinglish (Hindi + English mix)'}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, borderBottom: `1px solid ${BD}`, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: T1, marginBottom: 2 }}>Captions</div>
                <div style={{ fontSize: 11, color: T3 }}>{subtitlesOn ? 'On' : 'Off'} · {language === 'EN' ? 'English' : 'Hinglish'}</div>
              </div>
              <Toggle value={subtitlesOn} onChange={setSubtitlesOn} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, borderBottom: `1px solid ${BD}`, marginBottom: 16 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: T1 }}>Dark Mode</span>
              <Toggle value={darkMode} onChange={setDarkMode} />
            </div>

            <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: `1px solid ${BD}` }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: T1, marginBottom: 10 }}>Playback Speed</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {['0.75x', '1x', '1.25x', '1.5x', '2x'].map(s => (
                  <button key={s} onClick={() => setPlaybackSpeed(s)}
                    style={{ flex: 1, padding: '8px 2px', borderRadius: 8, border: `1.5px solid ${playbackSpeed === s ? P : BD}`, background: playbackSpeed === s ? PL : 'white', color: playbackSpeed === s ? PD : T2, fontSize: 11, fontWeight: playbackSpeed === s ? 700 : 400, cursor: 'pointer' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: `1px solid ${BD}` }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: T1, marginBottom: 10 }}>Rewind / Forward</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[5, 10, 15].map(s => (
                  <button key={s} onClick={() => setSeekInterval(s)}
                    style={{ flex: 1, padding: '9px 4px', borderRadius: 8, border: `1.5px solid ${seekInterval === s ? P : BD}`, background: seekInterval === s ? PL : 'white', color: seekInterval === s ? PD : T2, fontSize: 12, fontWeight: seekInterval === s ? 700 : 400, cursor: 'pointer' }}>
                    {s}s
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: `1px solid ${BD}` }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: T1, marginBottom: 10 }}>Video Quality</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {['Auto', '480p', '720p', '1080p'].map(q => (
                  <button key={q} onClick={() => setVideoQuality(q)}
                    style={{ flex: 1, padding: '8px 2px', borderRadius: 8, border: `1.5px solid ${videoQuality === q ? P : BD}`, background: videoQuality === q ? PL : 'white', color: videoQuality === q ? PD : T2, fontSize: 11, fontWeight: videoQuality === q ? 700 : 400, cursor: 'pointer' }}>
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: T1, marginBottom: 2 }}>Autoplay next video</div>
                <div style={{ fontSize: 11, color: T3 }}>
                  {autoplay ? 'Plays next video after countdown' : 'Stays here when video ends'}
                </div>
              </div>
              <Toggle value={autoplay} onChange={setAutoplay} />
            </div>

            <button onClick={() => setShowSettings(false)} className="btn-primary" style={{ width: '100%' }}>Done</button>
          </div>
        )

        return isFullscreen ? (
          /* ── Landscape: sheet rotated -90° inside same coordinate space as video controls ── */
          <div style={{ position: 'absolute', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowSettings(false)}>
            <div style={{
              position: 'absolute',
              width: playerDims.h,
              height: playerDims.w,
              top: '50%',
              left: '50%',
              marginLeft: -(playerDims.h / 2),
              marginTop: -(playerDims.w / 2),
              transform: 'rotate(-90deg)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
            }}>
              <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '20px 20px 0 0', maxHeight: '78%', overflowY: 'auto' }}>
                <div className="sheet-handle" />
                {settingsContent}
              </div>
            </div>
          </div>
        ) : (
          /* ── Portrait: normal bottom sheet ── */
          <div className="overlay" onClick={() => setShowSettings(false)}>
            <div className="sheet" onClick={e => e.stopPropagation()} style={{ maxHeight: '75vh' }}>
              <div className="sheet-handle" />
              {settingsContent}
            </div>
          </div>
        )
      })()}
    </div>
  )
}
