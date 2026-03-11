import './globals.css'

export const metadata = {
  title: 'Memoire',
  description: 'Share moments with someone special',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#fdf8f3]">
        {children}
      </body>
    </html>
  )
}