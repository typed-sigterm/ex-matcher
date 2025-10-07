import type { InjectionKey, Ref } from 'vue';
import type { GameState } from '@/utils/game';

export const EditingGameConfigSymbol: InjectionKey<Ref<GameState>> = Symbol('editing-game-config');
