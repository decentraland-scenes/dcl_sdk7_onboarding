import { Entity, engine, Transform, VirtualCamera, MainCamera, CameraModeArea, CameraType, AvatarModifierArea, AvatarModifierType } from "@dcl/sdk/ecs";
import { Quaternion, Vector3 } from "@dcl/sdk/math";
import * as utils from '@dcl-sdk/utils'

var customCameraEnt: Entity
var forceCameraArea: Entity
var hideAvatarArea: Entity
var forcedFirstPersonInCameraBlock = false
export function initCameraModiers() {
    try {
        if(!customCameraEnt) {
            customCameraEnt = engine.addEntity()
            Transform.create(customCameraEnt, {
                position: Vector3.create(),
                rotation: Quaternion.fromEulerDegrees(0,0,0)
            })
            VirtualCamera.create(customCameraEnt, {
                defaultTransition: { transitionMode: VirtualCamera.Transition.Time(0.5) },
            })
        }
    } catch (error) {
        console.error(error); 
    }
    try {
        if(!forceCameraArea) {
            forceCameraArea = engine.addEntity()
            Transform.create(forceCameraArea, {
                position: Vector3.Zero(),
                parent: engine.PlayerEntity
            })
        }
        if(!hideAvatarArea) {
            hideAvatarArea = engine.addEntity()
            Transform.create(hideAvatarArea, {
                position: Vector3.Zero(),
                parent: engine.PlayerEntity
            })
        }
    } catch (error) {
        console.error(error); 
    }
    
}

export function blockCamera(position: Vector3, rotation: Quaternion, bForceFirstPerson: boolean = false) {
    try {
        forcedFirstPersonInCameraBlock = bForceFirstPerson
        Transform.getMutable(customCameraEnt).position = position
        Transform.getMutable(customCameraEnt).rotation = rotation
        if(!bForceFirstPerson) {
            MainCamera.createOrReplace(engine.CameraEntity, {
                virtualCameraEntity: customCameraEnt,
            })    
            return;
        }

        //Force 1st person some frames before blocking the camera to avoid 3rd person camera bug with block camera
        forceFirstPerson()
        hideAvatar()
        utils.timers.setTimeout(()=>{
            MainCamera.createOrReplace(engine.CameraEntity, {
                virtualCameraEntity: customCameraEnt,
            })
        }, 100)
        
    } catch (error) {
        console.error(error); 
    }
}
export function freeCamera() {
    try {

        MainCamera.getMutable(engine.CameraEntity).virtualCameraEntity = undefined

        if(forcedFirstPersonInCameraBlock) {     
            //After a couple of frames, stop forcing 1st person camera mode, the transition is smooth with the release of the virtual camera and the change of mode won't be noticed
            utils.timers.setTimeout(() => {
                freeCameraMode()
                showAvatar()
            }, 100)
        }
    } catch (error) {
        console.error(error); 
    }
}

export function freeCameraMode() {
    try {
        CameraModeArea.deleteFrom(forceCameraArea)
    } catch (error) {
        console.error(error); 
    }
}
export function forceFirstPerson() {

    CameraModeArea.createOrReplace(forceCameraArea, {
        area: Vector3.create(4, 3, 4),
        mode: CameraType.CT_FIRST_PERSON,
    })
}
export function forceThirdPerson() {

    CameraModeArea.createOrReplace(forceCameraArea, {
        area: Vector3.create(4, 3, 4),
        mode: CameraType.CT_THIRD_PERSON,
    })
}

function hideAvatar() {
    if(AvatarModifierArea.has(hideAvatarArea)) return;

    AvatarModifierArea.create(hideAvatarArea, {
        area: Vector3.create(4, 3, 4),
        modifiers: [AvatarModifierType.AMT_HIDE_AVATARS],
        excludeIds: []
    })
}
function showAvatar() {
    try {
        AvatarModifierArea.deleteFrom(hideAvatarArea)
    } catch (error) {
        console.error(error); 
    }
}