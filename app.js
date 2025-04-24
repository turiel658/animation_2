import anime from 'animejs';

// Credenciales de la API de Spotify
const CLIENT_ID = '  '; // Reemplaza con tu Client ID
const CLIENT_SECRET = '  '; // Reemplaza con tu Client Secret

// Elementos del DOM
const elements = {
    artistName: document.getElementById('artist-name'),
    artistImage: document.getElementById('artist-image'),
    artistGenres: document.getElementById('artist-genres'),
    artistFollowers: document.getElementById('artist-followers'),
    topTracksList: document.getElementById('top-tracks-list'),
    audioFeaturesChart: document.getElementById('audio-features-chart')
};

// Obtener el token de acceso
async function getAccessToken() {
    try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${btoa(CLIENT_ID + ':' + CLIENT_SECRET)}`,
            },
            body: 'grant_type=client_credentials',
        });

        if (!response.ok) throw new Error('Error al obtener token');
        const data = await response.json();
        return data.access_token;
    } catch (error) {
        showError(`Error de autenticación: ${error.message}`);
        return null;
    }
}

// Obtener información básica del artista
async function getArtistInfo(artistId) {
    try {
        const token = await getAccessToken();
        if (!token) return;

        const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Artista no encontrado');
        const artistData = await response.json();

        updateArtistInfo(artistData);
        changeBackgroundColor(artistData.images[0]?.url);
        
        // Obtener datos adicionales
        const topTracks = await getTopTracks(artistId);
        if (topTracks) {
            displayTopTracks(topTracks);
            const audioFeatures = await getAudioFeatures(topTracks.map(track => track.id));
            if (audioFeatures) createAudioFeaturesChart(audioFeatures);
        }
    } catch (error) {
        showError(`Error al cargar datos: ${error.message}`);
    }
}

// Actualizar la información del artista en el DOM
function updateArtistInfo(artistData) {
    elements.artistName.textContent = artistData.name;
    elements.artistImage.src = artistData.images[0]?.url || '';
    elements.artistGenres.textContent = `Géneros: ${artistData.genres.join(', ') || 'No disponible'}`;
    elements.artistFollowers.textContent = `Seguidores: ${artistData.followers?.total.toLocaleString() || 'N/A'}`;
}

// Obtener top tracks
async function getTopTracks(artistId) {
    try {
        const token = await getAccessToken();
        const response = await fetch(
            `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`,
            { headers: { 'Authorization': `Bearer ${token}` } }
        );

        if (!response.ok) throw new Error('Error al obtener tracks');
        const data = await response.json();
        return data.tracks.slice(0, 5); // Top 5 canciones
    } catch (error) {
        showError(`Error en tracks: ${error.message}`);
        return null;
    }
}

// Mostrar top tracks
function displayTopTracks(tracks) {
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

// Obtener características de audio
async function getAudioFeatures(trackIds) {
    try {
        const token = await getAccessToken();
        const response = await fetch(
            `https://api.spotify.com/v1/audio-features?ids=${trackIds.join(',')}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
        );

        if (!response.ok) throw new Error('Error en audio features');
        const data = await response.json();
        return data.audio_features.filter(feat => feat); // Filtrar nulls
    } catch (error) {
        showError(`Error en análisis: ${error.message}`);
        return null;
    }
}

// Crear gráfico de radar
function createAudioFeaturesChart(audioFeatures) {
    const features = ['danceability', 'energy', 'speechiness', 'acousticness', 'instrumentalness', 'valence'];
    const averages = features.map(feature => {
        const total = audioFeatures.reduce((sum, af) => sum + af[feature], 0);
        return Number((total / audioFeatures.length).toFixed(2));
    });

    new Chart(elements.audioFeaturesChart, {
        type: 'radar',
        data: {
            labels: ['Bailabilidad', 'Energía', 'Vocales', 'Acústica', 'Instrumental', 'Positividad'],
            datasets: [{
                label: 'Media de características',
                data: averages,
                backgroundColor: 'rgba(29, 185, 84, 0.3)',
                borderColor: '#1db954',
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 1,
                    ticks: { color: '#fff', backdropColor: 'transparent' },
                    grid: { color: 'rgba(255, 255, 255, 0.2)' }
                }
            },
            plugins: {
                legend: {
                    labels: { color: '#fff' }
                }
            }
        }
    });
}

// Cambiar color de fondo
function changeBackgroundColor(imageUrl) {
    if (!imageUrl) return;

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imageUrl;

    img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const color = getDominantColor(imageData);
        
        anime({
            targets: 'body',
            backgroundColor: `rgb(${color.join(',')})`,
            duration: 1500,
            easing: 'easeInOutQuad'
        });
    };
}

// Función para obtener color dominante
function getDominantColor(imageData) {
    const colorCount = {};
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const rgb = `${data[i]},${data[i+1]},${data[i+2]}`;
        colorCount[rgb] = (colorCount[rgb] || 0) + 1;
    }

    const dominant = Object.entries(colorCount).reduce((a, b) => a[1] > b[1] ? a : b)[0];
    return dominant.split(',').map(Number);
}

// Helpers
function msToMinutes(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, '0')}`;
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.prepend(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
}

// Inicializar con un artista por defecto
getArtistInfo('7jy3rLJdDQY21OgRLCZ9sD'); // Foo Fighters
