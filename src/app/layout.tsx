export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body style={{ margin: 0, background: '#0a0a0b', color: '#EDEBE7', fontFamily: 'Arial, sans-serif' }}>
        <header style={{
          background: '#1a1a1a', padding: '12px 16px',
          borderBottom: '2px solid #F5A623', textAlign: 'center',
          position: 'sticky', top: 0, zIndex: 100
        }}>
          <a href="/" style={{ color: '#F5A623', textDecoration: 'none', fontSize: 24, fontWeight: 'bold' }}>
            🐝 Mangabee
          </a>
        </header>
        <main style={{ maxWidth: 1200, margin: '0 auto', padding: 16 }}>
          {children}
        </main>
      </body>
    </html>
  );
}
