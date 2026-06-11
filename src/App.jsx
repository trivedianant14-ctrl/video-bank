import { useState, useRef } from 'react'
import VideoHome from './screens/VideoHome'
import VideoPlayer from './screens/VideoPlayer'
import Saved from './screens/Saved'

const SCREEN_DEPTH = {
  home: 0,
  saved: 1,
  videoplayer: 2,
}

export default function App() {
  const [screen, setScreen] = useState('home')
  const [currentVideo, setCurrentVideo] = useState(null)
  const [savedVideos, setSavedVideos] = useState([])
  const [savedResources, setSavedResources] = useState([])
  const animDirRef = useRef('forward')

  const goTo = (next) => {
    const currDepth = SCREEN_DEPTH[screen] ?? 0
    const nextDepth = SCREEN_DEPTH[next] ?? 0
    animDirRef.current = nextDepth >= currDepth ? 'forward' : 'backward'
    setScreen(next)
  }

  const saveVideo = (v) =>
    setSavedVideos(prev => prev.some(x => x.id === v.id) ? prev : [...prev, v])
  const unsaveVideo = (id) =>
    setSavedVideos(prev => prev.filter(v => v.id !== id))
  const saveResource = (r) =>
    setSavedResources(prev => prev.some(x => x.id === r.id) ? prev : [...prev, r])
  const unsaveResource = (id) =>
    setSavedResources(prev => prev.filter(r => r.id !== id))

  return (
    <div className="phone">
      <div key={screen} className={`screen-trans screen-${animDirRef.current}`}>
        {screen === 'home' && (
          <VideoHome
            navigate={goTo}
            setCurrentVideo={setCurrentVideo}
            savedVideos={savedVideos}
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
