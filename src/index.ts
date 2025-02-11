import { wait_ms } from './cinematic/cameraManager'
import { GameController } from './controllers/gameController'
export function main() {
  const gameController = new GameController()

  startGame(gameController)
}

async function startGame(gameController: GameController){
  await wait_ms(1000)
  gameController.spawnIsland.startSpawnIsland()
}
