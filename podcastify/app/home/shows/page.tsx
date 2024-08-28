'use client';

import React, { useEffect, useState } from 'react';
import { getShows } from '../../services/podcastService';

interface Show {
    id: string;
    name: string;
    description: string;
    publisher: string;
    images: { url: string }[];
    external_urls: { spotify: string };
}

const ShowsPage: React.FC = () => {
    const [shows, setShows] = useState<Show[]>([]);
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

                // Fetch shows
                const data = await getShows();
                console.log("Shows Data:", data);

                // Sort shows alphabetically by name
                const sortedShows = data.sort((a: Show, b: Show) =>
                    a.name.localeCompare(b.name)
                );
                setShows(sortedShows);
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

    console.log('Rendering shows:', shows); // Keep this for debugging

    return (
        <div className="font-sans p-4">
            <h1 className="text-3xl mb-4">My Saved Shows</h1>
            {shows.length === 0 ? (
                <p>No shows available. Make sure you have saved shows to your library!</p>
            ) : (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {shows.map((show) => (
                        <div key={show.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg">
                            {show.images && show.images[0] && (
                                <img src={show.images[0].url} alt={show.name} className="w-full h-48 object-cover" />
                            )}
                            <div className="p-4">
                                <h2 className="text-lg font-bold mb-2">{show.name}</h2>
                                <p className="text-sm text-gray-700 mb-2">{show.publisher}</p>
                                <p className="text-sm text-gray-700 mb-2 line-clamp-3">{show.description}</p>
                                {show.external_urls && show.external_urls.spotify && (
                                    <a href={show.external_urls.spotify} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                                        View on Spotify
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ShowsPage;