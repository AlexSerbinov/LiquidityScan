# Simulator

## Description

The simulator is a utility used in LiqRegistry to perform two main functions.

## Main Functions

### 1. Simulation of Future Transactions

- Used in TransmitFetcher to simulate a user's HealthFactor in the next block.
- Simulation occurs alongside the transmit transaction.

### 2. Data Retrieval

- Performs functions similar to GET methods in a regular Ethereum node.
- Used to obtain user data (e.g., through getUserAccountData).
- Chosen over a node due to high speed, stability, and ability to handle a larger request flow.

## Services Using the Simulator

- **Blacklist**: Data retrieval via getUserAccountData.
- **Subgraph**: Data retrieval via getUserAccountData.
- **DataFetcher**: Data retrieval via getUserAccountData.
- **TransmitFetcher**: Data retrieval and transaction simulation.
- **Events**: Does not use the simulator, uses a regular Ethereum node.
- **Archive**: Does not use the simulator, uses a regular Ethereum node.

## Using the Simulator

- Service classes for interaction are located in the `lib/simulator` folder.
- Each service has parameters in Params:
  - **StateOverrides**: Smart contract bytecode.
  - **FormatTrace**: Responsible for returning extended logs (recommended to set to False for faster operation).
  - **Contract Address**: Can be any (used for simulation).

## Additional Information

- Some services have a "useSimulatorInsteadOfNode" parameter.
- This parameter allows switching between the simulator and the node.
- The parameter is available in Blacklist and DataFetcher, but not in Subgraph.

## Example Code in params

```json
{
  "useSimulatorInsteadOfNode": true,
  "formattedTrace": false,
  "simulationContract": "0xF50024f746D94F144a79003D00000000e380A500",
  "stateOverrides": {
    "0xF50024f746D94F144a79003D00000000e380A500": {
      "code": "0x608080604052600436101561001357600080fd5b600324324u23i40x60808060405260043610156100135..." // big hex data
    }
  }
}
```
