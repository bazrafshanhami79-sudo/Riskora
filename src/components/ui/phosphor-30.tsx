import React, { useEffect, useRef } from 'react'

/* ========= Fragment shader ========= */
const SHADER_SRC = `#version 300 es
precision highp float;

out vec4 fragColor;
in vec2 v_uv;

uniform vec3  iResolution;   // (width, height, dpr)
uniform float iTime;         // seconds
uniform int   iFrame;        // frame counter
uniform vec4  iMouse;        // (x, y, L, R)

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    vec2  r  = iResolution.xy;
    float t  = iTime;
    vec3  FC = vec3(fragCoord, t);
    vec4  o  = vec4(0.0);

    float s = 0.0;
    for (float i = 0.0, z = 0.0, d = 0.0; i++ < 8e1; o += (cos(s + vec4(0.0, 1.0, 8.0, 0.0)) + 1.0) / d)
    {
        vec3 p = z * normalize(FC.rgb * 2.0 - r.xyy);
        vec3 a = normalize(cos(vec3(5.0, 0.0, 1.0) + t - d * 4.0));
        p.z += 5.0;

        a = a * dot(a, p) - cross(a, p);
        for (d = 1.0; d++ < 9.0; )
            a -= sin(a * d + t).zxy / d;

        z += d = 0.1 * abs(length(p) - 3.0) + 0.07 * abs(cos(s = a.y));
    }
    o = tanh(o / 5e3);

    fragColor = vec4(o.rgb, 1.0);
}

void main(){
  mainImage(fragColor, gl_FragCoord.xy);
}
`

/* ========= Vertex shader: fullscreen triangle ========= */
const VERT_SRC = `#version 300 es
precision highp float;
layout(location=0) in vec2 a_pos;
out vec2 v_uv;
void main(){
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`

/* ========= Helpers (no throw) ========= */
function safeCompile(gl: WebGL2RenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!
  gl.shaderSource(sh, src)
  gl.compileShader(sh)
  const ok = gl.getShaderParameter(sh, gl.COMPILE_STATUS)
  const log = gl.getShaderInfoLog(sh) || ''
  return { shader: ok ? sh : null, log }
}

function safeLink(gl: WebGL2RenderingContext, vs: WebGLShader, fs: WebGLShader) {
  const prog = gl.createProgram()!
  gl.attachShader(prog, vs)
  gl.attachShader(prog, fs)
  gl.linkProgram(prog)
  const ok = gl.getProgramParameter(prog, gl.LINK_STATUS)
  const log = gl.getProgramInfoLog(prog) || ''
  return { program: ok ? prog : null, log }
}

function drawError(gl: WebGL2RenderingContext, msg: string) {
  console.error(msg)
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  gl.clearColor(0, 0, 0, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)
}

export interface ShaderCanvasProps {
  fragSource?: string
  /** Render scale. Clamped to 1–2. Lower is cheaper; 1 is plenty for a backdrop. */
  pixelRatio?: number
  /** Pause externally (e.g. while a heavy interaction is in flight). */
  paused?: boolean
  className?: string
  style?: React.CSSProperties
}

/**
 * WebGL2 shader canvas, sized to its parent.
 *
 * Beyond the original: the loop stops whenever the canvas is off-screen or the
 * tab is hidden, and `prefers-reduced-motion` renders a single static frame
 * instead of animating. A raymarching loop this heavy should not run when
 * nobody is looking at it.
 */
