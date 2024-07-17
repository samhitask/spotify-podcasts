// pages/_app.tsx

import '../styles/globals.css'; // Import global styles
import Head from 'next/head';
import type { AppProps } from 'next/app'; // Import AppProps type

function MyApp({ Component, pageProps }: AppProps) { // Use AppProps type
  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Spectral:wght@400;600&display=swap" rel="stylesheet" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
