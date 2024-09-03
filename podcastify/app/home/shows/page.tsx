'use client';

import React, { useEffect, useState } from 'react';
import { getShows } from '../../services/podcastService';

interface Show {
    name: string;
    added_at: string;
    description: string;
    play_url: string;
    images: string | null;
}

const ShowsPage: React.FC = () => {
    const [shows, setShows] = useState<Show[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedDescriptions, setExpandedDescriptions] = useState<{ [key: number]: boolean }>({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const urlParams = new URLSearchParams(window.location.search);
                const code = urlParams.get('code');
                if (code) {
                    const tokenResponse = await fetch(`http://127.0.0.1:5000/callback?code=${code}`, {
                        method: 'GET',
                        credentials: 'include',
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

                const data = await getShows();
                console.log("Shows Data:", data);

                const sortedShows = data.sort(
                    (a: { added_at: string | number | Date }, b: { added_at: string | number | Date }) =>
                        new Date(b.added_at).getTime() - new Date(a.added_at).getTime()
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

    const toggleDescription = (index: number) => {
        setExpandedDescriptions(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    if (loading) return <p className="my-5 text-center">Loading...</p>;
    if (error) return <p className="my-5 text-center">{error}</p>;

    return (
        <div className="font-sans p-4">
            <h1 className="text-3xl mb-4">Your Shows</h1>
            {shows.length === 0 ? (
                <p>No shows available. Make sure you have saved shows in your library!</p>
            ) : (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {shows.map((show, index) => (
                        <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg flex flex-col h-full">
                            <img
                                src={show.images || 'default-image.jpg'}
                                alt={show.name}
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-4 flex-grow flex flex-col">
                                <h2 className="text-lg font-bold mb-2">{show.name || 'Unknown Show'}</h2>
                                <div className="flex-grow">
                                    <p className={`text-sm text-gray-700 mb-2 ${expandedDescriptions[index] ? '' : 'line-clamp-3'}`}
                                       dangerouslySetInnerHTML={{ __html: show.description || 'No description available' }}></p>
                                    {show.description && show.description.length > 150 && (
                                        <button
                                            onClick={() => toggleDescription(index)}
                                            className="text-blue-500 hover:text-blue-700 text-sm"
                                        >
                                            {expandedDescriptions[index] ? 'Show Less' : 'Show More'}
                                        </button>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Added on: {show.added_at || 'Unknown date'}</p>
                                {show.play_url && (
                                    <a href={show.play_url} className="inline-block mt-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">Listen</a>
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