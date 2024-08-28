// pages/index.tsx or equivalent
'use client';

import React, { useEffect, useState } from 'react';
import { getShows } from '../../services/podcastService';


const HomePage: React.FC = () => {
    const [shows, setShows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getShows();
                getShows();
                setLoading(false);
            } catch (err) {
                setError('Error loading episodes');
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <p className="my-5 text-center">Loading...</p>;
    if (error) return <p className="my-5 text-center">{error}</p>;

    return (
        <div className="font-sans">
            <h1 className="text-3xl mb-4">Shows</h1>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {shows.map((show, index) => (
                    <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg">
                        <div className="p-4">
                           <h2> {show} </h2>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HomePage;