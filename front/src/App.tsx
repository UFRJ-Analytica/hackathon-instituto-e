import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

import AppLayout from "@/pages/app"
import EtanolPage from "@/pages/app/etanol"
import EtanolAnaliseTemporalPage from "@/pages/app/etanol/analise-temporal"
import EtanolPrevisaoPage from "@/pages/app/etanol/previsao"
import ChatAIPage from "@/pages/app/chat-ai"
import EmissoesPage from "@/pages/app/emissoes"
import EnergiaPage from "@/pages/app/energia"
import InicioPage from "@/pages/app/inicio"
import InfraestruturaPage from "@/pages/app/infraestrutura"
import IndustriasPage from "@/pages/app/industrias"
import MercadoPage from "@/pages/app/mercado"
import PIDPage from "@/pages/app/pid"
import SaibaMaisPage from "@/pages/app/saiba-mais"

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<InicioPage />} />
          <Route path="etanol" element={<EtanolPage />} />
          <Route
            path="etanol/analise-temporal"
            element={<EtanolAnaliseTemporalPage />}
          />
          <Route path="etanol/previsao" element={<EtanolPrevisaoPage />} />
          <Route path="emissoes" element={<EmissoesPage />} />
          <Route path="infraestrutura" element={<InfraestruturaPage />} />
          <Route path="energia" element={<EnergiaPage />} />
          <Route path="industrias" element={<IndustriasPage />} />
          <Route path="mercado" element={<MercadoPage />} />
          <Route path="pid" element={<PIDPage />} />
          <Route path="saiba-mais" element={<SaibaMaisPage />} />
          <Route path="chat-ai" element={<ChatAIPage />} />
        </Route>
        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
