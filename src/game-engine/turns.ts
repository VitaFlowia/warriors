export type MatchState = {
  round: number;
  turnOrder: string[];
  currentTurnIndex: number;
  status: 'playing' | 'victory' | 'defeat' | 'village_collapse';
  villageSecurity: number;
};

export function getNextTurn(state: MatchState): MatchState {
  let nextIndex = state.currentTurnIndex + 1;
  let nextRound = state.round;

  if (nextIndex >= state.turnOrder.length) {
    nextIndex = 0;
    nextRound += 1;
  }

  return {
    ...state,
    currentTurnIndex: nextIndex,
    round: nextRound,
  };
}

export function getCurrentActor(state: MatchState): string {
  return state.turnOrder[state.currentTurnIndex];
}
