import { AvatarModifierArea, AvatarModifierType, CameraModeArea, CameraType, engine, Entity, InputModifier, MainCamera, Schemas, Transform, VirtualCamera } from "@dcl/sdk/ecs"
import { Quaternion, Vector3 } from "@dcl/sdk/math"
import * as utils from '@dcl-sdk/utils'
import { createCatmullRomSplineWithRotation, SplinePoint } from "../utils/catmullRomSpline"

enum CameraState {
    IDLE,
    BLOCKING,
    ORBITING,
    PATH_TRACKING
}

const PathTransportData = {
    track: Schemas.Array(Schemas.Map({
		position: Schemas.Vector3,
		rotation: Schemas.Quaternion
	})),
    speed: Schemas.Number,
    cumulativeSegmentTimes: Schemas.Array(Schemas.Number),
    currentIndex: Schemas.Number,
    normalizedTime: Schemas.Number,
    active: Schemas.Boolean,
    loop: Schemas.Boolean
}

const OrbitData = {
    targetAngle: Schemas.Float,
    currentAngle: Schemas.Float,
    speed: Schemas.Float,

    active: Schemas.Boolean,
    continuous: Schemas.Boolean
}


export const LerpTransformComponent = engine.defineComponent('LerpTransformComponent', PathTransportData)
export const OrbitComponent = engine.defineComponent('OrbitComponent', OrbitData)



class CameraManager {
    private cameraInitialized: boolean = false

    private state: CameraState = CameraState.IDLE
    private activeOperationId: string | null = null

    private currentCam!: {camEntity: Entity, vanityRoot: Entity}

    private cam1!: {camEntity: Entity, vanityRoot: Entity}
    private cam2!: {camEntity: Entity, vanityRoot: Entity}

    private forceCameraArea!: Entity
    private hideAvatarArea!: Entity

    constructor() {}

    initCamera() {
        if (this.cameraInitialized) return
        this.cameraInitialized = true
        
        this.state = CameraState.IDLE

        // --SETUP ENTITIES--
        // Create camera hierarchy
        this.cam1 = {camEntity: engine.addEntity(), vanityRoot: engine.addEntity()}
        this.cam2 = {camEntity: engine.addEntity(), vanityRoot: engine.addEntity()}
        
        Transform.create(this.cam1.vanityRoot)
        Transform.create(this.cam2.vanityRoot)

        Transform.create(this.cam1.camEntity)
        VirtualCamera.create(this.cam1.camEntity, {
            defaultTransition: {
                transitionMode: VirtualCamera.Transition.Time(0.5)
            },
        })
        Transform.create(this.cam2.camEntity)
        VirtualCamera.create(this.cam2.camEntity, {
            defaultTransition: {
                transitionMode: VirtualCamera.Transition.Time(0.5)
            },
        })
        this.currentCam = this.cam1

        // hide avatar area
        this.hideAvatarArea = engine.addEntity()
        Transform.create(this.hideAvatarArea, {
            position: Vector3.create(0, -50, 0),
            parent: engine.PlayerEntity
        })        
        AvatarModifierArea.create(this.hideAvatarArea, {
            area: Vector3.create(10, 10, 10),
            modifiers: [AvatarModifierType.AMT_HIDE_AVATARS],
            excludeIds: []
        })
        // force camera area
        this.forceCameraArea = engine.addEntity()
        Transform.create(this.forceCameraArea, {
            position: Vector3.Zero(),
            parent: engine.PlayerEntity
        })

        // --SETUP SYSTEMS--
        // orbit camera system
        engine.addSystem((dt: number) => {
            
            const orbitGroup = engine.getEntitiesWith(Transform, OrbitComponent)
            for (const [entity, transform, orbit] of orbitGroup) {
                if (!orbit.active) continue

                const orbitMutable = OrbitComponent.getMutable(entity)
                const transformMutable = Transform.getMutable(entity)
                
                orbitMutable.currentAngle += orbit.speed * dt

                orbitMutable.currentAngle = orbitMutable.currentAngle % 360

                transformMutable.rotation = Quaternion.fromEulerDegrees(0, orbitMutable.currentAngle, 0)
                
                if(!orbitMutable.continuous) {
                    const threshold = Math.max(0.1, Math.abs(orbit.speed * dt))
                    
                    if(Math.abs(orbitMutable.currentAngle - orbit.targetAngle) < threshold) {
                        orbitMutable.active = false
                        transformMutable.rotation = Quaternion.fromEulerDegrees(0, orbit.targetAngle, 0)
                    }
                }
            }
        })
        
        // lerp transform system
        engine.addSystem((dt: number) => {
            const pathGroup = engine.getEntitiesWith(Transform, LerpTransformComponent)

            for (let [entity] of pathGroup) {
                let transform = Transform.getMutable(entity)
                let lerp = LerpTransformComponent.getMutable(entity)
        
                if(!lerp.active) continue
                
        
                lerp.normalizedTime = lerp.normalizedTime + dt * lerp.speed

                if(lerp.normalizedTime >= 1 && !lerp.loop) {
                    lerp.active = false
                    
                    transform.position = lerp.track[lerp.track.length - 1].position
                    transform.rotation = lerp.track[lerp.track.length - 1].rotation

                    continue
                }
        
                // Find the current segment
                let currentIndex = lerp.cumulativeSegmentTimes.findIndex(v => lerp.normalizedTime <= v)
                if (currentIndex === -1) currentIndex = lerp.cumulativeSegmentTimes.length - 1

                // console.log('lerp.currentIndex:', currentIndex)

                // Calculate local time within segment
                let prevSegmentTime = currentIndex > 0 ? lerp.cumulativeSegmentTimes[currentIndex - 1] : 0
                let currentSegmentTime = lerp.cumulativeSegmentTimes[currentIndex]
                let segmentDuration = currentSegmentTime - prevSegmentTime
                let localT = Math.min(1, (lerp.normalizedTime - prevSegmentTime) / segmentDuration)
                
                let startPos, endPos, startRot, endRot

                if (lerp.loop && currentIndex === lerp.track.length - 1) {
                    startPos = lerp.track[lerp.track.length - 1].position
                    endPos = lerp.track[0].position
                    startRot = lerp.track[lerp.track.length - 1].rotation
                    endRot = lerp.track[0].rotation
                    
                    if (lerp.normalizedTime >= 1) {
                        lerp.normalizedTime = 0
                    }
                } 
                else {
                    startPos = lerp.track[currentIndex].position
                    endPos = lerp.track[currentIndex + 1].position
                    startRot = lerp.track[currentIndex].rotation
                    endRot = lerp.track[currentIndex + 1].rotation
                }

                transform.position = Vector3.lerp(startPos, endPos, localT)
                transform.rotation = Quaternion.slerp(startRot, endRot, localT)
            }
        })
    }

