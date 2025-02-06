import ReactEcs, { PositionUnit, UiEntity } from "@dcl/sdk/react-ecs"
import { KEYCODE_FORWARD_IMG, KEYCODE_LEFT_IMG, KEYCODE_RIGHT_IMG, KEYCODE_BACKWARD_IMG, KEYCODE_SPACE_IMG, KEYCODE_LEFT_SHIFT_IMG, KEYCODE_V_IMG, KEYCODE_B_IMG, BIG_KEY_BACKGROUND_SIZE, LARGE_KEY_BACKGROUND_SIZE, SMALL_KEY_BACKGROUND_SIZE, KEY_BACKGROUND_IMG, CONTROLS_BACKGROUND_ORANGE_IMG, CONTROLS_BACKGROUND_RED_IMG, KEYCODE_NUMBER_IMG } from "./controlsAssetsConfig"
import { Color4 } from "@dcl/sdk/math"

export enum KeyType {
    W, A, S, D, V, B, SPACE, LEFT_SHIFT, NUMBER
}

export function getKeyImg(key: KeyControlWidget){
    switch (key.keyType) {
      case KeyType.W:
        return KEYCODE_FORWARD_IMG
      case KeyType.A:
        return KEYCODE_LEFT_IMG
      case KeyType.D:
        return KEYCODE_RIGHT_IMG
      case KeyType.S:
        return KEYCODE_BACKWARD_IMG
      case KeyType.SPACE:
        return KEYCODE_SPACE_IMG
      case KeyType.LEFT_SHIFT:
        return KEYCODE_LEFT_SHIFT_IMG
      case KeyType.V:
        return KEYCODE_V_IMG
      case KeyType.B:
        return KEYCODE_B_IMG
      case KeyType.NUMBER:
        return KEYCODE_NUMBER_IMG
      default:
        return KEYCODE_FORWARD_IMG
    }
}

export function getKeySize(key: KeyControlWidget){
    switch (key.keyType) {
        case KeyType.W:
        case KeyType.A:
        case KeyType.S:
        case KeyType.D:
            return BIG_KEY_BACKGROUND_SIZE
        case KeyType.SPACE:
        case KeyType.LEFT_SHIFT:
            return LARGE_KEY_BACKGROUND_SIZE
        case KeyType.V:
        case KeyType.B:
        case KeyType.NUMBER:
            return SMALL_KEY_BACKGROUND_SIZE
        
        default:
            return SMALL_KEY_BACKGROUND_SIZE
    }
}

const PRESED_ANIM_SPEED = 12
const RELEASED_ANIM_SPEED = 16
const INCREASE_SCALE = 0.08

export class KeyControlWidget {
    readonly keyType: KeyType
    bIsPressed = false
    private bEnableProgress = true
    private bInstantProgress = false
    private bEnableAnim = true
    bIsProgressCompleted = false
    pressedProgress = 0
    pressedAnimAlpha = 0
    animScale = 1
    private _onFinishProgress: (() => void) | undefined
    constructor(keyType: KeyType){
        this.keyType = keyType
    }
    update(bPressed: boolean, dt: number) {
        
        this.bIsPressed = bPressed
        if(this.bEnableProgress && this.bIsProgressCompleted == false) {
            if(bPressed && this.pressedProgress < 1) {

                if(this.bInstantProgress) {
                    this.pressedProgress = 1
                }
                else this.pressedProgress += dt*1.5
                
                if(this.pressedProgress >= 1) {
                    this.pressedProgress = 1
                    this.bIsProgressCompleted = true
                    if(this._onFinishProgress) this._onFinishProgress()
                }
            }
        }
        if(this.bEnableAnim) {
            if(bPressed && this.pressedAnimAlpha < 1) {
                this.pressedAnimAlpha = Math.min(this.pressedAnimAlpha + dt*PRESED_ANIM_SPEED, 1)
                this.animScale = 1 + INCREASE_SCALE*this.pressedAnimAlpha
            }
            if(bPressed == false && this.pressedAnimAlpha > 0) {
                this.pressedAnimAlpha = Math.max(this.pressedAnimAlpha - dt*RELEASED_ANIM_SPEED, 0)
                this.animScale = 1 + INCREASE_SCALE*this.pressedAnimAlpha
            }
        }
    }
    enableAnim(enable: boolean) {
        this.bEnableAnim = enable
    }
    setInstantKeyProgress(bInstantProgress: boolean) {
        this.bInstantProgress = bInstantProgress
    }
    enableKeyProgress(bEnable: boolean) {
        this.bEnableProgress = bEnable
    }
    resetPressProgress(){
        this.pressedProgress = 0
        this.bIsProgressCompleted = false
    }
    setFinishProgressCB(callback: (() => void) | undefined){
        this._onFinishProgress = callback
    }
    generateKeyControlUI(): ReactEcs.JSX.Element {
        return (
          <UiEntity
          //BACKGROUND
            uiTransform={{
              positionType: 'relative',
              alignSelf: 'center',
              justifyContent: 'center',
              height: getKeySize(this).height * this.animScale,
              width: getKeySize(this).width * this.animScale,
              position: { top: '0%', left: '0%' }
            }}
            uiBackground={{
              texture: { src: KEY_BACKGROUND_IMG },
              textureMode: 'nine-slices',
              textureSlices: { top: 0.1, bottom: 0.1, left: 0.1, right: 0.1},
              color: Color4.create(22, 21, 24, 1)
            }}
          >
            <UiEntity
            //HIGHLIGHT BACKGROUND
              uiTransform={{
                positionType: 'absolute',
                alignSelf: 'flex-end',
                width: '100%',
                height: (this.pressedProgress*100 + '%') as PositionUnit,
              }}
              uiBackground={{
                texture: { src: (this.pressedProgress >= 1)? CONTROLS_BACKGROUND_RED_IMG : CONTROLS_BACKGROUND_ORANGE_IMG },
                textureMode: 'nine-slices',
                textureSlices: { top: 0.1, bottom: 0.1, left: 0.1, right: 0.1},
                //color: (this.getKeyColorPercent(keyType) < 1)? Color4.create(1, 0.45, 0.22, 1) : Color4.create(1, 0.17, 0.33, 1)
              }}
            />
            <UiEntity
            //Key Code Img
              uiTransform={{
                positionType: 'relative',
                alignSelf: 'center',
                width: '100%',
                height: '100%',
              }}
              uiBackground={{
                texture: { src: getKeyImg(this)},
                textureMode: 'center',
                  //color: Color4.create(22, 21, 24, 1)
              }}
            />
          </UiEntity>
        )
      }
    
}