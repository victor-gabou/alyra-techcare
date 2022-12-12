// import { useState, useEffect } from "react";
// import useEth from "../../../contexts/EthContext/useEth";

import tcLogo from "./techcare-logo.png";

function DaapHeader({ currentPage, setCurrentPage, currentPopin, openPopin, closePopin }) {
  // const { state: { contract, accounts } } = useEth();

  return (
    <header className="daap-header">
      {
        currentPage !== 'home' && false &&
        <button type="button" onClick={() => setCurrentPage('home')}>back</button>
      }
      <button type="button" onClick={() => setCurrentPage('home')}>
        <img src={tcLogo} alt="TechCare logo" />
        <h1>TechCare</h1>
      </button>
    </header>
  );
}

export default DaapHeader;
