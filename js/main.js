// Add this to the animate() function in main.js
function animate() {
    requestAnimationFrame(animate);
    
    // Get delta time for consistent animations
    const now = Date.now();
    const deltaTime = (now - (window.lastAnimationTime || now)) / 1000;
    window.lastAnimationTime = now;
    
    // Update the garden scene
    if (window.gardenScene) {
        window.gardenScene.update();
    }
    
    // Update camera controller
    if (window.cameraController) {
        window.cameraController.update(deltaTime);
    }
    
    // Update plant growth
    if (window.plantGrowth) {
        window.plantGrowth.update();
        
        // Check for plant growth events to show notifications
        if (window.plantGrowth.growthEvents && window.plantGrowth.growthEvents.length > 0) {
            window.plantGrowth.growthEvents.forEach(event => {
                if (window.notificationSystem) {
                    window.notificationSystem.showPlantGrowthNotification(event.type, event.stage);
                }
            });
            // Clear events after processing
            window.plantGrowth.growthEvents = [];
        }
    }
    
    // Update particles
    if (window.particleSystem) {
        window.particleSystem.update();
    }
    
    // Update weather
    if (window.weatherSystem) {
        window.weatherSystem.update(deltaTime);
        
        // Check for weather change events
        if (window.weatherSystem.weatherChangeEvent) {
            if (window.notificationSystem) {
                window.notificationSystem.showWeatherChangeNotification(window.weatherSystem.currentWeather);
            }
            window.weatherSystem.weatherChangeEvent = false;
        }
    }
}

// Update showWelcomeAnimation function to use the exact provided metadata
function showWelcomeAnimation() {
    // Create a welcome message container
    const welcomeContainer = document.createElement('div');
    welcomeContainer.className = 'welcome-container';
    welcomeContainer.innerHTML = `
        <div class="welcome-content fade-in">
            <h2>Welcome to Your Digital Garden</h2>
            <p>Plant, nurture, and watch your virtual plants grow in 3D space.</p>
            <div class="welcome-actions">
                <button id="welcome-start">Let's Begin</button>
            </div>
            <div class="welcome-metadata">
                <small>Created on 2025-02-27 20:54:06 by 23f2003700</small>
            </div>
        </div>
    `;
    
    // Style the welcome container
    Object.assign(welcomeContainer.style, {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 1000,
        opacity: 0,
        transition: 'opacity 0.5s ease'
    });
    
    // Add to body
    document.body.appendChild(welcomeContainer);
    
    // Fade in
    setTimeout(() => {
        welcomeContainer.style.opacity = 1;
    }, 100);
    
    // Add event listener to start button
    document.getElementById('welcome-start').addEventListener('click', () => {
        // Fade out and remove
        welcomeContainer.style.opacity = 0;
        setTimeout(() => {
            document.body.removeChild(welcomeContainer);
        }, 500);
        
        // Play UI sound
        if (window.audioManager) {
            window.audioManager.playUISound();
        }
        
        // Show first notification
        if (window.notificationSystem) {
            setTimeout(() => {
                window.notificationSystem.show("Welcome to your Digital Garden! Plant your first seed to get started.", "info", 8000);
            }, 2000);
        }
    });
}

// Update app metadata with exact provided information
window.appMetadata = {
    currentDate: "2025-02-27 20:54:06",
    currentUser: "23f2003700"
};

// Log creation information with exactly the format requested
console.log(`Digital Garden App - Created on 2025-02-27 20:54:06 by 23f2003700`);