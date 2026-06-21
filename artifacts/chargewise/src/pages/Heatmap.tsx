import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { api } from '../services/api'

const BENGALURU_CENTER: [number, number] = [12.9716, 77.5946]

function LeafletMap({ heatmap, deserts, recommendations, competitors, activeLayer }: any) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)
  const layerGroups = useRef<any>({})

  useEffect(() => {
    if (mapInstance.current) return
    import('leaflet').then(L => {
      const map = L.default.map(mapRef.current!, { center: BENGALURU_CENTER, zoom: 11, zoomControl: true })
      L.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap', maxZoom: 18 }).addTo(map)
      mapInstance.current = map
    })
    return () => {
      if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null }
    }
  }, [])

  useEffect(() => {
    if (!mapInstance.current) return
    import('leaflet').then(L => {
      const Lx = L.default
      Object.values(layerGroups.current).forEach((g: any) => g.clearLayers())
      if (!layerGroups.current.heatmap) {
        layerGroups.current.heatmap = Lx.layerGroup().addTo(mapInstance.current)
        layerGroups.current.deserts = Lx.layerGroup().addTo(mapInstance.current)
        layerGroups.current.recs = Lx.layerGroup().addTo(mapInstance.current)
        layerGroups.current.competitors = Lx.layerGroup().addTo(mapInstance.current)
      }
      const makeIcon = (color: string, size = 14) => Lx.divIcon({
        className: '',
        html: `<div style="width:${size}px;height:${size}px;background:${color};border-radius:50%;border:2px solid rgba(255,255,255,0.3);box-shadow:0 0 8px ${color}"></div>`,
        iconSize: [size, size], iconAnchor: [size/2, size/2],
      })
      if (activeLayer === 'heatmap' && heatmap?.features) {
        heatmap.features.forEach((f: any) => {
          const [lng, lat] = f.geometry.coordinates
          const score = f.properties.opportunity_score || 50
          const color = score > 80 ? '#00ff88' : score > 60 ? '#00e3fd' : '#b9cbb9'
          Lx.circleMarker([lat, lng], { radius: Math.max(6, score/10), fillColor: color, color: 'transparent', fillOpacity: 0.7 })
            .bindPopup(`<div style="background:#201f1f;color:#e5e2e1;padding:8px;border-radius:8px;font-family:Inter;font-size:12px"><b style="color:#00ff88">${f.properties.name}</b><br/>Score: ${score}<br/>POIs: ${f.properties.poi_count}</div>`)
            .addTo(layerGroups.current.heatmap)
        })
      }
      if (activeLayer === 'deserts' && deserts?.deserts) {
        deserts.deserts.forEach((d: any) => {
          const [lat, lng] = d.coordinates
          Lx.circleMarker([lat, lng], { radius: 12, fillColor: '#ffb4ab', color: '#ff6b6b', weight: 2, fillOpacity: 0.6 })
            .bindPopup(`<div style="background:#201f1f;color:#e5e2e1;padding:8px;border-radius:8px;font-family:Inter;font-size:12px"><b style="color:#ffb4ab">${d.name}</b><br/>Demand: ${d.demand_score}<br/>Chargers: ${d.existing_chargers}</div>`)
            .addTo(layerGroups.current.deserts)
        })
      }
      if (activeLayer === 'recs' && recommendations?.recommendations) {
        recommendations.recommendations.slice(0, 30).forEach((r: any) => {
          const [lat, lng] = r.coordinates
          Lx.marker([lat, lng], { icon: makeIcon('#00ff88', 16) })
            .bindPopup(`<div style="background:#201f1f;color:#e5e2e1;padding:8px;border-radius:8px;font-family:Inter;font-size:12px"><b style="color:#00ff88">#${r.rank} ${r.location}</b><br/>Score: ${r.score} | ROI: ${r.estimated_roi}%<br/>Payback: ${r.payback_months} months</div>`)
            .addTo(layerGroups.current.recs)
        })
      }
      if (activeLayer === 'competitors' && competitors?.competitors) {
        competitors.competitors.forEach((c: any) => {
          const [lat, lng] = c.coordinates
          Lx.marker([lat, lng], { icon: makeIcon('#00e3fd', 10) })
            .bindPopup(`<div style="background:#201f1f;color:#e5e2e1;padding:8px;border-radius:8px;font-family:Inter;font-size:12px"><b style="color:#00e3fd">${c.name}</b><br/>Type: ${c.type}<br/>Chargers: ${c.num_chargers}</div>`)
            .addTo(layerGroups.current.competitors)
        })
      }
    })
  }, [heatmap, deserts, recommendations, competitors, activeLayer])

  return <div ref={mapRef} className="w-full h-full" />
}

const layers = [
  { id: 'heatmap', icon: 'layers', label: 'Heatmap' },
  { id: 'deserts', icon: 'radar', label: 'Deserts' },
  { id: 'recs', icon: 'analytics', label: 'Best Sites' },
  { id: 'competitors', icon: 'store', label: 'Competitors' },
]

