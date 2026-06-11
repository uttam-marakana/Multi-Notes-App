import React from "react";
import { Link } from "react-router-dom";
import tabLogo from "../assets/images/tabLogo.png";

const Footer = () => {
  return (
    <footer className="bg-light fixed-bottom ">
      <div className="row justify-content-center">
        <div className="col-12 col-md-3 text-center">
          <Link to="/" className="d-block mb-2">
            <img
              src={tabLogo}
              alt="Tab Logo"
              className="img-fluid"
              style={{ maxWidth: "80px", maxHeight: "80px" }}
            />
          </Link>
        </div>
        <div className="col-12 col-md-3 mb-3">
          <h5>
            <strong>About Us</strong>
          </h5>
          <p className="text-start">
            We are a leading provider of innovative solutions. Our mission is to
            deliver quality and exceed expectations.
          </p>
        </div>
        <div className="col-12 col-md-3 mb-3">
          <h5>
            <strong>Contact Info</strong>
          </h5>
          <ul className="list-unstyled">
            <li>
              <a
                href="https://github.com/Uttam2709"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black text-decoration-none"
              >
                Github
              </a>
            </li>
            <li>Rajkot, Gujarat, 360311</li>
            <li>
              <a
                href="mailto:uttammarakana03@gmail.com"
                className="text-black text-decoration-none"
              >
                uttammarakana03@gmail.com
              </a>
            </li>
            <li>
              <a
                href="tel:+91 6353098381"
                className="text-black text-decoration-none"
              >
                +91 6353098381
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="text-center border-top border-secondary py-3">
        <small>© 2024 Secret Me. All rights reserved.</small>
      </div>
    </footer>
  );
};

export default Footer;
