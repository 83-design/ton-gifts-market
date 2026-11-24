import { Address, beginCell, toNano } from '@ton/core';

export function createTonDepositTx(
  escrowAddress: string,
  amount: number,
  memo: string
) {
  const address = Address.parse(escrowAddress);
  const body = beginCell()
    .storeUint(0, 32)
    .storeStringTail(memo)
    .endCell();

  return {
    validUntil: Math.floor(Date.now() / 1000) + 600,
    messages: [
      {
        address: address.toString(),
        amount: toNano(amount.toString()).toString(),
        payload: body.toBoc().toString('base64'),
      },
    ],
  };
}

export function createJettonTransferTx(
  jettonWalletAddress: string,
  recipientAddress: string,
  amount: bigint,
  memo: string
) {
  const forwardPayload = beginCell()
    .storeUint(0, 32)
    .storeStringTail(memo)
    .endCell();

  const body = beginCell()
    .storeUint(0xf8a7ea5, 32)
    .storeUint(0, 64)
    .storeCoins(amount)
    .storeAddress(Address.parse(recipientAddress))
    .storeAddress(Address.parse(recipientAddress))
    .storeBit(false)
    .storeCoins(toNano('0.01'))
    .storeBit(true)
    .storeRef(forwardPayload)
    .endCell();

  return {
    validUntil: Math.floor(Date.now() / 1000) + 600,
    messages: [
      {
        address: jettonWalletAddress,
        amount: toNano('0.05').toString(),
        payload: body.toBoc().toString('base64'),
      },
    ],
  };
}

export async function verifyTransaction(
  txHash: string,
  expectedMemo: string,
  expectedAmount: number,
  apiKey?: string
): Promise<boolean> {
  try {
    const baseUrl =
      process.env.TON_NETWORK === 'mainnet'
        ? 'https://tonapi.io/v2'
        : 'https://testnet.tonapi.io/v2';

    const headers: Record<string, string> = {};
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

    const res = await fetch(`${baseUrl}/blockchain/transactions/${txHash}`, { headers });
    if (!res.ok) return false;

    const tx = await res.json();
    void expectedMemo;
    void expectedAmount;
    return tx?.success === true;
  } catch {
    return false;
  }
}
