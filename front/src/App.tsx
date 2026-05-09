import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

import AppLayout from "@/pages/app"
import InicioPage from "@/pages/app/inicio"
import InfraestruturaPage from "@/pages/app/infraestrutura"
import IndustriasPage from "@/pages/app/industrias"
import PIDPage from "@/pages/app/pid"
import SaibaMaisPage from "@/pages/app/saiba-mais"

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<InicioPage />} />
          <Route path="infraestrutura" element={<InfraestruturaPage />} />
          <Route path="industrias" element={<IndustriasPage />} />
          <Route path="pid" element={<PIDPage />} />
          <Route path="saiba-mais" element={<SaibaMaisPage />} />
        </Route>
        <Route path="*" element={<Navigate replace to="/app/inicio" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
