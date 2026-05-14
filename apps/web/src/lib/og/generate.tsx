import type { ReactNode } from "react";

export interface GenerateProps {
  title: ReactNode;
  description?: ReactNode;
  site?: ReactNode;
  icon?: ReactNode;
}

export function generate({ title, description, icon, site = "mangowm" }: GenerateProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        color: "white",
        backgroundColor: "rgb(10,10,10)",
        fontFamily: "Geist",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          padding: "80px",
        }}
      >
        <p
          style={{
            fontWeight: 700,
            fontSize: "76px",
            letterSpacing: "-0.04em",
            margin: 0,
          }}
        >
          {title}
        </p>
        {description ? (
          <p
            style={{
              fontSize: "48px",
              color: "rgba(240,240,240,0.7)",
              letterSpacing: "-0.02em",
              lineClamp: 2,
              textOverflow: "ellipsis",
              overflow: "hidden",
            }}
          >
            {description}
          </p>
        ) : null}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "24px",
            marginTop: "auto",
          }}
        >
          {icon || (
            <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <rect width="48" height="48" rx="8" fill="rgb(59,130,246)" />
              <text
                x="24"
                y="30"
                textAnchor="middle"
                fill="white"
                fontSize="24"
                fontWeight="bold"
                fontFamily="Geist"
              >
                M
              </text>
            </svg>
          )}
          <span
            style={{
              fontSize: "40px",
              fontWeight: 600,
              letterSpacing: "-0.02em",
            }}
          >
            {site}
          </span>
        </div>
      </div>
    </div>
  );
}
