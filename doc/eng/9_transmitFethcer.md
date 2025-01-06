# TransmitFetcher

TransmitFetcher is a service that listen Transmit transactions in the mempool to detect changes in token prices that are in the user's borrow or collateral, affecting users' Health Factor. TransmitFetcher allows liquidating a user in the same block where their Health Factor changes. In essence, it's like looking into the future by one block.

![Transmit fetcher flow](../images/transmitFetcherFlow.jpg)

## What is Transmit:

- Transmit is a transaction from the Chainlink Oracle provider that informs the liquidity protocol about a change in asset price. It is necessary for the smooth operation of liquidity protocols.
- Example of operation: if ETH costs $4000 now, and in an hour ETH costs $3950, then in an hour Transmit sends the new price to the liquidity protocol.
- Impact on Health Factor: if a user borrowed WrapedBTC and put WrapedETH as collateral, a change in the price of WrapedBTC or WrapedETH will affect their Health Factor.
- Frequency: Transmit comes at a certain interval (for example, once an hour) or with significant price changes, and transmits the new token price to the liquidity protocol.

## TransmitFetcher Operating Principles:

### 1. Transmit Monitoring:

- TransmitFetcher listens to Transmit transactions that come from another service (logParser) that filters the entire mempool.
- TransmitFetcher checks whether Transmit relates to its protocol (V1, V2, V3, Compound) and which tokens are changing in price.

### 2. User Analysis:

- TransmitFetcher retrieves from WatchList all users who have the mentioned token in Borrow or Collateral.
- For each user, it simulates a transaction taking into account the Transmit transaction, i.e., considering the price change. This allows obtaining a new Health Factor at the mempool stage before inclusion in the block.

### 3. Decision Making:

- If a user's new Health Factor < 1, TransmitFetcher sends a liquidate event to LiqExecutor.
- TransmitFetcher checks all tokens in Borrow and Collateral for the user before making a liquidation decision.
- TransmitFetcher does not write or delete users from WatchList, it only retrieves users from WatchList for analysis. The DataFetcher service handles writing and deleting users from WatchList.

![HF Leverage](../images/hfBalance.jpg)

### 4. Advantages of TransmitFetcher:

- The largest and most profitable liquidations occur precisely through TransmitFetcher, as it monitors the mempool and can predict price changes.

## Conclusion

TransmitFetcher provides monitoring and analysis of changes in token prices that affect users' Health Factor. Its main task is to timely identify users who can be liquidated and transmit this information for further action.
