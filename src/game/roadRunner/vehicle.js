export function createVehicle(scene, color = 0xf97316, label = '', textureKey = null) {
  const node = scene.add.container(80, 500);
  node.add(scene.add.ellipse(0, 20, 82, 18, 0x000000, 0.20));

  if (textureKey && scene.textures.exists(textureKey)) {
    const image = scene.add.image(0, 0, textureKey);
    image.setOrigin(0.5, 0.5);
    image.setDisplaySize(96, 48);
    node.add(image);
    node.assetImage = image;
  } else {
    node.add(scene.add.roundRectangle(0, 0, 62, 26, 9, color).setStrokeStyle(3, 0x172033));
    node.add(scene.add.roundRectangle(-5, -8, 30, 18, 5, 0xfef3c7).setStrokeStyle(2, 0x172033));
    const frontWheel = scene.add.circle(21, 16, 8, 0x111827).setStrokeStyle(2, 0xcbd5e1);
    const rearWheel = scene.add.circle(-22, 16, 8, 0x111827).setStrokeStyle(2, 0xcbd5e1);
    node.add([frontWheel, rearWheel]);
    node.frontWheel = frontWheel;
    node.rearWheel = rearWheel;
  }

  if (label) {
    node.add(scene.add.text(-32, -42, label, {
      fontSize: '11px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    }));
  }

  return node;
}

export function updateVehicleWheels(vehicle, speed, dt) {
  if (!vehicle.frontWheel || !vehicle.rearWheel) return;
  vehicle.frontWheel.rotation += speed * dt * 0.08;
  vehicle.rearWheel.rotation += speed * dt * 0.08;
}
