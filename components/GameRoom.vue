<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="8">
        <v-card class="mb-4">
          <v-card-title class="text-h5">
            Sala de Jogo
            <v-chip
              color="warning"
              class="ml-2"
              v-if="gameState === 'countdown'"
            >
              Preparando...
            </v-chip>
            <v-chip
              color="success"
              class="ml-2"
              v-else-if="gameState === 'playing'"
            >
              Jogando!
            </v-chip>
          </v-card-title>

          <v-card-text>
            <div v-if="gameState === 'countdown'" class="text-center">
              <div class="text-h2">{{ countdown }}</div>
            </div>

            <div v-else-if="gameState === 'playing'" class="text-center">
              <div class="text-h4 mb-4">
                Palavra Cifrada: {{ currentChallenge.encrypted }}
              </div>
              <div class="text-h6 mb-4">
                Deslocamento: {{ currentChallenge.shift }}
              </div>
              <v-text-field
                v-model="userAnswer"
                label="Sua resposta"
                @keyup.enter="submitAnswer"
                :disabled="hasAnswered"
              ></v-text-field>
              <v-btn
                color="primary"
                @click="submitAnswer"
                :disabled="hasAnswered"
              >
                Enviar Resposta
              </v-btn>
              <div class="text-h2 mt-4">{{ timeLeft }}s</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>Ranking</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item
                v-for="player in sortedPlayers"
                :key="player.id"
                :class="{ 'highlight-player': player.id === currentPlayer.id }"
              >
                <v-list-item-title>
                  {{ player.username }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  Pontos: {{ player.score }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
const { $supabase } = useNuxtApp()
const props = defineProps({
  currentPlayer: {
    type: Object,
    required: true
  }
})

const gameState = ref('playing')
const countdown = ref(3)
const timeLeft = ref(30)
const userAnswer = ref('')
const hasAnswered = ref(false)
const players = ref([])
const currentChallenge = ref(null)
const isHost = ref(false)

const sortedPlayers = computed(() => {
  return [...players.value].sort((a, b) => b.score - a.score)
})

onMounted(async () => {
  // Subscribe to game state changes
  const gameChannel = $supabase
    .channel('game-state')
    .on('broadcast', { event: 'game-state' }, ({ payload }) => {
      handleGameStateUpdate(payload)
    })
    .subscribe()

  // Subscribe to player updates
  const playersChannel = $supabase
    .channel('players')
    .on('broadcast', { event: 'player-update' }, ({ payload }) => {
      handlePlayerUpdate(payload)
    })
    .subscribe()

  // Load initial players
  const { data: initialPlayers } = await $supabase
    .from('players')
    .select('*')
  players.value = initialPlayers

  // Start game automatically
  startNewRound()
})

const handleGameStateUpdate = (payload) => {
  gameState.value = payload.state
  if (payload.state === 'countdown') {
    countdown.value = payload.countdown
  } else if (payload.state === 'playing') {
    currentChallenge.value = payload.challenge
    timeLeft.value = 30
    hasAnswered.value = false
    userAnswer.value = ''
  }
}

const handlePlayerUpdate = (payload) => {
  const index = players.value.findIndex(p => p.id === payload.id)
  if (index !== -1) {
    players.value[index] = { ...players.value[index], ...payload }
  } else {
    players.value.push(payload)
  }
}

const startNewRound = async () => {
  const challenge = {
    encrypted: encrypt('EXEMPLO', generateRandomShift()),
    shift: generateRandomShift()
  }

  await $supabase
    .channel('game-state')
    .send({
      type: 'broadcast',
      event: 'game-state',
      payload: {
        state: 'countdown',
        countdown: 3
      }
    })

  setTimeout(() => {
    $supabase
      .channel('game-state')
      .send({
        type: 'broadcast',
        event: 'game-state',
        payload: {
          state: 'playing',
          challenge
        }
      })
    
    // Start timer for next round
    setTimeout(() => {
      startNewRound()
    }, 30000) // 30 seconds per round
  }, 3000)
}

const submitAnswer = async () => {
  if (hasAnswered.value) return

  const isCorrect = userAnswer.value.toLowerCase() === 
    decrypt(currentChallenge.value.encrypted, currentChallenge.value.shift).toLowerCase()

  hasAnswered.value = true

  await $supabase
    .channel('players')
    .send({
      type: 'broadcast',
      event: 'player-update',
      payload: {
        id: props.currentPlayer.id,
        score: props.currentPlayer.score + (isCorrect ? 10 : 0)
      }
    })
}

onUnmounted(() => {
  $supabase.removeAllChannels()
})
</script>

<style scoped>
.highlight-player {
  background-color: rgba(var(--v-theme-primary), 0.1);
}
</style> 