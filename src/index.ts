import { GameController } from './controllers/gameController'

export let gameController: GameController

export function main() {
   gameController = new GameController()
}
