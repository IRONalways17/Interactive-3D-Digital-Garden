    createWaterParticles() {
        // Create water droplets over the garden
        const particleCount = 200;
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * 10;
            positions[i3 + 1] = 10;
            positions[i3 + 2] = (Math.random() - 0.5) * 10;
        }
        
        this.createParticleGroup('water', positions, particleCount);
    }
    
    createSunlightParticles() {
        // Create sunlight particles descending from above
        const particleCount = 150;
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 5;
            
            positions[i3] = Math.cos(angle) * radius;
            positions[i3 + 1] = 8 + Math.random() * 4;
            positions[i3 + 2] = Math.sin(angle) * radius;
        }
        
        this.createParticleGroup('sunlight', positions, particleCount);
    }
    
    createGrowthParticles(position) {
        // Create growth particles around a specific plant position
        const particleCount = 30;
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            positions[i3] = position.x + (Math.random() - 0.5) * 0.5;
            positions[i3 + 1] = position.y + Math.random() * 0.5;
            positions[i3 + 2] = position.z + (Math.random() - 0.5) * 0.5;
        }
        
        this.createParticleGroup('growth', positions, particleCount);
    }
    
    createParticleGroup(type, positions, count) {
        const particleType = this.particleTypes[type];
        
        if (!particleType) {
            console.error(`Invalid particle type: ${type}`);
            return;
        }
        
        // Create particle geometry
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        // Store original positions for animation
        const originalPositions = positions.slice();
        
        // Create additional attributes for animation
        const velocities = new Float32Array(count * 3);
        const startTimes = new Float32Array(count);
        const now = Date.now();
        
        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            const velocity = particleType.velocityFunc();
            
            velocities[i3] = velocity.x;
            velocities[i3 + 1] = velocity.y;
            velocities[i3 + 2] = velocity.z;
            
            // Stagger start times slightly
            startTimes[i] = now + Math.random() * 500;
        }
        
        // Create particle material
        const material = new THREE.PointsMaterial({
            color: particleType.color,
            size: particleType.size,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        // Create particle system
        const particleSystem = new THREE.Points(geometry, material);
        this.scene.add(particleSystem);
        
        // Add to managed groups
        this.particleGroups.push({
            system: particleSystem,
            type: type,
            count: count,
            originalPositions: originalPositions,
            velocities: velocities,
            startTimes: startTimes,
            creationTime: now,
            lifetime: particleType.lifetime
        });
        
        // Schedule removal after lifetime
        setTimeout(() => {
            this.removeParticleGroup(particleSystem);
        }, particleType.lifetime + 1000);
    }
    
    removeParticleGroup(particleSystem) {
        const index = this.particleGroups.findIndex(group => group.system === particleSystem);
        
        if (index !== -1) {
            const group = this.particleGroups[index];
            
            // Remove from scene
            this.scene.remove(group.system);
            
            // Dispose resources
            group.system.geometry.dispose();
            group.system.material.dispose();
            
            // Remove from managed groups
            this.particleGroups.splice(index, 1);
        }
    }
    
    update() {
        const now = Date.now();
        
        // Update each particle group
        this.particleGroups.forEach(group => {
            const positions = group.system.geometry.attributes.position.array;
            const originalPositions = group.originalPositions;
            const velocities = group.velocities;
            const startTimes = group.startTimes;
            const elapsed = now - group.creationTime;
            const lifetime = group.lifetime;
            
            // Skip if the group is past its lifetime
            if (elapsed > lifetime + 1000) return;
            
            let needsUpdate = false;
            
            for (let i = 0; i < group.count; i++) {
                const i3 = i * 3;
                const particleStartTime = startTimes[i];
                const particleElapsed = now - particleStartTime;
                
                // Skip if this particle hasn't started yet
                if (particleElapsed < 0) continue;
                
                // Calculate normalized age (0 to 1)
                const age = Math.min(particleElapsed / lifetime, 1);
                
                // Update position based on velocity and age
                if (age < 1) {
                    positions[i3] = originalPositions[i3] + velocities[i3] * particleElapsed / 1000;
                    positions[i3 + 1] = originalPositions[i3 + 1] + velocities[i3 + 1] * particleElapsed / 1000;
                    positions[i3 + 2] = originalPositions[i3 + 2] + velocities[i3 + 2] * particleElapsed / 1000;
                    needsUpdate = true;
                }
                
                // If it's a water particle, check for collision with ground
                if (group.type === 'water') {
                    // Simple ground collision - stop at y=0
                    if (positions[i3 + 1] < 0) {
                        positions[i3 + 1] = 0;
                        
                        // Create a splash particle effect
                        if (Math.random() < 0.1) {
                            const splashPos = new THREE.Vector3(
                                positions[i3],
                                0,
                                positions[i3 + 2]
                            );
                            this.createSplash(splashPos);
                        }
                    }
                }
            }
            
            // Update opacity based on overall age
            if (group.system.material.opacity) {
                // Fade in quickly, then fade out towards the end
                if (elapsed < 300) {
                    group.system.material.opacity = elapsed / 300 * 0.8;
                } else if (elapsed > lifetime * 0.7) {
                    group.system.material.opacity = 0.8 * (1 - (elapsed - lifetime * 0.7) / (lifetime * 0.3));
                }
            }
            
            // Update geometry if needed
            if (needsUpdate) {
                group.system.geometry.attributes.position.needsUpdate = true;
            }
        });
    }
    
    createSplash(position) {
        // Create small splash effect when water hits ground
        const particleCount = 10;
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            positions[i3] = position.x;
            positions[i3 + 1] = position.y;
            positions[i3 + 2] = position.z;
        }
        
        // Create custom type for splash
        const splashType = {
            color: 0x99ddff,
            size: 0.03,
            lifetime: 500,
            velocityFunc: () => ({
                x: (Math.random() - 0.5) * 0.2,
                y: 0.05 + Math.random() * 0.1,
                z: (Math.random() - 0.5) * 0.2
            })
        };
        
        // Store original type and replace temporarily
        const originalType = this.particleTypes['splash'];
        this.particleTypes['splash'] = splashType;
        
        // Create the particle group
        this.createParticleGroup('splash', positions, particleCount);
        
        // Restore original type if it existed
        if (originalType) {
            this.particleTypes['splash'] = originalType;
        } else {
            delete this.particleTypes['splash'];
        }
    }
}