export function ShaderCanvas({
  fragSource = SHADER_SRC,
  pixelRatio,
  paused = false,
  className,
  style,
}: ShaderCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number>(0)
  const frameRef = useRef<number>(0)
  const mouseRef = useRef({ x: 0, y: 0, l: 0, r: 0 })
  const pausedRef = useRef(paused)

  useEffect(() => {
    pausedRef.current = paused
  }, [paused])

  useEffect(() => {
    const canvas = canvasRef.current!
    const gl = canvas.getContext('webgl2', { premultipliedAlpha: false, antialias: false })
    if (!gl) {
      console.warn('phosphor-30: WebGL2 unavailable; leaving the backdrop blank.')
      return
    }

    let disposed = false
    let vao: WebGLVertexArrayObject | null = null
    let vbo: WebGLBuffer | null = null
    let program: WebGLProgram | null = null
    let ro: ResizeObserver | null = null
    let io: IntersectionObserver | null = null
    let resizeScheduled = false
    let mouseBound = false
    let ctxBound = false

    // Animation gating: on-screen AND tab visible AND not externally paused.
    let onScreen = true
    let pauseStartedAt = 0

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    let reduceMotion = motionQuery.matches

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      mouseRef.current.x = Math.max(0, Math.min(x, rect.width))
      mouseRef.current.y = Math.max(0, Math.min(rect.height - y, rect.height))
    }
    const onDown = (e: MouseEvent) => {
      if (e.button === 0) mouseRef.current.l = 1
      if (e.button === 2) mouseRef.current.r = 1
    }
    const onUp = (e: MouseEvent) => {
      if (e.button === 0) mouseRef.current.l = 0
      if (e.button === 2) mouseRef.current.r = 0
    }
    const onCtxMenu = (e: Event) => e.preventDefault()

    const onContextLost = (ev: Event) => {
      ev.preventDefault()
      stop()
    }
    const onContextRestored = () => {
      scheduleSize()
      startRef.current = performance.now()
      frameRef.current = 0
      start()
    }

    const getDpr = () => {
      const sys = window.devicePixelRatio || 1
      return Math.max(1, Math.min(2, pixelRatio ?? sys))
    }

    function applySize() {
      resizeScheduled = false
      if (disposed || !gl) return
      const dpr = getDpr()
      const cssW = Math.max(1, canvas.clientWidth | 0)
      const cssH = Math.max(1, canvas.clientHeight | 0)
      const w = Math.max(1, Math.floor(cssW * dpr))
      const h = Math.max(1, Math.floor(cssH * dpr))
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
        gl.viewport(0, 0, w, h)
        // A resize invalidates the single static frame, so redraw it.
        if (reduceMotion) renderOnce()
      }
    }
    function scheduleSize() {
      if (resizeScheduled) return
      resizeScheduled = true
      requestAnimationFrame(applySize)
    }

    // ----- geometry -----
    vao = gl.createVertexArray()
    vbo = gl.createBuffer()
    if (!vao || !vbo) {
      drawError(gl, 'phosphor-30: failed to create VAO/VBO')
      return cleanup
    }
    gl.bindVertexArray(vao)
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)

    // ----- shaders -----
    const { shader: vs, log: vsLog } = safeCompile(gl, gl.VERTEX_SHADER, VERT_SRC)
    if (!vs) {
      drawError(gl, `phosphor-30 vertex compile error:\n${vsLog}`)
      return cleanup
    }
    const { shader: fs, log: fsLog } = safeCompile(gl, gl.FRAGMENT_SHADER, fragSource)
    if (!fs) {
      drawError(gl, `phosphor-30 fragment compile error:\n${fsLog}`)
      gl.deleteShader(vs)
      return cleanup
    }
    const linked = safeLink(gl, vs, fs)
    gl.deleteShader(vs)
    gl.deleteShader(fs)
    if (!linked.program) {
      drawError(gl, `phosphor-30 program link error:\n${linked.log}`)
      return cleanup
    }
    program = linked.program

    // ----- uniforms -----
    const uResolution = gl.getUniformLocation(program, 'iResolution')
    const uTime = gl.getUniformLocation(program, 'iTime')
    const uFrame = gl.getUniformLocation(program, 'iFrame')
    const uMouse = gl.getUniformLocation(program, 'iMouse')

    // ----- sizing -----
    ro = new ResizeObserver(scheduleSize)
    ro.observe(canvas)
    scheduleSize()

    // ----- pause when off-screen -----
    io = new IntersectionObserver(
      (entries) => {
        onScreen = entries.some((e) => e.isIntersecting)
        if (onScreen) start()
        else stop()
      },
      { rootMargin: '64px' },
    )
    io.observe(canvas)

    const onVisibility = () => (document.hidden ? stop() : start())
    document.addEventListener('visibilitychange', onVisibility)

    const onMotionChange = () => {
      reduceMotion = motionQuery.matches
      if (reduceMotion) {
        stop()
        renderOnce()
      } else {
        start()
      }
    }
    motionQuery.addEventListener('change', onMotionChange)

    // ----- pointer -----
    canvas.addEventListener('mousemove', onMove)
    canvas.addEventListener('mousedown', onDown)
    canvas.addEventListener('mouseup', onUp)
    canvas.addEventListener('contextmenu', onCtxMenu)
    mouseBound = true

    canvas.addEventListener('webglcontextlost', onContextLost)
    canvas.addEventListener('webglcontextrestored', onContextRestored)
    ctxBound = true

    // ----- drawing -----
    function draw(t: number) {
      if (!gl || !program) return
      try {
        if (resizeScheduled) applySize()
        gl.useProgram(program)

        const dpr = getDpr()
        if (uResolution) gl.uniform3f(uResolution, canvas.width, canvas.height, dpr)
        if (uTime) gl.uniform1f(uTime, t)
        if (uFrame) gl.uniform1i(uFrame, frameRef.current)
        if (uMouse) {
          const m = mouseRef.current
          gl.uniform4f(uMouse, m.x * dpr, m.y * dpr, m.l, m.r)
        }

        gl.bindVertexArray(vao)
        gl.drawArrays(gl.TRIANGLES, 0, 3)
      } catch (err) {
        drawError(gl, (err as Error)?.message ?? String(err))
      }
    }

    /** One static frame, for reduced-motion users. */
    function renderOnce() {
      if (disposed || !gl || gl.isContextLost()) return
      frameRef.current = 1
      draw(0)
    }

    function tick(now: number) {
      if (disposed || !gl) return
      if (gl.isContextLost()) {
        rafRef.current = requestAnimationFrame(tick)
        return
      }
      frameRef.current += 1
      draw((now - startRef.current) / 1000)
      rafRef.current = requestAnimationFrame(tick)
    }

    function start() {
      if (disposed || rafRef.current !== null) return
      if (reduceMotion || pausedRef.current || !onScreen || document.hidden) return
      // Shift the clock past the pause so the animation resumes, not jumps.
      if (pauseStartedAt) {
        startRef.current += performance.now() - pauseStartedAt
        pauseStartedAt = 0
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    function stop() {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
        pauseStartedAt = performance.now()
      }
    }

    startRef.current = performance.now()
    frameRef.current = 0
    if (reduceMotion) renderOnce()
    else start()

    function cleanup() {
      disposed = true
      stop()

      if (mouseBound) {
        canvas.removeEventListener('mousemove', onMove)
        canvas.removeEventListener('mousedown', onDown)
        canvas.removeEventListener('mouseup', onUp)
        canvas.removeEventListener('contextmenu', onCtxMenu)
        mouseBound = false
      }
      if (ctxBound) {
        canvas.removeEventListener('webglcontextlost', onContextLost)
        canvas.removeEventListener('webglcontextrestored', onContextRestored)
        ctxBound = false
      }

      document.removeEventListener('visibilitychange', onVisibility)
      motionQuery.removeEventListener('change', onMotionChange)

      if (ro) {
        try {
          ro.disconnect()
        } catch {}
        ro = null
      }
      if (io) {
        try {
          io.disconnect()
        } catch {}
        io = null
      }

      if (gl) {
        if (vbo) {
          try {
            gl.deleteBuffer(vbo)
          } catch {}
          vbo = null
        }
        if (vao) {
          try {
            gl.deleteVertexArray(vao)
          } catch {}
          vao = null
        }
        if (program) {
          try {
            gl.deleteProgram(program)
          } catch {}
          program = null
        }
      }
    }

    return cleanup
  }, [fragSource, pixelRatio])

  return (
    <div className={className} style={{ position: 'absolute', inset: 0, ...style }}>
      <canvas
        ref={canvasRef}
        // Purely decorative: never announce it, never let it take focus.
        aria-hidden
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  )
}

/* ========= Default export: fullscreen, as shipped ========= */
export default function Component() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100dvh',
        background: 'black',
        overflow: 'hidden',
      }}
    >
      <ShaderCanvas />
    </div>
  )
}
