// import { useState, useEffect } from "react";
// import useEth from "../../../contexts/EthContext/useEth";


function DaapHome({ currentPage, setCurrentPage, currentPopin, openPopin, closePopin }) {
  // const { state: { contract, accounts } } = useEth();

  return (
    <div className="daap-home daap-page">
      <button className="cta-default" type="button" onClick={() => setCurrentPage('subscribe')}>Subscribe</button>
      <button className="cta-default" type="button" onClick={() => setCurrentPage('subscriptions')}>Subscriptions</button>
      <button className="cta-default" type="button" onClick={() => setCurrentPage('dao')}>DAO</button>
      <button className="cta-default" type="button" onClick={() => setCurrentPage('deposit')}>Deposit</button>
      <button className="cta-default" type="button" onClick={() => setCurrentPage('withdraw')}>Withdraw</button>
    </div>
  );
}

export default DaapHome;
