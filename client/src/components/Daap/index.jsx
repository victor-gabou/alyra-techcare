import { useState } from "react";
// import { useState, useEffect } from "react";
// import useEth from "../../contexts/EthContext/useEth";

import Header from "./Header";
import Home from "./Home";
import Subscribe from "./Subscribe";
import Subscriptions from "./Subscriptions";
import DAO from "./DAO";
import Deposit from "./Deposit";
import Withdraw from "./Withdraw";

function Daap() {
  // const { state: { contract, accounts } } = useEth();

  const page = new URLSearchParams(window.location.search).get('page')
  const [currentPage, setCurrentPage] = useState(page ? page : 'home')

  const daapSetCurrentPage = (page) => {
    const popin = new URLSearchParams(window.location.search).get('popin')
    let updatedUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?page=' + page
    if (popin) {
      updatedUrl += '&popin=' + popin

    }
    window.history.pushState({ path: updatedUrl }, '', updatedUrl )
    setCurrentPage(page)
  }

  const popin = new URLSearchParams(window.location.search).get('popin')
  const [currentPopin, setCurrentPopin] = useState(popin ? popin : '')

  const daapOpenPopin = (popin) => {
    setCurrentPopin(popin)
  }
  const daapClosePopin = () => {
    setCurrentPopin('')
  }

  return (
    <div className="daap">
      <Header currentPage={currentPage} setCurrentPage={daapSetCurrentPage} currentPopin={currentPopin} openPopin={daapOpenPopin} closePopin={daapClosePopin} />
      {
        currentPage === 'home' &&
          <Home currentPage={currentPage} setCurrentPage={daapSetCurrentPage} currentPopin={currentPopin} openPopin={daapOpenPopin} closePopin={daapClosePopin} />
      }
      {
        currentPage === 'subscribe' &&
          <Subscribe currentPage={currentPage} setCurrentPage={daapSetCurrentPage} currentPopin={currentPopin} openPopin={daapOpenPopin} closePopin={daapClosePopin} />
      }
      {
        currentPage === 'subscriptions' &&
          <Subscriptions currentPage={currentPage} setCurrentPage={daapSetCurrentPage} currentPopin={currentPopin} openPopin={daapOpenPopin} closePopin={daapClosePopin} />
      }
      {
        currentPage === 'dao' &&
          <DAO currentPage={currentPage} setCurrentPage={daapSetCurrentPage} currentPopin={currentPopin} openPopin={daapOpenPopin} closePopin={daapClosePopin} />
      }
      {
        currentPage === 'deposit' &&
          <Deposit currentPage={currentPage} setCurrentPage={daapSetCurrentPage} currentPopin={currentPopin} openPopin={daapOpenPopin} closePopin={daapClosePopin} />
      }
      {
        currentPage === 'withdraw' &&
          <Withdraw currentPage={currentPage} setCurrentPage={daapSetCurrentPage} currentPopin={currentPopin} openPopin={daapOpenPopin} closePopin={daapClosePopin} />
      }
    </div>
  );
}

export default Daap;
