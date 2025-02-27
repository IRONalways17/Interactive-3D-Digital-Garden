class PlantGrowth {
    constructor(gardenScene) {
        this.gardenScene = gardenScene;
        this.plants = [];
        this.lastUpdateTime = Date.now();
        this.simulationSpeed = 1; // Faster = quicker plant growth
        this.growthTimeBase = 10000; // Base time in ms for growth stages
        
        // Register for terrain click events
        this.gardenScene.canvas.addEventListener('terrain-click', this.handleTerrainClick.bind(this));
        
        // Initialize garden age calculation
        this.gardenCreationTime = Date.now();
        this.updateGardenAge();
        setInterval(() => this.updateGardenAge(), 60000); // Update garden age every minute
    }
    
    handleTerrainClick(event) {
        const position = event.detail.position;
        this.addPlantAtPosition(position);
    }
    
    addPlant(type) {
        // Generate a random position if not clicked on terrain
        const x = (Math.random() - 0.5) * 10;
        const z = (Math.random() - 0.5) * 10;
        const position = new THREE.Vector3(x, 0, z);
        
        return this.addPlantAtPosition(position, type);
    }
    
    addPlantAtPosition(position, type = null) {
        // If type is not specified, use the selected type from UI
        if (!type) {
            const selectedElement = document.querySelector('.plant-type.selected');
            type = selectedElement ? selectedElement.getAttribute('data-type') : 'flower';
        }
        
        // Adjust y position to be on the ground
        const terrainHeight = this.getTerrainHeightAt(position.x, position.z);
        position.y = terrainHeight;
        
        // Create the 3D plant object
        const plant = this.gardenScene.addPlant(position, type);
        
        // Add to our managed list with additional properties
        this.plants.push({
            object: plant,
            position: position.clone(),
            type: type,
            plantedTime: Date.now(),
            lastWatered: Date.now(),
            lastSunlight: Date.now(),
            growthStage: 0,
            targetScale: new THREE.Vector3(0.1, 0.1, 0.1),
            currentScale: new THREE.Vector3(0.1, 0.1, 0.1)
        });
        
        return plant;
    }
    
    waterPlants() {
        const now = Date.now();
        
        this.plants.forEach(plant => {
            plant.lastWatered = now;
            
            // Increase water level in plant userData
            if (plant.object.userData) {
                plant.object.userData.waterLevel = Math.min(100, plant.object.userData.waterLevel + 30);
                
                // Pulse animation for watering
                this.pulseAnimation(plant.object);
            }
        });
    }
    
    addSunlight() {
        const now = Date.now();
        
        this.plants.forEach(plant => {
            plant.lastSunlight = now;
            
            // Increase sunlight level in plant userData
            if (plant.object.userData) {
                plant.object.userData.sunlight = Math.min(100, plant.object.userData.sunlight + 40);
                
                // Glow animation for sunlight
                this.glowAnimation(plant.object);
            }
        });
    }
    
    pulseAnimation(object) {
        // Save the original scale
        const originalScale = object.scale.clone();
        
        // Animate scale up
        gsap.to(object.scale, {
            x: originalScale.x * 1.2,
            y: originalScale.y * 1.2,
            z: originalScale.z * 1.2,
            duration: 0.5,
            ease: "power1.out",
            onComplete: () => {
                // Animate back to original scale
                gsap.to(object.scale, {
                    x: originalScale.x,
                    y: originalScale.y,
                    z: originalScale.z,
                    duration: 0.5,
                    ease: "power1.in"
                });
            }
        });
    }
    
    glowAnimation(object) {
        // Create temporary glow effect
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffaa,
            transparent: true,
            opacity: 0.6
        });
        
        // Clone the object geometry for the glow effect
        const glowMesh = object.clone();
        
        // Replace all materials with the glow material
        glowMesh.traverse(child => {
            if (child.isMesh) {
                child.material = glowMaterial;
            }
        });
        
        // Make the glow slightly larger
        glowMesh.scale.multiplyScalar(1.1);
        
        // Add to scene
        this.gardenScene.scene.add(glowMesh);
        
        // Animate the glow effect
        gsap.to(glowMaterial, {
            opacity: 0,
            duration: 1.5,
            ease: "power2.out",
            onComplete: () => {
                this.gardenScene.scene.remove(glowMesh);
                glowMesh.traverse(child => {
                    if (child.geometry) child.geometry.dispose();
                    if (child.material) child.material.dispose();
                });
            }
        });
    }
    
    update() {
        const now = Date.now();
        const deltaTime = now - this.lastUpdateTime;
        this.lastUpdateTime = now;
        
        // Skip if delta is too large (probably tab was inactive)
        if (deltaTime > 5000) return;
        
        // Update each plant
        this.plants.forEach(plant => {
            // Skip if plant object is no longer valid
            if (!plant.object || !plant.object.userData) return;
            
            const userData = plant.object.userData;
            
            // Calculate growth progress
            const plantAge = now - plant.plantedTime;
            const waterFactor = userData.waterLevel / 100;
            const sunlightFactor = userData.sunlight / 100;
            const growthFactor = waterFactor * sunlightFactor * this.simulationSpeed;
            
            // Slowly decrease water and sunlight levels
            userData.waterLevel = Math.max(0, userData.waterLevel - 0.01 * deltaTime / 1000);
            userData.sunlight = Math.max(0, userData.sunlight - 0.02 * deltaTime / 1000);
            
            // Calculate health based on water and sunlight
            userData.health = (userData.waterLevel + userData.sunlight) / 2;
            
            // Update age
            userData.age = plantAge / 1000; // in seconds
            
            // Check for growth stage advancement
            const nextStageTime = (userData.growthStage + 1) * this.growthTimeBase / growthFactor;
            
            if (plantAge > nextStageTime && userData.growthStage < userData.maxStage) {
                // Advance to next growth stage
                userData.growthStage++;
                
                // Calculate new target scale based on growth stage
                const baseScale = 0.7 + (userData.growthStage / userData.maxStage) * 0.5;
                plant.targetScale.set(baseScale, baseScale, baseScale);
                
                // Add some randomness to make each plant unique
                plant.targetScale.x *= 0.9 + Math.random() * 0.2;
                plant.targetScale.y *= 0.9 + Math.random() * 0.2;
                plant.targetScale.z *= 0.9 + Math.random() * 0.2;
            }
            
            // Smooth scale interpolation
            plant.currentScale.lerp(plant.targetScale, 0.01);
            plant.object.scale.copy(plant.currentScale);
            
            // Apply health effects
            if (userData.health < 30) {
                // Plants droop when unhealthy
                plant.object.rotation.x = Math.max(plant.object.rotation.x, -(30 - userData.health) * 0.01);
            }
        });
        
        // Update garden stats
        this.updateGardenStats();
    }
    
    getTerrainHeightAt(x, z) {
        // Simple simulation of terrain height based on the same function used in terrain generation
        const distance = Math.sqrt(x * x + z * z);
        return Math.sin(distance * 0.3) * 0.5 + 
               Math.sin(x * 0.5) * 0.2 + 
               Math.sin(z * 0.4) * 0.3;
    }
    
    getPlantCount() {
        return this.plants.length;
    }
    
    updateGardenAge() {
        const now = Date.now();
        const ageInDays = Math.floor((now - this.gardenCreationTime) / (1000 * 60 * 60 * 24));
        const ageText = ageInDays === 0 ? '1 day' : `${ageInDays + 1} days`;
        document.getElementById('garden-age').textContent = ageText;
    }
    
    updateGardenStats() {
        // Only update periodically to avoid excessive DOM updates
        if (Date.now() - this.lastStatsUpdate < 1000) return;
        this.lastStatsUpdate = Date.now();
        
        // Calculate average garden health
        let totalHealth = 0;
        this.plants.forEach(plant => {
            if (plant.object && plant.object.userData) {
                totalHealth += plant.object.userData.health || 0;
            }
        });
        
        const averageHealth = this.plants.length ? Math.round(totalHealth / this.plants.length) : 100;
        document.getElementById('garden-health').textContent = `${averageHealth}%`;
        
        // Update plants count
        document.getElementById('plants-count').textContent = this.plants.length;
    }
}