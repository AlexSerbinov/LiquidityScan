### Proxy

Proxy is an auxiliary service for Subgraph. It emerged from the need to efficiently distribute users among multiple Subgraph instances.

#### History

Our Cinnamon architecture allows running each service in multiple fork mode. For example, Subgraph can be launched with 10, 20, or more forks to increase performance. Proxy's task was to efficiently distribute users among these forks. However, after optimization and transition to using a Rust-written simulator (Rust = fast:) instead of a regular Ethereum node, the speed increased significantly, and now all services operate in single fork mode. Therefore, there's no need to run multiple Subgraph instances.

However, currently, the interaction between Proxy and Subgraph services is very well debugged and works efficiently. But the combination of Proxy and Subgraph allows us to reduce the scanning circle in the future by running multiple forks using different simulator instances.

#### Main Principles of Proxy Operation

1. **Initialization**:

   - Proxy retrieves all users from Archive. For example, the Compound protocol has 50 thousand users.
   - Proxy checks which of these users are in Blacklist and which are not. For instance, if out of 50 thousand users, 10 thousand are not in Blacklist, Proxy sends these users to Subgraph for further processing.

2. **User Distribution**:

   - Proxy sends users to Subgraph in batches. The batch size can be set in the settings (currently it's 30 users).
   - Important: The entire batch goes for verification in the simulator. The simulator has a limit on the maximum gas size and cannot process more than 30-40 users. Therefore, don't set the batch size larger than 30-40. A small batch size will just slow down the service. Note: For debugging the Subgraph service, it's convenient to set the batch size to 1 user.
   - If 10 Subgraph forks are running, and there are 10,000 non-Blacklist users, Proxy evenly distributes users among all forks. That is, 1,000 users will be sent to each fork. So 30 users to the first fork, 30 to the second, until all 10000/30 = 334 batches are sent, 33-34 batches to each fork.

3. **Processing and Feedback**:

   - Proxy sends users to Subgraph in a matter of seconds. And then users enter the queue in the Subgraph service. After processing all users, Subgraph sends a signal (event drain) to Proxy, indicating the completion of processing and readiness to receive new batches.
   - Proxy retrieves an updated list of users on each subsequent circle, taking into account possible changes in Archive or Blacklist, and sends the next batch of users to Subgraph.

   ![Users flow](../images/archiveToSubgraphFlow.jpg)

4. **Launch and Configuration**:
   - Subgraph should always be launched before Proxy, otherwise Proxy will simply send users into the void, and we won't receive a drain event.
   - Protection: If Proxy doesn't receive an event drain within an hour (parameter "SEND_WITHOUT_DRAIN_TIMEOUT": 3600000 (ms)), Proxy will send batches to Subgraph. This provides protection in case only the Subgraph service is restarted in production without Proxy. Don't set the SEND_WITHOUT_DRAIN_TIMEOUT parameter too small, otherwise it may create a problem of accumulating too many users in Subgraph instances. A value of 3600000 (ms) is quite safe, as currently Subgraph completes a circle in 90 seconds.
