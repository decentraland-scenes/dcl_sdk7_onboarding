import { engine, Entity, InputAction, InputModifier, inputSystem, MainCamera, PBTween, PointerEventType, Schemas, TextAlignMode, Transform, TransformType, Tween, TweenLoop, TweenSequence, Vector3Type, VirtualCamera } from "@dcl/sdk/ecs"
import { Color4, Quaternion, Vector3 } from "@dcl/sdk/math"
import { vanityTracks } from "./vanityTracks"

export let fadeColor: Color4 = Color4.fromHexString("#00000000")

enum FADE_STATE {
    IDLE,
    GOING_BLACK,
    FULLY_BLACK,
    FADING_OUT
}
//var customCameraEnt: Entity
const PathTransportData = {
    pathPos: Schemas.Array(Schemas.Vector3),
    pathRot: Schemas.Array(Schemas.Quaternion),
    startPos: Schemas.Vector3,
    endPos: Schemas.Vector3,
    startRot: Schemas.Quaternion,
    endRot: Schemas.Quaternion,
    fraction: Schemas.Float,
    speed: Schemas.Float,
    pathTargetIndex: Schemas.Int,
    stepTime: Schemas.Number,
    elapsedTime: Schemas.Number,
    active: Schemas.Boolean,
    startedFade: Schemas.Boolean,
    loop: Schemas.Boolean

}

export const LerpTransformComponent = engine.defineComponent(
    'LerpTransformComponent',
    PathTransportData
)

export const BlackFade = engine.defineComponent(
    'BlackFadeComponent',
    {
        fraction: Schemas.Float,
        currentValue: Schemas.Number,
        duration: Schemas.Number,
        offTime: Schemas.Number,
        elapsedTime: Schemas.Number,
        state: Schemas.EnumNumber<FADE_STATE>(FADE_STATE, FADE_STATE.IDLE)
    }
)

class CameraManager {
    camPostionParent: Entity
    camRotationParent: Entity
    camEntity: Entity
    vanityRoot: Entity
    currentPosTrack: Vector3[]
    currentRotTrack: Quaternion[]
    lastIndex: number = 0
    modifierButtonPressed: Boolean = false

    constructor() {

        this.currentPosTrack = []
        this.currentRotTrack = []

        // engine.addSystem(() => {
        //     if (
        //         inputSystem.isTriggered(InputAction.IA_SECONDARY, PointerEventType.PET_DOWN)
        //     ) {

        //         stopAnimationTrack()
        //     }
        //     if (
        //         inputSystem.isTriggered(InputAction.IA_PRIMARY, PointerEventType.PET_DOWN)
        //     ) {
        //         console.log("MODIFIER ON")
        //         this.modifierButtonPressed = true
        //     }
        //     if (
        //         inputSystem.isTriggered(InputAction.IA_PRIMARY, PointerEventType.PET_UP)
        //     ) {
        //         console.log("MODIFIER OFF")
        //         this.modifierButtonPressed = false

        //     }

        //     if (
        //         inputSystem.isTriggered(InputAction.IA_ACTION_3, PointerEventType.PET_DOWN)
        //     ) {

        //         if (this.modifierButtonPressed) {
        //             // this.startVanityTrack(vanityTracks.ZoomIn, Transform.get(engine.PlayerEntity).position, false)
        //         }
        //     }
        //     if (
        //         inputSystem.isTriggered(InputAction.IA_ACTION_4, PointerEventType.PET_DOWN)
        //     ) {
        //         if (this.modifierButtonPressed) {
        //             // this.startVanityTrack(vanityTracks.CircleAvatar, Transform.get(engine.PlayerEntity).position, true)
        //         }
        //     }
        //     if (
        //         inputSystem.isTriggered(InputAction.IA_ACTION_5, PointerEventType.PET_DOWN)
        //     ) {
        //         if (this.modifierButtonPressed) {
        //             //    this.startVanityTrack(vanityTracks.Action, Transform.get(engine.PlayerEntity).position, false)
        //         }
        //     }
        // })

        this.camPostionParent = engine.addEntity()
        Transform.create(this.camPostionParent, { position: Vector3.Zero() })

        this.camRotationParent = engine.addEntity()
        Transform.create(this.camRotationParent, {
            parent: this.camPostionParent
        })

        this.camEntity = engine.addEntity()
        Transform.create(this.camEntity, {
            parent: this.camRotationParent
        })

        this.vanityRoot = engine.addEntity()
        Transform.create(this.vanityRoot, {
            position: Vector3.create(48, 1, 30)
        })
        
    }
    initCamera() {

        Transform.createOrReplace(this.camEntity, {
            parent: this.camRotationParent
        })
        VirtualCamera.create(this.camEntity, {
            defaultTransition: {
                transitionMode: VirtualCamera.Transition.Time(0)
            },
        })
        engine.addSystem(cameraAnimationSystem)

    }
    blockCamera() {
        try {
            console.log("Block camera: ", JSON.stringify(Transform.get(engine.CameraEntity)))
            MainCamera.createOrReplace(engine.CameraEntity, {
                virtualCameraEntity: this.camEntity,
            })

        } catch (error) {
            console.error(error);
        }
    }


    loadCameraTrack(track: any) {

        this.currentPosTrack = []
        this.currentRotTrack = []

        for (let frame of track) {
            let posVector: Vector3 = Vector3.create(
                frame.position.x,
                frame.position.y,
                frame.position.z)
            this.currentPosTrack.push(posVector)

            let rotation: Quaternion = Quaternion.create(
                frame.rotation.x,
                frame.rotation.y,
                frame.rotation.z,
                frame.rotation.w)
            rotation = Quaternion.multiply(rotation, Quaternion.fromEulerDegrees(90, 0, 0))
            this.currentRotTrack.push(rotation)
        }
    }

