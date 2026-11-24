'use client';

import { TonConnectUIProvider } from '@tonconnect/ui-react';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const manifestUrl =
    process.env.NEXT_PUBLIC_TON_CONNECT_MANIFEST_URL ||
    'https://ton-gifts-market.vercel.app/tonconnect-manifest.json';

  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      {children}
    </TonConnectUIProvider>
  );
}
