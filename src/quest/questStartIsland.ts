import {
  Animator,
  EasingFunction,
  engine,
  Entity,
  executeTask,
  GltfContainer,
  GltfContainerLoadingState,
  InputAction,
  inputSystem,
  LoadingState,
  Material,
  MaterialTransparencyMode,
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
import { cameraManager, getWorldPosition, wait_ms } from '../cinematic/cameraManager'
import { onEnterScene } from '@dcl/sdk/src/players'

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
      if (
        inputSystem.isTriggered(
          InputAction.IA_POINTER,
          PointerEventType.PET_DOWN,
          this.gameController.mainInstance.s0_tree_fall_art_01
        )
      ) {
      }
    })

    this.activeCables(false)

    // check if island loading complete.
    engine.addSystem(() => {
      const loadingState = GltfContainerLoadingState.getOrNull(this.gameController.mainInstance.s0_First_island_art_1__01)
      if (loadingState){
        switch (loadingState.currentState) {

            case LoadingState.LOADING:
            break

            // case LoadingState.FINISHED_WITH_ERROR:
            // case LoadingState.UNKNOWN:
            case LoadingState.FINISHED:
              console.log('loadingState: FINISHED')
              engine.removeSystem('check-island-loading-state')
              utils.timers.setTimeout(() => {
                this.respawnTrigger()
              }, 3000)
            break
        }
      }
    }, undefined, 'check-island-loading-state')

    this.getBridgeArrow()
  }
  respawnTrigger() {
    cameraManager.lockPlayer()
    cameraManager.forceFirstPerson()
    
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
    this.gameController.uiController.keyBoardUI.pressanykey = 'Press left click to Continue...'
    this.gameController.uiController.keyBoardUI.canClick = true
  }
  async startSpawnIsland() {
    // if(Vector3.distance(Transform.get(engine.PlayerEntity).position, this.SPAWN_POINT) > 10) {
    //   cameraManager.unlockPlayer()
    //   cameraManager.forceThirdPerson()
    //   await wait_ms(100)
    //   await cameraManager.freeCamera()
    //   //return
    // }


    this.gameController.uiController.widgetTasks.showTasks(false, TaskType.Simple)

    //Start ambiental sound
    
    AudioManager.instance().playMainAmbience(true)
    AudioManager.instance().play('waterfall', { volume: 1, loop: true, position: Vector3.create(226.94, 70, 130.37) })

    // -- Camera --
    //The tutorial begins with a cinematic that shows detailed views and traveling shots of the scenario. Then, it focuses on where the avatar has appeared along with Tobor.
    /*cameraManager.cameraOrbit(
      this.gameController.spawnIsland.tobor.entity, 
      Vector3.create(0, 7, -11), 
      -10 - 40, 
      190 - 40, 
      15000,
      0
    )*/
    
    await wait_ms(500)
    Animator.stopAllAnimations(this.tobor.entity)
    Animator.getClip(this.tobor.entity, 'Talk').playing = true
    openDialogWindow(this.tobor.entity, this.gameController.dialogs.toborCinematicDialog, 0)

  }

  async introductionMiddleChangeCamera() {
    // -- Camera --
    //Camera pans to the player’s character
    /*await cameraManager.cameraOrbit(
      engine.PlayerEntity, 
      Vector3.create(0, 2.5, -5), 
      90 + 40, 
      105 + 40, 
      10000,
      1
    )*/
   
    cameraManager.freeCamera()
    cameraManager.forceThirdPerson()
  }

  async finishedIntroDialog() {
    console.log('finishedIntroDialog. start block camera')
    // -- Camera --
    //Camera turns back to Tobor
    let camPosition = Vector3.add(Transform.get(engine.PlayerEntity).position, Vector3.create(0, 2, 0))
    let cameraRotation = Quaternion.fromLookAt(camPosition, Vector3.add(Transform.get(this.tobor.entity).position, Vector3.create(0, 1.25, 0)))
    
    /*await cameraManager.blockCamera(
      camPosition, 
      cameraRotation, 
      true, 
      0
    )*/

    //await wait_ms(500)
    //cameraManager.forceThirdPerson()
    await wait_ms(100)
    cameraManager.freeCameraMode()
    await cameraManager.freeCamera()
    
    //await wait_ms(500)
    AudioManager.instance().playOnce('tobor_talk', { volume: 0.6, parent: this.tobor.entity })
    Animator.stopAllAnimations(this.tobor.entity)
    Animator.getClip(this.tobor.entity, 'Talk').playing = true
    openDialogWindow(this.tobor.entity, this.gameController.dialogs.toborMovementDialog, 0)

  }
  // ---- Movement Quest ----
  async startMovementQuest() {
    // -- Camera --
    //Camera goes back to normal
    cameraManager.unlockPlayer()
    cameraManager.forceThirdPerson()
    await wait_ms(100)
    await cameraManager.freeCamera()

    // should third person camera forced to player?
    // await wait_ms(100)
    // cameraManager.forceThirdPerson()

    Animator.stopAllAnimations(this.tobor.entity)
    Animator.getClip(this.tobor.entity, 'Robot_Idle').playing = true

    this.gameController.uiController.popUpControls.showMoveControlsUI()
    this.bubbleTalk.openBubble(MOVE_QUEST_1, true)
    //Movement task UI
    this.gameController.uiController.widgetTasks.showTasks(true, TaskType.Simple)
    this.gameController.uiController.widgetTasks.showTick(false, 0)
    this.gameController.uiController.widgetTasks.setText(0, 0)
  }
  async moveQuestCompleted() {
    if(this.isMoveQuestCompleted) return;
    this.isMoveQuestCompleted = true;

    this.gameController.uiController.widgetTasks.showTick(true, 0)
    sendTrak('z0_quest0_01', this.gameController.timeStamp)
    // -- Camera --
    //Camera transitions to Tobor
    cameraManager.lockPlayer()
    cameraManager.hideAvatar()
    
    let cameraPosition = Vector3.create(225.5, 71, 123.7)
    let cameraRotation = Quaternion.fromLookAt(cameraPosition, Vector3.add(Transform.get(this.tobor.entity).position, Vector3.create(0, 1.25, 0)))
    await cameraManager.blockCamera(
      cameraPosition, 
      cameraRotation, 
      true, 
      0.4
    )
    
    movePlayerTo({
      newRelativePosition: Vector3.create(225.5, 69.7368, 123.7),
      cameraTarget: Transform.get(this.tobor.entity).position
    })
    cameraManager.showAvatar()

    await wait_ms(500)
    this.bubbleTalk.closeBubbleInTime()
    this.gameController.uiController.popUpControls.hideAllControlsUI()
    

    AudioManager.instance().playOnce('tobor_talk', { volume: 0.6, parent: this.tobor.entity })
    Animator.stopAllAnimations(this.tobor.entity)
    Animator.getClip(this.tobor.entity, 'Talk').playing = true
    openDialogWindow(this.tobor.entity, this.gameController.dialogs.toborCameraDialog, 0)

    await wait_ms(1000)
    this.gameController.uiController.widgetTasks.showTasks(false, TaskType.Simple)
  }
  // ---- Camera Quest ----
  async startCameraQuest() {
    Animator.stopAllAnimations(this.tobor.entity)
    Animator.getClip(this.tobor.entity, 'Robot_Idle').playing = true

    let cameraPosition = Vector3.create(225.5, 71, 123.7)
    let cameraRotation = Quaternion.fromLookAt(cameraPosition, Vector3.add(Transform.get(this.tobor.entity).position, Vector3.create(0, 1.25, 0)))
    
    cameraManager.forceThirdPerson()
    await wait_ms(100)
    await cameraManager.freeCamera()

    this.bubbleTalk.openBubble(CAMERA_QUEST_0, true)
    this.gameController.uiController.popUpControls.showLookControlsUI()
    //Camera task UI
    this.gameController.uiController.widgetTasks.showTasks(true, TaskType.Simple)
    this.gameController.uiController.widgetTasks.showTick(false, 0)
    this.gameController.uiController.widgetTasks.setText(1, 0)
    //Spawn gloing orb
    this.spawnGlowingOrb()
  }

  private spawnGlowingOrb() {
    this.orb.activate()
  }

  async cameraQuestCompleted() {

    sendTrak('z0_quest0_02', this.gameController.timeStamp)
    this.gameController.uiController.widgetTasks.showTick(true, 0)

    await wait_ms(500)
    let cameraPosition = Vector3.create(225.5, 71, 123.7)
    let cameraRotation = Quaternion.fromLookAt(cameraPosition, Vector3.add(Transform.get(this.tobor.entity).position, Vector3.create(0, 1.25, 0)))
    await cameraManager.blockCamera(
      cameraPosition, 
      cameraRotation, 
      true, 
      0.4
    )
    
    this.bubbleTalk.closeBubbleInTime()
    this.gameController.uiController.popUpControls.hideAllControlsUI()

    AudioManager.instance().playOnce('tobor_talk', { volume: 0.6, parent: this.tobor.entity })
    Animator.stopAllAnimations(this.tobor.entity)
    Animator.getClip(this.tobor.entity, 'Talk').playing = true
    openDialogWindow(this.tobor.entity, this.gameController.dialogs.toborJumpDialog, 0)

    utils.timers.setTimeout(()=>{
      this.gameController.uiController.widgetTasks.showTasks(false, TaskType.Simple)
      this.orb.deactivateWithAnim()
    }, 1000)
  }

  async lookAtLog() {
    cameraManager.hideAvatar()

    let cameraPosition = Vector3.create(222.7, 71, 131.11)
    let logPosition = Vector3.create(217.4, 69.5, 131.4)
    let cameraRotation = Quaternion.fromLookAt(cameraPosition, logPosition)
    cameraManager.blockCamera(
      cameraPosition, 
      cameraRotation, 
      true, 
      1.25
    )
    
    await wait_ms(100)
    movePlayerTo({
      newRelativePosition: Vector3.create(225.5, 71, 123.7),
      cameraTarget: Vector3.add(logPosition, Vector3.create(0, 2, 0))
    })
    await wait_ms(100)
    
    cameraManager.showAvatar()
    return
  }

  //Jump quest
  async startJumpQuest() {
    // await this.lookAtLog()
    let cameraPosition = Vector3.create(225.5, 71, 123.7)
    let logPosition = Vector3.create(217.4, 69.5, 131.4)
    let cameraRotation = Quaternion.fromLookAt(cameraPosition, logPosition)
    await cameraManager.blockCamera(
      cameraPosition, 
      cameraRotation, 
      true, 
      0.4
    )

    await wait_ms(100)
    cameraManager.forceThirdPerson()
    await wait_ms(100)
    await cameraManager.freeCamera()

    Animator.stopAllAnimations(this.tobor.entity)
    Animator.getClip(this.tobor.entity, 'Robot_Idle').playing = true

    cameraManager.unlockPlayer()

    this.gameController.uiController.popUpControls.showJumpControlsUI()
    this.gameController.uiController.popUpControls.showJumpControlsUI()
    this.gameController.uiController.widgetTasks.setText(2, 0)
    this.gameController.uiController.widgetTasks.showTasks(true, TaskType.Simple)
    

    PointerEvents.createOrReplace(this.gameController.mainInstance.s0_tree_fall_art_01, {
      pointerEvents: [
        {
          eventType: PointerEventType.PET_DOWN,
          eventInfo: {
            button: InputAction.IA_POINTER,
            showFeedback: true,
            hoverText: 'Jump pressing SPACE and W'
          }
        }
      ]
    })
    
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
  /*startInteractQuest() {
    AudioManager.instance().playOnce('tobor_talk', { volume: 0.6, parent: this.tobor.entity })
    openDialogWindow(this.tobor.entity, this.gameController.dialogs.toborDialog, 0)
    Animator.stopAllAnimations(this.tobor.entity)
    Animator.getClip(this.tobor.entity, 'Talk').playing = true
    this.targeterCircle.showCircle(false)
    this.questIndicator.hide()
    this.gameController.uiController.widgetTasks.showTick(true, 0)
    this.gameController.uiController.popUpControls.hideLookControlsUI()
    this.gameController.uiController.popUpControls.hideCursorLockControlsUI()
  }*/
  startMoveForwardJumpQuest() {
    
    
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
    let tweenSystemActive = true
    
    // Add timeout fallback for tween sequence
    utils.timers.setTimeout(() => {
      if (tween < 5 && tweenSystemActive) {
        console.log('Tween sequence incomplete after 10 seconds, forcing completion')
        tweenSystemActive = false
        
        // Force robot to final position and setup interaction
        this.tobor.activateBillBoard(true)
        this.targeterCircle.showCircle(true)
        this.setupDialogAtPilarTargeter()
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
            this.toborTalkAfterJumpQuest()
          }
        )
        console.log('tobor on pilar - forced by timeout')
      }
    }, 30000)
    
    engine.addSystem(() => {
      if (!tweenSystemActive) return
      
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
          tweenSystemActive = false
          this.tobor.activateBillBoard(true)
          this.targeterCircle.showCircle(true)
          this.setupDialogAtPilarTargeter()
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
              this.toborTalkAfterJumpQuest()
            }
          )
          console.log('tobor on  pilar')
        }
      }
    })
  }
  jumpquest() {
    //this.gameController.uiController.popUpControls.spaceContainerVisible = true
    
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
    sendTrak('z0_quest0_03', this.gameController.timeStamp)
    this.gameController.uiController.popUpControls.hideMoveControlsUI()
    this.gameController.uiController.popUpControls.hideJumpControlsUI()
    this.gameController.uiController.popUpControls.spaceContainerVisible = false
    this.gameController.uiController.widgetTasks.showTick(true, 0)
    PointerEvents.deleteFrom(this.gameController.mainInstance.s0_tree_fall_art_01)
    utils.timers.setTimeout(() => {
      this.gameController.uiController.widgetTasks.setText(3, 0)
      this.gameController.uiController.widgetTasks.showTasks(true, TaskType.Simple)
      this.setupDialogAtPilarTargeter()
    }, 1500)
  }
  setupDialogAtPilarTargeter() {
    this.questIndicator.updateStatus(IndicatorState.ARROW)
    this.questIndicator.showWithAnim()
  }
  private async toborTalkAfterJumpQuest() {
    cameraManager.lockPlayer()

    let talkPlayerPoint = Vector3.add(Transform.get(engine.PlayerEntity).position, Vector3.create(0, 1.75, 0))
    const cameraTarget = Vector3.add(getWorldPosition(this.tobor.entity), Vector3.create(0, 1.25, 0))
    // const cameraPoint = Vector3.create(203.90, 65.88, 128.46)
    
    // evaluate talkPlayerPoint, reposition if it is too close to NPC
    const minRadius = 2.25
    let distanceSqToTarget = Vector3.distanceSquared(talkPlayerPoint, cameraTarget)
    if(distanceSqToTarget < minRadius * minRadius){
        const direction = Vector3.normalize(
            Vector3.create(
                talkPlayerPoint.x - cameraTarget.x,
                0,
                talkPlayerPoint.z - cameraTarget.z
            )
        )
        
        talkPlayerPoint = Vector3.create(
            cameraTarget.x + direction.x * minRadius,
            talkPlayerPoint.y,
            cameraTarget.z + direction.z * minRadius
        )
    }
    
    console.log('tobor talk after jump quest')
    await cameraManager.blockCamera(
      talkPlayerPoint, 
      // Quaternion.fromLookAt(cameraPoint, getWorldPosition(this.gameController.questEmote.bezier.entity)), 
      Quaternion.fromLookAt(talkPlayerPoint, cameraTarget), 
      true, 
      0.5
    )
    cameraManager.hideAvatar()
    await wait_ms(100)
    movePlayerTo({newRelativePosition: talkPlayerPoint, cameraTarget: cameraTarget})

    this.gameController.uiController.widgetTasks.showTick(true, 0)
    AudioManager.instance().playOnce('tobor_talk', {
      volume: 0.6,
      parent: this.tobor.entity
    })
    this.targeterCircle.showCircle(false)
    this.questIndicator.hide()
    sendTrak('z0_quest0_04', this.gameController.timeStamp)
    openDialogWindow(this.gameController.spawnIsland.tobor.entity, this.gameController.dialogs.toborDialog, 3)
    
  }
  async lookTowardBridge(){
    this.gameController.uiController.widgetTasks.showTasks(false, TaskType.Simple)
    // const cameraPoint = Vector3.create(203.90, 65.88, 128.46)
    const cameraPoint = Vector3.add(Transform.get(engine.PlayerEntity).position, Vector3.create(0, 1.75, 0))
    
    console.log('tobor talk after jump quest')
    await cameraManager.blockCamera(
      cameraPoint, 
      Quaternion.fromLookAt(cameraPoint, getWorldPosition(this.gameController.questEmote.bezier.entity)), 
      true, 
      0.5
    )
  }
  async onFinishCompleteQuestDialog() {
    this.targeterCircle.showCircle(false)
    this.questIndicator.hide()
    PointerEvents.deleteFrom(this.gameController.mainInstance.s0_Z3_Str_Bridge_Art_01)
    
    const moveToPosition = Vector3.create(203.60,64.89,129.5)
    const afterCameraTarget = getWorldPosition(this.gameController.questEmote.bezier.entity)
    const cameraPoint = Vector3.create(198.4, 65.5, 126.6)

    // setup skip input handling
    cameraManager.requestSkip(
        Vector3.add(moveToPosition, Vector3.create(0, 1.75, 0)), 
        Quaternion.fromLookAt(Vector3.add(moveToPosition, Vector3.create(0, 1.75, 0)), getWorldPosition(this.gameController.questEmote.bezier.entity)),
    )

    await cameraManager.blockCamera(
      cameraPoint, 
      Quaternion.fromLookAt(cameraPoint, afterCameraTarget), 
      true, 
      1.25
    )
    
    // this.gameController.questEmote.npcSayHi()
    this.activateBridge()
    this.activatePilar()
    Animator.stopAllAnimations(this.tobor.entity)
    Animator.getClip(this.tobor.entity, 'Robot_Idle').playing = true
    this.gameController.spawnIsland.bubbleTalk.openBubble(HELP_BEIZER, false)
    this.gameController.questEmote.questIndicator.updateStatus(IndicatorState.ARROW)
    this.gameController.questEmote.questIndicator.showWithAnim()

    // move player back to start position (near tobor)
    movePlayerTo({
      newRelativePosition: moveToPosition,
      cameraTarget: afterCameraTarget
    })

    executeTask(async () => {
        await wait_ms(3000)
        if(cameraManager.isSkipDetected()) return
        if(!cameraManager.isSkipRequested()) return

        Animator.stopAllAnimations(this.gameController.questEmote.bezier.entity)
        Animator.playSingleAnimation(this.gameController.questEmote.bezier.entity, 'Hi')
    })

    // camera move to end position
    const cameraPoint2 = Vector3.create(173.4,71,110.5)
    const cameraRotation2 = Quaternion.fromLookAt(cameraPoint2, afterCameraTarget)
    await cameraManager.blockCamera(
        cameraPoint2, 
        cameraRotation2, 
        true, 
        6.5
    )

    // // camera orbit to bezier
    // await cameraManager.cameraOrbit(
    //     this.gameController.questEmote.bezier.entity,
    //     Vector3.subtract(cameraPoint2, getWorldPosition(this.gameController.questEmote.bezier.entity)),
    //     0,
    //     -20,
    //     3000,
    //     0
    // )

    await wait_ms(200)
    await cameraManager.blockCamera(
      Vector3.add(moveToPosition, Vector3.create(0, 1.75, 0)),
      Quaternion.fromLookAt(Vector3.add(moveToPosition, Vector3.create(0, 1.75, 0)), getWorldPosition(this.gameController.questEmote.bezier.entity)), 
      true, 
      0
    )

    cameraManager.resetSkipRequested()

    await wait_ms(350)
    cameraManager.showAvatar()
    cameraManager.forceThirdPerson()
    await wait_ms(100)
    await cameraManager.freeCamera()
    cameraManager.unlockPlayer()

    Animator.stopAllAnimations(this.gameController.questEmote.bezier.entity)
    Animator.playSingleAnimation(this.gameController.questEmote.bezier.entity, 'Idle')

    this.gameController.uiController.widgetTasks.setText(4, 0)
    this.gameController.uiController.widgetTasks.showTick(false, 0)
    this.gameController.uiController.widgetTasks.showTasks(true, TaskType.Simple)
  }
  onCloseRewardUI() {
    //this.onFinishCompleteQuestDialog()
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
    this.activateBridgeArrow()
    //PointerEvents.deleteFrom(this.gameController.mainInstance.s0_Z3_Str_Bridge_Art_01)
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
  activateBridgeArrow() {
    this.arrows.forEach(arrow => {
      VisibilityComponent.getMutable(arrow).visible = true
    })
  }
  private getBridgeArrow() {
    let zOffset = 1.85
    let scale = 0.3
    const xOffsets = [-2.3, -0.6, 0.7, 2.3, -2.3, -0.6, 0.7, 2.3]
    const texture = Material.Texture.Common({
      src: 'assets/textures/arrow2.png'
    })
    for (let i = 0; i < 9; i++) {
      const arrow = engine.addEntity()
      MeshRenderer.setPlane(arrow)
      Transform.create(arrow, { parent: this.gameController.mainInstance.s0_Z3_Str_Bridge_Art_01 })
      Material.setPbrMaterial(arrow, {
        texture: texture,
        albedoColor: Color4.Yellow(),
        emissiveColor: Color4.Yellow(),
        emissiveIntensity: 5,
        emissiveTexture: texture,
        alphaTexture: texture,
        transparencyMode: MaterialTransparencyMode.MTM_ALPHA_TEST
      })
      VisibilityComponent.create(arrow, { visible: false })
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
