import {
  Animator,
  EasingFunction,
  engine,
  Entity,
  GltfContainer,
  InputAction,
  inputSystem,
  Material,
  MeshRenderer,
  PointerEvents,
  pointerEventsSystem,
  PointerEventType,
  Transform,
  Tween,
  TweenSequence,
  tweenSystem,
  VisibilityComponent
} from '@dcl/sdk/ecs'
import { Vector3, Quaternion, Color4 } from '@dcl/sdk/math'
import { GameController } from '../controllers/gameController'
import { openDialogWindow } from 'dcl-npc-toolkit'
import { FloorCircleTargeter } from '../imports/components/targeter'
import * as utils from '@dcl-sdk/utils'
import { movePlayerTo } from '~system/RestrictedActions'
import { addInPlace } from '../utils/addInPlace'
import { BubbleTalk } from '../imports/bubble'
import { IndicatorState, QuestIndicator } from '../imports/components/questIndicator'
import { AudioManager } from '../imports/components/audio/audio.manager'
import { activateSoundPillar1 } from '../imports/components/audio/sounds'
import { TaskType } from '../uis/widgetTask'
import { CAMERA_QUEST_0, CLICKME, HELP_BEIZER, JUMP, MOVE_QUEST_1, OVERHERE } from '../jsonData/textsTutorialBubble'
import { point1, point2, point3 } from '../jsonData/npcData'
import { sendTrak } from '../utils/segment'
import { NPC } from '../imports/components/npc.class'
import { blockCamera, forceFirstPerson, forceThirdPerson, freeCamera, freeCameraMode } from '../utils/camera'
import { lockPlayer, unlockPlayer } from '../utils/blockPlayer'
import { GlowingOrb } from '../imports/glowingOrb'

