import { useState, useEffect } from "react";
import useEth from "../../../contexts/EthContext/useEth";


function DaapSubscribe({ currentPage, setCurrentPage, currentPopin, openPopin, closePopin }) {
  const { state: { contract, accounts } } = useEth();

  const [pending, setPending] = useState(false)

  const [flightNumber, setFlightNumber] = useState('TC-202212010000')
  const [flightNumberErrorMessage, setFlightNumberErrorMessage] = useState('')
  const onFlightNumberChange = (e) => {
    setFlightNumber(e.target.value)
  }

  const [amount, setAmount] = useState(50)
  const [amountErrorMessage, setAmountErrorMessage] = useState('')
  const onAmountChange = (e) => {
    setAmount(parseFloat(e.target.value))
  }

  const [minAmount, setMinAmount] = useState(0)
  const [maxAmount, setMaxAmount] = useState(0)
  useEffect(() => {
    (async () => {
      if (contract && accounts) {
        const minAmountValueRaw = await contract.methods.getMinAmount().call({ from: accounts[0] });
        const minAmountValue = parseInt(minAmountValueRaw)
        setMinAmount(minAmountValue)
        const maxAmountValueRaw = await contract.methods.getMaxAmount().call({ from: accounts[0] });
        const maxAmountValue = parseInt(maxAmountValueRaw)
        setMaxAmount(maxAmountValue)
      }
    })()
  }, [contract, accounts])

  const onFormSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    setPending(true)

    let valid = true

    setFlightNumberErrorMessage('')
    setAmountErrorMessage('')

    if (amount < minAmount) {
      setAmountErrorMessage(`Amount should be greater than ${minAmount}`)
      valid = false
    }
    if (amount > maxAmount) {
      setAmountErrorMessage(`Amount should be lower than ${maxAmount}`)
      valid = false
    }

    const apiResponse = await fetch(`https://api.flights.gabou.cool/flights/flightNumber?flightNumber=${flightNumber}`)
      .then(response => response.json())

    if (apiResponse.code && apiResponse.code !== 200) {
      setFlightNumberErrorMessage(apiResponse.message)
      valid = false
    }

    if (valid) {
      // await contract.methods.createPremium(flightNumber, amount * 100).send({ from: accounts[0] });
      try {
        await contract.methods.createPremium(flightNumber, amount).send({ from: accounts[0] });
        setCurrentPage('subscriptions')
      } catch (e) {}
      setPending(false)
    }
  }

  return (
    <div className="daap-subscribe daap-page">
      <h1>Subscribe</h1>
      <form onSubmit={onFormSubmit} disabled={pending}>
        <div className="input-group">
          <label htmlFor="flightNumber">Flight number</label>
          <input type="text" name="flightNumber" id="flightNumber" placeholder="TC-202212120000" value={flightNumber} onChange={onFlightNumberChange} required />
          {
            flightNumberErrorMessage &&
            <span>{flightNumberErrorMessage}</span>
          }
        </div>
        <div className="input-group">
          <label htmlFor="amount">Amount</label>
          <input type="number" name="amount" id="amount" min={minAmount} max={maxAmount} placeholder="100" value={amount > 0 ? amount : undefined} onChange={onAmountChange} required />
          {
            amountErrorMessage &&
            <span>{amountErrorMessage}</span>
          }
        </div>
        {
          pending
            ? <button className="cta-default" type="button" disabled>Waiting...</button>
            : <button className="cta-default" type="submit">Submit</button>
        }
      </form>
    </div>
  );
}

export default DaapSubscribe;
