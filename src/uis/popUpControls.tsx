import { CameraMode, CameraType, DeepReadonlyObject, InputAction, PBUiCanvasInformation, PointerEventType, Transform, UiCanvasInformation, engine, inputSystem } from '@dcl/sdk/ecs'
import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { Label, PositionUnit, UiEntity, UiTransformProps } from '@dcl/sdk/react-ecs'
import { UIController } from '../controllers/uiController'
import { CONTROLS_BACKGROUND_IMG, KEY_BACKGROUND_IMG } from './controls/controlsAssetsConfig'
import { getKeySize, KeyControlWidget, KeyType } from './controls/keyControl'
import { MoveControlsUI } from './controls/moveControls'
import { JumpControlsUI } from './controls/jumpControls'
import { LookControlsUI } from './controls/lookControls'
import { CursorLockControlsUI } from './controls/cursorLockControls'
import { EmoteControlsUI } from './controls/emoteControls'
import { InteractLockControlsUI } from './controls/interactControls'
import { RunControlsUI } from './controls/runControls'
import { CameraControlsUI } from './controls/cameraControls'



export class PopUpControls {
  uiController: UIController
  currentCamera: CameraType | null = null
  freezeCamera: boolean = false
  endPuzzle: boolean = false
  //Jump
  spaceContainer: string = 'assets/ui/UI_Tasks_Base_P.png'
  spaceContainerVisible: boolean = false
  spaceImage: string = 'assets/ui/UI_Space.png'
  spaceText: string = '<b>Jump</b>'
  //Emote
  emoteContainerVisible: boolean = false
  emoteText2: string = '<b>Press</b>'
  emoteImage: string = 'assets/ui/UI_B.png'
  emoteText: string = '<b>to open emote menu\nand select a move</b>'
  //Puzzle V
  puzzleContainerVisible: boolean = false
  puzzleImage: string = 'assets/ui/UI_V.png'
  puzzleText: string = '<b>Toggle camera to get\na closer look</b>'
  puzzleConnectCablesVisible: boolean = false
  puzzleConnectCablesText: string = '<b>Connect the cables</b>'

  //NEW CONTROLS

  private jumpControlsUI: JumpControlsUI
  private moveControlsUI: MoveControlsUI
  private lookControlsUI: LookControlsUI
  private cursorLookControlsUI: CursorLockControlsUI
  private emoteControlsUI: EmoteControlsUI
  private interactControlsUI: InteractLockControlsUI
  private runControlsUI: RunControlsUI
  private cameraControlsUI: CameraControlsUI
  private bEnableAutoSwapLookControls = true

  constructor(uiController: UIController) {
    this.uiController = uiController

    this.moveControlsUI = new MoveControlsUI()
    this.jumpControlsUI = new JumpControlsUI()
    this.lookControlsUI = new LookControlsUI()
    this.cursorLookControlsUI = new CursorLockControlsUI()
    this.emoteControlsUI = new EmoteControlsUI()
    this.interactControlsUI = new InteractLockControlsUI()
    this.runControlsUI = new RunControlsUI()
    this.cameraControlsUI = new CameraControlsUI()

    engine.addSystem((dt: number) => {
        if(this.moveControlsUI.moveContainerVisible) {
            this.moveControlsUI.keyW.update(inputSystem.isPressed(InputAction.IA_FORWARD), dt)  
            this.moveControlsUI.keyS.update(inputSystem.isPressed(InputAction.IA_BACKWARD), dt)
            this.moveControlsUI.keyA.update(inputSystem.isPressed(InputAction.IA_LEFT), dt)
            this.moveControlsUI.keyD.update(inputSystem.isPressed(InputAction.IA_RIGHT), dt)
        }
        if(this.jumpControlsUI.jumpContainerVisible) {
            this.jumpControlsUI.keySpace.update(inputSystem.isPressed(InputAction.IA_JUMP), dt)
            this.jumpControlsUI.keyWinJump.update(inputSystem.isPressed(InputAction.IA_FORWARD), dt)
        }
        if(this.runControlsUI.runContainerVisible) {
            this.runControlsUI.keyShift.update(inputSystem.isPressed(InputAction.IA_WALK), dt)
        }
        //if(this.cameraControlsUI.cameraContainerVisible) {
        //    if(CameraMode.get(engine.CameraEntity).mode == CameraType.CT_FIRST_PERSON)
        //}
        if(this.bEnableAutoSwapLookControls && (this.lookControlsUI.lookContainerVisible || this.cursorLookControlsUI.cursorLockContainerVisible)) {
            if(this.uiController.isPointerLocked && this.lookControlsUI.lookContainerVisible) {
                this.hideLookControlsUI()
                this.showCursorLockControlsUI()
            }
            else if(!this.uiController.isPointerLocked && this.cursorLookControlsUI.cursorLockContainerVisible) {
                this.hideCursorLockControlsUI()
                this.showLookControlsUI()
            }
        }
    })

    //this.showMoveControlsUI()
    //this.showJumpControlsUI()
    //this.showLookControlsUI()
    //this.showCursorLockControlsUI()
    //this.showEmoteLockControlsUI()
    //this.showInteractLockControlsUI()
    //this.showRunLockControlsUI()
    //this.showCameraLockControlsUI()
  }

