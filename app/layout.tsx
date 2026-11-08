import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Hap — Agjensi Punësimi', description: 'Hapi yt i radhës fillon këtu.' };
export default function RootLayout({children}: {children: React.ReactNode}) { return <html lang="sq"><body>{children}</body></html>; }
