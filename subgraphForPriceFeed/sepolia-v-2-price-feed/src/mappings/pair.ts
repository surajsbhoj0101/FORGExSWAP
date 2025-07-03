import { BigDecimal, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { Swap as SwapEvent, Sync as SyncEvent } from "../../generated/templates/Pair/pairContract"
import { Swap, Sync } from "../../generated/schema"
import { Candle } from "../../generated/schema";

function getBucket(timestamp: BigInt, intervalSeconds: i64): BigInt {
   return BigInt.fromI64(timestamp.toI64() / intervalSeconds * intervalSeconds)
}

function updateCandle(pair: string, price: BigDecimal, timestamp: BigInt, intervalLabel: string, intervalSeconds: i64): void {
   let bucket = getBucket(timestamp, intervalSeconds) //Calculate the bucket (rounded-down time)
   let id = pair + "_" + intervalLabel + "_" + bucket.toString() //create unique id 

   let candle = Candle.load(id)// Load the existing candle (if it exists)
   if (!candle) {
      candle = new Candle(id)
      let pairBytes = Bytes.fromHexString(pair)
      if (!pairBytes) return

      candle.pair = pairBytes as Bytes
      candle.timestamp = bucket
      candle.interval = intervalLabel
      candle.open = price
      candle.high = price
      candle.low = price
      candle.close = price
   } else {
      if (price > candle.high) candle.high = price
      if (price < candle.low) candle.low = price
      candle.close = price
   }

   candle.save()
}

export function handleSync(event: SyncEvent): void {
   let reserve0 = event.params.reserve0
   let reserve1 = event.params.reserve1

   if (reserve0.isZero()) return // avoid division by zero

   let price = reserve1.toBigDecimal().div(reserve0.toBigDecimal())
   let pairHex = event.address.toHex()
   let timestamp = event.block.timestamp

   updateCandle(pairHex, price, timestamp, "1m", 60)
   updateCandle(pairHex, price, timestamp, "5m", 300)
   updateCandle(pairHex, price, timestamp, "1h", 3600)
   updateCandle(pairHex, price, timestamp, "4h", 14400)
   updateCandle(pairHex, price, timestamp, "1d", 86400)
}

export function handleSwap(event: SwapEvent): void {
  let entity = new Swap(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.pair = event.address
  entity.sender = event.params.sender
  entity.amount0In = event.params.amount0In
  entity.amount1In = event.params.amount1In
  entity.amount0Out = event.params.amount0Out
  entity.amount1Out = event.params.amount1Out
  entity.to = event.params.to

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

