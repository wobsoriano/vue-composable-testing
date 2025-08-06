import type { Component, Plugin } from 'vue'
import { createApp, defineComponent, h } from 'vue'

type InstanceType<V> = V extends { new (...arg: any[]): infer X } ? X : never
type VM<V> = InstanceType<V> & { unmount: () => void }

export interface RenderComposableResult<T> {
  result: T
  unmount: () => void
}

export interface Options {
  wrapper?: Component
  plugins?: Plugin[]
}

export function renderComposable<T>(composable: () => T, options: Options = {}): RenderComposableResult<T> {
  let result!: T
  const Comp = defineComponent({
    setup() {
      result = composable()

      return () => null
    },
  })

  let unmount: () => void

  if (options.wrapper) {
    const Provider = defineComponent({
      setup() {
        return () => h(options.wrapper!, () => h(Comp))
      },
    })
    const { unmount: unmountFn } = mount(Provider, { plugins: options.plugins })
    unmount = unmountFn
  }
  else {
    const { unmount: unmountFn } = mount(Comp, { plugins: options.plugins })
    unmount = unmountFn
  }

  return {
    result,
    unmount,
  }
}

function mount<V extends Component>(Comp: V, options: { plugins?: Plugin[] } = {}) {
  const el = document.createElement('div')
  const app = createApp(Comp)

  if (options.plugins) {
    options.plugins.forEach((plugin) => {
      app.use(plugin)
    })
  }

  const unmount = () => app.unmount()
  const comp = app.mount(el) as any as VM<V>
  comp.unmount = unmount
  return comp
}
