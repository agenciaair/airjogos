import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Impostor from './pages/Impostor';
import QuemEuSou from './pages/QuemEuSou';
import Mimica from './pages/Mimica';
import Completar from './pages/Completar';
import Taboo from './pages/Taboo';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/impostor" element={<Impostor />} />
      <Route path="/quem-eu-sou" element={<QuemEuSou />} />
      <Route path="/mimica" element={<Mimica />} />
      <Route path="/completar" element={<Completar />} />
      <Route path="/taboo" element={<Taboo />} />
    </Routes>
  );
}
