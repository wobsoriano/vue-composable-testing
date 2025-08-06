# vue-composable-testing

Simple composable testing utility for Vue.

## Installation

```bash
npm install vue-composable-testing --save-dev
```

## Basic Usage

A simple counter composable:

```ts
import { ref } from 'vue'

export function useCounter() {
  const count = ref(0)

  function increment() {
    count.value++
  }

  return {
    count,
    increment,
  }
}
```

To test, render it using the `renderComposable` function provided by the library:

```ts
import { renderComposable } from 'vue-composable-testing'
import { useCounter } from './counter'

test('should increment count', () => {
  const { result } = renderComposable(() => useCounter())

  expect(result.count.value).toBe(0)
  result.increment()
  expect(result.count.value).toBe(1)
})
```

You can unmount the underlying component by using the unmount helper returned by `renderComposable` to trigger `onUnmounted` and related lifecycle hooks:

```ts
const { result, unmount } = renderComposable(() => useCounter())

// Unmount underlying component to trigger lifecycle hooks
unmount()
```

## Plugins

You can pass Vue plugins to the composable test environment using the `plugins` option:

```ts
import { createPinia } from 'pinia'
import { renderComposable } from 'vue-composable-testing'

function useStore() {
  const store = useMyStore()
  return {
    store,
  }
}

test('useStore with Pinia', () => {
  const pinia = createPinia()
  const { result } = renderComposable(() => useStore(), {
    plugins: [pinia],
  })

  expect(result.store).toBeDefined()
})
```

## Provide/Inject

Often, a composable needs values from context. You can use the `wrapper` option to wrap the underlying component with a Provider component:

```ts
import { defineComponent, inject, provide } from 'vue'
import { renderComposable } from 'vue-composable-testing'

function useUser() {
  const injected = inject('user')
  return {
    injected,
  }
}

test('useUser', () => {
  const { result } = renderComposable(() => useUser(), {
    wrapper: defineComponent((_, { slots }) => {
      provide('user', 'John Doe')
      // Always return a default slot to render the composable
      return () => slots.default?.()
    }),
  })

  expect(result.injected).toBe('John Doe')
})
```

## License

MIT