export class SpawnIsland {
  tobor: NPC
  gameController: GameController
  targeterCircle: FloorCircleTargeter
  questIndicator: QuestIndicator
  bubbleTalk: BubbleTalk
  arrows: Entity[]
  private isMoveQuestCompleted = false
  private readonly SPAWN_POINT = Vector3.create(224.127, 69.7368, 124.0051)
  private orb: GlowingOrb
  constructor(gameController: GameController) {
    this.gameController = gameController
    this.tobor = new NPC(
      Vector3.create(218.95, 68.67, 127.08),
      Vector3.create(1.1, 1.1, 1.1),
      Quaternion.create(0, 0.5733939, 0, -0.8192798),
      'assets/scene/models/unity_assets/s0_NPC_Robot_Art_1__01.glb',
      14,
      () => {
        Animator.getClip(this.tobor.entity, 'Robot_Idle').playing = true
      },
      
    )
    //() => {
      //  pointerEventsSystem.removeOnPointerDown(this.tobor.npcChild)
      //  this.bubbleTalk.closeBubbleInTime()
      //  this.startInteractQuest()
      //}
    Animator.createOrReplace(this.tobor.entity, {
      states: [
        {
          clip: 'Robot_On',
          playing: false,
          loop: true
        },
        {
          clip: 'Robot_off',
          playing: false,
          loop: false
        },
        {
          clip: 'Walk_End',
          playing: false,
          loop: false
        },
        {
          clip: 'Walk_Loop',
          playing: false,
          loop: false
        },
        {
          clip: 'Walk_Start',
          playing: false,
          loop: false
        },
        {
          clip: 'Robot_Idle',
          playing: true,
          loop: true
        },
        {
          clip: 'Talk',
          playing: false,
          loop: true
        }
      ]
    })
    this.tobor.activateBillBoard(true)
    this.bubbleTalk = new BubbleTalk(this.tobor.bubbleAttach)
    this.tobor.setChildScaleYAxis(3.1)
    this.bubbleTalk.closeBubbleInTime()
    //this.bubbleTalk.openBubble(CLICKME, true)

    this.targeterCircle = new FloorCircleTargeter(
      Vector3.create(0, 0, 0),
      Vector3.create(0, 0, 0),
      Quaternion.create(0, 0, 0),
      this.tobor.entity
    )
    this.questIndicator = new QuestIndicator(this.tobor.entity)
    this.questIndicator.hide()
    this.targeterCircle.showCircle(false)
    this.targeterCircle.setCircleScale(0.4)
    this.arrows = []

    this.orb = new GlowingOrb(this)

    this.loadTagData()
  }
  loadTagData() {
    PointerEvents.createOrReplace(this.gameController.mainInstance.s0_Fence_Art_02, {
      pointerEvents: [
        {
          eventType: PointerEventType.PET_DOWN,
          eventInfo: {
            button: InputAction.IA_POINTER,
            showFeedback: true,
            hoverText: 'Talk to Tobor First'
          }
        }
      ]
    })
    PointerEvents.createOrReplace(this.gameController.mainInstance.s0_Z3_Str_Bridge_Art_01, {
      pointerEvents: [
        {
          eventType: PointerEventType.PET_DOWN,
          eventInfo: {
            button: InputAction.IA_POINTER,
            showFeedback: true,
            hoverText: 'Talk to Tobor'
          }
        }
      ]
    })
    engine.addSystem(() => {
      if (
        inputSystem.isTriggered(
          InputAction.IA_POINTER,
          PointerEventType.PET_DOWN,
          this.gameController.mainInstance.s0_Fence_Art_02
        )
      ) {
      }
      if (
        inputSystem.isTriggered(
          InputAction.IA_POINTER,
          PointerEventType.PET_DOWN,
          this.gameController.mainInstance.s0_Z3_Str_Bridge_Art_01
        )
      ) {
      }
    })
    this.respawnTrigger()
    this.activeCables(false)
    //this.startSpawnIsland()
  }
  respawnTrigger() {
    const triggerPos = Vector3.create(160, 10, 160)
    const triggerEnt = engine.addEntity()
    Transform.create(triggerEnt, {
      position: triggerPos,
      scale: Vector3.create(300, 20, 300) 
    })
    utils.triggers.addTrigger(triggerEnt, 1, 1, [{ type: 'box', scale: Vector3.create(300, 20, 300) }], () => {
      movePlayerTo({
        // newRelativePosition: Vector3.create(170.59,65.84,116.23), // bazier island
        // newRelativePosition: Vector3.create(167.36, 68.29, 144.91), // mat island
        // newRelativePosition: Vector3.create(117.2279, 80.72495, 113.0214), 
        newRelativePosition: Vector3.create(224.127, 69.7368, 124.0051), // spawn island
        cameraTarget: Vector3.create(219.13, 70.73, 125.91)
      })
    })
  }
  startSpawnIsland() {
    lockPlayer()
    forceThirdPerson()

    this.gameController.uiController.widgetTasks.showTasks(false, TaskType.Simple)

    // -- Camera --
    //The tutorial begins with a cinematic that shows detailed views and traveling shots of the scenario. Then, it focuses on where the avatar has appeared along with Tobor.

    //Start ambiental sound
    sendTrak('z0_quest0_00', this.gameController.timeStamp)
    AudioManager.instance().playMainAmbience(true)
    AudioManager.instance().play('waterfall', { volume: 1, loop: true, position: Vector3.create(226.94, 70, 130.37) })

    utils.timers.setTimeout(()=>{
      Animator.stopAllAnimations(this.tobor.entity)
      Animator.getClip(this.tobor.entity, 'Talk').playing = true
      openDialogWindow(this.tobor.entity, this.gameController.dialogs.toborCinematicDialog, 0)
    }, 500)

  }

  introductionMiddleChangeCamera() {
    // -- Camera --
    //Camera pans to the player’s character
  }

