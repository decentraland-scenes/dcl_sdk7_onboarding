import { EasingFunction, engine, Entity, InputAction, InputModifier, inputSystem, MainCamera, PBTween, PointerEventType, Schemas, TextAlignMode, Transform, TransformType, Tween, TweenLoop, TweenSequence, tweenSystem, Vector3Type, VirtualCamera } from "@dcl/sdk/ecs"
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
    camPositionParent: Entity
    camRotationParent: Entity
    camEntity: Entity
    vanityRoot: Entity
    currentPosTrack: Vector3[]
    currentRotTrack: Quaternion[]
    lastIndex: number = 0
    modifierButtonPressed: Boolean = false
    cameraInitialized = false

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

        this.camPositionParent = engine.addEntity()
        Transform.create(this.camPositionParent, { position: Vector3.Zero() })

        this.camRotationParent = engine.addEntity()
        Transform.create(this.camRotationParent, {
            parent: this.camPositionParent
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

        if (this.cameraInitialized) return
        this.cameraInitialized = true

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
        this.initCamera()

        Transform.getMutable(this.camPositionParent).parent = engine.RootEntity

        const sampleRate = 5
        const frameTime = 30 / sampleRate
        this.loadCameraTrack(track)
        this.blockCamera()

        LerpTransformComponent.createOrReplace(this.camPositionParent, {
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
        this.initCamera()

        // let playerPos = Transform.get(engine.PlayerEntity).position

        const pos = Transform.get(targetEntity).position
        Transform.getMutable(this.vanityRoot).position = Vector3.create(pos.x, pos.y, pos.z)
        Transform.getMutable(this.camPositionParent).parent = this.vanityRoot

        const sampleRate = 7
        const frameTime = 30 / sampleRate
        this.loadCameraTrack(track)
        this.blockCamera()
        blockPlayer()


        LerpTransformComponent.createOrReplace(this.camPositionParent, {
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

    orbitEntity(targetEntity: Entity) {

        const targetPosition = getWorldPosition(targetEntity)

        const camPositionParent = engine.addEntity()
        Transform.createOrReplace(camPositionParent, {
            position: targetPosition,
            rotation: Quaternion.fromEulerDegrees(0, 180, 0)
        })

        const camRotationParent = engine.addEntity()
        Transform.createOrReplace(camRotationParent, {
            parent: camPositionParent
        })

        const camEntity = engine.addEntity()
        Transform.createOrReplace(camEntity, {
            parent: camRotationParent,
            position: Vector3.create(0, 2, -6)
        })

        VirtualCamera.createOrReplace(camEntity, {
            defaultTransition: {
                transitionMode: VirtualCamera.Transition.Time(0)
            },
        })

        // this.blockCamera()
        MainCamera.createOrReplace(engine.CameraEntity, {
            virtualCameraEntity: camEntity,
        })

        blockPlayer()

        console.log("CREATING TWEEN")
        Tween.createOrReplace(camRotationParent, {
            mode: Tween.Mode.Rotate({
                start: Quaternion.fromEulerDegrees(0, 0, 0),
                end: Quaternion.fromEulerDegrees(0, 160, 0)
            }),
            duration: 5000,
            easingFunction: EasingFunction.EF_LINEAR
        })

        engine.addSystem(() => {
            const tweenCompleted = tweenSystem.tweenCompleted(camRotationParent)
            if (tweenCompleted) {
                console.log("REMOVING TWEEN")
                // freeCamera()
                MainCamera.getMutable(engine.CameraEntity).virtualCameraEntity = undefined
                freePlayer()
                engine.removeEntity(camPositionParent)
                engine.removeEntity(camRotationParent)
                engine.removeEntity(camEntity)
                engine.removeSystem("camera-tween")
            }
        }, undefined, "camera-tween")
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

export function blockPlayer() {
    InputModifier.createOrReplace(engine.PlayerEntity, {
        mode: {
            $case: 'standard',
            standard: {
                disableAll: true
            }
        }
    })
}

export function freePlayer() {
    InputModifier.createOrReplace(engine.PlayerEntity, {
        mode: {
            $case: 'standard',
            standard: {
                disableAll: false
            }
        }
    })
}

export function getWorldPosition(entity: Entity, position = Vector3.Zero()): Vector3 {

    const transform = Transform.get(entity)
    //No transform
    if (!transform) return Vector3.Zero()

    let scaledPosition = { ...transform.position }
    //Scale relative position by parent scale
    if (transform.parent) {
        const parentTransform = Transform.get(transform.parent)
        if (parentTransform) {
            scaledPosition.x = scaledPosition.x * parentTransform.scale.x
            scaledPosition.y = scaledPosition.y * parentTransform.scale.y
            scaledPosition.z = scaledPosition.z * parentTransform.scale.z
        }
    }
    //Update position
    position.x = position.x + scaledPosition.x
    position.y = position.y + scaledPosition.y
    position.z = position.z + scaledPosition.z

    //No more parents
    if (!transform.parent) return position;

    //Get world position of the parent
    return Vector3.add(getWorldPosition(transform.parent, position), Vector3.rotate(transform.position, getWorldRotation(transform.parent)))
}

export function getWorldRotation(entity: Entity): Quaternion {

    let transform = Transform.getOrNull(entity)

    if (!transform)
        return Quaternion.Identity()

    let parent = transform.parent

    if (!parent) {
        return transform.rotation
    } else {
        return Quaternion.multiply(transform.rotation, getWorldRotation(parent))
    }
}
