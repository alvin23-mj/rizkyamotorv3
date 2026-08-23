'use client';

import { SessionProvider, useSession as useNextAuthSession } from 'next-auth/react';
import React, { ReactNode, createContext, useContext } from 'react';

const SafeSessionContext = createContext<{ data: any; status: string; update: (data?: any) => Promise<any> }>({
  data: null,
  status: 'unauthenticated',
  update: async () => null,
});

function InnerAuthProvider({ children }: { children: ReactNode }) {
  let sessionValue = { data: null, status: 'unauthenticated', update: async () => null };
  try {
    const res = useNextAuthSession();
    if (res) sessionValue = res as any;
  } catch (e) {
    // Fallback
  }

  return (
    <SafeSessionContext.Provider value={sessionValue}>
      {children}
    </SafeSessionContext.Provider>
  );
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <InnerAuthProvider>{children}</InnerAuthProvider>
    </SessionProvider>
  );
}

export function useSession() {
  return useContext(SafeSessionContext);
}