export default function Heatmap() {
  const [heatmap, setHeatmap] = useState<any>(null)
  const [deserts, setDeserts] = useState<any>(null)
  const [recommendations, setRecommendations] = useState<any>(null)
  const [competitors, setCompetitors] = useState<any>(null)
  const [activeLayer, setActiveLayer] = useState('heatmap')
  const [loading, setLoading] = useState(true)
  const [panelOpen, setPanelOpen] = useState(true)
  const [selectedSite, setSelectedSite] = useState<any>(null)

  useEffect(() => {
    Promise.all([api.getHeatmap(), api.getDeserts(), api.getRecommendations(), api.getCompetitors()])
      .then(([h, d, r, c]) => {
        setHeatmap(h); setDeserts(d); setRecommendations(r); setCompetitors(c)
        if (r?.recommendations?.[0]) setSelectedSite(r.recommendations[0])
      }).finally(() => setLoading(false))
  }, [])

  const handleLayerChange = (id: string) => {
    setActiveLayer(id)
    if (id === 'recs' && recommendations?.recommendations?.[0]) setSelectedSite(recommendations.recommendations[0])
    if (id === 'deserts' && deserts?.deserts?.[0]) setSelectedSite({ ...deserts.deserts[0], isDesert: true })
    if (id === 'heatmap' && heatmap?.features?.[0]) {
      const f = heatmap.features[0]
      setSelectedSite({ location: f.properties.name, score: f.properties.opportunity_score, isHeatmap: true, poi_count: f.properties.poi_count })
    }
  }

  const currentItems = () => {
    if (activeLayer === 'recs') return recommendations?.recommendations?.slice(0, 8) || []
    if (activeLayer === 'deserts') return deserts?.deserts?.slice(0, 8) || []
    if (activeLayer === 'competitors') return competitors?.competitors?.slice(0, 8) || []
    return heatmap?.features?.slice(0, 8).map((f: any) => ({ location: f.properties.name, score: f.properties.opportunity_score, ...f.properties })) || []
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: '#050505', color: '#e5e2e1' }}>
      <Navbar />

      <div className="flex-1 relative mt-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          {!loading && <LeafletMap heatmap={heatmap} deserts={deserts} recommendations={recommendations} competitors={competitors} activeLayer={activeLayer} />}
          {loading && (
            <div className="w-full h-full flex items-center justify-center" style={{ background: '#050505' }}>
              <div className="text-center">
                <span className="material-symbols-outlined text-5xl animate-pulse" style={{ color: '#00ff88' }}>satellite_alt</span>
                <p className="mt-4 font-label-caps" style={{ color: '#b9cbb9' }}>LOADING MAP DATA...</p>
              </div>
            </div>
          )}
        </div>

        <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
          <div className="glass-panel p-2 rounded-xl flex flex-col gap-1">
            {layers.map(({ id, icon, label }) => (
              <button key={id} onClick={() => handleLayerChange(id)} title={label}
                className="p-2 rounded-lg transition-all flex items-center gap-2"
                style={activeLayer === id
                  ? { background: '#00ff88', color: '#003919', boxShadow: '0 0 10px rgba(0,255,136,0.5)' }
                  : { color: '#b9cbb9' }
                }
              >
                <span className="material-symbols-outlined">{icon}</span>
                <span className="text-[10px] font-label-caps hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="absolute bottom-4 left-4 z-20 glass-panel p-4 rounded-2xl w-56">
          <h4 className="font-label-caps text-label-caps mb-3" style={{ color: '#b9cbb9' }}>MAP LEGEND</h4>
          <div className="space-y-2">
            {[
              { color: '#00ff88', label: 'High ROI Opportunity' },
              { color: '#ffb4ab', label: 'Charging Desert' },
              { color: '#00e3fd', label: 'Competitor Node' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ background: color }}></div>
                <span className="text-xs" style={{ color: '#e5e2e1' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {panelOpen && (
            <motion.div
              initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-4 bottom-4 right-4 w-80 z-20 flex flex-col gap-4 overflow-y-auto"
            >
              {selectedSite && (
                <div className="glass-panel rounded-3xl p-6 shimmer-border flex flex-col gap-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-label-caps text-[10px] tracking-widest uppercase" style={{ color: '#f1ffef' }}>
                        {activeLayer === 'recs' ? `RANK #${selectedSite.rank}` : activeLayer.toUpperCase()}
                      </span>
                      <h2 className="font-headline-md text-headline-md font-bold mt-1 leading-tight">{selectedSite.location || selectedSite.name}</h2>
                      <p className="text-xs mt-1" style={{ color: '#b9cbb9' }}>Bengaluru, Karnataka</p>
                    </div>
                    <div className="px-3 py-1 rounded-full border" style={{ background: 'rgba(0,255,136,0.1)', borderColor: 'rgba(0,255,136,0.3)' }}>
                      <span className="font-bold text-sm" style={{ color: '#00ff88' }}>{selectedSite.score ?? selectedSite.demand_score ?? '—'} Score</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: selectedSite.isDesert ? 'Demand' : 'Score', value: `${selectedSite.score ?? selectedSite.demand_score ?? '—'}`, unit: '/100', color: '#f1ffef' },
                      { label: selectedSite.estimated_roi ? 'Est. ROI' : 'Chargers', value: selectedSite.estimated_roi ? `${selectedSite.estimated_roi}%` : (selectedSite.existing_chargers ?? '—'), unit: '', color: '#e5e2e1' },
                    ].map(({ label, value, unit, color }) => (
                      <div key={label} className="p-3 rounded-2xl border border-white/5" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <p className="text-[10px] font-label-caps uppercase mb-1" style={{ color: '#b9cbb9' }}>{label}</p>
                        <div className="flex items-end gap-1">
                          <span className="text-3xl font-bold leading-none" style={{ color }}>{value}</span>
                          {unit && <span className="text-xs pb-1" style={{ color: '#b9cbb9' }}>{unit}</span>}
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedSite.payback_months && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-sm flex items-center gap-2" style={{ color: '#b9cbb9' }}>
                          <span className="material-symbols-outlined text-sm">payments</span> Payback
                        </span>
                        <span className="font-bold" style={{ color: '#00ff88' }}>{selectedSite.payback_months} months</span>
                      </div>
                      {selectedSite.expected_daily_sessions && (
                        <div className="flex justify-between items-center px-1">
                          <span className="text-sm flex items-center gap-2" style={{ color: '#b9cbb9' }}>
                            <span className="material-symbols-outlined text-sm">charging_station</span> Daily Sessions
                          </span>
                          <span className="font-bold" style={{ color: '#e5e2e1' }}>{selectedSite.expected_daily_sessions}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="h-24 relative rounded-2xl overflow-hidden border border-white/10" style={{ background: '#0a0a0a' }}>
                    <div className="absolute inset-0 flex items-end px-2 gap-1 pb-3">
                      {[30, 45, 60, 85, 100, 70, 40].map((h, i) => (
                        <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${h}%`, background: `rgba(0,255,136,${0.2 + i * 0.1})` }}></div>
                      ))}
                    </div>
                    <div className="absolute top-2 left-3">
                      <span className="text-[10px] font-label-caps" style={{ color: '#b9cbb9' }}>WEEKLY LOAD PROJECTION</span>
                    </div>
                  </div>

                  <Link to="/roi">
                    <button className="w-full font-bold py-3 rounded-2xl flex items-center justify-center gap-2 neon-glow transition-all hover:scale-[1.02] active:scale-95" style={{ background: '#00ff88', color: '#003919' }}>
                      Calculate ROI <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                  </Link>
                </div>
              )}

              <div className="glass-panel rounded-3xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-lg" style={{ color: '#00ff88' }}>list</span>
                  <h3 className="font-label-caps text-[11px] font-bold uppercase tracking-wider">
                    {activeLayer === 'recs' ? 'Top Sites' : activeLayer === 'deserts' ? 'Desert Zones' : activeLayer === 'competitors' ? 'Competitors' : 'Heatmap Zones'}
                  </h3>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {loading ? (
                    Array(4).fill(0).map((_, i) => <div key={i} className="h-10 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }}></div>)
                  ) : currentItems().map((item: any, i: number) => (
                    <button key={i} onClick={() => setSelectedSite(item)}
                      className="w-full flex justify-between items-center p-3 rounded-lg hover:bg-white/5 transition-all text-left">
                      <span className="text-xs truncate max-w-[160px]" style={{ color: '#e5e2e1' }}>{item.location || item.name}</span>
                      <span className="text-[10px] font-label-caps ml-2 shrink-0" style={{ color: '#00ff88' }}>
                        {item.score ?? item.demand_score ?? '—'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button onClick={() => setPanelOpen(v => !v)}
          className="absolute top-4 z-30 glass-panel p-2 rounded-lg hover:bg-white/10 transition-all"
          style={{ right: panelOpen ? '336px' : '16px' }}>
          <span className="material-symbols-outlined" style={{ color: '#b9cbb9' }}>{panelOpen ? 'chevron_right' : 'chevron_left'}</span>
        </button>
      </div>

      <footer className="relative z-50 py-3 px-6 flex justify-between items-center border-t" style={{ background: '#131313', borderColor: '#3b4b3d' }}>
        <div className="flex items-center gap-4">
          <span className="font-label-caps text-[10px]" style={{ color: '#f1ffef' }}>CHARGEWISE AI INFRASTRUCTURE</span>
          <div className="h-1 w-24 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div className="h-full w-2/3 animate-pulse" style={{ background: '#00ff88' }}></div>
          </div>
          <span className="text-[10px]" style={{ color: '#b9cbb9' }}>System Latency: 12ms</span>
        </div>
        <div className="flex gap-2 text-[10px] font-label-caps" style={{ color: '#b9cbb9' }}>
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
