import type { InjectionKey, Ref } from 'vue';
import type { GameState } from '@/utils/game';

export const EditingGameConfig: InjectionKey<Ref<GameState>> = Symbol('editing-game-config');
export const DisableNext: InjectionKey<Ref<boolean>> = Symbol('disable-next');
export const SyncToConfig: InjectionKey<Ref<(() => void) | undefined>> = Symbol('sync-to-config');
