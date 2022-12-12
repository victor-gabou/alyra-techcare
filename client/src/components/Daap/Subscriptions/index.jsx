import { useState, useEffect } from "react";
import useEth from "../../../contexts/EthContext/useEth";

function PremiumItem({ premium }) {

  const { state: { contract, accounts } } = useEth();

  const [pending, setPending] = useState(false)

  const [toggled, setToggled] = useState(false)

  const toggleToggle = () => {
    setToggled(!toggled)
  }

  const contractPremium = async () => {
    setPending(true)
    try {
      await contract.methods.contractPremium(premium.id).send({ from: accounts[0] });
    } catch (e) {}
    setPending(false)
  }

  return (
    <li>
      <div onClick={toggleToggle} className="title">
        Insure <b>{premium.amount}$</b> on <b>{premium.flightNumber}</b>
      </div>
      {
        toggled &&
        <div className="more">
          <b>Flight number:</b><br/>{premium.flightNumber}<br/>
          <b>Insured amout:</b><br/>${premium.amount}<br/>
          <b>Flight departure:</b><br/>{premium.flightDetails.departureTime}<br/>
          <b>Flight arrival:</b><br/>{premium.flightDetails.arrivalTime}<br/>
          <b>From:</b><br/>({premium.flightDetails.fromCode}) {premium.flightDetails.fromCity}<br/>
          <b>To:</b><br/>({premium.flightDetails.toCode}) {premium.flightDetails.toCity}<br/>
          <b>Price:</b><br/>{premium.price > 0 ? '$' + premium.price : 'loading...' }<br/>
          <b>Contracted:</b><br/>{premium.contracted ? 'yes' : 'no' }<br/>
          <b>Refunded:</b><br/>{premium.refunded ? 'yes' : 'no' }<br/>
        </div>
      }

      {
        !premium.contracted &&
          (premium.price > 0
            ? pending
              ? <button className="cta-default" disabled>Waiting...</button>
              : <button className="cta-default" onClick={contractPremium}>Insure for <b>{premium.price}$</b></button>
            : <button className="cta-default" disabled>Waiting...</button>)
      }

      {
        premium.contracted &&
          <>
            {
              premium.refunded
                ? <button className="cta-default" disabled>Refunded</button>
                : <button className="cta-default" disabled>Contracted</button>
            }
          </>
      }
    </li>
  );
}

function DaapSubscriptions({ currentPage, setCurrentPage, currentPopin, openPopin, closePopin }) {
  const { state: { contract, accounts } } = useEth();

  const [premiums, setPremiums] = useState({})
  const getPremiumByID = async (id) => {
    const premiumRaw = await contract.methods.getPremium(id).call({ from: accounts[0] })
    // console.log('premiumRaw', premiumRaw);

    const premium = {
      id: id,
      subscriber: premiumRaw.subscriber,
      flightNumber: premiumRaw.flightNumber,
      validUntil: parseInt(premiumRaw.validUntil) * 1000,
      amount: parseInt(premiumRaw.amount),
      price: parseInt(premiumRaw.price),
      contracted: premiumRaw.contracted,
      refunded: premiumRaw.refunded,
    }

    const apiResponse = await fetch(`https://api.flights.gabou.cool/flights/flightNumber?flightNumber=${premium.flightNumber}`)
      .then(response => response.json())

    premium.flightDetails = apiResponse

    return premium
  }
  useEffect(() => {
    (async () => {
      if (contract) {
        setPremiums({})
        const _premiumCreatedEvents = await contract.getPastEvents('PremiumCreated', { fromBlock: 0, toBlock: 'latest' })
        const _premiums = {}
        await Promise.all(_premiumCreatedEvents.map(async _premiumCreatedEvent => {
          if (_premiumCreatedEvent.returnValues.subscriber === accounts[0]) {
            const premium = await getPremiumByID(_premiumCreatedEvent.returnValues.premiumID)
            _premiums[premium.id] = premium
          }
        }))
        setPremiums(_premiums)
      }
    })()
  }, [contract, accounts]);

  return (
    <div className="daap-subscriptions daap-page">
      <h1>Subscriptions</h1>
      <ul>
        {Object.values(premiums).reverse().map(premium => <PremiumItem premium={premium} key={premium.id} />)}
      </ul>
    </div>
  );
}

export default DaapSubscriptions;
