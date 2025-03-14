import { UiCanvasInformation, engine } from '@dcl/sdk/ecs'
import ReactEcs, { Label, UiEntity } from '@dcl/sdk/react-ecs'
import { GameController } from '../controllers/gameController'
import { Color4 } from '@dcl/sdk/math'
import * as utils from '@dcl-sdk/utils'
import { UIController } from '../controllers/uiController'
import { AudioManager } from '../imports/components/audio/audio.manager'
import { TaskType } from './widgetTask'
import { wait_ms } from '../cinematic/cameraManager'

export class KeyBoardUI {
  image: string = 'assets/ui/UI_Keyboard.png'
  IMAGE_SCALE: number = 0.7
  isVisible: boolean = false
  // pressanykey: string = 'Press left click to Continue...'
  pressanykey: string = ''
  currentBackgroundColor: Color4 = Color4.create(0, 0, 0, 1)
  isFadingOut: boolean = false
  canClick: boolean = false
  private isStarted = false
  uiController: UIController
  constructor(uiController: UIController) {
    this.uiController = uiController
  }

  async startFadeOut() {
    if (this.isFadingOut) return

    this.isFadingOut = true
    let fadeInterval = 62/2
    let stepValue = 0.05
    let alpha = 1

    //this.uiController.gameController.spawnIsland.startSpawnIsland()
    await wait_ms(250)
    
    let interval = utils.timers.setInterval(() => {
      alpha -= stepValue
      this.currentBackgroundColor = Color4.create(0, 0, 0, alpha)
      if (alpha <= 0) {
        alpha = 0
        utils.timers.clearInterval(interval)
        this.isVisible = false
        this.isFadingOut = false
        AudioManager.instance().playOnce('pop_up_close', {
          volume: 0.2,
          parent: this.uiController.gameController.spawnIsland.tobor.entity
        })
      }
    }, fadeInterval)
    
    // if(this.isStarted) return;
    // this.isStarted = true
    // this.uiController.gameController.spawnIsland.startSpawnIsland()
    // //this.uiController.gameController.questEmote.giveReward()
  }

  mainUi(): ReactEcs.JSX.Element {
    return (
      <UiEntity
        uiTransform={{
          flexDirection: 'row',
          width: '100%',
          height: '100%',
          justifyContent: 'center',
          positionType: 'absolute',
          position: { top: '0%', right: '0%' },
          display: this.isVisible ? 'flex' : 'none'
        }}
        uiBackground={{
          // color: Color4.create(0, 0, 0, 0.2)
          color: this.currentBackgroundColor
        }}
      >
        <UiEntity
          uiTransform={{
            flexDirection: 'row',
            width: '70%',
            height: '70%',
            justifyContent: 'center',
            positionType: 'absolute',
            position: { top: '17%', right: '12%' },
            display: this.isVisible ? 'flex' : 'none'
          }}
          uiBackground={{
            textureMode: 'stretch',
            texture: { src: this.image }
          }}
          onMouseDown={() => {
            if(!this.canClick) return
            this.uiController.widgetTasks.showTasks(true, TaskType.Simple)
            this.startFadeOut()
          }}
        ></UiEntity>
        <Label
          uiTransform={{
            positionType: 'absolute',
            position: { left: '40%', bottom: '8%' }
          }}
          value={this.pressanykey}
          fontSize={30}
          font="sans-serif"
          color={Color4.White()}
          textAlign="bottom-center"
        />
      </UiEntity>
    )
  }
}
