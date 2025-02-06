import { cameraManager } from '../cinematic/cameraManager'
import { initAudioEntities } from '../imports/components/audio/sounds'
import { MainInstace } from '../instance/mainInstance'
import { Dialogs } from '../jsonData/npc_dialogs'
import { QuestEmote } from '../quest/questEmote'
import { QuestMaterials } from '../quest/questMaterials'
import { QuestPortal } from '../quest/questPortals'
import { QuestPuzzle } from '../quest/questPuzzle'
import { SpawnIsland } from '../quest/questStartIsland'
import { initCameraModiers } from '../utils/camera'
import { setPlayerTime } from '../utils/setPlayerTime'
import { UIController } from './uiController'

export class GameController {
  mainInstance: MainInstace
  uiController: UIController
  spawnIsland: SpawnIsland
  questEmote: QuestEmote
  questMaterial: QuestMaterials
  questPortal: QuestPortal
  dialogs: Dialogs
  timeStamp: number
  questPuzzle: QuestPuzzle
  constructor() {
    initCameraModiers()
    cameraManager.initCamera()
    this.mainInstance = new MainInstace(this)
    this.dialogs = new Dialogs(this)
    this.spawnIsland = new SpawnIsland(this)
    this.questEmote = new QuestEmote(this)
    this.questPuzzle = new QuestPuzzle(this)
    this.questMaterial = new QuestMaterials(this)
    this.questPortal = new QuestPortal(this)
    this.timeStamp = setPlayerTime()
    this.uiController = new UIController(this)

    initAudioEntities()
  }
}
