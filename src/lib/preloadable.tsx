import { use, type ComponentType } from 'react'

type Tracked<T> = Promise<T> & { status?: 'pending' | 'fulfilled' | 'rejected'; value?: T; reason?: unknown }

export interface Preloadable<P extends object> {
  /** Starts the import once and returns the same promise on every call. */
  load: () => Promise<ComponentType<P>>
  /** Suspends until the import settles. Renders without suspending when `load` already finished. */
  Component: ComponentType<P>
}

/**
 * A lazy component whose import can start before render, for example on
 * hover or before a view transition. React reads `status` and `value` on the
 * tracked promise, so a preloaded component renders in the same commit as
 * the navigation that shows it.
 */
export function preloadable<P extends object>(factory: () => Promise<ComponentType<P>>): Preloadable<P> {
  let promise: Tracked<ComponentType<P>> | null = null

  const load = () => {
    if (!promise) {
      const tracked: Tracked<ComponentType<P>> = factory()
      tracked.status = 'pending'
      tracked.then(
        (value) => {
          tracked.status = 'fulfilled'
          tracked.value = value
        },
        (reason: unknown) => {
          tracked.status = 'rejected'
          tracked.reason = reason
          promise = null
        },
      )
      promise = tracked
    }
    return promise
  }

  function Component(props: P) {
    const Loaded = use(load() as Promise<ComponentType<P>>)
    return <Loaded {...props} />
  }

  return { load, Component }
}
