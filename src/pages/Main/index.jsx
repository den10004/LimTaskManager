import logo from "/logo-white.webp";

function MainPage() {
  return (
    <section className="" style={{ background: "black" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <div className="mainLogo">
          <img
            style={{ width: "80%", display: "flex", margin: "0 auto" }}
            src={logo}
            alt="логотип"
          />
        </div>
      </div>
    </section>
  );
}
export default MainPage;
