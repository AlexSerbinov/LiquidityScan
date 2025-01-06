const formatAaveGlobalReserves = results => {
  return Object.fromEntries(
    results.map(({ asset, ...data }) => [
      asset,
      {
        price: data.price,
        decimals: data.decimals,
        bonus: data.bonus,
      },
    ])
  )
}

const formatCompoundGlobalReserves = results => {
  return Object.fromEntries(
    results.map(({ market, ...data }) => [
      market,
      {
        underlying: data.underlying,
        price: data.price,
        decimals: data.decimals,
        bonus: data.bonus,
        collateralFactor: data.collateralFactor,
      },
    ])
  )
}

const formatUsersReserves = results => {
  return results.map(res => ({
    addr: res.addr,
    healthFactor: res.healthFactor,
    reserves: Object.fromEntries(
      res.reserves
        .filter(reserve => reserve.collateralBalance.gt(0) || reserve.borrowBalance.gt(0))
        .map(({ asset, ...data }) => [
          asset,
          {
            collateralBalance: data.collateralBalance,
            borrowBalance: data.borrowBalance,
          },
        ])
    ),
  }))
}

module.exports = { formatAaveGlobalReserves, formatUsersReserves, formatCompoundGlobalReserves }
