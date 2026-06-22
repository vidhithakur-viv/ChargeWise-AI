import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'

function useCounter(target, duration = 1800) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    let start = 0
    const step = target / (duration / 16)

    const timer = setInterval(() => {
      start += step
      if (start >= target) {
        setValue(target)
        clearInterval(timer)
      } else {
        setValue(Math.floor(start))
      }
    }, 16)

    return () => clearInterval(timer)
  }, [target, duration])

  return value
}

function ShaderCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const sync = () => {
      canvas.width = canvas.clientWidth || 1280
      canvas.height = canvas.clientHeight || 720
    }

    const ro = new ResizeObserver(sync)
    ro.observe(canvas)
    sync()

    const gl = canvas.getContext('webgl')
    if (!gl) return

    const vs = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        v_uv = a_position * .5 + .5;
        gl_Position = vec4(a_position, 0., 1.);
      }
    `

    const fs = `
      precision highp float;
      varying vec2 v_uv;
      uniform float u_time;
      uniform vec2 u_res;

      void main() {
        vec2 uv = v_uv;
        vec3 c1 = vec3(0., 1., .53);
        vec3 c2 = vec3(0., .9, 1.);
        vec3 bg = vec3(.02, .02, .02);

        float sp = u_time * .2;
        float rays =
          abs(1. / (uv.y - .5 + .2 * sin(uv.x * 5. + sp))) * .01 +
          abs(1. / (uv.y - .3 + .15 * cos(uv.x * 4. - sp))) * .008;

        vec3 mesh = mix(c1, c2, .5 + .5 * sin(uv.x * 2. + u_time * .5));
        float fa = smoothstep(0., 1., rays);
        vec3 fc = mix(bg, mesh, fa * .3) + rays * c2 * .5;

        vec2 grid = fract(uv * 20.);
        fc += smoothstep(.02, .0, grid.x) * 0.02 + smoothstep(.02, .0, grid.y) * .02;

        gl_FragColor = vec4(fc, 1.);
      }
    `

    const mkShader = (type, src) => {
      const s = gl.createShader(type)
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return s
    }

    const prog = gl.createProgram()
    gl.attachShader(prog, mkShader(gl.VERTEX_SHADER, vs))
    gl.attachShader(prog, mkShader(gl.FRAGMENT_SHADER, fs))
    gl.linkProgram(prog)
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    )

    const pos = gl.getAttribLocation(prog, 'a_position')
    gl.enableVertexAttribArray(pos)
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0)

    const uTime = gl.getUniformLocation(prog, 'u_time')
    const uRes = gl.getUniformLocation(prog, 'u_res')

    let raf

    const render = (t) => {
      sync()
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform1f(uTime, t * 0.001)
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      raf = requestAnimationFrame(render)
    }

    raf = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60" />
}

const features = [
  {
    icon: 'map',
    title: 'Interactive Heatmap',
    desc: 'Visualize real-time EV concentration and grid capacity with sub-meter precision.',
    to: '/heatmap',
    span: 'md:col-span-8',
    hasMap: true,
  },
  {
    icon: 'waves',
    title: 'Desert Detection',
    desc: "AI identifies 'Charging Deserts'—high-demand zones with zero existing infrastructure.",
    to: '/heatmap',
    action: 'ANALYZE GAPS',
    span: 'md:col-span-4',
  },
  {
    icon: 'payments',
    title: 'ROI Calculator',
    desc: 'Project 5-year yields based on local power tariffs and traffic seasonality.',
    to: '/roi',
    hasChart: true,
    span: 'md:col-span-4',
  },
  {
    icon: 'psychology',
    title: 'AI Copilot',
    desc: 'Natural language queries for complex urban planning data.',
    to: '/copilot',
    hasChat: true,
    span: 'md:col-span-4',
  },
  {
    icon: 'stars',
    title: 'Recommendations',
    desc: 'Proprietary scoring system for every parcel of land in our database.',
    to: '/dashboard',
    span: 'md:col-span-4',
  },
]

export default function Landing() {
  const navigate = useNavigate()

  const c1 = useCounter(18083)
  const c2 = useCounter(45)
  const c3 = useCounter(41)
  const c4 = useCounter(15)

  return (
    <div className="bg-[#050505] min-h-screen text-on-surface">
      <Navbar />

      <header className="relative w-full h-screen flex items-center overflow-hidden">
        <ShaderCanvas />

        <div className="max-w-7xl mx-auto px-6 w-full relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container/10 border border-primary-container/20 text-primary-container text-xs font-label-caps mb-6">
              <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
              Analyzing 18,083 Demand Points
            </div>

            <h1 className="font-display-lg text-display-lg text-white mb-6 leading-tight font-bold">
              Powering The Future Of{' '}
              <span className="text-primary-container">EV Infrastructure</span>
            </h1>

            <p className="font-body-lg text-body-lg text-on-surface-variant mb-10">
              The intelligence layer for EV infrastructure. Analyze demand, predict utilization,
              and unlock the highest-value charging locations before your competitors do.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/heatmap">
                <button className="bg-primary-container text-on-primary font-bold px-8 py-4 rounded-lg flex items-center gap-2 neon-glow-btn transition-all transform active:scale-95">
                  Explore Heatmap
                  <span className="material-symbols-outlined">map</span>
                </button>
              </Link>

              <Link to="/dashboard">
                <button className="bg-transparent border border-white/20 text-white font-bold px-8 py-4 rounded-lg flex items-center gap-2 hover:bg-white/5 transition-all">
                  View Dashboard
                  <span className="material-symbols-outlined">dashboard</span>
                </button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="hidden lg:flex justify-center relative"
          >
            <div
              className="relative w-[480px] h-[480px]"
              style={{ animation: 'float 6s ease-in-out infinite' }}
            >
              <div
                className="absolute inset-0 rounded-full border border-primary-container/20 border-dashed"
                style={{ animation: 'spin 20s linear infinite' }}
              ></div>

              <div
                className="absolute inset-10 rounded-full border border-primary-container/10 border-dashed"
                style={{ animation: 'spin 15s linear infinite reverse' }}
              ></div>

              <div className="glass-card absolute inset-20 rounded-3xl flex items-center justify-center overflow-hidden shimmer-border">
                <div className="w-full h-full bg-gradient-to-br from-primary-container/20 via-surface-container to-secondary-container/10 flex items-center justify-center">
                  <div className="text-center">
                    <span
                      className="material-symbols-outlined text-primary-container text-8xl mb-4 block"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      electric_bolt
                    </span>
                    <div className="text-primary-container font-bold text-2xl font-label-caps tracking-widest">
                      BENGALURU
                    </div>
                    <div className="text-on-surface-variant text-sm mt-1">
                      Grid Intelligence Active
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute top-2 right-4 w-16 h-16 glass-card rounded-xl flex flex-col items-center justify-center neon-glow">
                <span
                  className="material-symbols-outlined text-primary-container"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  electric_bolt
                </span>
                <span className="text-[10px] font-label-caps text-on-surface-variant">
                  ACTIVE
                </span>
              </div>

              <div className="absolute bottom-10 -left-5 w-24 h-12 glass-card rounded-xl flex items-center justify-center gap-2 px-3 border-l-4 border-primary-container">
                <span className="text-primary-container font-bold font-label-caps">92%</span>
                <span className="text-[8px] text-on-surface-variant">EFFICIENCY</span>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce text-on-surface-variant">
          <span className="text-xs font-label-caps">SCROLL TO EXPLORE</span>
          <span className="material-symbols-outlined text-sm">expand_more</span>
        </div>
      </header>

      <section className="py-24 bg-surface-container-lowest border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { val: c1, label: 'Demand Signals Processed', suffix: '' },
            { val: c2, label: 'Chargers Geomapped', suffix: '' },
            { val: c3, label: 'Underserved Zones Found', suffix: '' },
            { val: c4, label: 'Investment-Ready Sites', suffix: '' },
          ].map(({ val, label, suffix, prefix }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="font-metric-xl text-metric-xl text-primary-container mb-2 font-bold">
                {prefix}
                {val}
                {suffix}
              </div>

              <div className="font-label-caps text-label-caps text-on-surface-variant">
                {label}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="font-headline-lg text-headline-lg mb-4 font-semibold">
              Ecosystem Architecture
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
              Deep-tech tools designed for energy operators, city planners, and infrastructure
              investors.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {features.map(({ icon, title, desc, to, span, action, hasChart, hasChat }) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className={`${span} glass-card rounded-2xl p-8 flex flex-col justify-between overflow-hidden relative group cursor-pointer`}
                onClick={() => navigate(to)}
              >
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="material-symbols-outlined text-primary-container bg-primary-container/10 p-3 rounded-xl">
                      {icon}
                    </span>
                    <h3 className="font-headline-md text-headline-md font-medium">{title}</h3>
                  </div>

                  <p className="text-on-surface-variant max-w-sm">{desc}</p>
                </div>

                {hasChart && (
                  <div className="h-20 w-full bg-white/5 rounded-xl mt-6 flex items-end px-3 py-2 gap-1">
                    {[12, 16, 20, 24].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t"
                        style={{
                          height: `${h * 4}px`,
                          background: `rgba(0,255,136,${0.2 + i * 0.2})`,
                        }}
                      ></div>
                    ))}
                  </div>
                )}

                {hasChat && (
                  <div className="bg-surface-container-high rounded-xl p-3 mt-4 border border-white/5">
                    <div className="text-[10px] text-primary-container font-label-caps mb-1">
                      QUERYING AGENT...
                    </div>
                    <div className="text-xs text-white italic">
                      "Analyzing grid substation load stability vs peak traffic..."
                    </div>
                  </div>
                )}

                {action && (
                  <div className="mt-8 pt-6 border-t border-white/5">
                    <button className="text-primary-container font-label-caps flex items-center gap-2 group/btn">
                      {action}
                      <span className="material-symbols-outlined group-hover/btn:translate-x-1 transition-transform">
                        arrow_forward
                      </span>
                    </button>
                  </div>
                )}

                {!action && !hasChart && !hasChat && (
                  <div className="flex gap-2 mt-4 overflow-hidden">
                    <span className="bg-primary-container/10 text-primary-container text-[10px] px-2 py-1 rounded border border-primary-container/20">
                      Site Score: 9.8
                    </span>
                    <span className="bg-white/5 text-on-surface-variant text-[10px] px-2 py-1 rounded border border-white/10">
                      Near Highway
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 bg-surface-container-lowest border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display-lg text-display-lg font-bold mb-6">
              Start Deploying <span className="text-primary-container">Smarter</span>
            </h2>

            <p className="text-on-surface-variant font-body-lg mb-10">
              Access real-time data for Bengaluru. See where the demand is. Build where it counts.
            </p>

            <div className="flex justify-center gap-4 flex-wrap">
              <Link to="/dashboard">
                <button className="bg-primary-container text-on-primary font-bold px-10 py-4 rounded-lg neon-glow-btn transition-all">
                  Open Dashboard
                </button>
              </Link>

              <Link to="/copilot">
                <button className="border border-white/20 text-white font-bold px-10 py-4 rounded-lg hover:bg-white/5 transition-all">
                  Try AI Copilot
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="bg-surface-dim border-t border-outline-variant py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <div className="font-label-caps text-label-caps text-primary mb-1">
              ChargeWise AI Infrastructure
            </div>
            <p className="text-on-surface-variant text-sm">
              © 2024 ChargeWise AI. All rights reserved.
            </p>
          </div>

          <div className="flex gap-8 text-on-surface-variant text-sm">
            <a href="#" className="hover:text-primary-container transition-colors">
              API Docs
            </a>
            <a href="#" className="hover:text-primary-container transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-primary-container transition-colors">
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
