import { onEnterScene } from '@dcl/sdk/src/players'
import { wait_ms } from './cinematic/cameraManager'
import { GameController } from './controllers/gameController'
import { sendTrak } from './utils/segment'
export function main() {
  const gameController = new GameController()

  startGame(gameController)
  onEnterScene(()=>{
    sendTrak('z0_quest0_00', gameController.timeStamp)
  })
}

async function startGame(gameController: GameController){
  await wait_ms(100)
  gameController.spawnIsland.startSpawnIsland()
}
