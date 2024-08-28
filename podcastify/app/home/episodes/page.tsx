'use client';

import React, { useEffect, useState } from 'react';
import { getPodcasts } from '../../services/podcastService';

interface Podcast {
    show: string;
    name: string;
    description: string;
    play_url: string;
    release_date: string;
    total: string;
}

const EpisodesPage: React.FC = () => {
    const [podcasts, setPodcasts] = useState<Podcast[]>([]);
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



                // Fetch podcasts
                const data = await getPodcasts();
                console.log("Podcasts Data:", data);

                // Sort podcasts by release date (newest first)
                const sortedPodcasts = data.sort((a: { release_date: string | number | Date; }, b: { release_date: string | number | Date; }) =>
                    new Date(b.release_date).getTime() - new Date(a.release_date).getTime()
                );
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

    if (loading) return <p className="my-5 text-center">Loading...</p>;
    if (error) return <p className="my-5 text-center">{error}</p>;

    console.log('Rendering podcasts:', podcasts); // Keep this for debugging

    return (
        <div className="font-sans p-4">
            <h1 className="text-3xl mb-4">Podcasts</h1>
            {podcasts.length === 0 ? (
                <p>No podcasts available. Make sure you have saved shows to your library! </p>
            ) : (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {podcasts.map((podcast, index) => (
                        <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg">
                            <div className="p-4">
                                <h2 className="text-lg font-bold mb-2">{podcast.show || 'Unknown Show'}</h2>
                                <h3 className="text-lg mb-2">{podcast.name || 'Unnamed Episode'}</h3>
                                <p className="text-sm text-gray-700 mb-2" dangerouslySetInnerHTML={{ __html: podcast.description || 'No description available' }}></p>
                                <p className="text-xs text-gray-500">Released on: {podcast.release_date || 'Unknown date'}</p>
                                <p className="text-xs text-gray-500">Duration: {podcast.total || 'Unknown duration'}</p>
                                {podcast.play_url && (
                                    <a href={podcast.play_url} className="inline-block mt-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">Listen</a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default EpisodesPage;