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

export function generateHomePage({ logoPaths }: { logoPaths: Array<{ fill: string; d: string }> }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "rgb(10,10,10)",
        overflow: "hidden",
        position: "relative",
        fontFamily: "Geist",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 340,
          top: -40,
          width: 900,
          height: 870,
          background: "rgb(13,13,15)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 12,
            display: "flex",
            gap: 10,
          }}
        >
          <div
            style={{
              flex: "0 0 56%",
              background: "rgba(255,255,255,0.036)",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: 6,
              boxSizing: "border-box",
            }}
          />
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div
              style={{
                flex: "0 0 48%",
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 6,
              }}
            />
            <div
              style={{
                flex: 1,
                background: "rgba(245,166,35,0.055)",
                border: "1px solid rgba(245,166,35,0.36)",
                borderRadius: 6,
              }}
            />
          </div>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: 200,
          background: "linear-gradient(to left, rgb(10,10,10) 0%, transparent 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 160,
          background: "linear-gradient(to bottom, rgb(10,10,10) 0%, transparent 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 160,
          background: "linear-gradient(to top, rgb(10,10,10) 0%, transparent 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 560,
          background:
            "linear-gradient(to right, rgb(10,10,10) 55%, rgba(10,10,10,0.7) 75%, transparent 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 160,
          top: "50%",
          transform: "translateY(-50%)",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(245,166,35,0.07) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          padding: "72px 80px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <svg width="44" height="44" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
            {logoPaths.map((p, i) => (
              <path key={i} fill={p.fill} d={p.d} />
            ))}
          </svg>
          <span
            style={{
              fontSize: 28,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: "rgba(255,255,255,0.6)",
            }}
          >
            mangowm
          </span>
        </div>
        <div
          style={{
            marginTop: "auto",
            marginBottom: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                width: 3,
                height: 18,
                background: "#F5A623",
                borderRadius: 2,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 20,
                fontWeight: 600,
                letterSpacing: "0.06em",
                color: "rgba(255,255,255,0.5)",
                textTransform: "uppercase",
              }}
            >
              Wayland Compositor
            </span>
          </div>

          <p
            style={{
              fontWeight: 800,
              fontSize: 80,
              letterSpacing: "-0.04em",
              margin: 0,
              lineHeight: 1.1,
              color: "#fff",
            }}
          >
            Practical and
            <br />
            <span style={{ color: "#F5A623" }}>Powerful.</span>
          </p>

          <p
            style={{
              fontSize: 28,
              color: "rgba(240,240,240,0.38)",
              letterSpacing: "-0.02em",
              margin: 0,
              marginTop: 20,
              fontWeight: 400,
            }}
          >
            Minimal. Modular. Modern.
          </p>
        </div>
      </div>
    </div>
  );
}
