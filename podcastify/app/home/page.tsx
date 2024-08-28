'use client';

import React, { useEffect, useState } from 'react';
import { getPodcasts } from '../services/podcastService';

interface Podcast {
    show: string;
    name: string;
    description: string;
    play_url: string;
    release_date: string;
    total: string;
}

interface UserInfo {
    display_name: string;
}

const HomePage: React.FC = () => {
    const [podcasts, setPodcasts] = useState<Podcast[]>([]);
    const [username, setUsername] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Check if we have a code parameter in the URL (indicating a callback from Spotify)
                const urlParams = new URLSearchParams(window.location.search);
                const code = urlParams.get('code');
                if (code) {
                    const tokenResponse = await fetch(`http://127.0.0.1:5000/callback?code=${code}`, {
                        method: 'GET',
                        credentials: 'include'
                    });
                    const tokenData = await tokenResponse.json();
                    if (tokenData.error) {
                        throw new Error(tokenData.error);
                    }
                    // Clear the URL search params to avoid repeated processing
                    window.history.replaceState({}, document.title, "/");
                }

                // Fetch user information
                const tokenResponse = await fetch('http://127.0.0.1:5000/token', { credentials: 'include' });
                const tokenInfo = await tokenResponse.json();
                if (tokenInfo.error) {
                    throw new Error(tokenInfo.error);
                }
                console.log("Token Info:", tokenInfo);

                const userInfo: UserInfo = await fetch('https://api.spotify.com/v1/me', {
                    headers: { 'Authorization': `Bearer ${tokenInfo.access_token}` }
                }).then(res => res.json());
                console.log("User Info:", userInfo);

                setUsername(userInfo.display_name);

                // Fetch podcasts
                const data = await getPodcasts();
                console.log("Podcasts Data:", data);

                // Sort podcasts by release date (newest first) and take the first 6
                const sortedPodcasts = data.sort((a: { release_date: string | number | Date; }, b: { release_date: string | number | Date; }) =>
                    new Date(b.release_date).getTime() - new Date(a.release_date).getTime()
                ).slice(0, 6);
                setPodcasts(sortedPodcasts);
                setLoading(false);
            } catch (err) {
                console.error("Error loading data:", err);
                setError('Error loading data');
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleShowMoreToggle = (index: number) => {
        const descriptionElement = document.getElementById(`description-${index}`);
        if (descriptionElement) {
            if (descriptionElement.classList.contains('max-h-32')) {
                descriptionElement.classList.remove('max-h-32');
                descriptionElement.classList.add('max-h-none');
            } else {
                descriptionElement.classList.add('max-h-32');
                descriptionElement.classList.remove('max-h-none');
            }
        }
    };

    if (loading) return <p className="my-5 text-center">Loading...</p>;
    if (error) return <p className="my-5 text-center">{error}</p>;

    return (
        <div className="font-sans p-6">
            <h1 className="text-3xl mb-6 text-center">Welcome, {username}!</h1>
            <h2 className="text-2xl mb-4">Recent updates from your saved shows.</h2>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {podcasts.map((podcast, index) => (
                    <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg" style={{ height: '400px' }}>
                        <div className="p-4 h-full flex flex-col">
                            <h3 className="text-lg font-bold mb-2">{podcast.show}</h3>
                            <h4 className="text-md font-semibold mb-2">{podcast.name}</h4>
                            <div className="flex-grow overflow-hidden">
                                <p id={`description-${index}`} className="text-sm text-gray-700 mb-2 max-h-32 overflow-hidden" 
                                   dangerouslySetInnerHTML={{ __html: podcast.description }}></p>
                                <button
                                    className="text-blue-500"
                                    onClick={() => handleShowMoreToggle(index)}
                                >
                                    {document.getElementById(`description-${index}`)?.classList.contains('max-h-32') ? 'Show More' : 'Show Less'}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500">Released on: {podcast.release_date}</p>
                            <p className="text-xs text-gray-500">Duration: {podcast.total}</p>
                            <a href={podcast.play_url} className="inline-block mt-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">Listen</a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HomePage;
