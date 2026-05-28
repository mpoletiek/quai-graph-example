import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Transfer as TransferEvent, ERC20 } from "../generated/WrappedQi/ERC20";
import { Account, Token, Transfer } from "../generated/schema";

const TOKEN_ADDRESS = "0x002b2596ecf05c93a31ff916e8b456df6c77c750";

export function handleTransfer(event: TransferEvent): void {
  const token = loadOrCreateToken();
  token.totalTransfers = token.totalTransfers.plus(BigInt.fromI32(1));
  token.save();

  const from = loadOrCreateAccount(event.params.from);
  const to = loadOrCreateAccount(event.params.to);

  from.balance = from.balance.minus(event.params.value);
  from.sentCount = from.sentCount.plus(BigInt.fromI32(1));
  to.balance = to.balance.plus(event.params.value);
  to.receivedCount = to.receivedCount.plus(BigInt.fromI32(1));

  from.save();
  to.save();

  const transferId =
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
  const transfer = new Transfer(transferId);
  transfer.from = from.id;
  transfer.to = to.id;
  transfer.amount = event.params.value;
  transfer.blockNumber = event.block.number;
  transfer.timestamp = event.block.timestamp;
  transfer.txHash = event.transaction.hash;
  transfer.save();
}

function loadOrCreateAccount(address: Address): Account {
  const id = address.toHexString();
  let account = Account.load(id);
  if (account == null) {
    account = new Account(id);
    account.balance = BigInt.zero();
    account.sentCount = BigInt.zero();
    account.receivedCount = BigInt.zero();
  }
  return account;
}

function loadOrCreateToken(): Token {
  let token = Token.load(TOKEN_ADDRESS);
  if (token != null) return token;

  token = new Token(TOKEN_ADDRESS);
  const contract = ERC20.bind(Address.fromString(TOKEN_ADDRESS));

  const nameCall = contract.try_name();
  const symbolCall = contract.try_symbol();
  const decimalsCall = contract.try_decimals();

  token.name = nameCall.reverted ? null : nameCall.value;
  token.symbol = symbolCall.reverted ? null : symbolCall.value;
  token.decimals = decimalsCall.reverted ? 0 : decimalsCall.value;
  token.totalTransfers = BigInt.zero();
  return token;
}
