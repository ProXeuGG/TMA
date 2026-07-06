import './globals.css';
import Script from 'next/script';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      </head>
      <body className="bg-[#17212b] text-white antialiased selection:bg-blue-500">
        {children}
      </body>
    </html>
  );
}
