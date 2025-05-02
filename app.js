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
    errorContainer: document.getElementById('error-container'),
    artistInfo: document.querySelector('.artist-info'),
    searchContainer: document.querySelector('.search-container'),
    analyticsContainer: document.querySelector('.analytics-container'),
    cards: document.querySelectorAll('.card'),
    header: document.querySelector('header'),
    main: document.querySelector('main'),
};

// Animation objects
const animations = {
    // Store timeline instances
    timelines: {},
    // Store animation configurations
    config: {
        duration: 1200,
        easing: 'cubicBezier(.5, .05, .1, .3)'
    }
};

// Animation initialization
function initAnimations() {
    // Create parallax effect for background
    document.addEventListener('mousemove', (e) => {
        const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
        const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
        
        anime({
            targets: 'body',
            backgroundPosition: `${moveX}px ${moveY}px`,
            easing: 'easeOutExpo',
            duration: 300
        });
    });
    
    // Animate header on load
    animations.timelines.header = anime.timeline({
        easing: animations.config.easing
    });
    
    animations.timelines.header
        .add({
            targets: elements.header,
            translateY: [-50, 0],
            opacity: [0, 1],
            duration: animations.config.duration,
        })
        .add({
            targets: elements.searchContainer,
            translateY: [20, 0],
            opacity: [0, 1],
            duration: animations.config.duration * 0.7,
        }, '-=800');
    
    // Create hover animations for buttons and cards
    createHoverAnimations();
}

// Create hover animations for interactive elements
function createHoverAnimations() {
    // Search button hover animation
    elements.searchButton.addEventListener('mouseenter', () => {
        anime({
            targets: elements.searchButton,
            scale: 1.05,
            boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3)',
            backgroundColor: '#1ed760',
            duration: 300,
            easing: 'easeOutElastic(1, .5)'
        });
    });
    
    elements.searchButton.addEventListener('mouseleave', () => {
        anime({
            targets: elements.searchButton,
            scale: 1,
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            backgroundColor: '#1db954',
            duration: 300,
            easing: 'easeOutElastic(1, .5)'
        });
    });
    
    // Artist image hover animation (3D effect)
    elements.artistImage.addEventListener('mousemove', (e) => {
        const bounds = elements.artistImage.getBoundingClientRect();
        const mouseX = e.clientX - bounds.left;
        const mouseY = e.clientY - bounds.top;
        const centerX = bounds.width / 2;
        const centerY = bounds.height / 2;
        
        const angleX = (mouseY - centerY) / 15;
        const angleY = (centerX - mouseX) / 15;
        
        anime({
            targets: elements.artistImage,
            rotateX: angleX + 'deg',
            rotateY: angleY + 'deg',
            boxShadow: `${angleY/2}px ${-angleX/2}px 20px rgba(0, 0, 0, 0.7)`,
            duration: 100,
            easing: 'linear'
        });
    });
    
    elements.artistImage.addEventListener('mouseleave', () => {
        anime({
            targets: elements.artistImage,
            rotateX: 0,
            rotateY: 0,
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
            duration: 800,
            easing: 'easeOutElastic(1, .5)'
        });
    });
}

// Animate content loading
function animateContentLoad() {
    // Create staggered animation for artist info
    anime({
        targets: [elements.artistName, elements.artistGenres, elements.artistFollowers],
        translateX: [-30, 0],
        opacity: [0, 1],
        duration: animations.config.duration * 0.7,
        delay: anime.stagger(150),
        easing: 'easeOutQuad'
    });
    
    // Animate the cards
    anime({
        targets: elements.cards,
        translateY: [30, 0],
        opacity: [0, 1],
        duration: animations.config.duration * 0.8,
        delay: anime.stagger(200),
        easing: 'easeOutQuad'
    });
}

// Animate track list items
function animateTrackList() {
    const trackItems = document.querySelectorAll('#top-tracks-list li');
    
    anime({
        targets: trackItems,
        translateX: [-50, 0],
        opacity: [0, 1],
        duration: 700,
        delay: anime.stagger(100),
        easing: 'easeOutQuad'
    });
}

// Create 3D effect for cards
function create3DCardEffect() {
    elements.cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const bounds = card.getBoundingClientRect();
            const mouseX = e.clientX - bounds.left;
            const mouseY = e.clientY - bounds.top;
            const centerX = bounds.width / 2;
            const centerY = bounds.height / 2;
            
            const angleX = (mouseY - centerY) / 30;
            const angleY = (centerX - mouseX) / 30;
            
            anime({
                targets: card,
                rotateX: -angleX + 'deg',
                rotateY: angleY + 'deg',
                translateZ: '10px',
                boxShadow: `${angleY/3}px ${-angleX/3}px 25px rgba(0, 0, 0, 0.4)`,
                duration: 100,
                easing: 'linear'
            });
        });
        
        card.addEventListener('mouseleave', () => {
            anime({
                targets: card,
                rotateX: '0deg',
                rotateY: '0deg',
                translateZ: '0px',
                boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
                duration: 600,
                easing: 'easeOutElastic(1, .5)'
            });
        });
    });
}

// Animate chart creation
function animateChart() {
    anime({
        targets: '.chart-container',
        opacity: [0, 1],
        scale: [0.9, 1],
        duration: 800,
        easing: 'easeOutQuad'
    });
}

