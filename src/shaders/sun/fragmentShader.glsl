  uniform float time;
  uniform vec2 resolution;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  // Fonction de bruit simplex 3D
  vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

  float snoise(vec3 v){ 
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 =   v - i + dot(i, C.xxx) ;

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );

    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1. + 3.0 * C.xxx;

    i = mod(i, 289.0 ); 
    vec4 p = permute( permute( permute( 
              i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
            + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

    float n_ = 1.0/7.0;
    vec3  ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z *ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                  dot(p2,x2), dot(p3,x3) ) );
  }

  // Fonction pour créer une éruption solaire
float stationarySolarEruption(vec3 p, float seed) {
  // Position fixe de l'éruption
  vec3 eruptionCenter = normalize(vec3(
    snoise(vec3(seed, 0.0, 0.0)),
    snoise(vec3(0.0, seed, 0.0)),
    snoise(vec3(seed, seed, 0.0))
  ));
  
  float distFromEruption = distance(normalize(p), eruptionCenter);
  float eruptionSize = 0.2 + 0.05 * snoise(vec3(seed, seed, 0.0));
  float eruptionIntensity = smoothstep(eruptionSize, 0.0, distFromEruption);
  
  // Animation lente de l'intensité
  float slowTime = time * 0.8; // Réduit la vitesse de l'animation
  eruptionIntensity *= (sin(slowTime + seed * 10.0) * 0.5 + 0.5);
  
  // Cycle de vie lent de l'éruption
  float lifeCycle = smoothstep(0.0, 0.2, fract(slowTime * 0.1 + seed));
  lifeCycle *= smoothstep(1.0, 0.8, fract(slowTime * 0.1 + seed));
  
  return eruptionIntensity * lifeCycle;
}

void main() {
  vec3 normal = normalize(vWorldPosition);
  
  // Couleur de base jaune
  vec3 baseColor = vec3(1.0, 0.34, 0.0); // Jaune vif
  
  // Utilisation de la normale pour le bruit
  float noise = snoise(normal * 5.0 + time * 0.3) * 0.5 + 0.5;
  
  // Couleur du soleil avec variation de bruit
  vec3 sunColor = mix(vec3(1.0, 0.7, 0.3), vec3(1.0, 0.3, 0.1), noise);
  
  // Mélange de la couleur de base jaune avec la couleur du soleil
  vec3 color = mix(baseColor, sunColor, 0.7);

  // Ajouter des éruptions stationnaires et lentes
  for (int i = 0; i < 10; i++) {
    float seed = float(i) * 100.0 + 123.45; // Une valeur de seed unique pour chaque éruption
    float eruption = stationarySolarEruption(normal, seed);
    color += vec3(1.0, 0.5, 0.2) * eruption * 0.5;
  }
  
  // Ajout d'un halo subtil
  float halo = 1.0 - abs(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)));
  color += vec3(1.0, 0.8, 0.5) * pow(halo, 5.0) * 0.3;
  
  gl_FragColor = vec4(color, 1.0);
}