import { useNavigate } from "react-router-dom";
import FuzzyText from "../components/React Bits/FuzzyText";

export default function NotFound404() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(circle at 20% 20%, #1f2937, #0b0f19 60%)",
        color: "#e5e7eb",
        padding: "32px",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: "520px" }}>
        <FuzzyText baseIntensity={0.2} hoverIntensity={1} enableHover>
          404
        </FuzzyText>
        <div style={{ marginTop: "6px", display: "flex", justifyContent: "center" }}>
          <FuzzyText
            fontSize="clamp(1rem, 4vw, 2.4rem)"
            fontWeight={700}
            baseIntensity={0.12}
            hoverIntensity={0.35}
            fuzzRange={20}
            letterSpacing={2}
          >
            not found
          </FuzzyText>
        </div>
        <button
          type="button"
          onClick={() => navigate("/")}
          onMouseEnter={(e) => {
            e.target.style.background = "linear-gradient(135deg, #7c5cfc 0%, #4f3bc0 100%)";
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 12px 24px rgba(124, 92, 252, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "rgba(124, 92, 252, 0.15)";
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 4px 12px rgba(124, 92, 252, 0.15)";
          }}
          style={{
            marginTop: "32px",
            padding: "12px 32px",
            borderRadius: "8px",
            border: "1px solid rgba(124, 92, 252, 0.4)",
            background: "rgba(124, 92, 252, 0.15)",
            color: "#e5e7eb",
            cursor: "pointer",
            fontSize: "0.975rem",
            fontWeight: "600",
            letterSpacing: "0.3px",
            transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: "0 4px 12px rgba(124, 92, 252, 0.15)",
          }}
        >
          ← Back to home
        </button>
      </div>
    </div>
  );
}
