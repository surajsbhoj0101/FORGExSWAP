import { PairCreated as PairCreatedEvent } from "../generated/UniswapV2Factory/UniswapV2Factory"
import { PairCreated } from "../generated/schema"

// Import the data source template!
import { Pair as PairTemplate } from "../generated/templates"

export function handlePairCreated(event: PairCreatedEvent): void {
  // 1️⃣ Save the event data to your DB entity
  let entity = new PairCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.token0 = event.params.token0
  entity.token1 = event.params.token1
  entity.pair = event.params.pair
  entity.param3 = event.params.param3

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  // 2️⃣ Dynamically create the Pair template for this pair address!
  PairTemplate.create(event.params.pair)
}
