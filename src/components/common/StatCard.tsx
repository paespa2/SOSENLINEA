import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ size: number; style?: React.CSSProperties }>;
  iconBg?: string;
  iconColor?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBg = "rgba(59, 130, 246, 0.1)",
  iconColor = "#3b82f6",
  trend,
  onClick,
}) => {
  return (
    <div
      className="card"
      onClick={onClick}
      style={{
        cursor: onClick ? "pointer" : "default",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: "135px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "0.75rem" }}>
        <div>
          <span style={{ fontSize: "0.785rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-muted)" }}>
            {title}
          </span>
          <div style={{ fontSize: "1.65rem", fontWeight: 800, color: "var(--text-main)", marginTop: "0.25rem", letterSpacing: "-0.02em" }}>
            {value}
          </div>
        </div>
        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "12px",
            backgroundColor: iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: iconColor,
            flexShrink: 0,
          }}
        >
          <Icon size={22} />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.75rem" }}>
        {subtitle && <span style={{ color: "var(--text-muted)" }}>{subtitle}</span>}
        {trend && (
          <span
            style={{
              fontWeight: 700,
              color: trend.isPositive ? "var(--success)" : "var(--danger)",
              display: "flex",
              alignItems: "center",
              gap: "0.2rem",
            }}
          >
            {trend.isPositive ? "↑" : "↓"} {trend.value}
          </span>
        )}
      </div>
    </div>
  );
};
