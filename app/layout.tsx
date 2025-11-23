import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kwangsoo Calculator",
  description: "광수 계산기",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        {children}
      </body>
    </html>
  );
}
