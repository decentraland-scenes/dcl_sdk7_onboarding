import { Color4 } from "@dcl/sdk/math";
import { Label, ReactEcs, UiEntity } from "@dcl/sdk/react-ecs";
import { UIController } from "../controllers/uiController";
import { CONTROLS_BACKGROUND_IMG, KEY_BACKGROUND_IMG, CONTROLS_BACKGROUND_ORANGE_IMG, CONTROLS_BACKGROUND_RED_IMG } from "./controls/controlsAssetsConfig";
import { engine, executeTask, InputAction, inputSystem, PointerEventType } from "@dcl/sdk/ecs";
import { wait_ms } from "../cinematic/cameraManager";

export class SkipCinematicUI {
  private isVisible: boolean = false
  private uiController: UIController
  private pressProgress: number = 0

  private animScale: number = 1
  private isFKeyPressed: boolean = false
  private bottomUiPosition: number = -40

  private onFinishProgress: () => void = () => {}

  private showUiSystemAdded: boolean = false
  private hideUiSystemAdded: boolean = false

  constructor(uiController: UIController) {
    this.uiController = uiController
  }
  
  async activateSkipCinematicUI(){
    // give small delay to avoid key press detection from previous click
    await wait_ms(100)
    this.addKeyCheckSystem()
  }

  async deactivateSkipCinematicUI(delay: number = 0){
    // // this.isVisible = false
    // this.pressProgress = 0
    // this.animScale = 1
    this.removeKeyCheckSystem()
    await wait_ms(delay)
    this.hideUiAnimation()
  }

  mainUi(): ReactEcs.JSX.Element {
    return (
      <UiEntity key="skip-cinematic-ui-canvas" 
        uiTransform={{
          display: this.isVisible ? 'flex' : 'none',
          width: '100%',
          height: '100%',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          positionType: 'absolute',
          overflow: 'hidden'
        }}
        uiBackground={{
            color: Color4.create(1, 0, 0, 0)
        }}
      >
        <UiEntity key={"skip-cinematic-ui-display"}
          uiTransform={{
            display: 'flex',
            width: 250,
            height: 50,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            positionType: 'absolute',
            position: { bottom: this.bottomUiPosition },
          }}
          uiBackground={{
            color: Color4.create(0, 1, 0, 0.25)
          }}
        >
          <UiEntity key={"skip-cinematic-ui-background"}
          uiTransform={{
            display: 'flex',
            width: 250 * this.animScale,
            height: 50 * this.animScale,
            flexDirection: 'column',
            justifyContent: 'flex-end',
            positionType: 'absolute',
          }}
          uiBackground={{
            // color: Color4.create(0, 1, 0, 0.5)
            texture: { src: KEY_BACKGROUND_IMG },
            textureMode: 'nine-slices',
            textureSlices: { top: 0.1, bottom: 0.1, left: 0.1, right: 0.1},
          }}
          >
            <UiEntity key={"skip-cinematic-ui-progress"}
            uiTransform={{
              display: 'flex',
              width: 250 * this.animScale,
              height: this.pressProgress * 50 * this.animScale,
              positionType: 'absolute',
              position: { bottom: 0 },
            }}
            uiBackground={{
              // color: Color4.create(0, 1, 0, 0.5)
              texture: { src: this.pressProgress >= 1 ? CONTROLS_BACKGROUND_RED_IMG : CONTROLS_BACKGROUND_ORANGE_IMG },
              textureMode: 'nine-slices',
              textureSlices: { top: 0.1, bottom: 0.1, left: 0.1, right: 0.1},
            }}
            ></UiEntity>
          </UiEntity>

          <Label
            value='Press <b>F</b> to skip'
            color={Color4.White()}
            fontSize={19 * this.animScale}
            font="serif"
            textAlign="middle-center"
          />
        </UiEntity>
      </UiEntity>
    )
  }

  addKeyCheckSystem(){
    let lastPressedTime = 0
    const timeToHideIfNotPressed = 2

    engine.addSystem((dt: number) => {
      // if (inputSystem.isPressed(InputAction.IA_ANY)){
      if (inputSystem.isPressed(InputAction.IA_POINTER) ||
        inputSystem.isPressed(InputAction.IA_PRIMARY) ||
        inputSystem.isPressed(InputAction.IA_SECONDARY) ||
        inputSystem.isPressed(InputAction.IA_JUMP) ||
        inputSystem.isPressed(InputAction.IA_FORWARD) ||
        inputSystem.isPressed(InputAction.IA_BACKWARD) ||
        inputSystem.isPressed(InputAction.IA_LEFT) ||
        inputSystem.isPressed(InputAction.IA_RIGHT)
      ){
        lastPressedTime = 0
        this.showUIAnimation()
      }
      
      lastPressedTime += dt
      if(lastPressedTime > timeToHideIfNotPressed) {
        this.hideUiAnimation()
      }

      if (inputSystem.isPressed(InputAction.IA_SECONDARY)) {
        this.isFKeyPressed = true
        this.pressProgress += dt * 2
        if(this.pressProgress > 1) {
          this.pressProgress = 1
          this.onFinishProgress()
          this.deactivateSkipCinematicUI(1000)
        }
      }
      else {
        this.isFKeyPressed = false
        this.pressProgress -= dt * 2.5
        if(this.pressProgress < 0) this.pressProgress = 0
      }

      this.animScale = 1 + 0.08 * (Math.min(this.pressProgress * 4.5, 1))

    }, undefined, 'skip-cinematic-ui-key-check-system')
  }

  private showUIAnimation(){
    if(this.showUiSystemAdded) return
    engine.removeSystem('skip-cinematic-ui-hide-ui-animation')
    
    this.showUiSystemAdded = true
    this.hideUiSystemAdded = false

    this.isVisible = true

    engine.addSystem((dt: number) => {
      this.bottomUiPosition += dt * 200
      if(this.bottomUiPosition > 10) {
        this.bottomUiPosition = 10
        engine.removeSystem('skip-cinematic-ui-show-ui-animation')
      }
    }, undefined, 'skip-cinematic-ui-show-ui-animation')
  }

  private hideUiAnimation(){
    if(this.hideUiSystemAdded) return
    engine.removeSystem('skip-cinematic-ui-show-ui-animation')
    
    this.hideUiSystemAdded = true
    this.showUiSystemAdded = false

    engine.addSystem((dt: number) => {
      this.bottomUiPosition -= dt * 200
      if(this.bottomUiPosition < -40) {
        this.bottomUiPosition = -40
        this.isVisible = false
        this.pressProgress = 0
        this.animScale = 1
        engine.removeSystem('skip-cinematic-ui-hide-ui-animation')
      }
    }, undefined, 'skip-cinematic-ui-hide-ui-animation')
  }

  removeKeyCheckSystem(){
    engine.removeSystem('skip-cinematic-ui-key-check-system')
  }

  setOnFinishProgress(callback: () => void) {
    this.onFinishProgress = callback
  }
}
