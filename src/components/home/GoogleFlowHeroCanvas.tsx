import React, { useState, useEffect, useRef, useCallback } from "react";
import { Sparkles, Layers, ShieldCheck, Compass, Hammer, Wrench, Eye } from "lucide-react";
import "./GoogleFlowHeroCanvas.css";

interface ToolHotspot {
  id: string;
  name: string;
  category: string;
  description: string;
  x: number; // percentage
  y: number; // percentage
  icon: string;
}

const TOOL_HOTSPOTS: ToolHotspot[] = [
  {
    id: "nivel",
    name: "Nivel de Burbuja Magnético",
    category: "Precisión y Acabados",
    description: "Alineación exacta en cerrajería, dry-wall, instalación de estanterías y muebles.",
    x: 34,
    y: 20,
    icon: "📐",
  },
  {
    id: "martillo",
    name: "Martillo de Uña Forjado",
    category: "Adecuaciones Estructurales",
    description: "Resistencia certificada para demolición selectiva, anclajes y fijaciones.",
    x: 74,
    y: 23,
    icon: "🔨",
  },
  {
    id: "llave",
    name: "Llave Expansiva Cromada",
    category: "Redes Hidrosanitarias",
    description: "Ajuste milimétrico de válvulas de paso, griferías, calentadores y tuberías.",
    x: 69,
    y: 47,
    icon: "🔧",
  },
  {
    id: "alicate",
    name: "Alicate de Presión y Corte",
    category: "Electricidad y Sujeción",
    description: "Manipulación segura de cableado eléctrico, amarres de tubería y cortes limpios.",
    x: 56,
    y: 63,
    icon: "⚡",
  },
  {
    id: "flexometro",
    name: "Flexómetro de Impacto 8M",
    category: "Cotización y Metraje",
    description: "Levantamiento de medidas reales para cotizaciones sin imprevistos.",
    x: 53,
    y: 79,
    icon: "📏",
  },
];

export const GoogleFlowHeroCanvas: React.FC = () => {
  const [activeMode, setActiveMode] = useState<"floating" | "grounded">("floating");
  const [activeHotspot, setActiveHotspot] = useState<ToolHotspot | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallax interactivo estilo Google (3D tilt suave)
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1; // -1 a 1
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1; // -1 a 1
    setMousePos({ x, y });
  }, []);

  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => {
    setIsHovering(false);
    setMousePos({ x: 0, y: 0 });
    setActiveHotspot(null);
  };

  // Cálculo de rotación y traslación 3D amortiguada
  const tiltX = isHovering ? -mousePos.y * 12 : 0;
  const tiltY = isHovering ? mousePos.x * 14 : 0;
  const transX = isHovering ? mousePos.x * 10 : 0;
  const transY = isHovering ? mousePos.y * 8 : 0;

  return (
    <div
      ref={containerRef}
      className={`google-flow-hero-stage ${isHovering ? "is-interacting" : ""}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label="Escenario interactivo de herramientas de mantenimiento SOSENLINEA"
    >
      {/* Orbes de luz ambientales Google Flow */}
      <div className="google-flow-orb google-orb-blue" />
      <div className="google-flow-orb google-orb-amber" />
      <div className="google-flow-orb google-orb-green" />

      {/* Selector de modo estilo Google I/O Pill */}
      <div className="google-flow-control-pill">
        <button
          type="button"
          className={`google-flow-pill-btn ${activeMode === "floating" ? "active" : ""}`}
          onClick={() => setActiveMode("floating")}
          title="Ver herramientas en suspensión antigravitatoria"
        >
          <Sparkles size={14} className="pill-icon" />
          <span>En Suspensión</span>
        </button>
        <button
          type="button"
          className={`google-flow-pill-btn ${activeMode === "grounded" ? "active" : ""}`}
          onClick={() => setActiveMode("grounded")}
          title="Ver herramientas listas en sitio operativo"
        >
          <Layers size={14} className="pill-icon" />
          <span>En Sitio Operativo</span>
        </button>
      </div>

      {/* Contenedor 3D con perspectiva interactiva */}
      <div
        className="google-flow-3d-viewport"
        style={{
          transform: `perspective(1100px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translate3d(${transX}px, ${transY}px, 0)`,
        }}
      >
        {/* Capa 1: Herramientas Flotantes (Zero Gravity) */}
        <div
          className={`google-flow-layer layer-floating ${activeMode === "floating" ? "active" : ""}`}
        >
          <img
            src="/hero-tools-floating.jpg"
            alt="Herramientas técnicas de mantenimiento en suspensión dinámica"
            className="google-flow-img"
            loading="eager"
          />
        </div>

        {/* Capa 2: Herramientas en el Suelo con Reflejo */}
        <div
          className={`google-flow-layer layer-grounded ${activeMode === "grounded" ? "active" : ""}`}
        >
          <img
            src="/hero-tools-grounded.jpg"
            alt="Herramientas de mantenimiento calibradas y listas sobre superficie reflectiva"
            className="google-flow-img"
            loading="lazy"
          />
        </div>

        {/* Puntos Interactivos (Hotspots) en Modo Flotante */}
        {activeMode === "floating" &&
          TOOL_HOTSPOTS.map((hotspot) => {
            const isActive = activeHotspot?.id === hotspot.id;
            return (
              <div
                key={hotspot.id}
                className={`google-flow-hotspot ${isActive ? "active" : ""}`}
                style={{
                  left: `${hotspot.x}%`,
                  top: `${hotspot.y}%`,
                  transform: `translate3d(${mousePos.x * -6}px, ${mousePos.y * -6}px, 20px)`,
                }}
                onMouseEnter={() => setActiveHotspot(hotspot)}
                onClick={() => setActiveHotspot(isActive ? null : hotspot)}
              >
                <div className="hotspot-pulse-ring" />
                <div className="hotspot-core-dot">
                  <span className="hotspot-glyph">{hotspot.icon}</span>
                </div>

                {/* Tooltip Card con datos técnicos */}
                {isActive && (
                  <div className="hotspot-tooltip-card" role="tooltip">
                    <div className="hotspot-tooltip-badge">
                      <ShieldCheck size={11} />
                      <span>{hotspot.category}</span>
                    </div>
                    <h4 className="hotspot-tooltip-title">{hotspot.name}</h4>
                    <p className="hotspot-tooltip-desc">{hotspot.description}</p>
                    <div className="hotspot-tooltip-footer">
                      <span>Equipamiento Certificado SOS</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* Guía de Interacción Flotante en Base */}
      <div className="google-flow-caption-badge">
        <Compass size={13} className="spin-slow" />
        <span>
          {isHovering
            ? "Explorando herramientas en perspectiva 3D"
            : "Mueve el cursor para interactuar con las herramientas en 3D"}
        </span>
      </div>
    </div>
  );
};
