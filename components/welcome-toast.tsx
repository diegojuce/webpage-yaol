'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

export function WelcomeToast() {
  useEffect(() => {
    // ignore if screen height is too small
    if (window.innerHeight < 650) return;
    if (!document.cookie.includes('welcome-toast=2')) {
      toast('Bienvenido a Yantissimo! [YANCARLO]', {
        id: 'welcome-toast',
        duration: Infinity,
        onDismiss: () => {
          document.cookie = 'welcome-toast=2; max-age=31536000; path=/';
        },
        description: (
          <>
            La tienda en linea oficial de Yantissimo (YAOL).
            <br />
            Contamos con los mejores precios en llantas.
          </>
        )
      });
    }
  }, []);

  return null;
}