// Animate error message
function animateErrorMessage() {
    anime({
        targets: elements.errorContainer,
        translateY: [-20, 0],
        opacity: [0, 1],
        duration: 400,
        easing: 'easeOutQuad'
    });
}

// Create ripple effect for buttons
function createRippleEffect(event, element) {
    const circle = document.createElement('div');
    const diameter = Math.max(element.clientWidth, element.clientHeight);
    const radius = diameter / 2;
    
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - element.getBoundingClientRect().left - radius}px`;
    circle.style.top = `${event.clientY - element.getBoundingClientRect().top - radius}px`;
    circle.classList.add('ripple');
    
    const ripple = element.querySelector('.ripple');
    if (ripple) {
        ripple.remove();
    }
    
    element.appendChild(circle);
    
    anime({
        targets: circle,
        scale: [0, 1],
        opacity: [0.7, 0],
        duration: 600,
        easing: 'easeOutQuad',
        complete: function() {
            circle.remove();
        }
    });
}

// Token storage
let accessToken = '';
let tokenExpiration = 0;

// Show/hide loader
function toggleLoader(show) {
    if (show) {
        anime({
            targets: elements.loader,
            opacity: [0, 1],
            duration: 400,
            easing: 'easeInOutQuad',
            begin: function() {
                elements.loader.classList.add('active');
                
                // Animate the spinner
                anime({
                    targets: '.spinner',
                    rotate: '360deg',
                    duration: 1000,
                    loop: true,
                    easing: 'linear'
                });
            }
        });
    } else {
        anime({
            targets: elements.loader,
            opacity: [1, 0],
            duration: 400,
            easing: 'easeInOutQuad',
            complete: function() {
                elements.loader.classList.remove('active');
            }
        });
    }
}    

// Show error message with animation
function showError(message) {
    elements.errorContainer.textContent = message;
    elements.errorContainer.style.display = 'block';
    
    // Animate the error message
    animateErrorMessage();

    setTimeout(() => {
        anime({
            targets: elements.errorContainer,
            translateY: [0, -20],
            opacity: [1, 0],
            duration: 400,
            easing: 'easeInQuad',
            complete: function() {
                elements.errorContainer.style.display = 'none';
            }
        });
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
        
        // Hide old content with animation before loading new
        anime({
            targets: [elements.artistInfo, elements.analyticsContainer],
            opacity: 0,
            translateY: 10,
            duration: 300,
            easing: 'easeInQuad',
            complete: async function() {
                await getArtistInfo(artistId);
                
                // Animation will be handled in getArtistInfo
            }
        });
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
        
        // Animate the content back in
        anime({
            targets: [elements.artistInfo, elements.analyticsContainer],
            opacity: [0, 1],
            translateY: [10, 0],
            duration: 800,
            delay: anime.stagger(150),
            easing: 'easeOutQuad',
            complete: function() {
                // Animate individual elements
                animateContentLoad();
                animateTrackList();
                
                // Create 3D card effects
                create3DCardEffect();
                
                // Animate the chart
                animateChart();
            }
        });
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
        // Use animation when updating the image
        anime({
            targets: elements.artistImage,
            opacity: [1, 0],
            scale: [1, 0.9],
            duration: 300,
            easing: 'easeInQuad',
            complete: function() {
                elements.artistImage.src = artistData.images[0]?.url || '';
                elements.artistImage.alt = `Imagen de ${artistData.name}`;
                
                anime({
                    targets: elements.artistImage,
                    opacity: [0, 1],
                    scale: [0.9, 1],
                    duration: 500,
                    easing: 'easeOutQuad'
                });
            }
        });
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
        
    // After populating, animate the tracks
    animateTrackList();
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
    
    // Animate the chart container before drawing
    anime({
        targets: '.chart-container',
        scale: [0.8, 1],
        opacity: [0, 1],
        duration: 600,
        easing: 'easeOutQuad',
        complete: function() {
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
                    animation: {
                        duration: 1500,
                        easing: 'easeOutQuart'
                    },
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
        }
    });
    
    // Update the section title
    const audioAnalysisTitle = document.querySelector('.audio-analysis h2');
    if (audioAnalysisTitle) {
        audioAnalysisTitle.innerHTML = '<i class="fas fa-chart-pie"></i> Análisis de Popularidad';
    }
}

// Change background color with a smoother animation
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
                
                // Create a more interesting background with gradients
                anime({
                    targets: 'body',
                    backgroundImage: [
                        'linear-gradient(135deg, #1e3c72, #2a5298)',
                        `linear-gradient(135deg, rgb(${r},${g},${b}), rgb(${r/2},${g/2},${b*1.5}))`
                    ],
                    duration: 1800,
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
    // Initialize animations
    initAnimations();
    
    // Add event listener for search button with ripple effect
    elements.searchButton.addEventListener('click', (e) => {
        // Create ripple effect
        createRippleEffect(e, elements.searchButton);
        
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
    
    // Add floating animation to artist image
    anime({
        targets: '.image-container',
        translateY: [-5, 5],
        duration: 3000,
        direction: 'alternate',
        loop: true,
        easing: 'easeInOutQuad'
    });
    
    // Create 3D card effect
    create3DCardEffect();

    // Initialize with default artist
    getArtistInfo('7jy3rLJdDQY21OgRLCZ9sD'); // Foo Fighters
});