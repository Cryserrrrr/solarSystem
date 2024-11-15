varying vec2 vUv;
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;

void main() {
    vUv = uv;

    // Transformez la position du sommet dans l'espace monde
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;

    // Transformez la normale dans l'espace monde
    vWorldNormal = normalize(mat3(modelMatrix) * normal);

    // Position du sommet en clip space
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
}