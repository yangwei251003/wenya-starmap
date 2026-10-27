import { Audio } from '@remotion/media'
import { AbsoluteFill, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion'

const fps = 30

const seconds = (value: number) => Math.round(value * fps)

const narration = [
  { from: 1.4, src: 'remotion-audio/narration-intro.wav', volume: 0.98 },
  { from: 22.0, src: 'remotion-audio/narration-starmap.wav', volume: 0.98 },
  { from: 57.0, src: 'remotion-audio/narration-ai.wav', volume: 0.98 },
  { from: 96.2, src: 'remotion-audio/narration-stripe.wav', volume: 0.98 },
  { from: 111.0, src: 'remotion-audio/narration-outro.wav', volume: 1 },
]

const effects = [
  { from: 4.8, src: 'remotion-audio/sfx-logo-bloom.wav', volume: 0.58 },
  { from: 18.6, src: 'remotion-audio/sfx-logo-bloom.wav', volume: 0.28 },
  { from: 29.7, src: 'remotion-audio/sfx-star-hover.wav', volume: 0.32 },
  { from: 36.1, src: 'remotion-audio/sfx-star-hover.wav', volume: 0.34 },
  { from: 43.2, src: 'remotion-audio/sfx-star-click.wav', volume: 0.7 },
  { from: 48.4, src: 'remotion-audio/sfx-path-ignite.wav', volume: 0.48 },
  { from: 56.3, src: 'remotion-audio/sfx-ai-pulse.wav', volume: 0.42 },
  { from: 64.5, src: 'remotion-audio/sfx-ai-pulse.wav', volume: 0.38 },
  { from: 73.2, src: 'remotion-audio/sfx-ai-pulse.wav', volume: 0.34 },
  { from: 87.0, src: 'remotion-audio/sfx-ai-pulse.wav', volume: 0.34 },
  { from: 96.0, src: 'remotion-audio/sfx-payment-open.wav', volume: 0.42 },
  { from: 103.2, src: 'remotion-audio/sfx-payment-confirm.wav', volume: 0.58 },
  { from: 108.0, src: 'remotion-audio/sfx-payment-confirm.wav', volume: 0.38 },
  { from: 111.0, src: 'remotion-audio/sfx-outro-expanse.wav', volume: 0.64 },
]

export function MainVideo() {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const masterFade = interpolate(frame, [durationInFrames - 90, durationInFrames - 1], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  return (
    <AbsoluteFill style={{ backgroundColor: '#0B0F19' }}>
      <OffthreadVideo
        src={staticFile('remotion-video/wenya-starmap-launch-base.mp4')}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />

      <Audio
        src={staticFile('remotion-audio/ambient-space.wav')}
        loop
        loopVolumeCurveBehavior="extend"
        volume={(audioFrame) => {
          const intro = interpolate(audioFrame, [0, seconds(4)], [0, 0.18], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
          const ending = interpolate(audioFrame, [durationInFrames - seconds(6), durationInFrames], [1, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
          return intro * ending
        }}
      />

      {narration.map((track) => (
        <Sequence key={track.src} from={seconds(track.from)}>
          <Audio src={staticFile(track.src)} volume={track.volume * masterFade} />
        </Sequence>
      ))}

      {effects.map((track, index) => (
        <Sequence key={`${track.src}-${index}`} from={seconds(track.from)}>
          <Audio src={staticFile(track.src)} volume={track.volume * masterFade} />
        </Sequence>
      ))}
    </AbsoluteFill>
  )
}
