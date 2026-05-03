export type DiceResult = {
  roll: number;
  total: number;
  isCriticalSuccess: boolean;
  isCriticalFailure: boolean;
  success: boolean;
};

/**
 * Rolls a d20 and calculates success based on attribute bonus.
 * >= 12 is SUCCESS, 1-3 is CRITICAL FAILURE, 20 is CRITICAL SUCCESS.
 */
export function rollD20(attributeBonus: number = 0, preRolledValue?: number): DiceResult {
  const roll = preRolledValue !== undefined ? preRolledValue : Math.floor(Math.random() * 20) + 1;
  const total = roll + attributeBonus;

  const isCriticalSuccess = roll === 20;
  const isCriticalFailure = roll >= 1 && roll <= 3;
  const success = isCriticalSuccess || (total >= 12 && !isCriticalFailure);

  return {
    roll,
    total,
    isCriticalSuccess,
    isCriticalFailure,
    success,
  };
}
