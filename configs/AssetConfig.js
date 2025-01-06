const AssetConfig = {
  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2": {
    V3: ["0xE62B71cf983019BFf55bC83B48601ce8419650CC"], // AccessControlledOffchainAggregator ETH  / USD
    V2: ["0x0000000000000000000000000000000000000000"], // Zero address, because no need aggregator to compare price WETH with ETH
    SYMBOL: "WETH",
  },
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48": {
    V3: ["0x789190466E21a8b78b8027866CBBDc151542A26C"], // AccessControlledOffchainAggregator USDC / USD
    V2: [
      "0xe5BbBdb2Bb953371841318E1Edfbf727447CeF2E", // Old one, probably not used | AccessControlledOffchainAggregator USDC / USD
      "0xE62B71cf983019BFf55bC83B48601ce8419650CC", // AccessControlledOffchainAggregator ETH  / USD (BASE to PEG)
      "0x789190466E21a8b78b8027866CBBDc151542A26C", // AccessControlledOffchainAggregator USDC / USD (ASSET to PEG)
    ],
    V1: [
      "0xe5BbBdb2Bb953371841318E1Edfbf727447CeF2E", // Old one, probably not used | AccessControlledOffchainAggregator USDC / USD
      "0xE62B71cf983019BFf55bC83B48601ce8419650CC", // AccessControlledOffchainAggregator ETH  / USD (BASE to PEG)
      "0x789190466E21a8b78b8027866CBBDc151542A26C", // AccessControlledOffchainAggregator USDC / USD (ASSET to PEG)
    ],
    SYMBOL: "USDC",
  },
  "0x514910771AF9Ca656af840dff83E8264EcF986CA": {
    V3: ["0x20807Cf61AD17c31837776fA39847A2Fa1839E81"], // AccessControlledOffchainAggregator LINK / USD
    V2: ["0xbba12740DE905707251525477bAD74985DeC46D2"], // AccessControlledOffchainAggregator LINK / ETH
    V1: ["0xbba12740DE905707251525477bAD74985DeC46D2"], // AccessControlledOffchainAggregator LINK / ETH
    Compound: ["0x20807Cf61AD17c31837776fA39847A2Fa1839E81"], // AccessControlledOffchainAggregator LINK / USD
    SYMBOL: "LINK", // Chainlink
  },
  "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9": {
    V3: ["0x8116B273cD75d79C382aFacc706659DEd5E0a59d"], // AccessControlledOffchainAggregator AAVE / USD
    V2: ["0xdF0da6B3d19E4427852F2112D0a963d8A158e9c7"], // AccessControlledOffchainAggregator AAVE / ETH
    V1: ["0xdF0da6B3d19E4427852F2112D0a963d8A158e9c7"], // AccessControlledOffchainAggregator AAVE / ETH
    Compound: ["0x8116B273cD75d79C382aFacc706659DEd5E0a59d"], // AccessControlledOffchainAggregator AAVE / USD
    SYMBOL: "AAVE",
  },
  "0xdAC17F958D2ee523a2206206994597C13D831ec7": {
    V3: ["0xa964273552C1dBa201f5f000215F5BD5576e8f93"], // AccessControlledOffchainAggregator USDT / USD
    V2: [
      "0x7De0d6fce0C128395C488cb4Df667cdbfb35d7DE", // Old one, probably not used | AccessControlledOffchainAggregator USDT / USD
      "0xE62B71cf983019BFf55bC83B48601ce8419650CC", // AccessControlledOffchainAggregator ETH  / USD (BASE to PEG)
      "0xa964273552C1dBa201f5f000215F5BD5576e8f93", // New one | AccessControlledOffchainAggregator USDT / USD (ASSET to PEG)
    ],
    V1: [
      "0x7De0d6fce0C128395C488cb4Df667cdbfb35d7DE", // Old one, probably not used | AccessControlledOffchainAggregator USDT / USD
      "0xE62B71cf983019BFf55bC83B48601ce8419650CC", // AccessControlledOffchainAggregator ETH  / USD (BASE to PEG)
      "0xa964273552C1dBa201f5f000215F5BD5576e8f93", // New one | AccessControlledOffchainAggregator USDT / USD (ASSET to PEG)
    ],
    SYMBOL: "USDT",
  },
  "0x5f98805A4E8be255a32880FDeC7F6728C6568bA0": {
    V3: [
      "0x27b97a63091d185cE056e1747624b9B92BAAD056", // AccessControlledOffchainAggregator LUSD / USD
    ],
    V2: [
      "0x27b97a63091d185cE056e1747624b9B92BAAD056", // AccessControlledOffchainAggregator LUSD / ETH (ASSET to PEG)
      "0xE62B71cf983019BFf55bC83B48601ce8419650CC", // AccessControlledOffchainAggregator ETH  / USD (BASE to PEG)
    ],
    Compound: ["0x27b97a63091d185cE056e1747624b9B92BAAD056"],
    SYMBOL: "LUSD", // Liquity USD
  },
  "0xD533a949740bb3306d119CC777fa900bA034cd52": {
    V3: ["0xb4c4a493AB6356497713A78FFA6c60FB53517c63"], // AccessControlledOffchainAggregator CRV / USD
    V2: ["0x7f67Ca2ce5299a67acd83D52A064C5b8e41dDb80"], // AccessControlledOffchainAggregator CRV / ETH.
    SYMBOL: "CRV", // Curve DAO Token
  },
  "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2": {
    V3: ["0x71Febc2F741F113af322e1B576eF005A4424574F"], // AccessControlledOffchainAggregator MKR / USD
    V2: ["0xFFC14A3B26708545BcCf8e915e2e8348123f5460"], // AccessControlledOffchainAggregator MKR / ETH
    V1: ["0xFFC14A3B26708545BcCf8e915e2e8348123f5460"], // AccessControlledOffchainAggregator MKR / ETH
    SYMBOL: "MKR", // Maker DAO
  },
  "0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F": {
    V3: ["0x06ce8Be8729B6bA18dD3416E3C223a5d4DB5e755"], // AccessControlledOffchainAggregator SNX / USD
    V2: ["0xBAFe3CB0E563E914806A99D547bdBF2Cfcf5fDF6"], // AccessControlledOffchainAggregator SNX / ETH
    V1: ["0xBAFe3CB0E563E914806A99D547bdBF2Cfcf5fDF6"], // AccessControlledOffchainAggregator SNX / ETH
    SYMBOL: "SNX", // Synthetix Network Token
  },
  "0xba100000625a3754423978a60c9317c58a424e3D": {
    V3: ["0xbd9350a3a2fd6e3Ad0a053a567f2609a1bf6c505"], // AccessControlledOffchainAggregator BAL / USD
    V2: ["0x2f2c0C1727Ce8C429A237DDFBBb87357893fBD5D"], // AccessControlledOffchainAggregator BAL / ETH
    SYMBOL: "BAL", // Balancer
  },
  "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984": {
    V3: ["0x373BCe97bec13BfA8A5f07Cc578EC2D77f80c589"], // AccessControlledOffchainAggregator UNI / USD
    V2: ["0xc1D1d0Da0fCf78157EA25D0E64e3BE679813a1F7"], // AccessControlledOffchainAggregator UNI / ETH
    V1: ["0xc1D1d0Da0fCf78157EA25D0E64e3BE679813a1F7"], // AccessControlledOffchainAggregator UNI / ETH
    Compound: ["0x373BCe97bec13BfA8A5f07Cc578EC2D77f80c589"],
    SYMBOL: "UNI", // Uniswap UNI
  },
  "0x111111111117dC0aa78b770fA6A738034120C302": {
    V3: ["0xd2bdD1E01fd2F8d7d42b209c111c7b32158b5a42"], // AccessControlledOffchainAggregator 1INCH / USD
    V2: ["0xb2F68c82479928669B0487D1dAeD6Ef47b63411e"], // AccessControlledOffchainAggregator 1INCH / ETH
    SYMBOL: "1INCH", // 1inch
  },
  "0x853d955aCEf822Db058eb8505911ED77F175b99e": {
    V3: ["0x61eB091ea16A32ea5B880d0b3D09d518c340D750"], // AccessControlledOffchainAggregator FRAX / USD
    V2: [
      "0x56f98706C14DF5C290b02Cec491bB4c20834Bb51", // Old one, probably not used | AccessControlledOffchainAggregator FRAX / ETH
      "0x61eB091ea16A32ea5B880d0b3D09d518c340D750", // AccessControlledOffchainAggregator FRAX / USD (ASSET to PEG)
      "0xE62B71cf983019BFf55bC83B48601ce8419650CC", // AccessControlledOffchainAggregator ETH  / USD (BASE to PEG)
    ],
    Compound: ["0x61eB091ea16A32ea5B880d0b3D09d518c340D750"], // AccessControlledOffchainAggregator FRAX / USD
    SYMBOL: "FRAX",
  },
  "0xD33526068D116cE69F19A9ee46F0bd304F21A51f": {
    V3: ["0x5Df960959De45A2BA9DC11e6fD6F77107F43256C"], // AccessControlledOffchainAggregator RPL / USD
    SYMBOL: "RPL", // Rocket Pool
  },
  "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599": {
    V3: [
      "0xD7623f1d24b35c392862fB67C9716564A117C9DE", // AccessControlledOffchainAggregator WBTC / BTC
      "0xdBe1941BFbe4410D6865b9b7078e0b49af144D2d", // AccessControlledOffchainAggregator BTC / USD
    ],
    V2: [
      "0xD7623f1d24b35c392862fB67C9716564A117C9DE", // AccessControlledOffchainAggregator WBTC / BTC (ASSET to PEG)
      "0x81076d6Ff2620Ea9Dd7bA9c1015f0d09A3A732E6", // AccessControlledOffchainAggregator BTC  / ETH (BASE to PEG)
    ],
    V1: [
      "0xD7623f1d24b35c392862fB67C9716564A117C9DE", // AccessControlledOffchainAggregator WBTC / BTC (ASSET to PEG)
      "0x81076d6Ff2620Ea9Dd7bA9c1015f0d09A3A732E6", // AccessControlledOffchainAggregator BTC  / ETH (BASE to PEG)
    ],
    Compound: ["0xdBe1941BFbe4410D6865b9b7078e0b49af144D2d"], // AccessControlledOffchainAggregator BTC / USD
    SYMBOL: "WBTC", // Wrapped Bitcoin
  },
  "0x6B175474E89094C44Da98b954EedeAC495271d0F": {
    V3: ["0x478238a1c8B862498c74D0647329Aef9ea6819Ed", "0xE62B71cf983019BFf55bC83B48601ce8419650CC"], // AccessControlledOffchainAggregator DAI / USD | UPDATE: Added AccessControlledOffchainAggregator ETH / USD
    V2: [
      "0x158228e08C52F3e2211Ccbc8ec275FA93f6033FC", // Old one, probably not used | AccessControlledOffchainAggregator DAI / ETH
      "0x478238a1c8B862498c74D0647329Aef9ea6819Ed", // AccessControlledOffchainAggregator DAI / USD (ASSET to PEG)
      "0xE62B71cf983019BFf55bC83B48601ce8419650CC", // AccessControlledOffchainAggregator ETH / USD (BASE to PEG)
    ],
    V1: [
      "0x158228e08C52F3e2211Ccbc8ec275FA93f6033FC", // Old one, probably not used | AccessControlledOffchainAggregator DAI / ETH
      "0x478238a1c8B862498c74D0647329Aef9ea6819Ed", // AccessControlledOffchainAggregator DAI / USD (ASSET to PEG)
      "0xE62B71cf983019BFf55bC83B48601ce8419650CC", // AccessControlledOffchainAggregator ETH / USD (BASE to PEG)
    ],
    Compound: ["0x478238a1c8B862498c74D0647329Aef9ea6819Ed"], // AccessControlledOffchainAggregator DAI / USD
    SYMBOL: "DAI", // Dai Stablecoin
  },
  "0x83F20F44975D03b1b09e64809B757c47f942BEeA": {
    V3: ["0x478238a1c8B862498c74D0647329Aef9ea6819Ed", "0xE62B71cf983019BFf55bC83B48601ce8419650CC"], // AccessControlledOffchainAggregator DAI / USD (Yes, DAI / USD, not sDAI) | UPDATE: Added AccessControlledOffchainAggregator ETH / USD
    SYMBOL: "sDAI", // Synthetix DAI
  },
  "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0": {
    V3: ["0xE62B71cf983019BFf55bC83B48601ce8419650CC"], // AccessControlledOffchainAggregator ETH / USD
    SYMBOL: "wstETH", // Wrapped stETH
  },
  "0xBe9895146f7AF43049ca1c1AE358B0541Ea49704": {
    V3: ["0xE62B71cf983019BFf55bC83B48601ce8419650CC"], // AccessControlledOffchainAggregator ETH / USD
    SYMBOL: "cbETH", // Coinbase Wrapped Staked ETH
  },
  "0xae78736Cd615f374D3085123A210448E74Fc6393": {
    V3: ["0xE62B71cf983019BFf55bC83B48601ce8419650CC"], // AccessControlledOffchainAggregator ETH / USD
    SYMBOL: "rETH", // Rocket Pool ETH
  },
  "0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32": {
    V3: [
      "0x7898AcCC83587C3C55116c5230C17a6Cd9C71bad", // AccessControlledOffchainAggregator LDO / ETH (ASSET to PEG)
      "0xE62B71cf983019BFf55bC83B48601ce8419650CC", // AccessControlledOffchainAggregator ETH / USD (BASE to PEG)
    ],
    SYMBOL: "LDO", // Lido DAO Token
  },
  "0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e": {
    V2: ["0xAa5aa80e416f9d32ffE6C390e24410d02D203F70"], // AccessControlledOffchainAggregator YFI / ETH
    V1: ["0xAa5aa80e416f9d32ffE6C390e24410d02D203F70"], // AccessControlledOffchainAggregator YFI / ETH
    SYMBOL: "YFI", // yearn.finance
  },
  "0xE41d2489571d322189246DaFA5ebDe1F4699F498": {
    V2: ["0x6B39588D2FC7990CC81544DFd4674C909E9EFeea"], // AccessControlledOffchainAggregator ZRX / ETH
    V1: ["0x6B39588D2FC7990CC81544DFd4674C909E9EFeea"], // AccessControlledOffchainAggregator ZRX / ETH
    Compound: ["0x4Dde220fF2690A350b0Ea9404F35C8f3Ad012584"], // AccessControlledOffchainAggregator ZRX / USD
    SYMBOL: "ZRX", // 0x Protocol Token
  },
  "0x0D8775F648430679A709E98d2b0Cb6250d2887EF": {
    V2: ["0x821f24DAcA9Ad4910c1EdE316D2713fC923Da698"], // AccessControlledOffchainAggregator BAT / ETH
    V1: ["0x821f24DAcA9Ad4910c1EdE316D2713fC923Da698"], // AccessControlledOffchainAggregator BAT / ETH
    Compound: ["0x98E3F1BE8E0609Ac8a7681f23e15B696F8e8204d"], // AccessControlledOffchainAggregator BAT / USD
    SYMBOL: "BAT", // Basic Attention Token
  },
  "0x4Fabb145d64652a948d72533023f6E7A623C7C53": {
    V2: [
      "0x5952c7F1Ab270D22d677762Be3dAd0BA9e5cd23d", // Old one, probably not used | AccessControlledOffchainAggregator FDUSD / ETH (Yes, FDUSD / USD, not BUSD)
      "0xd57a242FB40ED4526083B6fA05238B3d57f78D45", // New one | AccessControlledOffchainAggregator FDUSD / USD (Yes, FDUSD / USD, not BUSD) | (ASSET to PEG)
      "0xE62B71cf983019BFf55bC83B48601ce8419650CC", // AccessControlledOffchainAggregator ETH / USD (BASE to PEG)
    ],
    V1: [
      "0x5952c7F1Ab270D22d677762Be3dAd0BA9e5cd23d", // Old one, probably not used | AccessControlledOffchainAggregator FDUSD / ETH (Yes, FDUSD / USD, not BUSD)
      "0xd57a242FB40ED4526083B6fA05238B3d57f78D45", // New one | AccessControlledOffchainAggregator FDUSD / USD (Yes, FDUSD / USD, not BUSD) | (ASSET to PEG)
      "0xE62B71cf983019BFf55bC83B48601ce8419650CC", // AccessControlledOffchainAggregator ETH / USD (BASE to PEG)
    ],
    SYMBOL: "BUSD", // Binance USD
  },
  "0xF629cBd94d3791C9250152BD8dfBDF380E2a3B9c": {
    V2: ["0xdBd66e8D31F506e0cc8CB2f346De4C7FA3f655DE"], // AccessControlledOffchainAggregator ENJ / ETH
    V1: ["0xdBd66e8D31F506e0cc8CB2f346De4C7FA3f655DE"], // AccessControlledOffchainAggregator ENJ / ETH
    SYMBOL: "ENJ", // Enjin Coin
  },
  "0xdd974D5C2e2928deA5F71b9825b8b646686BD200": {
    V2: ["0xB3B1882C0A7eB5097F12547bCD20Dc6FAE7aC8a6"], // AccessControlledOffchainAggregator KNC / ETH
    V1: ["0xB3B1882C0A7eB5097F12547bCD20Dc6FAE7aC8a6"], // AccessControlledOffchainAggregator KNC / ETH
    SYMBOL: "KNC", // Kyber Network Crystal
  },
  "0x0F5D2fB29fb7d3CFeE444a200298f468908cC942": {
    V2: ["0x46b77070f9256523c2F31c333b72C3E102f8A8A7"], // AccessControlledOffchainAggregator MANA / ETH
    V1: ["0x46b77070f9256523c2F31c333b72C3E102f8A8A7"], // AccessControlledOffchainAggregator MANA / ETH
    SYMBOL: "MANA", // Decentraland MANA
  },
  "0x408e41876cCCDC0F92210600ef50372656052a38": {
    V2: ["0xEe34b3Ce92A6B635450B9cC6FAa976F70a106BE7"], // AccessControlledOffchainAggregator REN / ETH
    V1: ["0xEe34b3Ce92A6B635450B9cC6FAa976F70a106BE7"], // AccessControlledOffchainAggregator REN / ETH
    SYMBOL: "REN", // Republic Token
  },
  "0x57Ab1ec28D129707052df4dF418D58a2D46d5f51": {
    V2: [
      "0x45bb69B89D60878d1e42522342fFCa9F2077dD84", // AccessControlledOffchainAggregator SUSD / ETH (ASSET to PEG)
      "0xE62B71cf983019BFf55bC83B48601ce8419650CC", // AccessControlledOffchainAggregator ETH  / USD (BASE to PEG)
    ],
    V1: [
      "0x7De0d6fce0C128395C488cb4Df667cdbfb35d7DE", // Old one, probably not used | AccessControlledOffchainAggregator USDT / ETH
      "0x45bb69B89D60878d1e42522342fFCa9F2077dD84", // AccessControlledOffchainAggregator SUSD / ETH (ASSET to PEG)
      "0xE62B71cf983019BFf55bC83B48601ce8419650CC", // AccessControlledOffchainAggregator ETH  / USD (BASE to PEG)
    ],
    SYMBOL: "sUSD", // Synthetix USD
  },
  "0x0000000000085d4780B73119b644AE5ecd22b376": {
    V2: [
      "0x9534df8F2C9289bbDB0c736E9FeF402B20f1828E", // Old one, probably not used | AccessControlledOffchainAggregator TUSD / ETH
      "0x98953e9C76573e06ec265Bdde1dbB89fa02d56d3", // AccessControlledOffchainAggregator TUSD / USD (ASSET to PEG)
      "0xE62B71cf983019BFf55bC83B48601ce8419650CC", // AccessControlledOffchainAggregator ETH  / USD (BASE to PEG)
    ],
    V1: [
      "0x9534df8F2C9289bbDB0c736E9FeF402B20f1828E", // Old one, probably not used | AccessControlledOffchainAggregator TUSD / ETH
      "0x98953e9C76573e06ec265Bdde1dbB89fa02d56d3", // AccessControlledOffchainAggregator TUSD / USD (ASSET to PEG)
      "0xE62B71cf983019BFf55bC83B48601ce8419650CC", // AccessControlledOffchainAggregator ETH  / USD (BASE to PEG)
    ],
    SYMBOL: "TUSD", // TrueUSD
  },
  "0x056Fd409E1d7A124BD7017459dFEa2F387b6d5Cd": {
    V2: ["0xE62B71cf983019BFf55bC83B48601ce8419650CC"], // AccessControlledOffchainAggregator ETH / USD
    SYMBOL: "GUSD", // Gemini Dollar
  },
  "0x8E870D67F660D95d5be530380D0eC0bd388289E1": {
    V2: [
      "0x8034d486Fc2620F87A9C32a1fB746D20Ed9BFB96", // Old one, probably not used | AccessControlledOffchainAggregator PAX / ETH (strangely)
      "0xF3d70857B489Ecc6768D0982B773E1Cba9E1f00b", // AccessControlledOffchainAggregator USDP / USD (ASSET to PEG)
      "0xE62B71cf983019BFf55bC83B48601ce8419650CC", // AccessControlledOffchainAggregator ETH  / USD (BASE to PEG)
    ],
    SYMBOL: "USDP", // USDP Stablecoin
  },
  // "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2": {
  // V2 also have SUSHI, but AccessControlledOffchainAggregator not active from 2021, so we skip it for V2
  // Compound: ["0x7213536a36094cD8a768a5E45203Ec286Cba2d74"], // Not active from February 2023.  AccessControlledOffchainAggregator SUSHI / USD
  // SYMBOL: "SUSHI",
  // },
  "0x8798249c2E607446EfB7Ad49eC89dD1865Ff4272": {
    V2: ["0xdEaa4288c85e7e0be40BCE49E76D4e321d20fC36"], // AccessControlledOffchainAggregator "Calculated XSUSHI / ETH"
    SYMBOL: "xSUSHI",
  },
  "0xD5147bc8e386d91Cc5DBE72099DAC6C9b99276F5": {
    V2: ["0x9965AD91B4877d29c246445011Ce370b3890C5C2"], // AccessControlledOffchainAggregator FIL / ETH
    SYMBOL: "renFIL", // Ren Filecoin
  },
  "0x03ab458634910AaD20eF5f1C8ee96F1D6ac54919": {
    V2: ["0x8d6d808eC1f8803b54e2286BD6992f5601fCF3a8"], // AccessControlledOffchainAggregator RAI / ETH
    Compound: ["0x2Abfc56AaA39be7a946ec39aAC5d452e30614dF1"], // Not active from March 2024. AccessControlledOffchainAggregator RAI / USD
    SYMBOL: "RAI", // RAI Reflex Index
  },
  "0xD46bA6D942050d489DBd938a2C909A5d5039A161": {
    V2: ["0xb92EE05E7514FfEDDDbcd76F5e3064691F6eC79e"], // AccessControlledOffchainAggregator AMPL / ETH
    SYMBOL: "AMPL", // Ampleforth
  },

  "0x1494CA1F11D487c2bBe4543E90080AeBa4BA3C2b": {
    V2: [
      "0x36e4f71440EdF512EB410231e75B9281d4FcFC4c", // Old one, probably not used | AccessControlledOffchainAggregator DPI / ETH
      "0xA122f84935477142295F7451513e502D49316285", // AccessControlledOffchainAggregator DPI / USD (ASSET to PEG)
      "0xE62B71cf983019BFf55bC83B48601ce8419650CC", // AccessControlledOffchainAggregator ETH / USD (BASE to PEG)
    ],
    SYMBOL: "DPI", // DeFi Pulse Index
  },
  "0x956F47F50A910163D8BF957Cf5846D573E7f87CA": {
    V2: ["0xE62B71cf983019BFf55bC83B48601ce8419650CC"], // AccessControlledOffchainAggregator ETH / USD
    Compound: ["0xA998f62719e4A3Cdc3eE70F4809c9200B58818e3"], // AccessControlledOffchainAggregator FEI / USD
    SYMBOL: "FEI", // Fei Protocol
  },
  "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84": {
    V2: ["0xADE6CBA6c45aa8E9d0337cAc3D2619eabc39D901"], // StETHtoETHSynchronicityPriceAdapter stETH / ETH
    SYMBOL: "stETH", // Lido stETH
  },
  "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72": {
    V2: [
      "0x780f1bD91a5a22Ede36d4B2b2c0EcCB9b1726a28", // AccessControlledOffchainAggregator ENS / USD (ASSET to PEG)
      "0xE62B71cf983019BFf55bC83B48601ce8419650CC", // AccessControlledOffchainAggregator ETH / USD (BASE to PEG)
    ],
    SYMBOL: "ENS", // Ethereum Name Service
  },
  "0xa693B19d2931d498c5B318dF961919BB4aee87a5": {
    V2: [
      "0x4a81f77C8BBcA2CbA8110279cDbC9F1A8D3eAE6B", // AccessControlledOffchainAggregator UST / ETH (ASSET to PEG)
      "0xE62B71cf983019BFf55bC83B48601ce8419650CC", // AccessControlledOffchainAggregator ETH / USD (BASE to PEG)
    ],
    SYMBOL: "UST", // TerraUSD (Wormhole)
  },
  "0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B": {
    V2: ["0xf1F7F7BFCc5E9D6BB8D9617756beC06A5Cbe1a49"], // AccessControlledOffchainAggregator CVX / ETH
    SYMBOL: "CVX", // Convex Finance
  },
  "0x80fB784B7eD66730e8b1DBd9820aFD29931aab03": {
    V1: ["0xdF0da6B3d19E4427852F2112D0a963d8A158e9c7"], // Probably wrong | AAVE / ETH !!! | Can not find the correct one
  },
  "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE": {
    Compound: ["0xE62B71cf983019BFf55bC83B48601ce8419650CC"],
  },
  "0x1985365e9f78359a9B6AD760e32412f4a445E862": {
    V1: ["0x5d7d68D7c66a3Ac30e7727Ae380817a534c7bc89"],
    Compound: ["0x3536295940D13156190A081A318579B5bC8b8AA4"], // AccessControlledOffchainAggregator REP / USD
    SYMBOL: "REP", // Reputation
  },
  "0xc00e94cb662c3520282e6f5717214004a7f26888": {
    Compound: ["0x64d2E1F01A19762dDEE27b1062CC092B66Ff9652"], // AccessControlledOffchainAggregator COMP / USD
    SYMBOL: "COMP", // Compound
  },
  "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0": {
    Compound: ["0x4B35F7854e1fd8291f4EC714aC3EBB1DeA450585"], // AccessControlledOffchainAggregator MATIC / USD
    SYMBOL: "MATIC", // Polygon
  },
  "0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e": {
    Compound: ["0xcac109af977AC94929A5dD37ed8Af763BAD78151"], // AccessControlledOffchainAggregator YFI / USD
    SYMBOL: "YFI", // yearn.finance
  },
}
module.exports = { AssetConfig }
