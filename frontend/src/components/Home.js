import React from "react";

const Home = () => {
  const name = localStorage.getItem("name");
  const surname = localStorage.getItem("surname");

  return (
      <div
          style={{
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
              background: "linear-gradient(135deg, #e0f7ff 0%, #ffffff 85%, #e0f7ff 100%)",
            padding: "20px",
          }}
      >
        <div
            style={{
              backgroundColor: "white",
              borderRadius: "30px",
              padding: "50px",
              maxWidth: "600px",
              textAlign: "center",
              boxShadow: "0 15px 30px rgba(0,0,0,0.2)",
            }}
        >
          {name ? (
              <>
                <h1 style={{ fontSize: "36px", fontWeight: "700", color: "#111827", marginBottom: "15px" }}>
                  Добредојде, {name} {surname}!
                </h1>
                <p style={{ fontSize: "18px", color: "#6B7280" }}>
                  Сега можете да ги управувате вашите фискални сметки лесно и брзо.
                </p>
              </>
          ) : (
              <>
                <h1 style={{ fontSize: "36px", fontWeight: "700", color: "#111827", marginBottom: "15px" }}>
                  Добредојде во Системот за Фискални Сметки
                </h1>
                <p style={{ fontSize: "18px", color: "#6B7280" }}>
                  Најавете се или регистрирајте се за да ги следите и управувате вашите сметки.
                </p>
              </>
          )}
        </div>
      </div>
  );
};

export default Home;
