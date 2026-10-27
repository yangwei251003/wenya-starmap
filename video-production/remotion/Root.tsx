import { Composition, registerRoot } from 'remotion'
import { MainVideo } from './MainVideo'

export const RemotionRoot = () => (
  <Composition
    id="WenyaStarmapLaunchFilm"
    component={MainVideo}
    durationInFrames={3600}
    fps={30}
    width={1920}
    height={1080}
  />
)

registerRoot(RemotionRoot)
