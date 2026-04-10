import { Link } from "react-router-dom";
import PageBackButton from "../components/PageBackButton";
import page404 from "../assets/images/not-found.png";

const NotFound = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        position: "relative",
        backgroundColor: "#f3f4f6",
      }}
    >
      <div style={{ position: "absolute", top: "1.5rem", left: "1.5rem" }}>
        <PageBackButton fallback="/" />
      </div>
      <img src={page404} alt="404 Not Found" style={{ width: "50%" }} />
      <h1 style={{ fontSize: "2rem", fontWeight: "bold"}}>
        Oops! Page Not Found
      </h1>
      <p style={{ fontSize: "1rem"}}>
        The page you are looking for does not exist.
      </p>
      <Link
        to="/login"
        style={{
          backgroundColor: "#3b82f6",
          color: "#fff",
          padding: "0.5rem 1rem",
          marginBottom: "30px",
          borderRadius: "0.25rem",
          textDecoration: "none",
        }}
      >
        Go to Login
      </Link>
    </div>
  );
};

export default NotFound;
