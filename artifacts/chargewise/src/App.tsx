import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Heatmap from './pages/Heatmap'
import AICopilot from './pages/AICopilot'
import ROICalculator from './pages/ROICalculator'

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/heatmap" element={<Heatmap />} />
        <Route path="/copilot" element={<AICopilot />} />
        <Route path="/roi" element={<ROICalculator />} />
      </Routes>
    </BrowserRouter>
  )
}