    showMoveControlsUI() {
        this.moveControlsUI.moveContainerVisible = true
        this.moveControlsUI.keyW.resetPressProgress()
        this.moveControlsUI.keyS.resetPressProgress()
        this.moveControlsUI.keyA.resetPressProgress()
        this.moveControlsUI.keyD.resetPressProgress()
        this.moveControlsUI.keyW.setFinishProgressCB(()=>{this.checkMoveQuestCompleted()})
        this.moveControlsUI.keyS.setFinishProgressCB(()=>{this.checkMoveQuestCompleted()})
        this.moveControlsUI.keyA.setFinishProgressCB(()=>{this.checkMoveQuestCompleted()})
        this.moveControlsUI.keyD.setFinishProgressCB(()=>{this.checkMoveQuestCompleted()})
    }
    hideMoveControlsUI() {
        this.moveControlsUI.moveContainerVisible = false
    }
    checkMoveQuestCompleted() {
        if(
            this.moveControlsUI.keyW.bIsProgressCompleted && this.moveControlsUI.keyS.bIsProgressCompleted && 
            this.moveControlsUI.keyA.bIsProgressCompleted && this.moveControlsUI.keyD.bIsProgressCompleted
        ) {
            //TODO MOVE QUEST COMPLETED
        }
    }
    showJumpControlsUI() {
        this.jumpControlsUI.jumpContainerVisible = true
        this.jumpControlsUI.keySpace.resetPressProgress()
        this.jumpControlsUI.keySpace.setFinishProgressCB(()=>{this.checkJumpQuestCompleted()})
    }
    hideJumpControlsUI() {
        this.jumpControlsUI.jumpContainerVisible = false
    }
    checkJumpQuestCompleted() {
        if(this.jumpControlsUI.keySpace.bIsProgressCompleted) {
            //TODO MOVE QUEST COMPLETED
        }
    }
    showLookControlsUI() {
        this.lookControlsUI.lookContainerVisible = true
        this.bEnableAutoSwapLookControls = true
    }
    hideLookControlsUI() {
        this.lookControlsUI.lookContainerVisible = false
    }
    showCursorLockControlsUI() {
        this.cursorLookControlsUI.cursorLockContainerVisible = true
        this.bEnableAutoSwapLookControls = true
    }
    hideCursorLockControlsUI() {
        this.cursorLookControlsUI.cursorLockContainerVisible = false
    }
    showEmoteLockControlsUI() {
        this.emoteControlsUI.emoteContainerVisible = true
    }
    hideEmoteLockControlsUI() {
        this.emoteControlsUI.emoteContainerVisible = false
    }
    showInteractLockControlsUI() {
        this.interactControlsUI.interactContainerVisible = true
    }
    hideInteractControlsUI() {
        this.interactControlsUI.interactContainerVisible = false
    }
    showRunLockControlsUI() {
        this.runControlsUI.runContainerVisible = true
    }
    hideRunControlsUI() {
        this.runControlsUI.runContainerVisible = false
    }
    showCameraControlsUI() {
        this.cameraControlsUI.cameraContainerVisible = true
    }
    hideCameraControlsUI() {
        this.cameraControlsUI.cameraContainerVisible = false
    }
    hideAllControlsUI() {
        this.hideMoveControlsUI()
        this.hideJumpControlsUI()
        this.hideLookControlsUI()
        this.hideCursorLockControlsUI()
        this.hideEmoteLockControlsUI()
        this.hideInteractControlsUI()
        this.hideRunControlsUI()
        this.hideCameraControlsUI()
    }
  
