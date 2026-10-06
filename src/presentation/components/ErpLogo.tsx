import React from 'react';
import Svg, { Path } from 'react-native-svg';

export interface ErpLogoProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Isotipo oficial del ERP Ganadero (cabeza de toro geométrica minimalista).
 * Réplica idéntica 100% vectorial del SVG del frontend web (/public/assets/images/logo/logo.svg).
 */
export function ErpLogo({
  size = 24,
  color = '#FFFFFF',
  strokeWidth = 3,
}: ErpLogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* 1. Arco Frontal (Forehead Arch) */}
      <Path
        d="M 42 24 C 47 20, 53 20, 58 24"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* 2. Cuerno Izquierdo (Left Horn) */}
      <Path
        d="M 42 24 C 34 22, 26 21, 16 17 C 20 25, 25 30, 32 32"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 3. Cuerno Derecho (Right Horn) */}
      <Path
        d="M 58 24 C 66 22, 74 21, 84 17 C 80 25, 75 30, 68 32"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 4. Oreja Izquierda (Left Ear) */}
      <Path
        d="M 33 34 C 23 33, 8 37, 8 44 C 8 51, 20 53, 32 47"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 5. Oreja Derecha (Right Ear) */}
      <Path
        d="M 67 34 C 77 33, 92 37, 92 44 C 92 51, 80 53, 68 47"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 6. Contorno Facial Izquierdo & Bucle Ocular */}
      <Path
        d="M 31 46 C 32 58, 38 64, 44 64 C 49 64, 49 56, 44 56 C 39 56, 39 62, 44 62 L 35 71 C 39 78, 43 80, 46 80"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 7. Contorno Facial Derecho & Ojo Derecho */}
      <Path
        d="M 69 46 C 68 58, 62 64, 56 64 C 51 64, 51 56, 56 56 C 61 56, 61 62, 56 62 L 65 71 C 61 78, 57 80, 54 80"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 8. Unión del Hocico / Mentón */}
      <Path
        d="M 46 80 C 48 82, 52 82, 54 80"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}
