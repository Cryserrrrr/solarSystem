uniform sampler2D uTexture;
uniform vec3 uSunDirection;
uniform vec3 uCameraPosition;

varying vec2 vUv;
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;

void main()
{
    vec3 viewDirection = normalize(vWorldPosition - cameraPosition);
    vec3 normal = normalize(vWorldNormal);
    vec3 color = vec3(0.0);

    // Orientation du soleil
    float sunOrientation = dot(uSunDirection, normal);

    // Couleur jour/nuit
    float dayMix = smoothstep(-0.25, 0.5, sunOrientation);
    vec3 dayColor = texture(uTexture, vUv).rgb;
    vec3 nightColor = dayColor * 0.1;
    color = mix(nightColor, dayColor, dayMix);

    // Fresnel
    float fresnel = dot(viewDirection, normal) + 1.0;
    fresnel = pow(fresnel, 2.0);

    // Specular
    vec3 reflection = reflect(- uSunDirection, normal);
    float specular = - dot(reflection, viewDirection);
    specular = max(specular, 0.0);
    specular = pow(specular, 32.0);

    color += specular;

    // Couleur finale
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
