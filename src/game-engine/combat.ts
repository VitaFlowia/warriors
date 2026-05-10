import { rollD20, DiceResult } from './dice';
import { SKILL_EFFECTS } from './skills';

export type CombatAction = {
  actor: string;
  target: string;       // Can be "Todos" for AoE
  attributeBonus: number;
  weaponDamage: number;
  defenseBonus: number;
  preRolledDice?: number;
  skillName?: string;
};

export type CombatResult = {
  diceResult: DiceResult;
  damageDealt: number;  // Used for damage or heal amount
  logMessage: string;
  isHeal?: boolean;
};

export function executeAttack(action: CombatAction): CombatResult {
  const dice = rollD20(action.attributeBonus, action.preRolledDice);
  const skill = action.skillName ? SKILL_EFFECTS[action.skillName] : SKILL_EFFECTS['attack'];
  const effect = skill || SKILL_EFFECTS['attack'];

  if (dice.isCriticalFailure) {
    return {
      diceResult: dice,
      damageDealt: 0,
      logMessage: `${action.actor} falhou criticamente ao usar ${action.skillName || 'seu ataque'}!`,
    };
  }

  if (dice.success) {
    let baseAmount = (action.attributeBonus + action.weaponDamage) * effect.basePower;
    
    // Healing logic
    if (effect.type === 'heal') {
      let heal = Math.floor(baseAmount);
      if (dice.isCriticalSuccess) heal = Math.floor(heal * 1.5);
      return {
        diceResult: dice,
        damageDealt: heal,
        isHeal: true,
        logMessage: `${action.actor} curou ${action.target} com um ${dice.isCriticalSuccess ? 'Sucesso Crítico!' : 'sucesso.'} Restaurou ${heal} HP.`,
      };
    }

    // Damage logic
    let damage = baseAmount - action.defenseBonus;
    if (dice.isCriticalSuccess) {
      damage = (baseAmount) * 2 - action.defenseBonus; // Acerto crítico dobra o dano antes da armadura
    }
    
    damage = Math.floor(Math.max(1, damage)); // Dano mínimo 1 (se acertou)

    return {
      diceResult: dice,
      damageDealt: damage,
      logMessage: `${action.actor} atingiu ${action.target} com um ${dice.isCriticalSuccess ? 'Acerto Crítico!' : 'golpe.'} Causou ${damage} de dano${effect.type === 'damage_aoe' ? ' a todos' : ''}.`,
    };
  }

  return {
    diceResult: dice,
    damageDealt: 0,
    logMessage: `${action.actor} tentou atacar ${action.target}, mas errou.`,
  };
}
