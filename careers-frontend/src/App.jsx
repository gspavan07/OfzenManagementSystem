import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage';
import RegistrationPage from './pages/RegistrationPage';
import SuccessPage from './pages/SuccessPage';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      <div className="min-h-screen flex flex-col">
        {/* Simple Header */}
        <header className="bg-white border-b border-slate-200 py-4 px-6 md:px-12 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
              O
            </div>
            <span className="font-bold text-xl text-slate-900 tracking-tight">Ofzen Careers</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <a href="https://ofzen.in" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Main Website</a>
            <a href="#internships" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Internships</a>
          </nav>
        </header>

        {/* Main Content */}
        <main className="flex-1 bg-slate-50">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/register/:batchId" element={<RegistrationPage />} />
            <Route path="/success" element={<SuccessPage />} />
          </Routes>
        </main>

        {/* Simple Footer */}
        <footer className="bg-slate-900 py-8 px-6 md:px-12 text-center text-slate-400 text-sm">
          <p>© {new Date().getFullYear()} Ofzen Management System. All rights reserved.</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
