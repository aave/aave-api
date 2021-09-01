import BigNumber from 'bignumber.js';
import { normalize } from '@aave/protocol-js';
import { BigNumber as BigNumberEthers } from 'ethers';
import { BlockTime, Network } from '../repositories/blockchain/connection';

export const currencyUnitsToDecimals = (
  value: string,
  decimals: number,
): string =>
  new BigNumber(value).multipliedBy(new BigNumber(10).pow(decimals)).toFixed(0);

export const convertToEth = (value: string): string => normalize(value, 18);

export type TimeFrameType = {
  currentTimestamp: number;
  oneDayAgoTimestamp: number;
  sevenDaysAgoTimestamp: number;
};

export const getTimeFramesInUTC = (): TimeFrameType => {
  const oneDayInSeconds = 24 * 60 * 60;
  const currentDayUTC = Math.round(new Date().setUTCHours(0, 0, 0, 0) / 1000);
  const oneDayAgoUTC = currentDayUTC - oneDayInSeconds;
  const sevenDaysAgoUTC = currentDayUTC - 7 * oneDayInSeconds;

  return {
    currentTimestamp: currentDayUTC,
    oneDayAgoTimestamp: oneDayAgoUTC,
    sevenDaysAgoTimestamp: sevenDaysAgoUTC,
  };
};

export const getTimeFrames = (): TimeFrameType => {
  const oneDayInSeconds = 24 * 60 * 60;
  const currentTimestamp = Math.round(new Date().getTime() / 1000);
  const oneDayAgoTimestamp = currentTimestamp - oneDayInSeconds;
  const sevenDaysAgoTimestamp = currentTimestamp - 7 * oneDayInSeconds;

  return {
    currentTimestamp,
    oneDayAgoTimestamp,
    sevenDaysAgoTimestamp,
  };
};

export function tokenToUsd(
  amount: string,
  priceInEth: string,
  decimals: number,
  usdPriceEth: string | number,
): number {
  return new BigNumber(normalize(amount, decimals))
    .multipliedBy(priceInEth)
    .dividedBy(usdPriceEth)
    .toNumber();
}

export function tokenToEth(
  amount: string,
  priceInEth: string,
  decimals: number,
): number {
  return new BigNumber(normalize(amount, decimals))
    .multipliedBy(priceInEth)
    .toNumber();
}

export function toUsd(
  amount: string | number,
  priceInEth: string | number,
  usdPriceEth: string | number,
): number {
  return new BigNumber(amount)
    .multipliedBy(priceInEth)
    .dividedBy(usdPriceEth)
    .toNumber();
}

export function toEth(amount: number, priceInEth: string): number {
  return new BigNumber(amount).multipliedBy(priceInEth).toNumber();
}

export type BlockNumberFrameType = {
  oneDayAgoBlocknumber: number;
};

export const getBlockNumbers = (
  currentBlocknumber: number,
  network: Network,
): BlockNumberFrameType => {
  const { oneDayAgoTimestamp, currentTimestamp } = getTimeFrames();
  const blockDiff = Math.round(
    (currentTimestamp - oneDayAgoTimestamp) /
      BlockTime[network as keyof typeof BlockTime],
  );
  const oneDayAgoBlocknumber = currentBlocknumber - blockDiff;
  return {
    oneDayAgoBlocknumber,
  };
};

export function formatObjectWithBNFields<
  T extends Record<string, BigNumberEthers | string | number | boolean>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
>(obj: T): { [P in keyof T]: any } {
  return Object.keys(obj).reduce((acc, key: string | number) => {
    if (typeof key !== 'number') {
      let value = obj[key];
      // eslint-disable-next-line no-underscore-dangle
      if ((value as BigNumberEthers)._isBigNumber) {
        value = value.toString();
      }
      acc[key as keyof typeof obj] = value;
    }
    return acc;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }, {} as { [P in keyof T]: any });
}

export function tokenToUsdString(
  amount: string | number,
  priceInEth: string | number,
  usdPriceEth: string | number,
): string {
  return new BigNumber(amount)
    .multipliedBy(priceInEth)
    .dividedBy(usdPriceEth)
    .toString();
}
