import { EthProvider } from "./contexts/EthContext";
import Daap from "./components/Daap";
import "./App.css";

function App() {
  return (
    <EthProvider>
      <div id="App" >
        <div className="container">
          <Daap />
        </div>
      </div>
    </EthProvider>
  );
}

export default App;
