# Blacklist

Blacklist is the first sub-service for filtering by Health Factor (HF), MinBorrow, and MinCollateral in the LiqRegistry system. The main task of this service is to filter out users whose HF, MinBorrow, and MinCollateral values are too far from potentially interesting for liquidation, and add them to the blacklist.

> **Note:** This service is important. However, liqRegistry can work without it. In this case, the number of users on Subgraph will simply increase. However, for optimal speed in production, it's strongly recommended to run the blacklist as well.

## Main Principles of Blacklist Operation

### 1. Initialization:

- When Blacklist starts, there should already be a user database collected by the Archive sub-service. This ensures data availability for further filtering. However, it's not necessary to wait until the user database is completely filled. In the next cycle, when the number of users increases, Blacklist will update its user list.

### 2. User Filtering:

- The Blacklist service takes all users from the Archive database and checks their data:
  - Health Factor (HF): If a user's HF is too high (e.g., more than 10) or too low, they are added to the blacklist.
  - Minimum Borrow Amount (MinBorrow): If the Borrow is too small, the user is added to the blacklist.
  - Minimum Collateral (MinCollateral): If the Collateral is too small, the user is added to the blacklist.
- For example, if a user has an HF greater than 10, it means that the conditions for liquidating this user are unlikely to be met soon, so there's no point in monitoring them with more focused services (Subgraph).

### 3. Circular Scanning:

- Blacklist operates in a circular scanning mode (the Proxy + Subgraph combination also works in this mode), meaning the service continuously scans and checks users. After a complete scanning cycle, Blacklist starts the circle anew.

### 4. Adding to Blacklist:

- Depending on the check results, the service decides whether to add a user to the blacklist or not. Blacklist's task is to have a list of users worth working with, i.e., those whose HF, MinBorrow, and MinCollateral parameters are "interesting" for further processing.

### 5. Scanning Time:

- Most of our services use a simulator to obtain user data. Currently, all services use one simulator instance. Since our task is to get the fastest response from the simulator for other services, we artificially slow down Blacklist (see parameter: "delayBetweenRequestsToSimulator": 5000 (ms)).
- Currently, Blacklist completes a scanning cycle in about an hour and a half for the protocol with the largest number of users. Without artificial limitation, the service can complete scanning in 10 minutes.

## Conclusion

Blacklist provides effective initial filtering of users who do not meet the necessary criteria, allowing focus on those worth working with further. The service constantly maintains an up-to-date list of users for further processing in the LiqRegistry system.
