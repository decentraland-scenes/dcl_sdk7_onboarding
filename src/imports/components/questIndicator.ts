import { EasingFunction, engine, Entity, GltfContainer, Transform, Tween } from '@dcl/sdk/ecs'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import * as utils from '@dcl-sdk/utils'

export enum IndicatorState {
  EXCLAMATION,
  INTERROGATION,
  ARROW
}

export class QuestIndicator {
  icon: Entity
  private readonly startPos = Vector3.create(0, 2.2, 0)
  private readonly endAnimPos = Vector3.create(0, 2.4, 0)
  private readonly scale = Vector3.create(1.5, 1.5, 1.5)
  private evenLoop = true
  private enableAnimLoop = false
  constructor(parent: Entity) {
    this.icon = engine.addEntity()
    Transform.create(this.icon, {
      position: this.startPos,
      rotation: Quaternion.create(0, 0, 0, 0),
      scale: this.scale
    })
    Transform.getMutable(this.icon).parent = parent
    GltfContainer.create(this.icon, { src: 'assets/scene/models/glb_assets/target_arrow.glb' })
  }

  updateStatus(status: IndicatorState) {
    if (status == IndicatorState.EXCLAMATION) {
      //Transform.getMutable(this.icon).scale = this.scale
      GltfContainer.getMutable(this.icon).src = 'assets/scene/models/glb_assets/QuestExclamation.glb'
      this.stopAnimation()
    } else if (status == IndicatorState.INTERROGATION) {
      //Transform.getMutable(this.icon).scale = this.scale
      GltfContainer.getMutable(this.icon).src = 'assets/scene/models/glb_assets/QuestInterrogation.glb'
      this.stopAnimation()
    }
    else if (status == IndicatorState.ARROW) {
      //Transform.getMutable(this.icon).scale = this.scale
      GltfContainer.getMutable(this.icon).src = 'assets/scene/models/glb_assets/target_arrow.glb'
    }
  }

  hide() {
    Tween.deleteFrom(this.icon)
    utils.timers.setTimeout(()=>{
      Transform.getMutable(this.icon).scale = Vector3.Zero()
      this.stopAnimation()
    }, 100)
  }
  show() {
    Transform.getMutable(this.icon).position = this.startPos
    Transform.getMutable(this.icon).scale = this.scale
    this.evenLoop = true
    this.addAnimation()
  }

  showWithAnim() {
    Transform.getMutable(this.icon).position = this.startPos
    this.evenLoop = true
    utils.timers.setTimeout(()=>{
      Tween.createOrReplace(this.icon, {
        mode: Tween.Mode.Scale({
          start: Transform.get(this.icon).scale,
          end: this.scale
        }),
        duration: 800,
        easingFunction: EasingFunction.EF_EASEELASTIC
      })
      utils.timers.setTimeout(()=>{
        Transform.getMutable(this.icon).scale = this.scale
        utils.timers.setTimeout(()=>{
          this.addAnimation()
        }, 200)
      }, 800)
    }, 100)
  }
  hideWithAnim() {
    Tween.createOrReplace(this.icon, {
      mode: Tween.Mode.Scale({
        start: Transform.get(this.icon).scale,
        end: Vector3.Zero()
      }),
      duration: 500,
      easingFunction: EasingFunction.EF_LINEAR
    })
  }

  addAnimation() {
    if(this.enableAnimLoop) return;
    this.enableAnimLoop = true
    this.animationLoop()
  }
  private animationLoop() {
    if(this.enableAnimLoop == false) return;

    Tween.createOrReplace(this.icon, {
      mode: Tween.Mode.Move({
        start: (this.evenLoop)? this.startPos : this.endAnimPos,
        end: (this.evenLoop)? this.endAnimPos : this.startPos
      }),
      duration: 1000,
      easingFunction: EasingFunction.EF_LINEAR
    })
    this.evenLoop = !this.evenLoop
    utils.timers.setTimeout(() => {
      this.animationLoop()
    }, 1000)
  }
  stopAnimation() {
    if(this.enableAnimLoop == false) return;
    
    this.enableAnimLoop = false
  }
}
