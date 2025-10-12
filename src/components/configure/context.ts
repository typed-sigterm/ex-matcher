import type { InjectionKey, Ref } from 'vue';
import type { GameState } from '@/utils/game';

export const EditingGameConfig: InjectionKey<Ref<GameState>> = Symbol('editing-game-config');
