import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

import AppLayout from "@/pages/app"
import DashboardPage from "@/pages/app/dashboard"
import CarbonMarketPage from "@/pages/app/mercado-de-carbono"
import PredictivePage from "@/pages/app/preditivo"
import LandingPage from "@/pages/landingpage"

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Navigate replace to="/app/dashboard" />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="preditivo" element={<PredictivePage />} />
          <Route path="mercado-de-carbono" element={<CarbonMarketPage />} />
        </Route>
        <Route
          path="/dashboard"
          element={<Navigate replace to="/app/dashboard" />}
        />
        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
