import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import localFont from 'next/font/local'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })
const flexing = localFont({
  src: './fonts/Flexing.ttf',
  variable: '--font-flexing',
})

export const metadata: Metadata = {
  title: 'QueryFlow - Database Query Platform',
  description: 'Execute and monitor database queries with ease',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${flexing.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
