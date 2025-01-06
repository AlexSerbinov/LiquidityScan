module.exports = [
  {
    constant: true,
    inputs: [{ name: "account", type: "address" }],
    name: "getAccountSnapshot",
    outputs: [
      { name: "", type: "uint256" },
      { name: "", type: "uint256" },
      {
        name: "",
        type: "uint256",
      },
      { name: "", type: "uint256" },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
]
