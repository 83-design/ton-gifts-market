'use client';

import { useState } from 'react';
import { Wallet, ArrowDownLeft, ArrowUpRight, Unlink } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { BottomSheet } from './BottomSheet';
import { useWallet } from '@/hooks/useWallet';
import { useApi } from '@/hooks/useApi';
import { useStore } from '@/lib/store';
import { formatTon, formatGram, shortenAddress, tonToUsd, gramToTon } from '@/lib/utils';

export function WalletPanel() {
  const { isConnected, address, connect, disconnect, depositTon } = useWallet();
  const { api } = useApi();
  const balanceTon = useStore((s) => s.balanceTon);
  const balanceGram = useStore((s) => s.balanceGram);
  const setBalance = useStore((s) => s.setBalance);

  const [sheetMode, setSheetMode] = useState<'deposit' | 'withdraw' | null>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const totalUsd = tonToUsd(balanceTon + gramToTon(balanceGram));

  const handleDeposit = async () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) return;
    if (!isConnected) {
      await connect();
      return;
    }
    setLoading(true);
    setMsg(null);
    try {
      await depositTon(val, 'TON');
      setMsg(`Пополнено на ${formatTon(val)} TON`);
      setAmount('');
      setTimeout(() => setSheetMode(null), 1000);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Ошибка пополнения');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) return;
    if (!address) {
      setMsg('Сначала подключите TON-кошелек');
      return;
    }
    setLoading(true);
    setMsg(null);
    try {
      await api('wallet/withdraw', {
        method: 'POST',
        body: { amount: val, currency: 'TON', address },
      });
      const bal = await api<{ balanceTon: number; balanceGram: number }>('wallet/balance');
      setBalance(bal.balanceTon, bal.balanceGram);
      setMsg(`Заявка на вывод ${formatTon(val)} TON создана`);
      setAmount('');
      setTimeout(() => setSheetMode(null), 1000);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Ошибка вывода');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="p-4 rounded-2xl border border-white/[0.07] space-y-4"
        style={{
          backgroundColor: 'rgba(14, 10, 11, 0.78)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-ash">Внутренний баланс</p>
            <p className="text-2xl font-bold text-pearl tabular-nums mt-0.5">
              {formatTon(balanceTon)} TON
            </p>
            <p className="text-xs text-ash tabular-nums">
              {formatGram(balanceGram)} GRAM • {totalUsd}
            </p>
          </div>

          {isConnected && address ? (
            <button
              onClick={disconnect}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-pearl hover:border-ruby-800/40"
              title="Отключить кошелек"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-mono">{shortenAddress(address)}</span>
              <Unlink size={12} className="text-ash" />
            </button>
          ) : (
            <Button size="sm" variant="secondary" onClick={connect}>
              <Wallet size={14} />
              TON Connect
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <Button
            size="md"
            onClick={() => {
              setMsg(null);
              setSheetMode('deposit');
            }}
          >
            <ArrowDownLeft size={16} />
            Пополнить
          </Button>
          <Button
            size="md"
            variant="secondary"
            onClick={() => {
              setMsg(null);
              setSheetMode('withdraw');
            }}
          >
            <ArrowUpRight size={16} />
            Вывести
          </Button>
        </div>
      </div>

      <BottomSheet
        isOpen={sheetMode !== null}
        onClose={() => setSheetMode(null)}
        title={sheetMode === 'deposit' ? 'Пополнение баланса' : 'Вывод средств'}
      >
        <div className="p-5 space-y-4">
          <Input
            label={sheetMode === 'deposit' ? 'Сумма пополнения' : 'Сумма вывода'}
            type="number"
            step="0.1"
            min="0.1"
            placeholder="0.00"
            suffix="TON"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          {sheetMode === 'withdraw' && (
            <p className="text-xs text-ash">
              Доступно: <span className="text-pearl tabular-nums">{formatTon(balanceTon)} TON</span>
              {address ? ` → ${shortenAddress(address, 6)}` : ' (подключите кошелек)'}
            </p>
          )}
          {msg && <p className="text-xs text-pearl">{msg}</p>}
          <Button
            fullWidth
            loading={loading}
            onClick={sheetMode === 'deposit' ? handleDeposit : handleWithdraw}
          >
            {sheetMode === 'deposit' ? 'Отправить через TON Connect' : 'Подтвердить вывод'}
          </Button>
        </div>
      </BottomSheet>
    </>
  );
}
