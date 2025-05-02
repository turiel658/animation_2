// Import anime.js using script in HTML instead of ES6 import

// Spotify API Credentials
// IMPORTANT: These credentials need to be replaced with your own from Spotify Developer Dashboard
const CLIENT_ID = 'a9ee21a8115b4a17b9f7e118362a5eaf'; // Replace with your Client ID 
const CLIENT_SECRET = 'c279c920a4274bd78213ea6455583072'; // Replace with your Client Secret

// DOM Elements
const elements = {
    artistName: document.getElementById('artist-name'), 
    artistImage: document.getElementById('artist-image'),
    artistGenres: document.getElementById('artist-genres'),
    artistFollowers: document.getElementById('artist-followers'),
    topTracksList: document.getElementById('top-tracks-list'),
    audioFeaturesChart: document.getElementById('audio-features-chart'),
    loader: document.getElementById('loader'),
    searchInput: document.getElementById('artist-search'),
    searchButton: document.getElementById('search-btn'),
    errorContainer: document.getElementById('error-container')
};

// Token storage
let accessToken = '';
let tokenExpiration = 0;

// Show/hide loader
function toggleLoader(show) {
    if (show) {
        elements.loader.classList.add('active');
    } else {
        elements.loader.classList.remove('active');
    }
}    

// Show error message
function showError(message) {
    elements.errorContainer.textContent = message;
    elements.errorContainer.style.display = 'block';

    setTimeout(() => {
        elements.errorContainer.style.display = 'none';
    }, 5000);
}

// Get access token with better token management
async function getAccessToken() {
    try {
        // Check if we already have a valid token
        const now = Date.now();
        if (accessToken && tokenExpiration > now) {
            return accessToken;
        }

        toggleLoader(true);
        
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${btoa(CLIENT_ID + ':' + CLIENT_SECRET)}`,
            },
            body: 'grant_type=client_credentials',
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Error al obtener token de acceso (${response.status}): ${
                errorData.error_description || response.statusText
            }`);
        }

        const data = await response.json();
        
        if (!data.access_token) {
            throw new Error('Token de acceso no recibido desde Spotify');
        }
        
        // Store token and its expiration time
        accessToken = data.access_token;
        // Set expiration 60 seconds earlier to be safe
        tokenExpiration = now + (data.expires_in - 60) * 1000;
        
        console.log("New token obtained: " + accessToken.substring(0, 10) + "...");
        return accessToken;
    } catch (error) {
        showError(`Error de autenticación: ${error.message}`);
        console.error("Authentication error:", error);
        return null;
    } finally {
        toggleLoader(false);
    }
}

// Search for an artist by name
async function searchArtist(artistName) {
    try {
        toggleLoader(true);
        const token = await getAccessToken();
        if (!token) {
            return;
        }

        const response = await fetch(
            `https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist&limit=1`,
            { 
                headers: { 
                    'Authorization': `Bearer ${token}` 
                } 
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Error en la búsqueda (${response.status}): ${
                errorData.error?.message || response.statusText
            }`);
        }
        
        const data = await response.json();

        if (!data.artists || data.artists.items.length === 0) {
            throw new Error('No se encontró ningún artista con ese nombre');
        }

        const artistId = data.artists.items[0].id;
        await getArtistInfo(artistId);
    } catch (error) {
        showError(`Error: ${error.message}`);
        console.error("Search error:", error);
    } finally {
        toggleLoader(false);
    }
}

// Get basic artist information
async function getArtistInfo(artistId) {
    try {
        toggleLoader(true);
        const token = await getAccessToken();
        if (!token) {
            return;
        }

        const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Artista no encontrado (${response.status}): ${
                errorData.error?.message || response.statusText
            }`);
        }
        
        const artistData = await response.json();

        updateArtistInfo(artistData);
        if (artistData.images && artistData.images.length > 0) {
            changeBackgroundColor(artistData.images[0]?.url);
        }
        
        // Get additional data
        const topTracks = await getTopTracks(artistId);
        if (topTracks && topTracks.length > 0) {
            displayTopTracks(topTracks);
            
            // We'll use a different approach - instead of audio features, 
            // we'll create a chart based on the popularity and other 
            // data already available in the tracks
            createAlternativeChart(topTracks);
        }
    } catch (error) {
        showError(`Error al cargar datos: ${error.message}`);
        console.error("Artist info error:", error);
    } finally {
        toggleLoader(false);
    }    
}

// Update artist information in the DOM
function updateArtistInfo(artistData) {
    elements.artistName.textContent = artistData.name;
    
    if (artistData.images && artistData.images.length > 0) {
        elements.artistImage.src = artistData.images[0]?.url || '';
        elements.artistImage.alt = `Imagen de ${artistData.name}`;
    } else {
        elements.artistImage.src = '';
        elements.artistImage.alt = 'Imagen no disponible';
    }

    elements.artistGenres.innerHTML = `<i class="fas fa-music"></i> Géneros: ${
        artistData.genres && artistData.genres.length > 0
            ? artistData.genres.join(', ')
            : 'No disponible'
    }`;

    elements.artistFollowers.innerHTML = `<i class="fas fa-users"></i> Seguidores: ${
        artistData.followers?.total 
            ? artistData.followers.total.toLocaleString() 
            : 'N/A'
    }`;
}

