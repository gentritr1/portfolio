import { lazy, Suspense } from 'react'
import { MotionConfig } from 'motion/react'
import type { MonitorKind } from '../../content/projects'

const demonstrations = {
  care: lazy(() => import('../../worlds/healthcare/Recreation').then((module) => ({ default: module.Recreation }))),
  'live-room': lazy(() => import('../../worlds/streaming/Recreation').then((module) => ({ default: module.Recreation }))),
  reader: lazy(() => import('../../worlds/reading/Recreation').then((module) => ({ default: module.Recreation }))),
  wallet: lazy(() => import('../../worlds/web3/Recreation').then((module) => ({ default: module.Recreation }))),
  'design-system': lazy(() => import('../../worlds/design-system/Recreation').then((module) => ({ default: module.Recreation }))),
}

export default function GuidedRecreation({ kind, step, playing, reduced }: {
  kind: Exclude<MonitorKind, 'gallery'>
  step: number
  playing: boolean
  reduced: boolean
}) {
  const Recreation = demonstrations[kind]
  return (
    <MotionConfig reducedMotion={reduced ? 'always' : 'user'} transition={{ duration: playing ? 0.24 : 0 }}>
      <Suspense fallback={null}>
        <Recreation demoStep={step} demoPlaying={playing} />
      </Suspense>
    </MotionConfig>
  )
}
