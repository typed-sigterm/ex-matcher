<script setup lang="ts">
import { useTemplateRef } from 'vue';
import { useGameStore } from '@/utils/game';
import { BadgeFlag, useRoundStore } from '@/utils/round';

const game = useGameStore();
const round = useRoundStore();
const headerBoard = useTemplateRef('headerBoard');
const matchBoard = useTemplateRef('matchBoard');

function onGo() {
  round.start();
  headerBoard.value!.start();
  matchBoard.value!.start();
}

function onCompleted() {
  round.stop();
  const achievement = round.time / game.roundlyPairCount;
  headerBoard.value?.stop();

  let badge = 0;
  if (!round.mismatchedAttemptCount)
    badge |= BadgeFlag.FC;
  if (game.record && round.achievement < game.record)
    badge |= BadgeFlag.FDX;
  game.rank.push({
    playerId: round.playerId!,
    achievement,
    badge,
  });

  const nextId = round.playerId! + 1;
  round.$reset();
  if (nextId >= game.players.length)
    game.status = 'finished';
  else
    round.playerId = nextId;
}

const restart = () => game.$reset();
</script>

<template>
  <div v-if="game.status === 'configuring'" class="flex size-screen items-center justify-center">
    <Configure />
  </div>

  <div v-else-if="game.status === 'playing'" class="flex size-screen">
    <RealtimeRank />
    <div class="w-0.5 bg-gray-200" />
    <div class="flex flex-col flex-1">
      <HeaderBoard ref="headerBoard" />
      <Progress />
      <MatchBoard ref="matchBoard" @go="onGo" @completed="onCompleted" />
    </div>
  </div>

  <div v-else class="flex size-screen items-center justify-center">
    <NCard class="w-100 h-120" size="large" :segmented="{ content: true }">
      <template #header>
        <div class="i-lucide:medal mr-1" />
        Final Standings
      </template>
      <template #action>
        <NButton type="primary" @click="restart">
          Restart
        </NButton>
      </template>
      <FinalRankPairwise v-if="game.mode === 'pairwise'" />
      <FinalRankLeaderboard v-else />
    </NCard>
  </div>
</template>

<style scoped>
:deep() > .n-card__action {
  display: flex;
  justify-content: right;
}

:deep() > .n-card-header > .n-card-header__main {
  display: flex;
  align-items: center;
}
</style>
