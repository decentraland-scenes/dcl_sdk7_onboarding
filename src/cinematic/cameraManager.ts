import { CameraModeArea, CameraType, EasingFunction, engine, Entity, InputAction, InputModifier, inputSystem, MainCamera, PBTween, PointerEventType, Schemas, TextAlignMode, Transform, TransformType, Tween, TweenLoop, TweenSequence, tweenSystem, Vector3Type, VirtualCamera } from "@dcl/sdk/ecs"
import { Color4, Quaternion, Vector3 } from "@dcl/sdk/math"
import { vanityTracks } from "./vanityTracks"
import * as utils from '@dcl-sdk/utils'
import { movePlayerTo } from "~system/RestrictedActions"
import { gameController } from ".."

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
                transitionMode: VirtualCamera.Transition.Time(0.5)
            },
        })
        
        function cameraAnimationSystem(dt: number) {
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

        engine.addSystem(cameraAnimationSystem)

    }

    blockCamera(position?: Vector3, target?: Vector3, transitionSpeed = 0.5) {
        try {
            // let camEntityTf = Transform.getMutable(this.camEntity)
            VirtualCamera.getMutable(this.camEntity).defaultTransition = { transitionMode: VirtualCamera.Transition.Time(transitionSpeed) }
            let camPositionParentTransform = Transform.getMutable(this.camPositionParent)
            let camRotationParentTransform = Transform.getMutable(this.camRotationParent)

            camPositionParentTransform.parent = engine.RootEntity
            camPositionParentTransform.rotation = Quaternion.Identity()

            if(position) camPositionParentTransform.position = position
            if(position && target) {
                // camPositionParentTransform.rotation = Quaternion.fromLookAt(position, target)
                camRotationParentTransform.rotation = Quaternion.fromLookAt(position, target)
            }
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

    async startPathTrack(track: any, loop: boolean, finalPos: Vector3, finalCamTarget: Vector3) {
        this.initCamera()

        this.blockCamera(undefined, undefined, 0)

        Transform.getMutable(this.camPositionParent).parent = engine.RootEntity

        const sampleRate = 5
        const frameTime = 30 / sampleRate
        this.loadCameraTrack(track)
        
        lockPlayer()
        forceFirstPerson()

        await wait_ms(100)

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
        
        await this.checkIfLerpTransformComplete(this.camPositionParent)

        await wait_ms(50)
        this.blockCamera(finalPos, finalCamTarget, 0.5)

        await wait_ms(50)
        unlockPlayer()
        freeCamera()

        await wait_ms(50)
        freeCameraMode()

        return
    }

    async startVanityTrack(track: any, targetEntity: Entity, loop: boolean, finalPos: Vector3, finalCamTarget: Vector3) {
        this.initCamera()

        // let playerPos = Transform.get(engine.PlayerEntity).position
        this.blockCamera(undefined, undefined, 0)

        const pos = Transform.get(targetEntity).position
        Transform.getMutable(this.vanityRoot).position = Vector3.create(pos.x, pos.y, pos.z)
        Transform.getMutable(this.camPositionParent).parent = this.vanityRoot

        const sampleRate = 7
        const frameTime = 30 / sampleRate
        this.loadCameraTrack(track)
        
        lockPlayer()
        forceFirstPerson()

        await wait_ms(100)

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

        await this.checkIfLerpTransformComplete(this.camPositionParent)

        await wait_ms(50)
        this.blockCamera(finalPos, finalCamTarget, 0.5)

        await wait_ms(50)
        unlockPlayer()
        freeCamera()

        await wait_ms(50)
        freeCameraMode()

        return
    }

    async orbitEntity(targetEntity: Entity, camOffset: Vector3, angleStart: number, angleStop: number, duration_ms: number, finalPos: Vector3, finalCamTarget: Vector3) {
        this.initCamera()
        console.log('orbitEntity. start', JSON.stringify(Tween.getOrNull(targetEntity)))
        
        // await wait_ms(5000)
        console.log('orbitEntity. lockPlayer')
        // this.blockCamera(Vector3.add(finalPos, Vector3.create(0, 1.75, 0)), Vector3.add(getWorldPosition(gameController.spawnIsland.tobor.entity), Vector3.create(0, 0, 0)))

        lockPlayer()

        // await wait_ms(500)
        console.log('orbitEntity. forceFirstPerson')
        forceFirstPerson()

        await wait_ms(100)
        console.log('orbitEntity. blockCamera')

        this.blockCamera(finalPos, finalCamTarget, 0)

        // await wait_ms(5000)
        console.log('orbitEntity. start camera tween.')
        const pos = getWorldPosition(targetEntity)
        Transform.getMutable(this.vanityRoot).position = Vector3.create(pos.x, pos.y, pos.z)
        Transform.getMutable(this.camRotationParent).rotation = Quaternion.fromLookAt(camOffset, Vector3.Zero())

        let camPosParentTf = Transform.getMutable(this.camPositionParent)
        camPosParentTf.parent = this.vanityRoot
        camPosParentTf.position = camOffset

        console.log("CREATING TWEEN", JSON.stringify(Transform.get(this.camRotationParent).rotation))

        let angStart = angleStart
        let direction = Math.sign(angleStop - angleStart)
        let angEnd = Math.abs(angleStop - angleStart) <= 180 ? angleStop : (direction * 180 + (angleStart))
        let duration = Math.abs(angleStop - angleStart) <= 180 ? duration_ms : duration_ms * Math.abs(180 / (angleStop - angleStart))
        // console.log('start:', angStart, 'end:', angEnd, 'duration:', duration)

        let firstTween: PBTween = {
            mode: Tween.Mode.Rotate({
                start: Quaternion.fromEulerDegrees(0, angStart, 0),
                end: Quaternion.fromEulerDegrees(0, angEnd, 0)
            }),
            duration: duration,
            easingFunction: EasingFunction.EF_LINEAR
        }

        let nextSequenceDuration = 0
        let isSequenceTween = false
        let secondTween: PBTween

        if(Math.abs(angleStop - angleStart) > 180){
            isSequenceTween = true
            angStart = angEnd
            angEnd = angleStop
            nextSequenceDuration = duration_ms * Math.abs(((angleStop - angleStart) - direction * 180) / (angleStop - angleStart))
            // console.log('sequence start:', angStart, 'sequence end:', angEnd, 'sequence duration:', nextSequenceDuration)
            
            secondTween = {
                mode: Tween.Mode.Rotate({
                    start: Quaternion.fromEulerDegrees(0, angStart, 0),
                    end: Quaternion.fromEulerDegrees(0, angEnd, 0)
                }),
                duration: nextSequenceDuration,
                easingFunction: EasingFunction.EF_LINEAR
            }
        }

        Tween.createOrReplace(this.vanityRoot, firstTween)
        if(isSequenceTween){
            
            TweenSequence.create(this.vanityRoot, {
                sequence: [
                    secondTween!
                ]
            })
        }

        await this.checkIfTweenComplete(this.vanityRoot)
        console.log("first tween complete")

        await wait_ms(nextSequenceDuration + 100)
        console.log("tweenSequence complete")

        // await wait_ms(100)
        // console.log('blockCamera')
        this.blockCamera(finalPos, finalCamTarget, 0.5)
        // console.log("movePlayerTo. pos:", JSON.stringify(finalPos), 'target:', JSON.stringify(finalCamTarget))
        // movePlayerTo({
        //     // newRelativePosition: Vector3.create(224.127, 68.7368, 124.0051), // spawn island
        //     // cameraTarget: Vector3.create(219.13, 70.73, 125.91)
        //     newRelativePosition: Vector3.add(finalPos, Vector3.create(0, 1, 0)),
        //     cameraTarget: Vector3.add(getWorldPosition(gameController.spawnIsland.tobor.entity), Vector3.create(0, 0, 0))
        // })

        await wait_ms(50)
        // console.log("unlockPlayer and freeCamera")
        unlockPlayer()
        freeCamera()

        await wait_ms(50)
        // console.log("freeCameraMode")
        freeCameraMode()

        return
    }

    async checkIfTweenComplete(entity: Entity){
        return new Promise <boolean>((resolve, reject) => {
            engine.addSystem(() => {
                const tweenCompleted = tweenSystem.tweenCompleted(entity)
                if(tweenCompleted){
                    resolve(true)
                    engine.removeSystem("check-tween-complete")
                }
            }, undefined, "check-tween-complete")
        })
    }

    async checkIfLerpTransformComplete(entity: Entity){
        return new Promise <boolean>((resolve, reject) => {
            engine.addSystem(() => {
                const lerpComponent = LerpTransformComponent.get(entity)
                if(!lerpComponent.active){
                    resolve(true)
                    engine.removeSystem("check-lerp-complete")
                }
            }, undefined, "check-lerp-complete")
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
}

let firstPersonArea: Entity | null = null
export function forceFirstPerson(){
    if(!firstPersonArea){
        firstPersonArea = engine.addEntity()

        Transform.create(firstPersonArea, {
            parent: engine.RootEntity
        })

        CameraModeArea.create(firstPersonArea, {
            area: Vector3.create(4, 3, 4),
            mode: CameraType.CT_FIRST_PERSON,
        })
    }
    
    Transform.getMutable(firstPersonArea).parent = engine.PlayerEntity

}

export function freeCameraMode(){
    if(!firstPersonArea){
        firstPersonArea = engine.addEntity()

        Transform.create(firstPersonArea, {
            parent: engine.RootEntity
        })
        
        CameraModeArea.create(firstPersonArea, {
            area: Vector3.create(4, 3, 4),
            mode: CameraType.CT_FIRST_PERSON,
        })
    }
    
    Transform.getMutable(firstPersonArea).parent = engine.RootEntity
}

export function freeCamera() {
    try {
        MainCamera.getMutable(engine.CameraEntity).virtualCameraEntity = undefined

    } catch (error) {
        console.error(error);
    }
}

export function lockPlayer() {
    InputModifier.createOrReplace(engine.PlayerEntity, {
        mode: {
            $case: 'standard',
            standard: {
                disableAll: true
            }
        }
    })
}

export function unlockPlayer() {
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
    let worldPosition: Vector3
    let targetTransform = Transform.getOrNull(entity)
    if(!targetTransform) return Vector3.Zero()
    
    worldPosition = targetTransform.position
  
    while(targetTransform.parent){
      let parentTransform = Transform.getOrNull(targetTransform.parent)
      if(!parentTransform) return worldPosition
  
      let scaledPosition = {
        x: worldPosition.x * parentTransform.scale.x,
        y: worldPosition.y * parentTransform.scale.y,
        z: worldPosition.z * parentTransform.scale.z
      }
  
      worldPosition = Vector3.add(Vector3.rotate(scaledPosition, getWorldRotation(targetTransform.parent)), parentTransform.position)
  
      targetTransform = parentTransform
    }
    return worldPosition
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

export async function wait_ms(ms: number){
    return new Promise <boolean>((resolve, reject) => {
        try{
            utils.timers.setTimeout(() => {
                resolve(true)
            }, ms)
        }
        catch{
            resolve(false)
        }
    })
}