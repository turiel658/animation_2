// Import anime.js using script in HTML instead of ES6 import

// Spotify API Credentials
// Note: Replace these with your own credentials
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

// Obtener el token de acceso
async function getAccessToken() {
    try {
        toggleLoader(true);
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${btoa(CLIENT_ID + ':' + CLIENT_SECRET)}`,
            },
            body: 'grant_type=client_credentials',
        });

        if (!response.ok) throw new Error('Error al obtener token de acceso');

        const data = await response.json();
        toggleLoader(false);
        return data.access_token;
    } catch (error) {
        showError(`Error de autenticación: ${error.message}`);
        toggleLoader(false);
        return null;
    }
}


// Buscar un artista por nombre
async function searchArtist(artistName) {
    try {
        toggleLoader(true);
        const token = await getAccessToken();
        if (!token) {
            toggleLoader(false);
            return;
        }

        const response = await fetch(
            `https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist&limit=1`,
            { headers: { 'Authorization': `Bearer ${token}` } }
        );

        if (!response.ok) throw new Error('Error en la búsqueda');
        const data = await response.json();

        if (data.artists.items.length === 0) {
            throw new Error('No se encontró ningún artista con ese nombre');
        }

        const artistId = data.artists.items[0].id;
        await getArtistInfo(artistId);
    } catch (error) {
        showError(`Error: ${error.message}`);
    } finally {
        
    }
}

// Obtener información básica del artista
async function getArtistInfo(artistId) {
    try {
        toggleLoader(true);
        const token = await getAccessToken();
        if (!token) {
            toggleLoader(false);
            return;
        }

        const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Artista no encontrado');
        const artistData = await response.json();

         updateArtistInfo(artistData);
        if (artistData.images && artistData.images.length > 0) {
            changeBackgroundColor(artistData.images[0]?.url);
        }
        
        // Obtener datos adicionales
        const topTracks = await getTopTracks(artistId);
        if (topTracks) {
            displayTopTracks(topTracks);
            const audioFeatures = await getAudioFeatures(topTracks.map(track => track.id));
            if (audioFeatures && audioFeatures.length > 0) {
                createAudioFeaturesChart(audioFeatures);
            }
        }
    } catch (error) {
        showError(`Error al cargar datos: ${error.message}`);
    } finally {
       toggleLoader(false);
    }    
}

// Actualizar la información del artista en el DOM
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

// Obtener top tracks
async function getTopTracks(artistId) {
    try {
        const token = await getAccessToken();
        if (!token) return null;

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

// Obtener características de audio
async function getAudioFeatures(trackIds) {
    if (!trackIds || trackIds.length === 0) return null;

    try {
        const token = await getAccessToken();
        if (!token) return null;

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
    // Destruir el gráfico anterior si existe
    if (window.audioChart) {
        window.audioChart.destroy();
    }

    const features = ['danceability', 'energy', 'speechiness', 'acousticness', 'instrumentalness', 'valence'];
    const averages = features.map(feature => {
        const total = audioFeatures.reduce((sum, af) => sum + (af ? af[feature] : 0), 0);
        return Number((total / audioFeatures.length).toFixed(2)); 
    });

    window.audioChart = new Chart(elements.audioFeaturesChart, {
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
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            // Prevenir errores de CORS
            try {
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const color = getDominantColor(imageData);

                // Asegurar que el color no sea demasiado oscuro para legibilidad
                let [r, g, b] = color;
                const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

                // Si es muy oscuro, mezclarlo con un color base
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
                // Fallback si hay error de CORS
                console.error("Error de CORS al acceder a los datos de imagen:", e);
            }
        } catch (error) {
            console.error("Error al procesar imagen:", error);
        }
    };
    
    img.onerror = () => {
        console.error("Error al cargar la imagen para el color de fondo");
    };
}

// Función para obtener color dominante
function getDominantColor(imageData) {
    const data = imageData.data;
    const colorMap = {};

    // Muestrear un subconjunto de píxeles para mejor rendimiento
    const sampleRate = 10;

    for (let i = 0; i < data.length; i += (4 * sampleRate)) {
        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];

        // Agrupar colores similares (reducir precisión)
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

    // Encontrar el grupo más común
    let maxCount = 0;
    let dominant = null;

    for (const key in colorMap) {
        if (colorMap[key].count > maxCount) {
            maxCount = colorMap[key].count;
            dominant = colorMap[key];
        }
    }

    // Devolver el color promedio del grupo dominante
    return dominant ? [ 
        Math.floor(dominant.r / dominant.count),
        Math.floor(dominant.g / dominant.count), 
        Math.floor(dominant.b / dominant.count)
    ] : [30, 50, 100]; // Color por defecto
}

// Helpers
function msToMinutes(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, '0')}`;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Agregar event listener para el botón de búsqueda
    elements.searchButton.addEventListener('click', () => {
        const artistName = elements.searchInput.value.trim();
        if (artistName) {
            searchArtist(artistName);
        } else {
            showError('Por favor, ingresa el nombre de un artista');
        }
    });

    // Agregar event listener para buscar al presionar Enter
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

    // Inicializar con un artista por defecto
    getArtistInfo('7jy3rLJdDQY21OgRLCZ9sD'); // Foo Fighters
});