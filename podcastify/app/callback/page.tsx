'use client'
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Callback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Extract the code from the URL
    const code = searchParams.get('code');

    if (code) {
      // Send the code to your backend
      fetch(`http://127.0.0.1:5000/callback?code=${code}`)
        .then(response => response.json())
        .then(data => {
          // Handle the response (e.g., store the token in local storage)
          localStorage.setItem('spotifyToken', JSON.stringify(data));
          router.push('/home'); // Redirect to the home page or dashboard
        })
        .catch(error => {
          console.error('Error:', error);
        });
    }
  }, [searchParams, router]);

  return <div>Processing login...</div>;
}