import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../components/Navbar'
import { api } from '../services/api'
import { Link } from 'react-router-dom'

const BENGALURU_CENTER = [12.9716, 77.5946]

function LeafletMap({ heatmap, deserts, recommendations, competitors, activeLayer }) {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const layerGroups = useRef({})
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    if (mapInstance.current || !mapRef.current) return

    let cancelled = false

    import('leaflet').then(L => {
      if (cancelled || !mapRef.current) return

      const Lx = L.default

      const map = Lx.map(mapRef.current, {
        center: BENGALURU_CENTER,
        zoom: 11,
        zoomControl: true,
      })

      Lx.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 18,
      }).addTo(map)

      layerGroups.current.heatmap = Lx.layerGroup().addTo(map)
      layerGroups.current.deserts = Lx.layerGroup().addTo(map)
      layerGroups.current.recs = Lx.layerGroup().addTo(map)
      layerGroups.current.competitors = Lx.layerGroup().addTo(map)

      mapInstance.current = map
      setMapReady(true)

      setTimeout(() => map.invalidateSize(), 100)
      setTimeout(() => map.invalidateSize(), 500)
      setTimeout(() => map.invalidateSize(), 1000)
    })

    return () => {
      cancelled = true

      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
        setMapReady(false)
      }
    }
  }, [])

  useEffect(() => {
    if (!mapReady || !mapInstance.current) return

    import('leaflet').then(L => {
      const Lx = L.default

      Object.values(layerGroups.current).forEach(g => g.clearLayers())

      const makeIcon = (color, size = 14) =>
        Lx.divIcon({
          className: '',
          html: `<div style="width:${size}px;height:${size}px;background:${color};border-radius:50%;border:2px solid rgba(255,255,255,0.3);box-shadow:0 0 8px ${color}"></div>`,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        })

      if (activeLayer === 'heatmap' && heatmap?.features) {
        heatmap.features.forEach(f => {
          const [lng, lat] = f.geometry.coordinates
          const score = f.properties.opportunity_score || 50
          const color = score > 80 ? '#00ff88' : score > 60 ? '#00e3fd' : '#b9cbb9'

          Lx.circleMarker([lat, lng], {
            radius: Math.max(6, score / 10),
            fillColor: color,
            color: 'transparent',
            fillOpacity: 0.7,
          })
            .bindPopup(`<div style="background:#201f1f;color:#e5e2e1;padding:8px;border-radius:8px;font-family:Inter;font-size:12px">
              <b style="color:#00ff88">${f.properties.name}</b><br/>
              Score: ${score}<br/>POIs: ${f.properties.poi_count}
            </div>`)
            .addTo(layerGroups.current.heatmap)
        })
      }

      if (activeLayer === 'deserts' && deserts?.deserts) {
        deserts.deserts.forEach(d => {
          const [lng, lat] = d.coordinates

          Lx.circleMarker([lat, lng], {
            radius: 12,
            fillColor: '#ffb4ab',
            color: '#ff6b6b',
            weight: 2,
            fillOpacity: 0.6,
          })
            .bindPopup(`<div style="background:#201f1f;color:#e5e2e1;padding:8px;border-radius:8px;font-family:Inter;font-size:12px">
              <b style="color:#ffb4ab">${d.name}</b><br/>
              Demand: ${d.demand_score}<br/>Chargers: ${d.existing_chargers}
            </div>`)
            .addTo(layerGroups.current.deserts)
        })
      }

      if (activeLayer === 'recs' && recommendations?.recommendations) {
        recommendations.recommendations.slice(0, 30).forEach(r => {
          const [lng, lat] = r.coordinates
          const icon = makeIcon('#00ff88', 16)

          Lx.marker([lat, lng], { icon })
            .bindPopup(`<div style="background:#201f1f;color:#e5e2e1;padding:8px;border-radius:8px;font-family:Inter;font-size:12px">
              <b style="color:#00ff88">#${r.rank} ${r.location}</b><br/>
              Score: ${r.score} | ROI: ${r.estimated_roi}%<br/>
              Payback: ${r.payback_months} months
            </div>`)
            .addTo(layerGroups.current.recs)
        })
      }

      if (activeLayer === 'competitors' && competitors?.competitors) {
        competitors.competitors.forEach(c => {
          const [lng, lat] = c.coordinates
          const icon = makeIcon('#00e3fd', 10)

          Lx.marker([lat, lng], { icon })
            .bindPopup(`<div style="background:#201f1f;color:#e5e2e1;padding:8px;border-radius:8px;font-family:Inter;font-size:12px">
              <b style="color:#00e3fd">${c.name}</b><br/>
              Type: ${c.type}<br/>Chargers: ${c.num_chargers}
            </div>`)
            .addTo(layerGroups.current.competitors)
        })
      }

      setTimeout(() => {
        mapInstance.current?.invalidateSize()
      }, 100)
    })
  }, [mapReady, heatmap, deserts, recommendations, competitors, activeLayer])

  return <div ref={mapRef} className="w-full h-full" />
}

