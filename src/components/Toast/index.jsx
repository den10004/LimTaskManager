import { useEffect } from "react";

function Toast({ text, color, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className="toast"
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20%",
        backgroundColor: color,
        padding: "15px 20px",
        color: "white",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
        zIndex: 5,
      }}
    >
      {text}
    </div>
  );
}

export default Toast;
