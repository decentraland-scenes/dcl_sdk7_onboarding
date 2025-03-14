import { GameController } from './gameController'
import ReactEcs, { ReactEcsRenderer } from '@dcl/sdk/react-ecs'
import { NpcUtilsUi} from 'dcl-npc-toolkit'
import { PopUpControls } from '../uis/popUpControls'
import { KeyBoardUI } from '../uis/keyboardUI'
import { Popup } from '../uis/popupUI'
import { WidgetTasks } from '../uis/widgetTask'
import { engine, PointerLock } from '@dcl/sdk/ecs'
import { SkipCinematicUI } from '../uis/skipCinematicUI'

export class UIController {
  public gameController: GameController
  public popUpControls: PopUpControls
  public keyBoardUI: KeyBoardUI
  public popUpUI: Popup
  public skipCinematicUI: SkipCinematicUI
  public isPointerLocked: boolean = false
  public widgetTasks: WidgetTasks
  uiComponent: () => ReactEcs.JSX.Element[]
  constructor(gameController: GameController) {
    this.gameController = gameController
    this.popUpControls = new PopUpControls(this)
    this.keyBoardUI = new KeyBoardUI(this)
    this.popUpUI = new Popup(this)
    this.widgetTasks = new WidgetTasks(this)
    this.skipCinematicUI = new SkipCinematicUI(this)
    this.uiComponent = () => [
      this.popUpControls.puzzleUI(),
      this.popUpControls.puzzleUIConnectCables(),
      NpcUtilsUi(),
      this.popUpControls.spaceUI(),
      this.keyBoardUI.mainUi(),
      this.popUpUI.popupUI(),
      this.popUpUI.controlUI(),
      this.popUpControls.emoteUI(),
      this.popUpControls.controlsUI(),
      this.widgetTasks.widgetTask(),
      this.popUpUI.popupUIEmote(),
      this.gameController.questEmote.claim.claimInProgress.render(),
      this.gameController.questEmote.claim.captchaUI.render(),
      this.gameController.questEmote.claim.retryUI.render(),
      this.gameController.questEmote.claim.onTheWay.render(),
      this.popUpUI.popupUIVest(),
      this.gameController.questMaterial.claim.claimInProgress.render(),
      this.gameController.questMaterial.claim.captchaUI.render(),
      this.gameController.questMaterial.claim.retryUI.render(),
      this.gameController.questMaterial.claim.onTheWay.render(),
      this.gameController.questPortal.claim.claimInProgress.render(),
      this.gameController.questPortal.claim.captchaUI.render(),
      this.gameController.questPortal.claim.retryUI.render(),
      this.gameController.questPortal.claim.onTheWay.render(),
      this.skipCinematicUI.mainUi()
    ]
    ReactEcsRenderer.setUiRenderer(this.uiComponent)
    //this.keyBoardUI.isVisible = true

    this.listenToPointerLockChange()
  }

  listenToPointerLockChange() {
      PointerLock.onChange(engine.CameraEntity, (pointerLock) => {
        if(!pointerLock) {
          this.isPointerLocked = false
          return;
        }
        this.isPointerLocked = pointerLock.isPointerLocked
      })
    }
}
