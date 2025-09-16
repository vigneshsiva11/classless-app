import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'

export const metadata: Metadata = {
  title: 'Classless',
  description: 'Created with v0',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Language is applied via html lang attribute from localStorage on client
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
        <script dangerouslySetInnerHTML={{__html:`
          (function(){
            try{
              var lang=localStorage.getItem('classless_lang')||'en';
              document.documentElement.setAttribute('lang', lang);
              window.addEventListener('classless:language-changed',function(e){
                if(e && e.detail && e.detail.lang){
                  document.documentElement.setAttribute('lang', e.detail.lang);
                }
              });
            }catch(e){}
          })();
        `}} />
      </head>
      <body>{children}</body>
    </html>
  )
}
