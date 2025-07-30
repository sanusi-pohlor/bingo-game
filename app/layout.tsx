
import "./globals.css";
import { Itim } from 'next/font/google';

const itim = Itim({
  weight: '400',
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={itim.className}>
        {children}
      </body>
    </html>
  );
}
