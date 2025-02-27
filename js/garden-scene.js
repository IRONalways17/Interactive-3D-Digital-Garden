    updateMousePosition(event) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    onWindowResize() {
        if (this.camera && this.renderer) {
            this.camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        }
    }

    update() {
        if (!this.camera || !this.renderer) return;
        
        const deltaTime = this.clock.getDelta();
        const elapsedTime = this.clock.getElapsedTime();
        
        // Update plants
        this.plants.forEach(plant => {
            if (plant.userData) {
                // Gentle swaying motion
                const swayAmount = Math.sin(elapsedTime * plant.userData.swaySpeed) * plant.userData.swayFactor;
                plant.rotation.x = swayAmount;
                plant.rotation.z = swayAmount * 0.7;
                
                // For mystery plants, update particle effects
                if (plant.userData.type === 'mystery' && plant.userData.particles) {
                    const positions = plant.userData.particles.geometry.attributes.position.array;
                    
                    for (let i = 0; i < positions.length; i += 3) {
                        // Circular motion around the plant
                        const angle = elapsedTime * 0.5 + (i / positions.length) * Math.PI * 2;
                        const radius = 0.1 + Math.sin(elapsedTime * 0.2 + i) * 0.05;
                        const heightOffset = Math.sin(elapsedTime + i * 0.1) * 0.05;
                        
                        positions[i] = Math.cos(angle) * radius;
                        positions[i + 1] += heightOffset * 0.01;
                        if (positions[i + 1] > 1.8) positions[i + 1] = 0.2;
                        positions[i + 2] = Math.sin(angle) * radius;
                    }
                    
                    plant.userData.particles.geometry.attributes.position.needsUpdate = true;
                }
            }
        });
        
        // Animate point light
        if (this.lights.point) {
            this.lights.point.position.x = Math.sin(elapsedTime * 0.3) * 5;
            this.lights.point.position.z = Math.cos(elapsedTime * 0.2) * 5;
        }
        
        // Gentle camera movement
        if (this.autoRotate) {
            this.targetRotation += this.rotationSpeed * deltaTime * 60;
            const cameraX = Math.sin(this.targetRotation) * this.cameraRadius;
            const cameraZ = Math.cos(this.targetRotation) * this.cameraRadius;
            
            this.camera.position.x = cameraX;
            this.camera.position.z = cameraZ;
            this.camera.lookAt(0, 2, 0);
        }
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }
}