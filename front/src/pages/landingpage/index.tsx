import logo from "@/assets/logosPDI/SVG/Logo principal.svg"

export default function LandingPage() {
  return (
    <main
      className="relative min-h-screen overflow-hidden bg-slate-950 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage:
          "linear-gradient(rgba(3, 37, 77, 0.7), rgba(3, 37, 77, 1)), url('https://images.pexels.com/photos/37125618/pexels-photo-37125618.jpeg')",
      }}
    >
      <header className="relative z-10">
        <div className="mx-auto flex max-w-5xl items-center justify-between p-4">
          <img src={logo} alt="Logo Instituto E" className="h-18" />
          <button className="rounded-full bg-primary px-8 py-2 text-white font-bold transition-colors hover:opacity-90 ">
            Demo
          </button>
        </div>
      </header>

      <div className="mx-auto mt-12 flex items-center max-w-5xl p-4">
        <div className="max-w-lg">
            <h1 className="text-4xl font-black text-white">A plataforma de análise de dados e Inteligência Artificial</h1>
        </div>
        <img src="https://images.pexels.com/photos/32845694/pexels-photo-32845694.jpeg" className="w-1/2 max-w-lg" alt="" />
      </div>
    </main>
  )
}
