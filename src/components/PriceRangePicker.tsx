"use client";

import { formatCurrency } from "@/lib/format";
import type { DayOHLC } from "@/lib/types";

interface PriceRangePickerProps {
  ohlc: DayOHLC;
  price: number;
  onChange: (price: number) => void;
}

function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function lerp(min: number, max: number, t: number) {
  return min + (max - min) * t;
}

export function PriceRangePicker({ ohlc, price, onChange }: PriceRangePickerProps) {
  const { open, close, currency } = ohlc;
  const low = roundToCents(ohlc.low);
  const high = roundToCents(ohlc.high);
  const range = high - low;
  const sliderValue = range > 0 ? ((price - low) / range) * 100 : 50;

  const handleSlider = (pct: number) => {
    onChange(roundToCents(clamp(lerp(low, high, pct / 100), low, high)));
  };

  const handleInput = (raw: string) => {
    const num = parseFloat(raw);
    if (Number.isNaN(num)) return;
    onChange(roundToCents(clamp(num, low, high)));
  };

  return (
    <div className="space-y-4 rounded-lg border border-slate-700 bg-slate-800/50 p-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-400">당일 가격 범위</span>
        <span className="text-slate-500">
          {formatCurrency(low, currency)} — {formatCurrency(high, currency)}
        </span>
      </div>

      <div className="relative pt-2">
        <div className="mb-1 flex justify-between text-xs text-slate-500">
          <span>저가</span>
          <span>고가</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={0.1}
          value={sliderValue}
          onChange={(e) => handleSlider(parseFloat(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-red-500/40 via-slate-600 to-emerald-500/40 accent-emerald-500"
        />
        <div className="mt-2 flex justify-between text-xs">
          <span className="text-red-400">{formatCurrency(low, currency)}</span>
          <span className="text-emerald-400">{formatCurrency(high, currency)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-md bg-slate-800 px-3 py-2">
          <span className="text-slate-500">시가</span>
          <p className="font-medium text-white">{formatCurrency(open, currency)}</p>
        </div>
        <div className="rounded-md bg-slate-800 px-3 py-2">
          <span className="text-slate-500">종가</span>
          <p className="font-medium text-white">{formatCurrency(close, currency)}</p>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm text-slate-400">체결 단가</label>
        <input
          type="number"
          min={low}
          max={high}
          step="any"
          value={price.toFixed(2)}
          onChange={(e) => handleInput(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
        />
        <p className="mt-1 text-xs text-slate-500">
          슬라이더로 당일 저가~고가 사이에서 선택하거나 직접 입력하세요.
        </p>
      </div>
    </div>
  );
}