    controlsUI(): ReactEcs.JSX.Element {
        const canvasInfo = UiCanvasInformation.get(engine.RootEntity)
        return (
            <UiEntity
            //CONTAINER
                uiTransform={{
                positionType: 'absolute',
                width: '100%',
                height: '50%',
                flexDirection: 'row-reverse',
                alignContent: 'flex-start',
                position: { bottom: '0%', right: '0%' },
                padding: { bottom: '29px' }
                }}
                /*uiBackground={{
                    color: Color4.create(1, 0, 0, 1)
                }}*/
            >
                {this.moveControlsUI.generateUI(canvasInfo)}
                {this.jumpControlsUI.generateUI(canvasInfo)}
                {this.lookControlsUI.generateUI(canvasInfo)}
                {this.cursorLookControlsUI.generateUI(canvasInfo)}
                {this.emoteControlsUI.generateUI(canvasInfo)}
                {this.interactControlsUI.generateUI(canvasInfo)}
                {this.runControlsUI.generateUI(canvasInfo)}
                {this.cameraControlsUI.generateUI(canvasInfo)}
            </UiEntity>
        )

    }
  
  // ----- OLD CONTROLS -----
  spaceUI(): ReactEcs.JSX.Element {
    const canvasInfo = UiCanvasInformation.get(engine.RootEntity)
    return (
      <UiEntity
        uiTransform={{
          positionType: 'absolute',
          width: canvasInfo.width,
          height: '15%',
          position: { bottom: '0%', left: '0%' }
        }}
        uiBackground={{
          textureMode: 'stretch',
          color: Color4.create(0, 0, 0, 0)
        }}
      >
        <UiEntity
          uiTransform={{
            flexDirection: 'row',
            width: canvasInfo.height * 0.42,
            height: canvasInfo.height * 0.13,
            justifyContent: 'flex-end',
            positionType: 'absolute',
            position: { bottom: '2%', left: '40%' },
            display: this.spaceContainerVisible ? 'flex' : 'none'
          }}
          uiBackground={{
            textureMode: 'stretch',
            texture: { src: this.spaceContainer },
            color: Color4.create(0, 0, 0, 0.5)
          }}
        >
          {/* Text UI */}
          <Label
            uiTransform={{
              positionType: 'absolute',
              position: { right: '20%', top: '35%' }
            }}
            value={this.spaceText}
            fontSize={canvasInfo.height * 0.02}
            font="sans-serif"
            color={Color4.White()}
          />
          <UiEntity
            uiTransform={{
              positionType: 'absolute',
              width: '40%',
              height: '50%',
              position: { top: '25%', left: '15%' }
            }}
            uiBackground={{
              textureMode: 'stretch',
              texture: { src: this.spaceImage }
            }}
          ></UiEntity>
        </UiEntity>
      </UiEntity>
    )
  }
  emoteUI(): ReactEcs.JSX.Element {
    const canvasInfo = UiCanvasInformation.get(engine.RootEntity)
    return (
      <UiEntity
        uiTransform={{
          positionType: 'absolute',
          width: canvasInfo.width,
          height: '15%',
          position: { bottom: '0%', left: '0%' }
        }}
        uiBackground={{
          textureMode: 'stretch',
          color: Color4.create(0, 0, 0, 0)
        }}
      >
        <UiEntity
          uiTransform={{
            flexDirection: 'row',
            width: canvasInfo.height * 0.46,
            height: canvasInfo.height * 0.13,
            justifyContent: 'flex-end',
            positionType: 'absolute',
            position: { bottom: '2%', left: '40%' },
            display: this.emoteContainerVisible ? 'flex' : 'none'
          }}
          uiBackground={{
            textureMode: 'stretch',
            texture: { src: this.spaceContainer },
            color: Color4.create(0, 0, 0, 0.5)
          }}
        >
          {/* Text UI */}
          <Label
            uiTransform={{
              positionType: 'absolute',
              position: { left: '5%', top: '35%' }
            }}
            value={this.emoteText2}
            fontSize={canvasInfo.height * 0.02}
            font="sans-serif"
            color={Color4.White()}
          />
          {/* Text UI */}
          <Label
            uiTransform={{
              positionType: 'absolute',
              position: { right: '6%', top: '28%' }
            }}
            value={this.emoteText}
            fontSize={canvasInfo.height * 0.02}
            font="sans-serif"
            color={Color4.White()}
          />
          <UiEntity
            uiTransform={{
              positionType: 'absolute',
              width: '25%',
              height: '80%',
              position: { top: '10%', left: '19%' }
            }}
            uiBackground={{
              textureMode: 'stretch',
              texture: { src: this.emoteImage }
            }}
          ></UiEntity>
        </UiEntity>
      </UiEntity>
    )
  }
  puzzleUI(): ReactEcs.JSX.Element {
    const canvasInfo = UiCanvasInformation.get(engine.RootEntity)
    return (
      <UiEntity
        uiTransform={{
          positionType: 'absolute',
          width: canvasInfo.width,
          height: '15%',
          position: { bottom: '0%', left: '0%' },
          display: this.puzzleContainerVisible ? 'flex' : 'none'
        }}
        uiBackground={{
          textureMode: 'stretch',
          color: Color4.create(0, 0, 0, 0)
        }}
      >
        <UiEntity
          uiTransform={{
            flexDirection: 'row',
            width: canvasInfo.height * 0.4,
            height: canvasInfo.height * 0.13,
            justifyContent: 'flex-end',
            positionType: 'absolute',
            position: { bottom: '2%', left: '40%' },
            display: this.puzzleContainerVisible ? 'flex' : 'none'
          }}
          uiBackground={{
            textureMode: 'stretch',
            texture: { src: this.spaceContainer },
            color: Color4.create(0, 0, 0, 0.5)
          }}
        >
          {/* Text UI */}
          <Label
            uiTransform={{
              positionType: 'absolute',
              position: { right: '7%', top: '25%' }
            }}
            value={this.puzzleText}
            fontSize={canvasInfo.height * 0.02}
            font="sans-serif"
            color={Color4.White()}
          />
          <UiEntity
            uiTransform={{
              positionType: 'absolute',
              width: '30%',
              height: '80%',
              position: { top: '10%', left: '5%' }
            }}
            uiBackground={{
              textureMode: 'stretch',
              texture: { src: this.puzzleImage }
            }}
          ></UiEntity>
        </UiEntity>
      </UiEntity>
    )
  }
  puzzleUIConnectCables(): ReactEcs.JSX.Element {
    const canvasInfo = UiCanvasInformation.get(engine.RootEntity)
    return (
      <UiEntity
        uiTransform={{
          positionType: 'absolute',
          width: canvasInfo.width,
          height: '15%',
          position: { bottom: '0%', left: '0%' },
          display: this.puzzleConnectCablesVisible ? 'flex' : 'none'
        }}
        uiBackground={{
          textureMode: 'stretch',
          color: Color4.create(0, 0, 0, 0)
        }}
      >
        <UiEntity
          uiTransform={{
            flexDirection: 'row',
            width: canvasInfo.height * 0.4,
            height: canvasInfo.height * 0.13,
            justifyContent: 'flex-end',
            positionType: 'absolute',
            position: { bottom: '2%', left: '40%' },
            display: this.puzzleConnectCablesVisible ? 'flex' : 'none'
          }}
          uiBackground={{
            textureMode: 'stretch',
            texture: { src: this.spaceContainer },
            color: Color4.create(0, 0, 0, 0.5)
          }}
        >
          {/* Text UI */}
          <Label
            uiTransform={{
              positionType: 'absolute',
              position: { left: '25%', top: '36%' }
            }}
            value={this.puzzleConnectCablesText}
            fontSize={canvasInfo.height * 0.02}
            font="sans-serif"
            color={Color4.White()}
          />
        </UiEntity>
      </UiEntity>
    )
  }
  showPuzzlesUis() {
    Transform.onChange(engine.CameraEntity, () => {
      let cameraEntity = CameraMode.get(engine.CameraEntity)
      if (this.endPuzzle === true) {
        this.puzzleConnectCablesVisible = false
        this.puzzleContainerVisible = false
        return
      }
      if (this.freezeCamera === true) {
        this.puzzleConnectCablesVisible = true
        this.puzzleContainerVisible = false
        return
      }
      if (cameraEntity.mode == CameraType.CT_THIRD_PERSON) {
        this.puzzleConnectCablesVisible = false
        this.puzzleContainerVisible = true
      } else if (cameraEntity.mode == CameraType.CT_FIRST_PERSON) {
        this.freezeCamera = true
        this.puzzleConnectCablesVisible = true
        this.puzzleContainerVisible = false
      }
    })
  }
}


