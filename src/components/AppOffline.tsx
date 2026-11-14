import { useEffect, useState } from 'react';
import { CheckCircle2, Download, Share, WifiOff, X } from 'lucide-react';

/** Evento do Chrome/Android que permite mostrar o "Instalar app" no momento certo. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISPENSAR_KEY = 'airjogos:instalar-dispensado';

function lerDispensado(): boolean {
  try {
    return localStorage.getItem(DISPENSAR_KEY) === '1';
  } catch {
    return false;
  }
}

function estaInstalado(): boolean {
  const nav = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia?.('(display-mode: standalone)').matches || nav.standalone === true;
}

function ehIOS(): boolean {
  const ua = navigator.userAgent;
  return /iPhone|iPad|iPod/i.test(ua) || (ua.includes('Mac') && 'ontouchend' in document);
}

/** Acompanha se o celular está com ou sem internet. */
export function useOnline() {
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
  return online;
}

/** true quando o app já está todo salvo no aparelho (service worker ativo). */
export function useProntoOffline() {
  const [pronto, setPronto] = useState(false);
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    let vivo = true;
    navigator.serviceWorker.ready.then(() => {
      if (vivo) setPronto(true);
    });
    return () => {
      vivo = false;
    };
  }, []);
  return pronto;
}

/** Faixa no topo de qualquer tela quando a internet cai. */
export function AvisoOffline() {
  const online = useOnline();
  if (online) return null;
  return (
    <div className="sticky top-0 z-40 flex w-full items-center justify-center gap-2 bg-amber-400 px-4 py-2 text-center text-sm font-bold text-slate-950">
      <WifiOff size={16} /> Sem internet: tudo continua funcionando normalmente 👍
    </div>
  );
}

/** Cartão da Home: instalar o app e status do modo offline. */
export function InstalarApp() {
  const [evento, setEvento] = useState<BeforeInstallPromptEvent | null>(null);
  const [instalado, setInstalado] = useState(estaInstalado);
  const [dispensado, setDispensado] = useState(lerDispensado);
  const [verComo, setVerComo] = useState(false);
  const pronto = useProntoOffline();
  const ios = ehIOS();

  useEffect(() => {
    const antes = (e: Event) => {
      e.preventDefault();
      setEvento(e as BeforeInstallPromptEvent);
    };
    const depois = () => {
      setInstalado(true);
      setEvento(null);
    };
    window.addEventListener('beforeinstallprompt', antes);
    window.addEventListener('appinstalled', depois);
    return () => {
      window.removeEventListener('beforeinstallprompt', antes);
      window.removeEventListener('appinstalled', depois);
    };
  }, []);

  async function instalar() {
    if (evento) {
      await evento.prompt();
      const escolha = await evento.userChoice;
      if (escolha.outcome === 'accepted') setInstalado(true);
      setEvento(null);
      return;
    }
    setVerComo((v) => !v);
  }

  function dispensar() {
    setDispensado(true);
    try {
      localStorage.setItem(DISPENSAR_KEY, '1');
    } catch {
      /* ignora */
    }
  }

  const status = pronto ? (
    <span className="flex items-center gap-1 text-lime-400">
      <CheckCircle2 size={14} /> Pronto para jogar offline
    </span>
  ) : (
    <span className="text-slate-400">Preparando o modo offline…</span>
  );

  // Já instalado (ou dispensado): só um selo discreto com o status.
  if (instalado || dispensado) {
    return <p className="mt-1 flex justify-center text-xs font-semibold">{status}</p>;
  }

  return (
    <div className="relative mx-auto mt-4 w-full max-w-sm rounded-2xl border border-lime-400/40 bg-lime-400/10 p-4 text-left">
      <button
        onClick={dispensar}
        aria-label="Fechar"
        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 active:bg-slate-800"
      >
        <X size={16} />
      </button>
      <p className="pr-6 font-display text-base font-bold text-white">📲 Jogue até sem internet</p>
      <p className="mt-1 text-sm text-slate-300">
        Instale o AIR Jogos no celular: ele vira um app na tela inicial e funciona offline, no acampamento, na viagem ou onde a internet não pega.
      </p>
      <button
        onClick={instalar}
        className="no-select mt-3 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-lime-400 font-display text-sm font-bold text-slate-950 active:scale-95"
      >
        <Download size={18} /> Instalar o app
      </button>
      {verComo && !evento && (
        <div className="mt-3 rounded-xl bg-slate-900/80 p-3 text-sm text-slate-200">
          {ios ? (
            <p>
              No iPhone (Safari): toque em <Share size={14} className="inline" /> <b>Compartilhar</b> e depois em <b>“Adicionar à Tela de Início”</b>.
            </p>
          ) : (
            <p>
              Abra o menu do navegador (⋮) e toque em <b>“Instalar app”</b> ou <b>“Adicionar à tela inicial”</b>.
            </p>
          )}
        </div>
      )}
      <p className="mt-2 text-xs font-semibold">{status}</p>
    </div>
  );
}
