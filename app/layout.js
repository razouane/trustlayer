export const metadata = {
  title: 'TrustLayer — E-commerce Sécurisé Tunisie',
  description: 'Sécurisez vos transactions e-commerce en Tunisie',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&family=Syne:wght@700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, padding: 0, background: '#070C14', color: '#E8F0FF', fontFamily: 'DM Sans, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