    private generateOperationId(): string {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9)
    }

    private setActiveOperation(state: CameraState): string {
        const operationId = this.generateOperationId()
        this.state = state
        this.activeOperationId = operationId
        return operationId
    }

    private isOperationValid(operationId: string): boolean {
        return this.activeOperationId === operationId
    }

    private clearOperation(operationId: string) {
        if (this.isOperationValid(operationId)) {
            this.activeOperationId = null
            this.state = CameraState.IDLE
        }
    }

    private setCurrentCamEntity(): {camEntity: Entity, vanityRoot: Entity} {
        if(JSON.stringify(this.currentCam) === JSON.stringify(this.cam1)) {
            console.log('setCurrentCamEntity. cam1')
            this.currentCam = this.cam2
        } else {
            console.log('setCurrentCamEntity. cam2')
            this.currentCam = this.cam1
        }

        return this.currentCam
    }

    async blockCamera(position: Vector3, rotation: Quaternion, bForceFirstPerson: boolean = false, transitionSpeed = 0.5) {
        try {
            const operationId = this.setActiveOperation(CameraState.BLOCKING)
            this.stopExistingAnimations()
            // this.forcedFirstPersonInCameraBlock = bForceFirstPerson
            
            this.setCurrentCamEntity()

            const currentCamTransform = Transform.getMutable(this.currentCam.camEntity)
            currentCamTransform.position = position
            currentCamTransform.rotation = rotation
            // set parent to root entity
            currentCamTransform.parent = engine.RootEntity

            if(!bForceFirstPerson) {
                MainCamera.createOrReplace(engine.CameraEntity, {
                    virtualCameraEntity: this.currentCam.camEntity,
                })
                await wait_ms(transitionSpeed * 1000)
                return
            }
    
            //Force 1st person some frames before blocking the camera to avoid 3rd person camera bug with block camera
            this.forceFirstPerson()
            await wait_ms(100)
            if(!this.isOperationValid(operationId)) return

            VirtualCamera.getMutable(this.currentCam.camEntity).defaultTransition = { transitionMode: VirtualCamera.Transition.Time(transitionSpeed) }
            MainCamera.createOrReplace(engine.CameraEntity, {
                virtualCameraEntity: this.currentCam.camEntity,
            })
            await wait_ms(transitionSpeed * 1000)
            return

        } catch (error) {
            console.error(error);
        }
    }

    async cameraOrbit(targetEntity: Entity, camOffset: Vector3, angleStart: number, angleStop: number, duration_ms: number, transitionSpeed = 0.5, finalCamera?: {position: Vector3, rotation: Quaternion}) {
        const operationId = this.setActiveOperation(CameraState.ORBITING)
        this.stopExistingAnimations()

        console.log('cameraOrbit. start', this.activeOperationId)
        this.setCurrentCamEntity()
        
        // -- prepare camera position and rotation --
        // set the initial position and rotation of the current camera
        // currently the current camera isn't assigned to virtual camera yet.
        const pos = getWorldPosition(targetEntity)
        const vanityRootTransform = Transform.getMutable(this.currentCam.vanityRoot)
        vanityRootTransform.position = Vector3.create(pos.x, pos.y, pos.z)
        vanityRootTransform.rotation = Quaternion.fromEulerDegrees(0, angleStart, 0)

        const camTransform = Transform.getMutable(this.currentCam.camEntity)
        camTransform.parent = this.currentCam.vanityRoot
        camTransform.position = camOffset
        camTransform.rotation = Quaternion.fromLookAt(camOffset, Vector3.Zero())
        

        // assisgn current camera to virtual camera
        console.log('cameraOrbit. change main camera to orbit camera. Transition speed:', transitionSpeed)
        VirtualCamera.getMutable(this.currentCam.camEntity).defaultTransition = { transitionMode: VirtualCamera.Transition.Time(transitionSpeed) }
        MainCamera.createOrReplace(engine.CameraEntity, {
            virtualCameraEntity: this.currentCam.camEntity,
        })

        // wait for camera transition to complete
        await wait_ms(transitionSpeed * 1000)
        if(!this.isOperationValid(operationId)) {
            console.log('terminate operation. operation invalid:', operationId, '. New operation:', this.activeOperationId)
            return
        }

        console.log('cameraOrbit. transition complete. Start orbiting...')

        // -- start orbiting --
        const angleDiff = angleStop - angleStart
        const speed = (Math.abs(angleDiff) / duration_ms) * 1000
        const direction = Math.sign(angleDiff)

        let orbitComponent = OrbitComponent.createOrReplace(this.currentCam.vanityRoot, {
            targetAngle: angleStop,
            currentAngle: angleStart,
            speed: speed * direction,
            active: true,
            continuous: false
        })

        // wait for orbit to complete
        await this.checkIfOrbitComplete(this.currentCam.vanityRoot)
        if(!this.isOperationValid(operationId)) {
            console.log('terminate operation. operation invalid:', operationId, '. New operation:', this.activeOperationId)
            return
        }
        console.log('cameraOrbit. orbit complete')
        return
    }

    async checkIfOrbitComplete(entity: Entity){
        return new Promise<void>((resolve) => {
            engine.addSystem(() => {
                const orbit = OrbitComponent.getOrNull(entity)
                if(!orbit || !orbit.active){
                    resolve()
                    engine.removeSystem("check-orbit-complete")
                }
            }, undefined, "check-orbit-complete")
        })
    }
    
    // rotationBlend = 0 => only control point rotations, 1 => only path-based rotation
    async startPathTrack(track: SplinePoint[], duration_ms: number, nbPoints: number = 10, loop: boolean = false, rotationBlend: number = 1, transitionSpeed: number = 0.5) {
        const operationId = this.setActiveOperation(CameraState.PATH_TRACKING)
        this.stopExistingAnimations()

        console.log('startPathTrack. start', this.activeOperationId)
        this.setCurrentCamEntity()

        // create catmullRomSpline with rotation
        const catmullRomSpline = createCatmullRomSplineWithRotation(track, nbPoints, rotationBlend, loop)
        // console.log('startPathTrack. catmullRomSpline:', JSON.stringify(catmullRomSpline), 'length:', catmullRomSpline.length)

        let sumLength = 0
        const segmentLengths = []
        // Calculate segment lengths including the loop-back segment if looping
        for (let i = 0; i < catmullRomSpline.length - 1; i++) {
            let dist = Vector3.distance(catmullRomSpline[i].position, catmullRomSpline[i + 1].position)
            sumLength += dist
            segmentLengths.push(sumLength)
        }
    
        // Add the loop-back segment length if looping
        if (loop) {
            let loopDist = Vector3.distance(
                catmullRomSpline[catmullRomSpline.length - 1].position, 
                catmullRomSpline[0].position
            )
            sumLength += loopDist
            segmentLengths.push(sumLength)
        }
    
        // Calculate normalized segment times
        const cumulativeSegmentTimes = segmentLengths.map(v => v / sumLength)
        // console.log('startPathTrack. cumulativeSegmentTimes:', JSON.stringify(cumulativeSegmentTimes), 'length:', cumulativeSegmentTimes.length)
        const speed = 1 / duration_ms * 1000

        const camTransform = Transform.getMutable(this.currentCam.camEntity)
        camTransform.parent = engine.RootEntity
        camTransform.position = catmullRomSpline[0].position
        camTransform.rotation = catmullRomSpline[0].rotation

        // assisgn current camera to virtual camera
        console.log('cameraOrbit. change main camera to orbit camera. Transition speed:', transitionSpeed)
        VirtualCamera.getMutable(this.currentCam.camEntity).defaultTransition = { transitionMode: VirtualCamera.Transition.Time(transitionSpeed) }
        MainCamera.createOrReplace(engine.CameraEntity, {
            virtualCameraEntity: this.currentCam.camEntity,
        })

        await wait_ms(transitionSpeed * 1000)
        if(!this.isOperationValid(operationId)) {
            console.log('terminate operation. operation invalid:', operationId, '. New operation:', this.activeOperationId)
            return
        }

        LerpTransformComponent.createOrReplace(this.currentCam.camEntity, {
            track: catmullRomSpline,
            cumulativeSegmentTimes: cumulativeSegmentTimes,
            speed: speed,
            currentIndex: 0,
            normalizedTime: 0,
            active: true,
            loop: loop

        })

        // wait for lerp transform to complete
        await this.checkIfLerpTransformComplete(this.currentCam.camEntity)
        if(!this.isOperationValid(operationId)) {
            console.log('terminate operation. operation invalid:', operationId, '. New operation:', this.activeOperationId)
            return
        }

        console.log('startPathTrack. lerp transform complete')
        return
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
    
    stopExistingAnimations() {
        if(!this.activeOperationId) return

        // Clear existing animations
        // orbit use vanityRoot
        if (OrbitComponent.getOrNull(this.currentCam.vanityRoot)) {
            let orbitComponent = OrbitComponent.getMutable(this.currentCam.vanityRoot)
            if (orbitComponent.active) {
                orbitComponent.active = false
            }
        }
        // lerp transform use camEntity
        if(LerpTransformComponent.getOrNull(this.currentCam.camEntity)) {
            let lerpTransform = LerpTransformComponent.getMutable(this.currentCam.camEntity)
            if (lerpTransform.active) {
                lerpTransform.active = false
            }
        }

    }

    async freeCamera(){
        try {
            MainCamera.getMutable(engine.CameraEntity).virtualCameraEntity = undefined

            // if(this.forcedFirstPersonInCameraBlock) {
                await wait_ms(100)
                this.freeCameraMode()
            // }
            // else return
    
        } catch (error) {
            console.error(error);
        }
    }

    freeCameraMode() {
        console.log('freeCameraMode')
        CameraModeArea.deleteFrom(this.forceCameraArea)
    }
    forceFirstPerson() {
        console.log('forceFirstPerson')
        CameraModeArea.createOrReplace(this.forceCameraArea, {
            area: Vector3.create(4, 3, 4),
            mode: CameraType.CT_FIRST_PERSON,
        })
    }
    forceThirdPerson() {
        console.log('forceThirdPerson')
        CameraModeArea.createOrReplace(this.forceCameraArea, {
            area: Vector3.create(4, 3, 4),
            mode: CameraType.CT_THIRD_PERSON,
        })
    }
    
    lockPlayer() {
        InputModifier.createOrReplace(engine.PlayerEntity, {
            mode: {
                $case: 'standard',
                standard: {
                    disableAll: true
                }
            }
        })
    }

    unlockPlayer() {
        InputModifier.createOrReplace(engine.PlayerEntity, {
            mode: {
                $case: 'standard',
                standard: {
                    disableAll: false
                }
            }
        })
    }
    
    hideAvatar() {
        console.log('hide avatar')
        // if(AvatarModifierArea.has(this.hideAvatarArea)) return;
        Transform.getMutable(this.hideAvatarArea).position = Vector3.Zero()
        // AvatarModifierArea.create(this.hideAvatarArea, {
        //     area: Vector3.create(10, 10, 10),
        //     modifiers: [AvatarModifierType.AMT_HIDE_AVATARS],
        //     excludeIds: []
        // })
        console.log('hide avatar. done')
    }
    showAvatar() {
        console.log('show avatar')
        // if(!AvatarModifierArea.has(this.hideAvatarArea)) return;
        
        Transform.getMutable(this.hideAvatarArea).position = Vector3.create(0, -50, 0)

        // AvatarModifierArea.deleteFrom(this.hideAvatarArea)
        console.log('show avatar. done')
    }
}

export const cameraManager = new CameraManager()


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
