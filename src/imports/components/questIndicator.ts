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
  private evenLoop = true
  private enableAnimLoop = false
  constructor(parent: Entity) {
    this.icon = engine.addEntity()
    Transform.create(this.icon, {
      position: this.startPos,
      rotation: Quaternion.create(0, 0, 0, 0),
      scale: Vector3.create(1, 1, 1)
    })
    Transform.getMutable(this.icon).parent = parent
    GltfContainer.create(this.icon, { src: 'assets/scene/models/glb_assets/target_arrow.glb' })
  }

  updateStatus(status: IndicatorState) {
    if (status == IndicatorState.EXCLAMATION) {
      Transform.getMutable(this.icon).scale = Vector3.create(1, 1, 1)
      GltfContainer.getMutable(this.icon).src = 'assets/scene/models/glb_assets/QuestExclamation.glb'
      this.stopAnimation()
    } else if (status == IndicatorState.INTERROGATION) {
      Transform.getMutable(this.icon).scale = Vector3.create(1, 1, 1)
      GltfContainer.getMutable(this.icon).src = 'assets/scene/models/glb_assets/QuestInterrogation.glb'
      this.stopAnimation()
    }
    else if (status == IndicatorState.ARROW) {
      Transform.getMutable(this.icon).scale = Vector3.create(1, 1, 1)
      GltfContainer.getMutable(this.icon).src = 'assets/scene/models/glb_assets/target_arrow.glb'
      this.addAnimation()
    }
  }

  hide() {
    Transform.getMutable(this.icon).scale = Vector3.create(0, 0, 0)
    this.stopAnimation()
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
