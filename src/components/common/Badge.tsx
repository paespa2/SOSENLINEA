import React from "react";

interface BadgeProps {
  status: string;
  variant?: "success" | "warning" | "danger" | "info" | "neutral";
  size?: "sm" | "md";
}

export const StatusBadge: React.FC<BadgeProps> = ({ status, variant, size = "md" }) => {
  // Auto-detect variant from status label if not explicitly provided
  let determinedVariant: "success" | "warning" | "danger" | "info" | "neutral" = variant || "neutral";

  if (!variant) {
    const s = status.toLowerCase();
    if (
      s.includes("conciliado") ||
      s.includes("pagada") ||
      s.includes("pagado") ||
      s.includes("pagao") ||
      s.includes("aprobada") ||
      s.includes("aprobado") ||
      s.includes("ejecutado") ||
      s.includes("finalizado") ||
      s.includes("si esta facturado") ||
      s.includes("optimo") ||
      s.includes("disponible") ||
      s.includes("activo") ||
      s.includes("resuelto")
    ) {
      determinedVariant = "success";
    } else if (
      s.includes("en progreso") ||
      s.includes("en proceso") ||
      s.includes("en uso") ||
      s.includes("prestada") ||
      s.includes("anticipo") ||
      s.includes("por pagar") ||
      s.includes("aplazado") ||
      s.includes("recotizar")
    ) {
      determinedVariant = "warning";
    } else if (
      s.includes("revisión") ||
      s.includes("revision") ||
      s.includes("revisada") ||
      s.includes("facturada") ||
      s.includes("cobrado") ||
      s.includes("mantenimiento") ||
      s.includes("whatsapp") ||
      s.includes("wasap") ||
      s.includes("correo") ||
      s.includes("informacion") ||
      s.includes("información") ||
      s.includes("visita") ||
      s.includes("calidad") ||
      s.includes("memorando") ||
      s.includes("digital")
    ) {
      determinedVariant = "info";
    } else if (
      s.includes("descartado") ||
      s.includes("rechazada") ||
      s.includes("no aprobada") ||
      s.includes("cancelado") ||
      s.includes("cancelada") ||
      s.includes("anulada") ||
      s.includes("en mora") ||
      s.includes("agotado") ||
      s.includes("extraviada") ||
      s.includes("de baja") ||
      s.includes("urgente") ||
      s.includes("alta")
    ) {
      determinedVariant = "danger";
    } else if (
      s.includes("garantía") ||
      s.includes("garantia")
    ) {
      determinedVariant = "warning";
    } else if (s.includes("cotizado") || s.includes("borrador") || s.includes("pendiente") || s.includes("bajo stock")) {
      determinedVariant = "neutral";
    }
  }

  const padding = size === "sm" ? "0.15rem 0.5rem" : "0.25rem 0.65rem";
  const fontSize = size === "sm" ? "0.7rem" : "0.75rem";

  return (
    <span className={`badge badge-${determinedVariant}`} style={{ padding, fontSize }}>
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          backgroundColor: "currentColor",
          display: "inline-block",
        }}
      />
      {status}
    </span>
  );
};
