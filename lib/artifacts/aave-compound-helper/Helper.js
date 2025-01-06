module.exports = [
  {
    inputs: [],
    name: "aaveV1GetGlobalReservesData",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "asset",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "price",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "decimals",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "bonus",
            type: "uint256",
          },
        ],
        internalType: "struct Helper.AAVEReservesData[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "users",
        type: "address[]",
      },
    ],
    name: "aaveV1GetUsersData",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "addr",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "healthFactor",
            type: "uint256",
          },
          {
            components: [
              {
                internalType: "address",
                name: "asset",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "collateralBalance",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "borrowBalance",
                type: "uint256",
              },
            ],
            internalType: "struct Helper.UserReserve[]",
            name: "reserves",
            type: "tuple[]",
          },
        ],
        internalType: "struct Helper.UserData[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "aaveV2GetGlobalReservesData",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "asset",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "price",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "decimals",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "bonus",
            type: "uint256",
          },
        ],
        internalType: "struct Helper.AAVEReservesData[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "users",
        type: "address[]",
      },
    ],
    name: "aaveV2GetUsersData",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "addr",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "healthFactor",
            type: "uint256",
          },
          {
            components: [
              {
                internalType: "address",
                name: "asset",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "collateralBalance",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "borrowBalance",
                type: "uint256",
              },
            ],
            internalType: "struct Helper.UserReserve[]",
            name: "reserves",
            type: "tuple[]",
          },
        ],
        internalType: "struct Helper.UserData[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "aaveV3GetGlobalReservesData",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "asset",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "price",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "decimals",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "bonus",
            type: "uint256",
          },
        ],
        internalType: "struct Helper.AAVEReservesData[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "users",
        type: "address[]",
      },
    ],
    name: "aaveV3GetUsersData",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "addr",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "healthFactor",
            type: "uint256",
          },
          {
            components: [
              {
                internalType: "address",
                name: "asset",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "collateralBalance",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "borrowBalance",
                type: "uint256",
              },
            ],
            internalType: "struct Helper.UserReserve[]",
            name: "reserves",
            type: "tuple[]",
          },
        ],
        internalType: "struct Helper.UserData[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "compoundGetGlobalReservesData",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "market",
            type: "address",
          },
          {
            internalType: "address",
            name: "underlying",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "price",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "decimals",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "bonus",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "collateralFactor",
            type: "uint256",
          },
        ],
        internalType: "struct Helper.CompoundReservesData[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "users",
        type: "address[]",
      },
    ],
    name: "compoundGetUsersData",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "addr",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "healthFactor",
            type: "uint256",
          },
          {
            components: [
              {
                internalType: "address",
                name: "asset",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "collateralBalance",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "borrowBalance",
                type: "uint256",
              },
            ],
            internalType: "struct Helper.UserReserve[]",
            name: "reserves",
            type: "tuple[]",
          },
        ],
        internalType: "struct Helper.UserData[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
]
