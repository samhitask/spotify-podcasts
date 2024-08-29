'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { getPodcasts } from '../services/podcastService';

interface Podcast {
    show: string;
    show_image: string | null;
    show_url: string;
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
    const [expandedDescriptions, setExpandedDescriptions] = useState<{ [key: number]: boolean }>({});

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
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
                window.history.replaceState({}, document.title, "/");
            }

            const tokenResponse = await fetch('http://127.0.0.1:5000/token', { credentials: 'include' });
            const tokenInfo = await tokenResponse.json();
            if (tokenInfo.error) {
                throw new Error(tokenInfo.error);
            }

            const userInfo: UserInfo = await fetch('https://api.spotify.com/v1/me', {
                headers: { 'Authorization': `Bearer ${tokenInfo.access_token}` }
            }).then(res => res.json());

            setUsername(userInfo.display_name);

            const data = await getPodcasts();
            const sortedPodcasts = data.slice(0, 6);
            setPodcasts(sortedPodcasts);
        } catch (err) {
            console.error("Error loading data:", err);
            setError('Error loading data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const toggleDescription = (index: number) => {
        setExpandedDescriptions(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const handleRefresh = async () => {
        // Clear the cache by making a request to the backend
        try {
            await fetch('http://127.0.0.1:5000/clear-cache', { method: 'POST', credentials: 'include' });
        } catch (err) {
            console.error("Error clearing cache:", err);
        }

        // Fetch the data again
        await fetchData();
    };

    if (loading) return <p className="my-5 text-center">Loading...</p>;
    if (error) return <p className="my-5 text-center">{error}</p>;

    return (
        <div className="font-sans p-6 bg-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl">Welcome, {username}!</h1>
                <button
                    onClick={handleRefresh}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300"
                >
                    Refresh
                </button>
            </div>
            <h2 className="text-2xl mb-4">Recent updates from your saved shows on Spotify</h2>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {podcasts.map((podcast, index) => (
                    <div key={index} className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
                        <img
                            src={podcast.show_image || '/default-podcast-image.jpg'}
                            alt={podcast.show}
                            className="w-full h-48 object-cover"
                        />
                        <div className="p-4 flex-grow flex flex-col">
                            <h3 className="text-lg font-bold mb-1">{podcast.show}</h3>
                            <h4 className="text-md font-semibold mb-2">{podcast.name}</h4>
                            <div className="flex-grow">
                                <p className={`text-sm text-gray-700 mb-2 ${expandedDescriptions[index] ? '' : 'line-clamp-3'}`}
                                   dangerouslySetInnerHTML={{ __html: podcast.description }}></p>
                                {podcast.description && podcast.description.length > 150 && (
                                    <button
                                        onClick={() => toggleDescription(index)}
                                        className="text-blue-500 hover:text-blue-700 text-sm"
                                    >
                                        {expandedDescriptions[index] ? 'Show Less' : 'Show More'}
                                    </button>
                                )}
                            </div>
                            <div className="mt-2">
                                <p className="text-xs text-gray-500">Released on: {podcast.release_date}</p>
                                <p className="text-xs text-gray-500">Duration: {podcast.total}</p>
                                <a href={podcast.play_url} className="inline-block mt-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-300">Listen</a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HomePage;