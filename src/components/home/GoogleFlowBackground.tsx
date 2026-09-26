import React, { useState, useEffect, useRef, useCallback } from "react";
import { Sparkles, Wrench, Shield, Compass, Zap } from "lucide-react";
import "./GoogleFlowBackground.css";

export const GoogleFlowBackground: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Escuchar Scroll para Parallax y Transición entre Flotante y en Sitio
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 2. Escuchar Movimiento del Ratón para Parallax 3D Suave (Google Flow)
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    // Solo si el cursor está sobre la zona del hero o cerca
    if (e.clientY <= rect.bottom + 100) {
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      setMousePos({ x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) });
      setIsHovered(true);
    } else {
      setIsHovered(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  // Cálculos de Transformación basados en Scroll y Ratón
  const scrollProgress = Math.min(scrollY / 600, 1); // 0 a 1 en los primeros 600px
  const parallaxY = scrollY * 0.38; // Desplazamiento vertical en scroll
  const tiltX = isHovered ? -mousePos.y * 8 : 0;
  const tiltY = isHovered ? mousePos.x * 10 : 0;
  const mouseTransX = isHovered ? mousePos.x * 18 : 0;
  const mouseTransY = isHovered ? mousePos.y * 12 : 0;

  // Opacidades cruzadas: de herramientas suspendidas (arriba) a suelo reflectivo (al bajar)
  const floatingOpacity = Math.max(0, 1 - scrollProgress * 1.2);
  const groundedOpacity = Math.min(1, scrollProgress * 1.5);

  return (
    <div ref={containerRef} className="google-flow-bg-root" aria-hidden="true">
      {/* Orbes de luz ambiental de fondo estilo Google */}
      <div
        className="google-flow-orb google-orb-top-right"
        style={{
          transform: `translate(${mousePos.x * -25}px, ${mousePos.y * -20 - parallaxY * 0.2}px)`,
        }}
      />
      <div
        className="google-flow-orb google-orb-center-blue"
        style={{
          transform: `translate(${mousePos.x * 30}px, ${mousePos.y * 25 - parallaxY * 0.15}px)`,
        }}
      />
      <div
        className="google-flow-orb google-orb-bottom-left"
        style={{
          transform: `translate(${mousePos.x * -15}px, ${mousePos.y * -15 - parallaxY * 0.1}px)`,
        }}
      />

      {/* Escenario 3D Central con Efecto Parallax en Scroll y Tilt */}
      <div
        className="google-flow-canvas-wrapper"
        style={{
          transform: `perspective(1200px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translate3d(${mouseTransX}px, ${-parallaxY + mouseTransY}px, 0)`,
        }}
      >
        {/* Capa 1: Herramientas Flotantes (Zero-Gravity al inicio) */}
        <div
          className="google-flow-bg-layer layer-floating-tools"
          style={{ opacity: floatingOpacity }}
        >
          <img
            src="/hero-tools-floating.jpg"
            alt="Herramientas técnicas SOSENLINEA flotando en suspensión"
            className="google-flow-bg-image"
          />
        </div>

        {/* Capa 2: Herramientas Asentadas en Superficie Reflectiva (Al hacer scroll) */}
        <div
          className="google-flow-bg-layer layer-grounded-tools"
          style={{ opacity: groundedOpacity }}
        >
          <img
            src="/hero-tools-grounded.jpg"
            alt="Herramientas asentadas sobre piso reflectivo"
            className="google-flow-bg-image"
          />
        </div>

        {/* Píldoras flotantes con micro-animación estilo Google Features */}
        <div
          className="google-flow-chip chip-1"
          style={{
            transform: `translate3d(${mousePos.x * -12}px, ${mousePos.y * -10}px, 30px)`,
          }}
        >
          <Zap size={13} className="chip-icon-amber" />
          <span>Mantenimiento Preventivo</span>
        </div>

        <div
          className="google-flow-chip chip-2"
          style={{
            transform: `translate3d(${mousePos.x * 14}px, ${mousePos.y * 12}px, 20px)`,
          }}
        >
          <Wrench size={13} className="chip-icon-blue" />
          <span>Redes Hidrosanitarias & Eléctricas</span>
        </div>

        <div
          className="google-flow-chip chip-3"
          style={{
            transform: `translate3d(${mousePos.x * -16}px, ${mousePos.y * -14}px, 40px)`,
          }}
        >
          <Shield size={13} className="chip-icon-green" />
          <span>Cobertura & Respaldo Integral</span>
        </div>
      </div>

      {/* Degradado inferior suave para fundir con la siguiente sección */}
      <div className="google-flow-bottom-fade" />
    </div>
  );
};
