class NotificationSystem {
    constructor() {
        this.notificationContainer = null;
        this.notifications = [];
        this.maxNotifications = 3;
        this.init();
    }
    
    init() {
        // Create notification container
        this.notificationContainer = document.createElement('div');
        this.notificationContainer.className = 'notification-container';
        document.body.appendChild(this.notificationContainer);
    }
    
    show(message, type = 'info', duration = 5000) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type} fade-in`;
        
        // Add icon based on type
        let icon = '📌';
        switch (type) {
            case 'success':
                icon = '🌱';
                break;
            case 'warning':
                icon = '💧';
                break;
            case 'error':
                icon = '⚠️';
                break;
            case 'growth':
                icon = '🌿';
                break;
            case 'weather':
                icon = '☁️';
                break;
        }
        
        // Set content
        notification.innerHTML = `
            <span class="notification-icon">${icon}</span>
            <span class="notification-message">${message}</span>
            <span class="notification-close">×</span>
        `;
        
        // Add to container
        this.notificationContainer.prepend(notification);
        
        // Add to tracking array
        this.notifications.push(notification);
        
        // Remove excess notifications
        while (this.notifications.length > this.maxNotifications) {
            this.removeOldestNotification();
        }
        
        // Set up close button
        const closeButton = notification.querySelector('.notification-close');
        closeButton.addEventListener('click', () => {
            this.remove(notification);
        });
        
        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => {
                this.remove(notification);
            }, duration);
        }
        
        // Play notification sound
        if (window.audioManager) {
            window.audioManager.playUISound();
        }
        
        return notification;
    }
    
    remove(notification) {
        if (!notification || !this.notificationContainer.contains(notification)) return;
        
        // Add fade-out class
        notification.classList.add('fade-out');
        
        // Remove from DOM after animation
        setTimeout(() => {
            if (notification.parentNode === this.notificationContainer) {
                this.notificationContainer.removeChild(notification);
            }
            
            // Remove from tracking array
            const index = this.notifications.indexOf(notification);
            if (index !== -1) {
                this.notifications.splice(index, 1);
            }
        }, 500); // Match the CSS animation duration
    }
    
    removeOldestNotification() {
        if (this.notifications.length === 0) return;
        
        const oldest = this.notifications[this.notifications.length - 1];
        this.remove(oldest);
    }
    
    showPlantGrowthNotification(plantType, stage) {
        let message;
        
        switch (plantType) {
            case 'flower':
                message = stage === 1 ? "Your flower has sprouted!" : 
                          stage === 2 ? "Your flower is developing buds!" : 
                          "Your flower is in full bloom!";
                break;
            case 'tree':
                message = stage === 1 ? "Your tree seedling has emerged!" : 
                          stage === 2 ? "Your tree is growing taller!" : 
                          stage === 3 ? "Your tree is developing branches!" : 
                          "Your tree has reached maturity!";
                break;
            case 'succulent':
                message = stage === 1 ? "Your succulent has rooted!" : 
                          "Your succulent has grown new leaves!";
                break;
            case 'mystery':
                message = stage === 1 ? "Something mysterious is sprouting!" : 
                          stage === 2 ? "Your mystery plant is glowing!" : 
                          stage === 3 ? "Crystal formations are appearing!" : 
                          stage === 4 ? "Energy pulses within your mystery plant!" : 
                          "Your mystery plant has reached its final form!";
                break;
            default:
                message = "Your plant has grown!";
        }
        
        return this.show(message, 'growth', 6000);
    }
    
    showWeatherChangeNotification(weatherType) {
        let message;
        
        switch (weatherType) {
            case 'cloudy':
                message = "Clouds are gathering in the sky.";
                break;
            case 'rainy':
                message = "It's starting to rain! Plants are being watered naturally.";
                break;
            case 'stormy':
                message = "A storm is brewing! Take shelter!";
                break;
            case 'clear':
                message = "The skies are clearing up.";
                break;
            default:
                message = "Weather conditions are changing.";
        }
        
        return this.show(message, 'weather', 7000);
    }
    
    showLowResourceWarning(resource) {
        let message;
        
        switch (resource) {
            case 'water':
                message = "Your plants are thirsty! Add some water soon.";
                break;
            case 'sunlight':
                message = "Your plants need more sunlight to thrive.";
                break;
            default:
                message = "Your garden needs attention!";
        }
        
        return this.show(message, 'warning', 8000);
    }
}

// Create global instance
window.notificationSystem = new NotificationSystem();

// Update app metadata
window.appMetadata = {
    currentDate: "2025-02-27 20:54:06",
    currentUser: "23f2003700"
};

// Log creation information
console.log(`Digital Garden App - Notification system initialized`);
console.log(`Created on 2025-02-27 20:54:06 by 23f2003700`);