// Get top tracks
async function getTopTracks(artistId) {
    try {
        const token = await getAccessToken();
        if (!token) return null;

        const response = await fetch(
            `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`,
            { headers: { 'Authorization': `Bearer ${token}` } }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Error al obtener tracks (${response.status}): ${
                errorData.error?.message || response.statusText
            }`);
        }
        
        const data = await response.json();
        return data.tracks.slice(0, 5); // Top 5 songs
    } catch (error) {
        showError(`Error en tracks: ${error.message}`);
        console.error("Top tracks error:", error);
        return null;
    }
}

// Display top tracks
function displayTopTracks(tracks) {
    if (!tracks || tracks.length === 0) {
        elements.topTracksList.innerHTML = '<li>No hay canciones disponibles</li>';
        return;
    }

    elements.topTracksList.innerHTML = tracks
        .map((track, index) => `
            <li>
                <span class="track-number">${index + 1}.</span>
                ${track.name}
                <span class="track-popularity">${track.popularity}★</span>
                <span class="track-duration">${msToMinutes(track.duration_ms)}</span>
            </li>`
        ).join('');
}

// Create an alternative chart based on track data we already have
function createAlternativeChart(tracks) {
    // Destroy previous chart if exists
    if (window.audioChart) {
        window.audioChart.destroy();
    }

    // Get popularity scores and other data
    const trackNames = tracks.map(track => track.name.length > 15 ? track.name.substring(0, 15) + '...' : track.name);
    const popularityScores = tracks.map(track => track.popularity / 100); // Normalize to 0-1
    
    // Create a polar area chart instead of radar
    window.audioChart = new Chart(elements.audioFeaturesChart, {
        type: 'polarArea',
        data: {
            labels: trackNames,
            datasets: [{
                label: 'Popularidad',
                data: popularityScores.map(score => score), 
                backgroundColor: [
                    'rgba(29, 185, 84, 0.7)',
                    'rgba(25, 20, 20, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(255, 206, 86, 0.7)'
                ],
                borderColor: '#1db954',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                r: {
                    beginAtZero: true,
                    ticks: { color: '#fff', backdropColor: 'transparent' },
                    grid: { color: 'rgba(255, 255, 255, 0.2)' }
                }
            },
            plugins: {
                legend: {
                    labels: { color: '#fff' }
                },
                title: {
                    display: true,
                    color: '#fff',
                    text: 'Popularidad de canciones'
                }
            }
        }
    });
    
    // Update the section title
    const audioAnalysisTitle = document.querySelector('.audio-analysis h2');
    if (audioAnalysisTitle) {
        audioAnalysisTitle.innerHTML = '<i class="fas fa-chart-pie"></i> Análisis de Popularidad';
    }
}

// Change background color
function changeBackgroundColor(imageUrl) {
    if (!imageUrl) return;

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imageUrl;

    img.onload = () => {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            // Prevent CORS errors
            try {
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const color = getDominantColor(imageData);

                // Ensure color is not too dark for readability
                let [r, g, b] = color;
                const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

                // If too dark, mix with a base color
                if (luminance < 40) {
                    r = Math.floor((r+50) * 0.7);
                    g = Math.floor((g + 50) * 0.7);
                    b = Math.floor((b + 80) * 0.7);
                }
                
                anime({
                    targets: 'body',
                    backgroundColor: `rgb(${r},${g},${b})`,
                    duration: 1500,
                    easing: 'easeInOutQuad'
                });
            } catch (e) {
                // Fallback for CORS error
                console.error("CORS error accessing image data:", e);
            }
        } catch (error) {
            console.error("Error processing image:", error);
        }
    };
    
    img.onerror = () => {
        console.error("Error loading image for background color");
    };
}

// Function to get dominant color
function getDominantColor(imageData) {
    const data = imageData.data;
    const colorMap = {};

    // Sample a subset of pixels for better performance
    const sampleRate = 10;

    for (let i = 0; i < data.length; i += (4 * sampleRate)) {
        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];

        // Group similar colors (reduce precision)
        const key = `${Math.floor(r/10)},${Math.floor(g/10)},${Math.floor(b/10)}`;

        if (!colorMap[key]) {
            colorMap[key] = {
                count: 0,
                r: 0,
                g: 0,
                b: 0 
            };
        }
        
        colorMap[key].count++;
        colorMap[key].r += r;
        colorMap[key].g += g;
        colorMap[key].b += b;
    }

    // Find most common group
    let maxCount = 0;
    let dominant = null;

    for (const key in colorMap) {
        if (colorMap[key].count > maxCount) {
            maxCount = colorMap[key].count;
            dominant = colorMap[key];
        }
    }

    // Return average color of dominant group
    return dominant ? [ 
        Math.floor(dominant.r / dominant.count),
        Math.floor(dominant.g / dominant.count), 
        Math.floor(dominant.b / dominant.count)
    ] : [30, 50, 100]; // Default color
}

// Helpers
function msToMinutes(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, '0')}`;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Add event listener for search button
    elements.searchButton.addEventListener('click', () => {
        const artistName = elements.searchInput.value.trim();
        if (artistName) {
            searchArtist(artistName);
        } else {
            showError('Por favor, ingresa el nombre de un artista');
        }
    });

    // Add event listener to search on Enter key press
    elements.searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const artistName = elements.searchInput.value.trim();
            if (artistName) {
                searchArtist(artistName);
            } else {
                showError('Por favor, ingresa el nombre de un artista');
            }
        }
    });

    // Initialize with default artist
    getArtistInfo('7jy3rLJdDQY21OgRLCZ9sD'); // Foo Fighters
});