    startPathTrack(track: any, loop: boolean) {

        Transform.getMutable(this.camPostionParent).parent = engine.RootEntity

        const sampleRate = 5
        const frameTime = 30 / sampleRate
        this.loadCameraTrack(track)
        this.blockCamera()

        LerpTransformComponent.createOrReplace(this.camPostionParent, {
            pathPos: this.currentPosTrack,
            pathRot: this.currentRotTrack,
            startPos: this.currentPosTrack[0] ? this.currentPosTrack[0] : Vector3.create(8, 1, 4),
            endPos: this.currentPosTrack[1] ? this.currentPosTrack[1] : Vector3.create(8, 1, 8),
            startRot: this.currentRotTrack[0] ? this.currentRotTrack[0] : Quaternion.fromEulerDegrees(0, 0, 0),
            endRot: this.currentRotTrack[1] ? this.currentRotTrack[1] : Quaternion.fromEulerDegrees(0, 0, 0),
            fraction: 0,
            speed: frameTime,
            pathTargetIndex: 1,
            stepTime: 1 / frameTime,
            elapsedTime: 0,
            active: true,
            startedFade: false,
            loop: loop
        })
    }

    startVanityTrack(track: any, targetEntity: Entity, loop: boolean) {

        // let playerPos = Transform.get(engine.PlayerEntity).position

        const pos = Transform.get(targetEntity).position
        Transform.getMutable(this.vanityRoot).position = Vector3.create(pos.x, pos.y, pos.z)
        Transform.getMutable(this.camPostionParent).parent = this.vanityRoot

        const sampleRate = 7
        const frameTime = 30 / sampleRate
        this.loadCameraTrack(track)
        this.blockCamera()
        blockPlayer()


        LerpTransformComponent.createOrReplace(this.camPostionParent, {
            pathPos: this.currentPosTrack,
            pathRot: this.currentRotTrack,
            startPos: this.currentPosTrack[0] ? this.currentPosTrack[0] : Vector3.create(4, 1, 4),
            endPos: this.currentPosTrack[1] ? this.currentPosTrack[1] : Vector3.create(8, 1, 8),
            startRot: this.currentRotTrack[0] ? this.currentRotTrack[0] : Quaternion.fromEulerDegrees(0, 0, 0),
            endRot: this.currentRotTrack[1] ? this.currentRotTrack[1] : Quaternion.fromEulerDegrees(0, 90, 0),
            fraction: 0,
            speed: frameTime,
            pathTargetIndex: 1,
            stepTime: 1 / frameTime,
            elapsedTime: 0,
            active: true,
            startedFade: false,
            loop: loop
        })
    }

}

export let cameraManager = new CameraManager()

// export function startFade() {
//     const fadeGrp = engine.getEntitiesWith(BlackFade)

//     for (let [obj] of fadeGrp) {

//         if (BlackFade.get(obj).state == (FADE_STATE.IDLE)) {
//             BlackFade.getMutable(obj).state = FADE_STATE.GOING_BLACK
//         }

//     }
// }

export function stopAnimationTrack() {
    const pathGroup = engine.getEntitiesWith(Transform, LerpTransformComponent)

    for (let [obj] of pathGroup) {

        let lerp = LerpTransformComponent.getMutable(obj)
        lerp.active = false


    }
    freeCamera()
    freePlayer()
}

export function cameraAnimationSystem(dt: number) {

    //POSITION TRACK
    const pathGroup = engine.getEntitiesWith(Transform, LerpTransformComponent)

    for (let [obj, trans, info] of pathGroup) {

        if (info.active) {
            let transform = Transform.getMutable(obj)
            let lerp = LerpTransformComponent.getMutable(obj)

            lerp.elapsedTime += dt

            let startIndex = Math.floor(lerp.elapsedTime / lerp.stepTime)
            let fractionTime = (lerp.elapsedTime / lerp.stepTime) % 1

            if (startIndex >= lerp.pathPos.length) {
                startIndex = 0
                lerp.elapsedTime += dt
            }


            if (!lerp.loop) {
                if (!lerp.startedFade) {
                    if (startIndex + 4 > lerp.pathPos.length) {
                        // startFade()
                        lerp.startedFade = true
                    }
                }
            }



            let endIndex = startIndex + 1
            if (endIndex >= lerp.pathPos.length) {
                endIndex = 0
                lerp.elapsedTime = 0
                if (!lerp.loop) {
                    stopAnimationTrack()
                    lerp.startedFade = false
                }

            }

            lerp.startPos = lerp.pathPos[startIndex]
            lerp.endPos = lerp.pathPos[endIndex]
            lerp.fraction = fractionTime
            transform.position = Vector3.lerp(lerp.startPos, lerp.endPos, lerp.fraction)

            lerp.startRot = lerp.pathRot[startIndex]
            lerp.endRot = lerp.pathRot[endIndex]
            transform.rotation = Quaternion.slerp(lerp.startRot, lerp.endRot, lerp.fraction)

        }

    }

}


export function freeCamera() {
    try {
        MainCamera.getMutable(engine.CameraEntity).virtualCameraEntity = undefined

    } catch (error) {
        console.error(error);
    }
}

export function blockPlayer(){
    InputModifier.createOrReplace(engine.PlayerEntity, {
        mode: {
          $case: 'standard',
          standard: {
            disableAll: true
          }
        }
      })
}

export function freePlayer(){
    InputModifier.createOrReplace(engine.PlayerEntity, {
        mode: {
          $case: 'standard',
          standard: {
            disableAll: false
          }
        }
      })
}