'use client';

import { useCallback, useEffect } from 'react';
import { useTonConnectUI, useTonWallet, useTonAddress } from '@tonconnect/ui-react';
import { useStore } from '@/lib/store';
import { useApi } from './useApi';
import { generateMemo } from '@/lib/utils';

export function useWallet() {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const address = useTonAddress(false);
  const setWalletAddress = useStore((s) => s.setWalletAddress);
  const setBalance = useStore((s) => s.setBalance);
  const { api } = useApi();

  useEffect(() => {
    setWalletAddress(address || null);
  }, [address, setWalletAddress]);

  const connect = useCallback(async () => {
    try {
      await tonConnectUI.openModal();
    } catch (err) {
      console.error('Failed to connect wallet:', err);
    }
  }, [tonConnectUI]);

  const disconnect = useCallback(async () => {
    try {
      await tonConnectUI.disconnect();
      setWalletAddress(null);
    } catch (err) {
      console.error('Failed to disconnect wallet:', err);
    }
  }, [tonConnectUI, setWalletAddress]);

  const depositTon = useCallback(
    async (amount: number, currency: 'TON' | 'GRAM' = 'TON') => {
      const memo = generateMemo();

      const { transaction: depositTx } = await api<{
        transaction: { address: string; amount: string; payload: string };
      }>('wallet/deposit', {
        method: 'POST',
        body: { amount, currency, memo },
      });

      const result = await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [
          {
            address: depositTx.address,
            amount: depositTx.amount,
            payload: depositTx.payload,
          },
        ],
      });

      await api('wallet/deposit/confirm', {
        method: 'POST',
        body: { memo, txHash: result.boc },
      });

      const { balanceTon, balanceGram } = await api<{
        balanceTon: number;
        balanceGram: number;
      }>('wallet/balance');
      setBalance(balanceTon, balanceGram);

      return result;
    },
    [tonConnectUI, api, setBalance]
  );

  const buyDirect = useCallback(
    async (listingId: string) => {
      const { transaction } = await api<{
        transaction: { address: string; amount: string; payload: string };
      }>(`listings/${listingId}/buy`, {
        method: 'POST',
        body: { paymentMethod: 'direct' },
      });

      const result = await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [
          {
            address: transaction.address,
            amount: transaction.amount,
            payload: transaction.payload,
          },
        ],
      });

      return result;
    },
    [tonConnectUI, api]
  );

  const buyWithBalance = useCallback(
    async (listingId: string) => {
      const result = await api(`listings/${listingId}/buy`, {
        method: 'POST',
        body: { paymentMethod: 'balance' },
      });

      const { balanceTon, balanceGram } = await api<{
        balanceTon: number;
        balanceGram: number;
      }>('wallet/balance');
      setBalance(balanceTon, balanceGram);

      return result;
    },
    [api, setBalance]
  );

  return {
    wallet,
    address,
    isConnected: !!wallet,
    connect,
    disconnect,
    depositTon,
    buyDirect,
    buyWithBalance,
  };
}
