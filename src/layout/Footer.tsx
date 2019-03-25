import React, { Component } from "react";
import FooterMenu from "./FooterMenu";
import FooterPoweredBy from "./FooterPoweredBy";

class Footer extends Component {
  public render() {
    return (
      <footer className="footer">
        <FooterMenu />
        <FooterPoweredBy />
      </footer>
    );
  }
}

export default Footer;