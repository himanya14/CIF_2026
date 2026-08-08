import "../styles/Footer.css";

import {
  FaShieldAlt,
  FaCircle,
} from "react-icons/fa";

function Footer() {

  const today = new Date();

  const formatted = today.toLocaleString("en-IN",{
    day:"2-digit",
    month:"short",
    year:"numeric",
    hour:"2-digit",
    minute:"2-digit",
  });

  return (

    <footer className="footer">

      <div className="footer-left">

        <FaShieldAlt />

        <span>AI Watch Tower Executive Dashboard</span>

      </div>

      <div className="footer-center">

        <FaCircle className="live-dot"/>

        <span>All Systems Operational</span>

      </div>

      <div className="footer-right">

        Last Scan <strong>{formatted}</strong>

      </div>

    </footer>

  );

}

export default Footer;