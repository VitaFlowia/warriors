import { rollD20, DiceResult } from './dice';

export type CombatAction = {
  actor: string;
  target: string;
  attributeBonus: number;
  weaponDamage: number;
  defenseBonus: number;
};

export type CombatResult = {
  diceResult: DiceResult;
  damageDealt: number;
  logMessage: string;
};

export function executeAttack(action: CombatAction): CombatResult {
  const dice = rollD20(action.attributeBonus);

  if (dice.isCriticalFailure) {
    return {
      diceResult: dice,
      damageDealt: 0,
      logMessage: `${action.actor} errou miseravelmente o ataque contra ${action.target}. Falha Crítica!`,
    };
  }

  if (dice.success) {
    let damage = action.attributeBonus + action.weaponDamage - action.defenseBonus;
    if (dice.isCriticalSuccess) {
      damage = (action.attributeBonus + action.weaponDamage) * 2 - action.defenseBonus; // Acerto crítico dobra o dano antes da armadura
    }
    
    damage = Math.max(0, damage); // Dano não pode ser negativo

    return {
      diceResult: dice,
      damageDealt: damage,
      logMessage: `${action.actor} atingiu ${action.target} com um ${dice.isCriticalSuccess ? 'Acerto Crítico!' : 'golpe.'} Causou ${damage} de dano.`,
    };
  }

  return {
    diceResult: dice,
    damageDealt: 0,
    logMessage: `${action.actor} tentou atacar ${action.target}, mas errou.`,
  };
}
