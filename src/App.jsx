import { useState, useRef } from 'react'
import VideoHome from './screens/VideoHome'
import PreVideoScreen from './screens/PreVideoScreen'
import VideoPlayer from './screens/VideoPlayer'
import Saved from './screens/Saved'
import Downloads from './screens/Downloads'
import { SCENARIO_NEW, SCENARIO_RETURNING_A, SCENARIO_RETURNING_B } from './data/subjects'

const SCREEN_DEPTH = {
  home: 0,
  saved: 1,
  downloads: 1,
  prevideoscreen: 1,
  videoplayer: 2,
}

const SCENARIO_MAP = {
  'new':          SCENARIO_NEW,
  'returning-a':  SCENARIO_RETURNING_A,
  'returning-b':  SCENARIO_RETURNING_B,
}

export default function App() {
  const [screen, setScreen]               = useState('home')
  const [currentSubject, setCurrentSubject] = useState(null)
  const [currentVideo, setCurrentVideo]   = useState(null)
  const [savedVideos, setSavedVideos]     = useState([])
  const [savedResources, setSavedResources] = useState([])
  const [scenario, setScenario]           = useState('new')
  const [isFreeTier, setIsFreeTier]       = useState(false)
  const animDirRef = useRef('forward')

  const isReturningUser = scenario !== 'new'
  const videoProgress   = SCENARIO_MAP[scenario] ?? {}

  const goTo = (next) => {
    const currDepth = SCREEN_DEPTH[screen] ?? 0
    const nextDepth = SCREEN_DEPTH[next]   ?? 0
    animDirRef.current = nextDepth >= currDepth ? 'forward' : 'backward'
    setScreen(next)
  }

  const saveVideo      = (v)  => setSavedVideos(prev => prev.some(x => x.id === v.id) ? prev : [...prev, v])
  const unsaveVideo    = (id) => setSavedVideos(prev => prev.filter(v => v.id !== id))
  const saveResource   = (r)  => setSavedResources(prev => prev.some(x => x.id === r.id) ? prev : [...prev, r])
  const unsaveResource = (id) => setSavedResources(prev => prev.filter(r => r.id !== id))

  return (
    <div className="phone">
      <div key={screen} className={`screen-trans screen-${animDirRef.current}`}>

        {screen === 'home' && (
          <VideoHome
            navigate={goTo}
            setCurrentSubject={setCurrentSubject}
            setCurrentVideo={setCurrentVideo}
            savedVideos={savedVideos}
            scenario={scenario}
            setScenario={setScenario}
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
            currentSubject={currentSubject}
            setCurrentVideo={setCurrentVideo}
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
            isReturningUser={isReturningUser}
          />
        )}

        {screen === 'downloads' && (
          <Downloads navigate={goTo} />
        )}

      </div>
    </div>
  )
}