  finishedIntroDialog() {
    // -- Camera --
    //Camera turns back to Tobor
    
    //Wait for camera animation
    utils.timers.setTimeout(()=>{

      AudioManager.instance().playOnce('tobor_talk', { volume: 0.6, parent: this.tobor.entity })
      Animator.stopAllAnimations(this.tobor.entity)
      Animator.getClip(this.tobor.entity, 'Talk').playing = true
      openDialogWindow(this.tobor.entity, this.gameController.dialogs.toborMovementDialog, 0)
    }, 500)
  }
  // ---- Movement Quest ----
  startMovementQuest() {
    // -- Camera --
    //Camera goes back to normal

    unlockPlayer()
    freeCameraMode()
    Animator.stopAllAnimations(this.tobor.entity)
    Animator.getClip(this.tobor.entity, 'Robot_Idle').playing = true

    this.gameController.uiController.popUpControls.showMoveControlsUI()
    this.bubbleTalk.openBubble(MOVE_QUEST_1, true)
    //Movement task UI
    this.gameController.uiController.widgetTasks.showTasks(true, TaskType.Simple)
    this.gameController.uiController.widgetTasks.showTick(false, 0)
    this.gameController.uiController.widgetTasks.setText(0, 0)
  }
  moveQuestCompleted() {
    if(this.isMoveQuestCompleted) return;
    this.isMoveQuestCompleted = true;

    // -- Camera --
    //Camera transitions to Tobor

    
    lockPlayer()
    movePlayerTo({
      newRelativePosition: this.SPAWN_POINT,
      cameraTarget: Quaternion.fromLookAt(this.SPAWN_POINT, Vector3.add(Transform.get(this.tobor.entity).position, {x: 0, y: 1, z: 0}))
    })
    this.bubbleTalk.closeBubbleInTime()
    this.gameController.uiController.popUpControls.hideAllControlsUI()


    AudioManager.instance().playOnce('tobor_talk', { volume: 0.6, parent: this.tobor.entity })
    Animator.stopAllAnimations(this.tobor.entity)
    Animator.getClip(this.tobor.entity, 'Talk').playing = true
    openDialogWindow(this.tobor.entity, this.gameController.dialogs.toborCameraDialog, 0)
  }
  // ---- Camera Quest ----
  startCameraQuest() {
    Animator.stopAllAnimations(this.tobor.entity)
    Animator.getClip(this.tobor.entity, 'Robot_Idle').playing = true

    unlockPlayer()
    this.bubbleTalk.openBubble(CAMERA_QUEST_0, true)
    this.gameController.uiController.popUpControls.showLookControlsUI()
    //Camera task UI
    //Spawn gloing orb
    this.spawnGlowingOrb()
  }

  private spawnGlowingOrb() {
    this.orb.activate()
  }

  cameraQuestCompleted() {

    lockPlayer()
    movePlayerTo({
      newRelativePosition: this.SPAWN_POINT,
      cameraTarget: Quaternion.fromLookAt(this.SPAWN_POINT, Vector3.add(Transform.get(this.tobor.entity).position, {x: 0, y: 1, z: 0}))
    })
    this.bubbleTalk.closeBubbleInTime()
    this.gameController.uiController.popUpControls.hideAllControlsUI()


    AudioManager.instance().playOnce('tobor_talk', { volume: 0.6, parent: this.tobor.entity })
    Animator.stopAllAnimations(this.tobor.entity)
    Animator.getClip(this.tobor.entity, 'Talk').playing = true
    openDialogWindow(this.tobor.entity, this.gameController.dialogs.toborJumpDialog, 0)

    utils.timers.setTimeout(()=>{
      this.orb.deactivateWithAnim()
    }, 1000)
  }

  //Jump quest
  startJumpQuest() {
    Animator.stopAllAnimations(this.tobor.entity)
    Animator.getClip(this.tobor.entity, 'Robot_Idle').playing = true

    unlockPlayer()

    this.gameController.uiController.popUpControls.showJumpControlsUI()
    //Jump task UI
    
    this.startMoveForwardJumpQuest()
  }

