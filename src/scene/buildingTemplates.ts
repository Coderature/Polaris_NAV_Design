import * as THREE from 'three';

const PLACEHOLDER_MAT = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.55, metalness: 0.05 });

function stubPlaceholder(name: string): THREE.Group {
  console.log('TODO: ' + name);
  const group = new THREE.Group();
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), PLACEHOLDER_MAT);
  mesh.position.y = 0.5;
  group.add(mesh);
  return group;
}

export function createBoeing(): THREE.Group {
  return stubPlaceholder('Boeing');
}

export function createExxonMobil(): THREE.Group {
  return stubPlaceholder('Exxon Mobil');
}

export function createSamsungFab(): THREE.Group {
  return stubPlaceholder('Samsung Fab');
}

export function createSOilRefinery(): THREE.Group {
  return stubPlaceholder('S-Oil Refinery');
}

export function createLGEnergySolution(): THREE.Group {
  return stubPlaceholder('LG Energy Solution');
}

export function createHyundaiMotor(): THREE.Group {
  return stubPlaceholder('Hyundai Motor');
}

export function createTesla(): THREE.Group {
  return stubPlaceholder('Tesla');
}

export function createAppleCampus(): THREE.Group {
  return stubPlaceholder('Apple Campus');
}

export function createAmazonWarehouse(): THREE.Group {
  return stubPlaceholder('Amazon Warehouse');
}

export function createGoogleDC(): THREE.Group {
  return stubPlaceholder('Google DC');
}

export function createBankOfAmerica(): THREE.Group {
  return stubPlaceholder('Bank of America');
}

export function createAlibaba(): THREE.Group {
  return stubPlaceholder('Alibaba');
}

export function createPdd(): THREE.Group {
  return stubPlaceholder('PDD Holdings');
}

export function createSamsungBiologics(): THREE.Group {
  return stubPlaceholder('Samsung Biologics');
}
