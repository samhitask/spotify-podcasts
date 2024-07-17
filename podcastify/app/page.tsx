// pages/index.tsx or equivalent
'use client';

import React, { useEffect, useState } from 'react';
import { getPodcasts } from './services/podcastService';

interface Podcast {
    show: string;
    name: string;
    description: string;
    play_url: string;
    release_date: string;
    total: string;
}

const HomePage: React.FC = () => {
    const [podcasts, setPodcasts] = useState<Podcast[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getPodcasts();
                setPodcasts(data);
                setLoading(false);
            } catch (err) {
                setError('Error loading podcasts');
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <p className="my-5 text-center">Loading...</p>;
    if (error) return <p className="my-5 text-center">{error}</p>;

    return (
        <div className="font-sans">
            <h1 className="text-3xl mb-4">Podcasts</h1>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {podcasts.map((podcast, index) => (
                    <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg">
                        <div className="p-4">
                            <h2 className="text-lg font-bold mb-2">{podcast.show}</h2>
                            <p className="text-sm text-gray-700 mb-2" dangerouslySetInnerHTML={{ __html: podcast.description }}></p>
                            <p className="text-xs text-gray-500">Released on: {podcast.release_date}</p>
                            <p className="text-xs text-gray-500">Duration: {podcast.total}</p>
                            <a href={podcast.play_url} className="inline-block mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Listen</a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HomePage;