  activeCables(bActive: boolean) {
    if (bActive === true) {
      GltfContainer.getMutable(this.gameController.mainInstance.s0_Cable_01_ON_01).src =
        'assets/scene/models/unity_assets/s0_Cable_01_ON_01.glb'
      GltfContainer.getMutable(this.gameController.mainInstance.s0_Cable_01_OFF_01).src = ''
    } else if (bActive === false) {
      GltfContainer.getMutable(this.gameController.mainInstance.s0_Cable_01_ON_01).src = ''
      GltfContainer.getMutable(this.gameController.mainInstance.s0_Cable_01_OFF_01).src =
        'assets/scene/models/unity_assets/s0_Cable_01_OFF_01.glb'
    }
  }
  startInteractQuest() {
    AudioManager.instance().playOnce('tobor_talk', { volume: 0.6, parent: this.tobor.entity })
    openDialogWindow(this.tobor.entity, this.gameController.dialogs.toborDialog, 0)
    Animator.stopAllAnimations(this.tobor.entity)
    Animator.getClip(this.tobor.entity, 'Talk').playing = true
    this.targeterCircle.showCircle(false)
    this.questIndicator.hide()
    this.gameController.uiController.widgetTasks.showTick(true, 0)
    this.gameController.uiController.popUpControls.hideLookControlsUI()
    this.gameController.uiController.popUpControls.hideCursorLockControlsUI()
  }
  startMoveForwardJumpQuest() {
    //this.gameController.uiController.popUpControls.showMoveControlsUI()
    this.tobor.activateBillBoard(false)

    Tween.createOrReplace(this.tobor.entity, {
      mode: Tween.Mode.Rotate({
        start: Quaternion.create(0, 0.5733939, 0, -0.8192798),
        end: Quaternion.fromEulerDegrees(0, -240, 0)
      }),
      duration: 400,
      easingFunction: EasingFunction.EF_LINEAR
    })
    //utils.timers.setTimeout(() => {}, 500)

    TweenSequence.create(this.tobor.entity, {
      sequence: [
        {
          duration: 1500,
          easingFunction: EasingFunction.EF_LINEAR,
          mode: Tween.Mode.Move({
            start: Vector3.create(218.95, 68.67, 127.08),
            end: point1
          })
        },
        {
          duration: 1500,
          easingFunction: EasingFunction.EF_LINEAR,
          mode: Tween.Mode.Move({
            start: point1,
            end: point2
          })
        }
      ]
    })
    let tween = 0
    engine.addSystem(() => {
      const tweenCompleted = tweenSystem.tweenCompleted(this.tobor.entity)
      if (tweenCompleted) {
        tween = tween + 1
        if (tween === 3) {
          console.log('finished')
          this.tobor.activateBillBoard(true)
          this.bubbleTalk.openBubble(JUMP, true)
          this.jumpquest()
        }
        if (tween === 5) {
          this.tobor.activateBillBoard(true)
          this.targeterCircle.showCircle(true)
          this.dialogAtPilar()
          pointerEventsSystem.onPointerDown(
            {
              entity: this.tobor.npcChild,
              opts: {
                button: InputAction.IA_POINTER,
                hoverText: 'Talk'
              }
            },
            () => {
              pointerEventsSystem.removeOnPointerDown(this.tobor.npcChild)
              console.log('CLICKED')
              AudioManager.instance().playOnce('tobor_talk', {
                volume: 0.6,
                parent: this.tobor.entity
              })
              this.targeterCircle.showCircle(false)
              this.questIndicator.hide()
              sendTrak('z0_quest0_02', this.gameController.timeStamp)
              openDialogWindow(this.gameController.spawnIsland.tobor.entity, this.gameController.dialogs.toborDialog, 3)
              utils.timers.setTimeout(() => {
                this.gameController.uiController.widgetTasks.setText(3, 0)
                this.gameController.uiController.widgetTasks.showTick(false, 0)
              }, 2000)
            }
          )
          console.log('tobor on  pilar')
        }
      }
    })
  }
  jumpquest() {
    //this.gameController.uiController.popUpControls.spaceContainerVisible = true
    this.gameController.uiController.popUpControls.showJumpControlsUI()
    this.gameController.uiController.widgetTasks.setText(1, 0)
    this.gameController.uiController.widgetTasks.showTasks(true, TaskType.Simple)
    Transform.getMutable(this.gameController.mainInstance.s0_Fence_Art_02).scale = Vector3.create(0, 0, 0)
    Transform.getMutable(this.gameController.mainInstance.s0_Fence_Art_02).position = Vector3.create(0, 0, 0)
    let obstacletrigger = engine.addEntity()
    let triggerPosition = Transform.get(this.gameController.mainInstance.s0_tree_fall_art_01).position
    Transform.create(obstacletrigger, {
      position: addInPlace(triggerPosition, Vector3.create(-2, 0, 3))
    })
    utils.triggers.addTrigger(obstacletrigger, 1, 1, [{ type: 'box', scale: Vector3.create(3, 9, 10) }], () => {
      engine.removeEntity(obstacletrigger)
      this.bubbleTalk.closeBubbleInTime()
      this.gameController.spawnIsland.tobor.activateBillBoard(false)
      this.followPath()
      this.completeJumpQuest()
      console.log('jump tree')
    })
  }
  completeJumpQuest() {
    sendTrak('z0_quest0_01', this.gameController.timeStamp)
    this.gameController.uiController.popUpControls.hideMoveControlsUI()
    this.gameController.uiController.popUpControls.hideJumpControlsUI()
    this.gameController.uiController.popUpControls.spaceContainerVisible = false
    this.gameController.uiController.widgetTasks.showTick(true, 0)
    utils.timers.setTimeout(() => {
      this.gameController.uiController.widgetTasks.setText(2, 0)
      this.gameController.uiController.widgetTasks.showTasks(true, TaskType.Simple)
      this.dialogAtPilar()
    }, 1500)
  }
  dialogAtPilar() {
    this.questIndicator.updateStatus(IndicatorState.ARROW)
    this.questIndicator.showWithAnim()
  }
  onCloseRewardUI() {
    this.targeterCircle.showCircle(false)
    this.questIndicator.hide()
    //Camera animations

    //Blocks camera after force a 1st person, the transition is smooth and the change of camera won't be noticed
    const moveToPosition = Vector3.create(203.60,64.89,129.5)
    const afterCameraTarget = Vector3.add(Transform.get(this.gameController.questEmote.bezier.entity).position, Vector3.create(0,40,0))
    const cameraPoint = Vector3.create(199,66,127)
    blockCamera(
      cameraPoint, 
      Quaternion.fromLookAt(cameraPoint, Vector3.add(Transform.get(this.gameController.questEmote.bezier.entity).position, Vector3.create(0,40,0))),
      true
    )
    //If player is in front of the camera, move it inmidetlly
    //if(
    //  Vector3.distance(cameraPoint, Transform.get(this.gameController.questEmote.bezier.entity).position) 
    //  > Vector3.distance(Transform.get(engine.PlayerEntity).position, Transform.get(this.gameController.questEmote.bezier.entity).position)
    //) {
    //  movePlayerTo({
    //    newRelativePosition: moveToPosition,
    //    cameraTarget: afterCameraTarget
    //  })
    //}
    //Lock player controls
    lockPlayer()
    //500ms to wait for block camera traveling
    utils.timers.setTimeout(() => {
      //Bridge & indicator animations
      this.gameController.questEmote.npcSayHi()
      this.activateBridge()
      this.activatePilar()
      Animator.stopAllAnimations(this.tobor.entity)
      Animator.getClip(this.tobor.entity, 'Robot_Idle').playing = true
      this.gameController.uiController.widgetTasks.showTasks(true, TaskType.Simple)
      this.gameController.spawnIsland.bubbleTalk.openBubble(HELP_BEIZER, false)
      this.gameController.questEmote.questIndicator.updateStatus(IndicatorState.ARROW)
      this.gameController.questEmote.questIndicator.showWithAnim()
      //Release camera after animations (1000ms)
      utils.timers.setTimeout(() => {
        //While the camera is still blocked, move the player & camera look to the desired target
        
        movePlayerTo({
          newRelativePosition: moveToPosition,
          cameraTarget: afterCameraTarget
        })
        //Wait some frames until move player is finished (500ms here because of desired anim time)
        utils.timers.setTimeout(() => {
          //Free the camera and unlock plaver controls, the 1st person camera is still being forced to avoid 3rd person camera rotation bug on release camera
          freeCamera()
          unlockPlayer()
  
        }, 500)
      }, 1000)
    }, 500)
  }
  activatePilar() {
    AudioManager.instance().playTowerCharge(this.gameController.mainInstance.s0_Z3_Quest_Pillar_Art_4__01)
    Animator.getClip(this.gameController.mainInstance.s0_Z3_Quest_Pillar_Art_4__01, 'Pillar_Anim').speed = 3
    Animator.getClip(this.gameController.mainInstance.s0_Z3_Quest_Pillar_Art_4__01, 'Pillar_Anim').shouldReset = false
    Animator.getClip(this.gameController.mainInstance.s0_Z3_Quest_Pillar_Art_4__01, 'Pillar_Anim').loop = false
    Animator.playSingleAnimation(this.gameController.mainInstance.s0_Z3_Quest_Pillar_Art_4__01, 'Pillar_Anim')
    utils.timers.setTimeout(() => {
      AudioManager.instance().playTowerActivated(this.gameController.mainInstance.s0_Z3_Quest_Pillar_Art_4__01)
      activateSoundPillar1(this.gameController.mainInstance.s0_Z3_Quest_Pillar_Art_4__01)
      this.activeCables(true)
    }, 3000)
  }
  activateBridge() {
    this.getBridgeArrow()
    PointerEvents.deleteFrom(this.gameController.mainInstance.s0_Z3_Str_Bridge_Art_01)
    AudioManager.instance().playBridge(this.gameController.mainInstance.s0_Z3_Str_Bridge_Art_01)
    Animator.getClip(this.gameController.mainInstance.s0_Z3_Str_Bridge_Art_01, 'Bridge On').speed = 1
    Animator.getClip(this.gameController.mainInstance.s0_Z3_Str_Bridge_Art_01, 'Bridge On').shouldReset = false
    Animator.getClip(this.gameController.mainInstance.s0_Z3_Str_Bridge_Art_01, 'Bridge On').loop = false
    Animator.getClip(this.gameController.mainInstance.s0_Z3_Str_Bridge_Art_01, 'Bridge On').weight = 0.3
    Animator.playSingleAnimation(this.gameController.mainInstance.s0_Z3_Str_Bridge_Art_01, 'Bridge On')
    Animator.getClip(this.gameController.mainInstance.s0_Z3_Str_Bridge_Art_01, 'Bridge Animation').speed = 3
    Animator.getClip(this.gameController.mainInstance.s0_Z3_Str_Bridge_Art_01, 'Bridge Animation').shouldReset = false
    Animator.getClip(this.gameController.mainInstance.s0_Z3_Str_Bridge_Art_01, 'Bridge Animation').loop = false
    Animator.playSingleAnimation(this.gameController.mainInstance.s0_Z3_Str_Bridge_Art_01, 'Bridge Animation')
    Animator.getClip(this.gameController.mainInstance.s0_Z3_Str_Bridge_Art_01, 'Bridge Animation').weight = 1
  }
  getBridgeArrow() {
    let zOffset = 1.85
    let scale = 0.3
    const xOffsets = [-2.3, -0.6, 0.7, 2.3, -2.3, -0.6, 0.7, 2.3]
    for (let i = 0; i < 9; i++) {
      const arrow = engine.addEntity()
      MeshRenderer.setPlane(arrow)
      Transform.create(arrow, { parent: this.gameController.mainInstance.s0_Z3_Str_Bridge_Art_01 })
      Material.setPbrMaterial(arrow, {
        texture: Material.Texture.Common({
          src: 'assets/textures/arrow2.png'
        }),
        albedoColor: Color4.Yellow(),
        emissiveColor: Color4.Yellow(),
        emissiveIntensity: 5,
        alphaTexture: Material.Texture.Common({
          src: 'assets/textures/arrow2.png'
        })
      })
      if (i == 4) zOffset = -1.85

      if (i == 8) {
        Transform.getMutable(arrow).position = Vector3.create(-7, 1.6, 0)
        Transform.getMutable(arrow).scale = Vector3.create(1, 1, 1)
        Transform.getMutable(arrow).rotation = Quaternion.create(0.5, 0.5, -0.5, 0.5)
      } else {
        Transform.getMutable(arrow).position = Vector3.create(xOffsets[i], 1.4, zOffset)
        ;(Transform.getMutable(arrow).scale = Vector3.create(scale, scale, scale)),
          (Transform.getMutable(arrow).rotation = Quaternion.create(0.5, 0.5, -0.5, 0.5))
      }
      this.arrows.push(arrow)
    }
  }

  followPath(): void {
    Tween.createOrReplace(this.tobor.entity, {
      mode: Tween.Mode.Rotate({
        start: Quaternion.create(0, 0, 0),
        end: Quaternion.fromEulerDegrees(0, 30, 0)
      }),
      duration: 400,
      easingFunction: EasingFunction.EF_LINEAR
    })
    utils.timers.setTimeout(() => {}, 500)

    TweenSequence.createOrReplace(this.tobor.entity, {
      sequence: [
        {
          duration: 1500,
          easingFunction: EasingFunction.EF_LINEAR,
          mode: Tween.Mode.Move({
            start: point2,
            end: point3
          })
        }
      ]
    })
  }
}
