import { useEffect } from 'react';
import { useMicToggle } from './use-mic-toggle';

/**
 * Hook para gerenciar atalhos globais da aplicação
 */
export function useGlobalShortcuts() {
  const { handleMicToggle } = useMicToggle();

  useEffect(() => {
    // Listener para o atalho de toggle do microfone (tecla =)
    const cleanup = (window.api as any)?.onMicToggle(() => {
      console.log('[GlobalShortcuts] Tecla = pressionada - Toggle microfone');
      handleMicToggle();
    });

    return () => {
      cleanup?.();
    };
  }, [handleMicToggle]);
}
