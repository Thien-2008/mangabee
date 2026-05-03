import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { default: 'Mangabee', template: '%s · Mangabee' },
  description: 'Đọc truyện tranh online miễn phí – cập nhật nhanh nhất',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,300;0,400;0,600;0,700;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet" />
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          :root {
            --bg:      #0d0d0f;
            --bg2:     #131315;
            --bg3:     #1c1c1f;
            --card:    #161618;
            --border:  #272523;
            --accent:  #f59e0b;
            --accent2: #fbbf24;
            --text:    #f0ece4;
            --text2:   #9a9390;
            --text3:   #52504e;
            --green:   #22c55e;
            --radius:  10px;
          }
          html { scroll-behavior: smooth; }
          body {
            background: var(--bg);
            color: var(--text);
            font-family: 'DM Sans', sans-serif;
            font-size: 15px;
            line-height: 1.6;
            min-height: 100vh;
            -webkit-font-smoothing: antialiased;
          }
          a { color: inherit; text-decoration: none; }
          img { display: block; }
          ::-webkit-scrollbar { width: 5px; height: 5px; }
          ::-webkit-scrollbar-track { background: var(--bg2); }
          ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 99px; }
          ::-webkit-scrollbar-thumb:hover { background: var(--accent); }
          @keyframes fadeUp {
            from { opacity:0; transform:translateY(16px); }
            to   { opacity:1; transform:translateY(0); }
          }
          @keyframes fadeIn {
            from { opacity:0; } to { opacity:1; }
          }
          .fade-up { animation: fadeUp .4s ease both; }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}
