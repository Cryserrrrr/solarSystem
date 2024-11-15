uniform sampler2D uDayTexture;
uniform sampler2D uNightTexture;
uniform sampler2D uSpecularCloudsTexture;
uniform vec3 uSunDirection; // Doit être dans l'espace monde
uniform vec3 uAtmosphereDayColor;
uniform vec3 uAtmosphereTwilightColor;
uniform vec3 uCameraPosition; // Assurez-vous que ceci est passé correctement

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
    vec3 dayColor = texture(uDayTexture, vUv).rgb;
    vec3 nightColor = texture(uNightTexture, vUv).rgb;
    color = mix(nightColor, dayColor, dayMix);

    // Couleur des nuages spéculaires
    vec2 specularCloudsColor = texture(uSpecularCloudsTexture, vUv).rg;

    // Nuages
    float cloudsMix = smoothstep(0.5, 1.0, specularCloudsColor.g);
    cloudsMix *= dayMix;
    color = mix(color, vec3(1.0), cloudsMix);

    // Fresnel
    float fresnel = dot(viewDirection, normal) + 1.0;
    fresnel = pow(fresnel, 2.0);

    // Atmosphère
    float atmosphereDayMix = smoothstep(-0.5, 1.0, sunOrientation);
    vec3 atmosphereColor = mix(uAtmosphereTwilightColor, uAtmosphereDayColor, atmosphereDayMix);
    color = mix(color, atmosphereColor, fresnel * atmosphereDayMix);

    // Specular
    vec3 reflection = reflect(- uSunDirection, normal);
    float specular = - dot(reflection, viewDirection);
    specular = max(specular, 0.0);
    specular = pow(specular, 32.0);
    specular *= specularCloudsColor.r;

    vec3 specularColor = mix(vec3(0.1), atmosphereColor, fresnel);
    color += specular * specularColor;

    // Couleur finale
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
