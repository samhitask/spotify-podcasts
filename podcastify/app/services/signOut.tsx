// services/signOut.tsx

export async function signOut(): Promise<void> {
    try {
        const response = await fetch('http://127.0.0.1:5000/logout', {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Logout failed');
        }

        // Clear local storage
        localStorage.removeItem('spotifyToken');

        // Redirect to home page (base URL)
        window.location.href = '/';
    } catch (error) {
        console.error('Error signing out:', error);
    }
}
