'use client'
import { useEffect } from 'react';

export default function Login() {
  useEffect(() => {
    // Redirect to the backend login route
    window.location.href = 'http://127.0.0.1:5000/login';
  }, []);

  return <div>Redirecting to Spotify login...</div>;
}