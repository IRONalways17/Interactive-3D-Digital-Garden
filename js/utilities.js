const material = new THREE.MeshPhongMaterial({
    color: color,
    transparent: true,
    opacity: dark ? 0.9 : 0.7,
    flatShading: true
});

const sphere = new THREE.Mesh(geometry, material);
sphere.position.set(
    (Math.random() - 0.5) * 2,
    Math.random() * 0.5,
    (Math.random() - 0.5) * 2
);
cloudGroup.add(sphere);
}

// Position the cloud
const angle = (i / cloudCount) * Math.PI * 2;
const radius = 8 + Math.random() * 8;
cloudGroup.position.set(
Math.cos(angle) * radius,
10 + Math.random() * 5,
Math.sin(angle) * radius
);

// Add random rotation
cloudGroup.rotation.y = Math.random() * Math.PI * 2;

// Add movement data
cloudGroup.userData = {
speed: 0.01 + Math.random() * 0.02,
rotationSpeed: (Math.random() - 0.5) * 0.003,
originalY: cloudGroup.position.y,
bobAmount: 0.05 + Math.random() * 0.1,
bobSpeed: 0.3 + Math.random() * 0.5
};

this.clouds.add(cloudGroup);
}

this.scene.add(this.clouds);
}

setupLightning() {
this.lightning = {
active: false,
lastFlash: 0,
interval: null,
light: new THREE.PointLight(0xffffff, 0, 100)
};

// Add light
this.lightning.light.position.set(0, 15, 0);
this.scene.add(this.lightning.light);

// Set up interval for random lightning strikes
this.lightning.interval = setInterval(() => {
// Random chance to trigger lightning
if (Math.random() < 0.2) {
this.flashLightning();
}
}, 5000);
}

flashLightning() {
if (!this.lightning || this.lightning.active) return;

this.lightning.active = true;
this.lightning.lastFlash = Date.now();

// Create flash
this.lightning.light.intensity = 2;

// Play thunder sound with delay
setTimeout(() => {
if (window.audioManager) {
window.audioManager.play('thunder');
}
}, 200 + Math.random() * 1000);

// Lightning duration
setTimeout(() => {
// Fade out
gsap.to(this.lightning.light, {
intensity: 0,
duration: 0.2,
onComplete: () => {
    this.lightning.active = false;
}
});

// 30% chance for a second flash
if (Math.random() < 0.3) {
setTimeout(() => this.flashLightning(), 200 + Math.random() * 300);
}
}, 100 + Math.random() * 100);
}

updateLighting(weatherType) {
if (!this.gardenScene.lights) return;

const lights = this.gardenScene.lights;

switch (weatherType) {
case 'clear':
if (lights.directional) {
    lights.directional.intensity = this.gardenScene.isDarkMode ? 0.7 : 0.8;
}
if (lights.ambient) {
    lights.ambient.intensity = 0.5;
}
break;

case 'cloudy':
if (lights.directional) {
    lights.directional.intensity = this.gardenScene.isDarkMode ? 0.5 : 0.6;
}
if (lights.ambient) {
    lights.ambient.intensity = 0.6;
}
break;

case 'rainy':
if (lights.directional) {
    lights.directional.intensity = this.gardenScene.isDarkMode ? 0.3 : 0.4;
}
if (lights.ambient) {
    lights.ambient.intensity = 0.4;
}
break;

case 'stormy':
if (lights.directional) {
    lights.directional.intensity = this.gardenScene.isDarkMode ? 0.2 : 0.3;
}
if (lights.ambient) {
    lights.ambient.intensity = 0.3;
}
break;
}
}

update(deltaTime) {
// Update raindrops
if (this.raindrops) {
const positions = this.raindrops.geometry.attributes.position.array;
const count = positions.length / 3;

for (let i = 0; i < count; i++) {
const i3 = i * 3;

// Apply velocity
positions[i3 + 1] += this.raindrops.userData.velocityY + 
    (Math.random() - 0.5) * this.raindrops.userData.velocityVariation;

// Reset if below ground
if (positions[i3 + 1] < 0) {
    positions[i3] = (Math.random() - 0.5) * 20;
    positions[i3 + 1] = 15;
    positions[i3 + 2] = (Math.random() - 0.5) * 20;
}
}

this.raindrops.geometry.attributes.position.needsUpdate = true;
}

// Update clouds
if (this.clouds) {
const time = Date.now() * 0.001;

this.clouds.children.forEach(cloud => {
// Circular movement
cloud.position.x += Math.sin(time * 0.2) * 0.01;
cloud.position.z += Math.cos(time * 0.2) * 0.01;

// Rotation
cloud.rotation.y += cloud.userData.rotationSpeed;

// Bob up and down
cloud.position.y = cloud.userData.originalY + 
    Math.sin(time * cloud.userData.bobSpeed) * cloud.userData.bobAmount;
});
}

// Update lightning
if (this.lightning && this.lightning.active) {
const flashDuration = Date.now() - this.lightning.lastFlash;

if (flashDuration > 300) {
this.lightning.active = false;
this.lightning.light.intensity = 0;
}
}
}
}

// Export utilities
window.DigitalGardenUtils = {
CameraController,
GardenAnalytics,
WeatherSystem,
currentDate: "2025-02-27 20:42:38",
currentUser: "23f2003700"
};