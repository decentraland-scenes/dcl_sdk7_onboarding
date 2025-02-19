import { ColliderLayer, engine, Entity, InputAction, inputSystem, Material, MeshCollider, MeshRenderer, PBMaterial_PbrMaterial, PointerEvents, pointerEventsSystem, PointerEventType, Transform, VisibilityComponent } from "@dcl/sdk/ecs";
import { SpawnIsland } from "../quest/questStartIsland";
import { Vector3, Color4, Quaternion } from "@dcl/sdk/math";
import { lerp } from "../utils/lerp";
import * as utils from '@dcl-sdk/utils'
import { directionVectorBetweenTwoPoints } from "../utils/globalLibrary";

export class GlowingOrb {
    entity: Entity
    outerEntity: Entity
    innerEntity: Entity
    innerEntity2: Entity
    private _questStartIsland: SpawnIsland
    private _completedQuest = false
    private readonly _systemName: string = "GlowingOrbSystem"
    private _animAlpha = 0
    private _evenLoop = false
    private _animScaleAlpha = 0
    private _evenScaleLoop = false
    private _questProgressAlpha = 0
    private _hover = false
    private _hoverAngle = false
    private _deactivateWithAnim = false
    private _deactivateAnimAlpha = 0
    constructor(questStartIsland: SpawnIsland){
        this._questStartIsland = questStartIsland

        this.entity = engine.addEntity()
        Transform.create(this.entity, {
            position: Vector3.create(223.31,71,130.26),
            scale: Vector3.Zero()
        })
        VisibilityComponent.create(this.entity, {
            visible: false
        })

        this.outerEntity = engine.addEntity()
        Transform.create(this.outerEntity, {
            parent: this.entity,
            position: Vector3.create(0,0,0),
            scale: Vector3.scale(Vector3.One(), 2)
        })
        MeshRenderer.setSphere(this.outerEntity)
        MeshCollider.setSphere(this.outerEntity, ColliderLayer.CL_POINTER)
        Material.setPbrMaterial(this.outerEntity,{
            albedoColor: Color4.create(1, 1, 0, 0.01),
            emissiveColor: Color4.create(1, 1, .5, 0.01),
            emissiveIntensity: 10
        })
        // rgb(255, 255, 0)
        this.innerEntity2 = engine.addEntity()
        Transform.create(this.innerEntity2, {
            parent: this.outerEntity,
            position: Vector3.create(0,0,0),
            scale: Vector3.scale(Vector3.One(), 0.9)
        })
        MeshRenderer.setSphere(this.innerEntity2)
        Material.setPbrMaterial(this.innerEntity2,{
            albedoColor: Color4.create(1, 1, 0, 0.1),
            emissiveColor: Color4.create(1, 1, .5, 0.1),
            emissiveIntensity: 5
        })

        this.innerEntity = engine.addEntity()
        Transform.create(this.innerEntity, {
            parent: this.outerEntity,
            position: Vector3.create(0,0,0),
            scale: Vector3.scale(Vector3.One(), 0.1)
        })
        MeshRenderer.setSphere(this.innerEntity)
        Material.setPbrMaterial(this.innerEntity,{
            albedoColor: Color4.create(1, 1, 0, 1),
            emissiveColor: Color4.create(1, 1, .5, 1),
            emissiveIntensity: 20
        })


        PointerEvents.create(this.outerEntity, {
            pointerEvents: [
                {
                    eventType: PointerEventType.PET_HOVER_ENTER,
                    eventInfo: {
                        button: InputAction.IA_POINTER,
                        showFeedback: true,
                    },
                },
                {
                    eventType: PointerEventType.PET_HOVER_LEAVE,
                    eventInfo: {
                        button: InputAction.IA_POINTER,
                        showFeedback: true,
                    },
                },
            ],
        })

        //this.activate()
    }
    private checkLookAtWithCameraRotation(): boolean {

        //Calculate forward direction of camera
        const forwardCamera = Vector3.rotate(Vector3.Forward(), Transform.get(engine.CameraEntity).rotation)
        const forwardToOrb = directionVectorBetweenTwoPoints(Transform.get(engine.CameraEntity).position, Transform.get(this.entity).position)
        //Calculate angle between centerDirection and cameraRotation
        return Math.abs(Vector3.getAngleBetweenVectors(forwardToOrb, forwardCamera, Vector3.Up())) < 0.3
    }
    private updateSystem(dt: number) {
        //Input & quest
        if(this._completedQuest == false) {

            this._hoverAngle = this.checkLookAtWithCameraRotation()
            
            if (inputSystem.isTriggered( InputAction.IA_POINTER, PointerEventType.PET_HOVER_ENTER, this.outerEntity )) {
                this._hover = true;
            }
            else if (inputSystem.isTriggered( InputAction.IA_POINTER, PointerEventType.PET_HOVER_LEAVE, this.outerEntity )) {
                this._hover = false;
            }
                
            
            if(this._hover || this._hoverAngle) {
                this._questProgressAlpha += dt*0.5
                if(this._questProgressAlpha >= 1) {
                    this._questProgressAlpha = 1
                    this.completeQuest()
                }
            }
        }

        //Animations
        //Idle Anims
        if(this._animAlpha >= 1) {
            this._evenLoop = true
        }
        else if (this._animAlpha <= 0) {
            this._evenLoop = false
        }
        if(this._animScaleAlpha >= 1) {
            this._evenScaleLoop = true
        }
        else if (this._animScaleAlpha <= 0) {
            this._evenScaleLoop = false
        }

        if(this._evenLoop) {
            this._animAlpha = Math.max(this._animAlpha - dt, 0)
        }
        else {
            this._animAlpha = Math.min(this._animAlpha + dt, 1)
        }
        if(this._evenScaleLoop) {
            this._animScaleAlpha = Math.max(this._animScaleAlpha - dt*3, 0)
        }
        else {
            this._animScaleAlpha = Math.min(this._animScaleAlpha + dt*3, 1)
        }
        //Deactivate anim
        if(this._deactivateWithAnim) {
            this._deactivateAnimAlpha = Math.min(this._deactivateAnimAlpha + dt*2, 1)
            Transform.getMutable(this.entity).scale = Vector3.scale(Vector3.One(), lerp(1, 0, this._deactivateAnimAlpha));
            if(this._deactivateAnimAlpha <= 0) {
                this.deactivate()
            }
        }

        //Idle anims & quest ani
        Transform.getMutable(this.outerEntity).position = Vector3.create(0, lerp(0, 0.1, this._animAlpha), 0);
        Transform.getMutable(this.outerEntity).scale = Vector3.scale(Vector3.One(), lerp(2, 2.05, this._animScaleAlpha));
        Transform.getMutable(this.innerEntity2).scale = Vector3.scale(Vector3.One(), lerp(0.9, 0.85, this._animScaleAlpha));
        Transform.getMutable(this.innerEntity).scale = Vector3.scale(Vector3.One(), lerp(0.1, 1, this._questProgressAlpha));
        (Material.getMutable(this.outerEntity).material as { $case: "pbr"; pbr: PBMaterial_PbrMaterial; }).pbr.emissiveIntensity = lerp(10, 15, this._animAlpha);
        (Material.getMutable(this.innerEntity).material as { $case: "pbr"; pbr: PBMaterial_PbrMaterial; }).pbr.emissiveIntensity = lerp(20, 30, this._animAlpha);
        (Material.getMutable(this.innerEntity2).material as { $case: "pbr"; pbr: PBMaterial_PbrMaterial; }).pbr.emissiveIntensity = lerp(2, 5, this._animAlpha);
        
    }
    activate(){
        this._deactivateWithAnim = false
        Transform.getMutable(this.entity).scale = Vector3.One()
        engine.addSystem((dt: number)=>{this.updateSystem(dt)}, 0, this._systemName)
        VisibilityComponent.getMutable(this.entity).visible = true
    }
    deactivateWithAnim() {
        this._deactivateAnimAlpha = 0
        this._deactivateWithAnim = true
    }
    deactivate(){
        this._deactivateWithAnim = false
        engine.removeSystem(this._systemName)
        VisibilityComponent.getMutable(this.entity).visible = false
        
    }
    private completeQuest(){
        if(this._completedQuest) return

        this._completedQuest = true
        this._questStartIsland.cameraQuestCompleted()

    }
}