const layers = [
  { id: 'heatmap', icon: 'layers', label: 'Heatmap', color: 'primary-container' },
  { id: 'deserts', icon: 'radar', label: 'Deserts', color: 'error' },
  { id: 'recs', icon: 'analytics', label: 'Best Sites', color: 'secondary-container' },
  { id: 'competitors', icon: 'store', label: 'Competitors', color: 'tertiary-container' },
]

export default function Heatmap() {
  const [heatmap, setHeatmap] = useState(null)
  const [deserts, setDeserts] = useState(null)
  const [recommendations, setRecommendations] = useState(null)
  const [competitors, setCompetitors] = useState(null)
  const [activeLayer, setActiveLayer] = useState('heatmap')
  const [loading, setLoading] = useState(true)
  const [panelOpen, setPanelOpen] = useState(true)
  const [selectedSite, setSelectedSite] = useState(null)

  useEffect(() => {
    Promise.all([
      api.getHeatmap(),
      api.getDeserts(),
      api.getRecommendations(),
      api.getCompetitors(),
    ])
      .then(([h, d, r, c]) => {
        setHeatmap(h)
        setDeserts(d)
        setRecommendations(r)
        setCompetitors(c)

        if (h?.features?.[0]) {
          const f = h.features[0]
          setSelectedSite({
            location: f.properties.name,
            score: f.properties.opportunity_score,
            isHeatmap: true,
            poi_count: f.properties.poi_count,
          })
        } else if (r?.recommendations?.[0]) {
          setSelectedSite(r.recommendations[0])
        }
      })
      .catch(error => {
        console.error('Error loading heatmap data:', error)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleLayerChange = id => {
    setActiveLayer(id)

    if (id === 'recs' && recommendations?.recommendations?.[0]) {
      setSelectedSite(recommendations.recommendations[0])
    }

    if (id === 'deserts' && deserts?.deserts?.[0]) {
      setSelectedSite({ ...deserts.deserts[0], isDesert: true })
    }

    if (id === 'heatmap' && heatmap?.features?.[0]) {
      const f = heatmap.features[0]
      setSelectedSite({
        location: f.properties.name,
        score: f.properties.opportunity_score,
        isHeatmap: true,
        poi_count: f.properties.poi_count,
      })
    }

    if (id === 'competitors' && competitors?.competitors?.[0]) {
      setSelectedSite(competitors.competitors[0])
    }
  }

  const currentItems = () => {
    if (activeLayer === 'recs') return recommendations?.recommendations?.slice(0, 8) || []
    if (activeLayer === 'deserts') return deserts?.deserts?.slice(0, 8) || []
    if (activeLayer === 'competitors') return competitors?.competitors?.slice(0, 8) || []

    return heatmap?.features?.slice(0, 8).map(f => ({
      location: f.properties.name,
      score: f.properties.opportunity_score,
      estimated_roi: null,
      ...f.properties,
    })) || []
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#050505] text-on-surface">
      <Navbar />

      <div className="flex-1 relative mt-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          {!loading && (
            <LeafletMap
              heatmap={heatmap}
              deserts={deserts}
              recommendations={recommendations}
              competitors={competitors}
              activeLayer={activeLayer}
            />
          )}

          {loading && (
            <div className="w-full h-full flex items-center justify-center bg-[#050505]">
              <div className="text-center">
                <span className="material-symbols-outlined text-primary-container text-5xl animate-pulse">
                  satellite_alt
                </span>
                <p className="text-on-surface-variant mt-4 font-label-caps">
                  LOADING MAP DATA...
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
          <div className="glass-panel p-2 rounded-xl flex flex-col gap-1">
            {layers.map(({ id, icon, label }) => (
              <button
                key={id}
                onClick={() => handleLayerChange(id)}
                title={label}
                className={`p-2 rounded-lg transition-all flex items-center gap-2 ${
                  activeLayer === id
                    ? 'bg-primary-container text-on-primary shadow-[0_0_10px_rgba(0,255,136,0.5)]'
                    : 'hover:bg-white/10 text-on-surface-variant'
                }`}
              >
                <span className="material-symbols-outlined">{icon}</span>
                <span className="text-[10px] font-label-caps hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="absolute bottom-4 left-4 z-20 glass-panel p-4 rounded-2xl w-56">
          <h4 className="font-label-caps text-label-caps text-on-surface-variant mb-3">
            MAP LEGEND
          </h4>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-primary-container neon-glow"></div>
              <span className="text-xs text-on-surface">High ROI Opportunity</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-error"></div>
              <span className="text-xs text-on-surface">Charging Desert</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-secondary-container"></div>
              <span className="text-xs text-on-surface">Competitor Node</span>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {panelOpen && (
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-4 bottom-4 right-4 w-80 z-20 flex flex-col gap-4 overflow-y-auto"
            >
              {selectedSite && (
                <div className="glass-panel rounded-3xl p-6 shimmer-border flex flex-col gap-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-primary font-label-caps text-[10px] tracking-widest uppercase">
                        {activeLayer === 'recs' ? `RANK #${selectedSite.rank}` : activeLayer.toUpperCase()}
                      </span>

                      <h2 className="font-headline-md text-headline-md font-bold mt-1 leading-tight">
                        {selectedSite.location || selectedSite.name}
                      </h2>

                      <p className="text-on-surface-variant text-xs mt-1">
                        Bengaluru, Karnataka
                      </p>
                    </div>

                    <div className="bg-primary-container/10 px-3 py-1 rounded-full border border-primary-container/30">
                      <span className="text-primary-container font-bold text-sm">
                        {selectedSite.score ?? selectedSite.demand_score ?? '—'} Score
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                      <p className="text-[10px] font-label-caps text-on-surface-variant uppercase mb-1">
                        {selectedSite.isDesert ? 'Demand' : 'Score'}
                      </p>

                      <div className="flex items-end gap-1">
                        <span className="font-metric-xl text-3xl text-primary font-bold leading-none">
                          {selectedSite.score ?? selectedSite.demand_score ?? '—'}
                        </span>
                        <span className="text-xs text-on-surface-variant pb-1">/100</span>
                      </div>
                    </div>

                    <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                      <p className="text-[10px] font-label-caps text-on-surface-variant uppercase mb-1">
                        {selectedSite.estimated_roi ? 'Est. ROI' : 'Chargers'}
                      </p>

                      <div className="flex items-end gap-1">
                        <span className="font-metric-xl text-3xl text-on-surface font-bold leading-none">
                          {selectedSite.estimated_roi
                            ? `${selectedSite.estimated_roi}%`
                            : selectedSite.existing_chargers ?? selectedSite.num_chargers ?? '—'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedSite.payback_months && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-sm text-on-surface-variant flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm">payments</span>
                          Payback
                        </span>
                        <span className="font-bold text-primary-container">
                          {selectedSite.payback_months} months
                        </span>
                      </div>

                      {selectedSite.expected_daily_sessions && (
                        <div className="flex justify-between items-center px-1">
                          <span className="text-sm text-on-surface-variant flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">
                              charging_station
                            </span>
                            Daily Sessions
                          </span>
                          <span className="font-bold text-on-surface">
                            {selectedSite.expected_daily_sessions}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="h-24 relative rounded-2xl overflow-hidden bg-[#0a0a0a] border border-white/10">
                    <div className="absolute inset-0 flex items-end px-2 gap-1 pb-3">
                      {[30, 45, 60, 85, 100, 70, 40].map((h, i) => (
                        <div
                          key={i}
                          className={`flex-1 rounded-t-sm ${i === 4 ? 'neon-glow' : ''}`}
                          style={{
                            height: `${h}%`,
                            background: `rgba(0,255,136,${0.2 + i * 0.1})`,
                          }}
                        ></div>
                      ))}
                    </div>

                    <div className="absolute top-2 left-3">
                      <span className="text-[10px] font-label-caps text-on-surface-variant">
                        WEEKLY LOAD PROJECTION
                      </span>
                    </div>
                  </div>

                  <Link to="/roi">
                    <button className="w-full bg-primary-container text-on-primary font-bold py-3 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all neon-glow">
                      Calculate ROI
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                  </Link>
                </div>
              )}

              <div className="glass-panel rounded-3xl p-4 border border-secondary-container/20">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-primary-container text-lg">
                    list
                  </span>

                  <h3 className="font-label-caps text-[11px] font-bold uppercase tracking-wider">
                    {activeLayer === 'recs'
                      ? 'Top Sites'
                      : activeLayer === 'deserts'
                        ? 'Desert Zones'
                        : activeLayer === 'competitors'
                          ? 'Competitors'
                          : 'Heatmap Zones'}
                  </h3>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {loading ? (
                    Array(4).fill(0).map((_, i) => (
                      <div key={i} className="h-10 bg-white/5 rounded-lg animate-pulse"></div>
                    ))
                  ) : (
                    currentItems().map((item, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedSite(item)}
                        className="w-full flex justify-between items-center p-3 rounded-lg hover:bg-white/5 transition-all text-left"
                      >
                        <span className="text-xs text-on-surface truncate max-w-[160px]">
                          {item.location || item.name || item.properties?.name}
                        </span>

                        <span className="text-[10px] font-label-caps text-primary-container ml-2 shrink-0">
                          {item.score ?? item.demand_score ?? item.opportunity_score ?? '—'}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setPanelOpen(v => !v)}
          className="absolute top-4 right-[336px] z-30 glass-panel p-2 rounded-lg hover:bg-white/10 transition-all"
          style={{ right: panelOpen ? '336px' : '16px' }}
        >
          <span className="material-symbols-outlined text-on-surface-variant">
            {panelOpen ? 'chevron_right' : 'chevron_left'}
          </span>
        </button>
      </div>

      <footer className="relative z-50 py-3 px-6 flex justify-between items-center bg-surface-dim border-t border-outline-variant">
        <div className="flex items-center gap-4">
          <span className="font-label-caps text-[10px] text-primary">
            CHARGEWISE AI INFRASTRUCTURE
          </span>

          <div className="h-1 w-24 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-primary-container w-2/3 animate-pulse"></div>
          </div>

          <span className="text-[10px] text-on-surface-variant">
            System Latency: 12ms
          </span>
        </div>

        <div className="flex gap-2 text-[10px] font-label-caps text-on-surface-variant">
          <span>{heatmap?.features?.length ?? 0} zones</span>
          <span>•</span>
          <span>{deserts?.deserts?.length ?? 0} deserts</span>
          <span>•</span>
          <span>{recommendations?.recommendations?.length ?? 0} recs</span>
        </div>
      </footer>
    </div>
  )
}
