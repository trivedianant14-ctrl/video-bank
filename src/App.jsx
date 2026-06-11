import { useState, useRef } from 'react'
import VideoHome from './screens/VideoHome'
import PreVideoScreen from './screens/PreVideoScreen'
import VideoPlayer from './screens/VideoPlayer'
import Saved from './screens/Saved'

const SCREEN_DEPTH = {
  home: 0,
  saved: 1,
  prevideoscreen: 1,
  videoplayer: 2,
}

// Simulated watch history for returning user
const MOCK_PROGRESS_RETURNING = {
  'cv-part1':    { secondsWatched: 720, completed: true,  lastWatched: Date.now() - 86400000 * 2 },
  'cv-part2':    { secondsWatched: 340, completed: false, lastWatched: Date.now() - 86400000 },
  'renal-part1': { secondsWatched: 0,   completed: false, lastWatched: null },
  'resp-part1':  { secondsWatched: 705, completed: true,  lastWatched: Date.now() - 86400000 * 5 },
  'neuro-part1': { secondsWatched: 0,   completed: false, lastWatched: null },
  'pharm-part1': { secondsWatched: 0,   completed: false, lastWatched: null },
}

export default function App() {
  const [screen, setScreen] = useState('home')
  const [currentSubject, setCurrentSubject] = useState(null)
  const [currentVideo, setCurrentVideo] = useState(null)
  const [savedVideos, setSavedVideos] = useState([])
  const [savedResources, setSavedResources] = useState([])
  const [isReturningUser, setIsReturningUser] = useState(false)
  const [isFreeTier, setIsFreeTier] = useState(false)
  const animDirRef = useRef('forward')

  const videoProgress = isReturningUser ? MOCK_PROGRESS_RETURNING : {}

  const goTo = (next) => {
    const currDepth = SCREEN_DEPTH[screen] ?? 0
    const nextDepth = SCREEN_DEPTH[next] ?? 0
    animDirRef.current = nextDepth >= currDepth ? 'forward' : 'backward'
    setScreen(next)
  }

  const saveVideo    = (v) => setSavedVideos(prev => prev.some(x => x.id === v.id) ? prev : [...prev, v])
  const unsaveVideo  = (id) => setSavedVideos(prev => prev.filter(v => v.id !== id))
  const saveResource = (r) => setSavedResources(prev => prev.some(x => x.id === r.id) ? prev : [...prev, r])
  const unsaveResource = (id) => setSavedResources(prev => prev.filter(r => r.id !== id))

  return (
    <div className="phone">
      <div key={screen} className={`screen-trans screen-${animDirRef.current}`}>

        {screen === 'home' && (
          <VideoHome
            navigate={goTo}
            setCurrentSubject={setCurrentSubject}
            savedVideos={savedVideos}
            isReturningUser={isReturningUser}
            setIsReturningUser={setIsReturningUser}
            isFreeTier={isFreeTier}
            setIsFreeTier={setIsFreeTier}
            videoProgress={videoProgress}
          />
        )}

        {screen === 'prevideoscreen' && (
          <PreVideoScreen
            navigate={goTo}
            currentSubject={currentSubject}
            setCurrentVideo={setCurrentVideo}
            savedVideos={savedVideos}
            isReturningUser={isReturningUser}
            isFreeTier={isFreeTier}
            videoProgress={videoProgress}
          />
        )}

        {screen === 'videoplayer' && (
          <VideoPlayer
            navigate={goTo}
            currentVideo={currentVideo}
            savedVideos={savedVideos}
            saveVideo={saveVideo}
            unsaveVideo={unsaveVideo}
            savedResources={savedResources}
            saveResource={saveResource}
            unsaveResource={unsaveResource}
            isReturningUser={isReturningUser}
          />
        )}

        {screen === 'saved' && (
          <Saved
            navigate={goTo}
            savedVideos={savedVideos}
            unsaveVideo={unsaveVideo}
            savedResources={savedResources}
            unsaveResource={unsaveResource}
          />
        )}

      </div>
    </div>
  )
}
