"use client";

import { computed, signal } from '@preact/signals-react';
import { EDirection } from '../types';

// Serializable object with initial values
export const tradingSignalsInitialState = {
  mainStablecoin: "USDT",
  selectedCoin: "BTC",
  positionEntry: 100000,
  positionSl: 90000,
  positionTp: 125000,
  positionRisk: 1,
  positionBudget: 100,
  positionLeverage: 10,
};

// Helper to load from localStorage or use defaults
function loadSignalValue<T>(key: keyof typeof tradingSignalsInitialState): T {
  const stored = localStorage.getItem(`tradingSignal_${key}`);
  if (stored !== null) {
    try {
      return JSON.parse(stored) as T;
    } catch {
      // fallback to default if parsing fails
    }
  }
  return tradingSignalsInitialState[key] as T;
}

// Helper to persist to localStorage
function persistSignalValue<T>(key: keyof typeof tradingSignalsInitialState, value: T) {
  localStorage.setItem(`tradingSignal_${key}`, JSON.stringify(value));
}

// Signals with persistence
export const $tradingMainStablecoin = signal<string>(loadSignalValue("mainStablecoin"));
$tradingMainStablecoin.subscribe(value => persistSignalValue("mainStablecoin", value));

export const $tradingSelectedCoin = signal<string>(loadSignalValue("selectedCoin"));
$tradingSelectedCoin.subscribe(value => persistSignalValue("selectedCoin", value));

export const $tradingPositionEntry = signal<number>(loadSignalValue("positionEntry"));
$tradingPositionEntry.subscribe(value => persistSignalValue("positionEntry", value));

export const $tradingPositionSl = signal<number>(loadSignalValue("positionSl"));
$tradingPositionSl.subscribe(value => persistSignalValue("positionSl", value));

export const $tradingPositionTp = signal<number>(loadSignalValue("positionTp"));
$tradingPositionTp.subscribe(value => persistSignalValue("positionTp", value));

export const $tradingPositionRisk = signal<number>(loadSignalValue("positionRisk"));
$tradingPositionRisk.subscribe(value => persistSignalValue("positionRisk", value));

export const $tradingPositionBudget = signal<number>(loadSignalValue("positionBudget"));
$tradingPositionBudget.subscribe(value => persistSignalValue("positionBudget", value));

export const $tradingPositionLeverage = signal<number>(loadSignalValue("positionLeverage"));
$tradingPositionLeverage.subscribe(value => persistSignalValue("positionLeverage", value));

export const $tradingPositionRiskPerTrade = computed(() => $tradingPositionBudget.value * ($tradingPositionRisk.value / 100));
export const $tradingPositionRiskPerUnit = computed(() => Math.abs($tradingPositionEntry.value - $tradingPositionSl.value));
export const $tradingPositionRewardPerUnit = computed(() => Math.abs($tradingPositionEntry.value - $tradingPositionTp.value));
export const $tradingPositionRR = computed(() => Math.round($tradingPositionRewardPerUnit.value / $tradingPositionRiskPerUnit.value * 100) / 100);

export const $tradingPositionDirection = computed(() => {
  const direction = $tradingPositionSl.value > $tradingPositionEntry.value
    ? EDirection.SHORT
    : EDirection.LONG;

  return direction;
});

export const $tradingPositionPercentTP = computed(() => {
  const diff = $tradingPositionDirection.value === EDirection.LONG
    ? $tradingPositionTp.value - $tradingPositionEntry.value
    : $tradingPositionEntry.value - $tradingPositionTp.value;

  const percentTP = diff / $tradingPositionEntry.value;

  return percentTP;
})

export const $tradingPositionPercentSL = computed(() => {
  const percentTP = $tradingPositionDirection.value === EDirection.LONG
    ? 1 - ($tradingPositionSl.value * 1 / $tradingPositionEntry.value)
    : 1 - ($tradingPositionEntry.value * 1 / $tradingPositionSl.value);

  return percentTP;
})

export const $tradingPositionSizeCoin = computed(() => Math.round($tradingPositionRiskPerTrade.value / $tradingPositionRiskPerUnit.value * 10000000) / 10000000);


export const $tradingPositionSizeStable = computed(() => {

  const units = $tradingPositionSizeCoin.value * $tradingPositionEntry.value;
  return Math.round(units * 100) / 100
  // const riscStable = $tradingPositionRisk.value * 100 / $tradingPositionBudget.value;
  // const percentSL = $tradingPositionDirection.value === EDirection.LONG
  //   ? 1 - ($tradingPositionSl.value * 1 / $tradingPositionEntry.value)
  //   : 1 - ($tradingPositionEntry.value * 1 / $tradingPositionSl.value);

  // console.log('psl', $tradingPositionDirection.value, percentSL, riscStable);

  // const positionSize = (riscStable / (percentSL / 100));// / $tradingPositionLeverage.value;

  // return Math.round(positionSize * 100) / 100;
});


export const $tradingPositionTotalProfitPotential = computed(() => $tradingPositionSizeCoin.value * $tradingPositionRewardPerUnit.value);
