/**
 * @vitest-environment jsdom
 */

import type { Plugin } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, inject, onMounted, onUnmounted, provide, ref } from 'vue'
import { renderComposable } from '..'

describe('renderComposable', () => {
  it('returns the result of passed composable', () => {
    function useTest() {
      const test = ref('value')
      return {
        test,
      }
    }
    const { result } = renderComposable(() => useTest())
    expect(result.test.value).toBe('value')
  })

  it('mounts the underlying component', () => {
    const spy = vi.fn()
    function useTest() {
      onMounted(spy)
    }
    renderComposable(() => useTest())
    expect(spy).toHaveBeenCalled()
  })

  it('unmounts the underlying component', () => {
    const spy = vi.fn()
    function useTest() {
      onUnmounted(spy)
    }
    const { unmount } = renderComposable(() => useTest())
    expect(spy).not.toHaveBeenCalled()
    unmount()
    expect(spy).toHaveBeenCalled()
  })

  it('allows to provide a wrapper', () => {
    function useTest() {
      const injected = inject('test')
      return {
        injected,
      }
    }

    const { result } = renderComposable(() => useTest(), {
      wrapper: defineComponent((_, { slots }) => {
        provide('test', 'value')
        return () => slots.default?.()
      }),
    })
    expect(result.injected).toBe('value')
  })

  it('allows to use plugins', () => {
    const plugin: Plugin = {
      install(app) {
        app.provide('count', 10)
      },
    }

    function useCounter() {
      const count = inject<number>('count')!
      return {
        count,
      }
    }

    const { result } = renderComposable(() => useCounter(), {
      plugins: [plugin],
    })
    expect(result.count).toBe(10)
  })
})
