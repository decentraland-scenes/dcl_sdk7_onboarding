import {
  Animator,
  AvatarEmoteCommand,
  Entity,
  GltfContainer,
  InputAction,
  Material,
  MaterialTransparencyMode,
  MeshRenderer,
  PointerEventType,
  PointerEvents,
  Transform,
  engine,
  executeTask,
  pointerEventsSystem
} from '@dcl/sdk/ecs'
import { GameController } from '../controllers/gameController'
import { closeDialogWindow, openDialogWindow } from 'dcl-npc-toolkit'
import { AudioManager } from '../imports/components/audio/audio.manager'
import { IndicatorState, QuestIndicator } from '../imports/components/questIndicator'
import { FloorCircleTargeter } from '../imports/components/targeter'
import { ZONE_1_EMOTE_1, ZONE_1_EMOTE_2, ZONE_1_EMOTE_3, ZONE_1_EMOTE_4 } from '../jsonData/textsTutorialBubble'
import { Color4, Quaternion, Vector3 } from '@dcl/sdk/math'
import * as utils from '@dcl-sdk/utils'
import { sideBubbleTalk } from '../imports/bubble'
import { POPUP_STATE } from '../uis/popupUI'
import { activateSoundPillar2 } from '../imports/components/audio/sounds'
import { TaskType } from '../uis/widgetTask'
import { ClaimEmoteTokenRequest } from '../claim/claimEmote'
import { configEmote } from '../claim/config'
import { sendTrak } from '../utils/segment'
import { NPC } from '../imports/components/npc.class'
import { lockPlayer, unlockPlayer } from '../utils/blockPlayer'
import { movePlayerTo } from '~system/RestrictedActions'
import { blockCamera, freeCamera } from '../utils/camera'
import { cameraManager, getWorldPosition, wait_ms } from '../cinematic/cameraManager'

export class QuestEmote {
  gameController: GameController
  bezier: NPC
  targeterCircle: FloorCircleTargeter
  questIndicator: QuestIndicator
  bubbleTalk: sideBubbleTalk
  emoteMoves: number = 0
  currentEmote: string
  lastState: boolean = false
  tick1: Entity
  tick2: Entity
  tick3: Entity
  walletConected: boolean = false
  hasReward: boolean = false
  firstTimeClosingRewardUI: boolean = true
  arrows: Entity[]
  claim: ClaimEmoteTokenRequest

  // private readonly talkCameraPoint = Vector3.create(162.54,67.33,104.62)
  private readonly talkCameraPoint = Vector3.create(163.2,67.33,105.9)
  private readonly bridgeCameraPoint = Vector3.create(167.06,67.33,115.58)
  private readonly talkPlayerPoint = Vector3.create(163.79,65.97,106.08)

  constructor(gameController: GameController) {
    this.gameController = gameController
    this.claim = new ClaimEmoteTokenRequest(
      this.gameController,
      configEmote,
      configEmote.campaign_key,
      configEmote.claimServer
    )
    this.tick1 = engine.addEntity()
    this.tick2 = engine.addEntity()
    this.tick3 = engine.addEntity()
    this.bezier = new NPC(
      Vector3.create(0, -1.12, 0),
      Vector3.create(1.76666, 0.915751, 1.756506),
      Quaternion.create(0, 1, 0, -4.371139e-8),
      'assets/scene/models/unity_assets/s0_NPC_FoxAnim_Art_01.glb',
      14,
      () => {
        Animator.getClip(this.bezier.entity, 'Idle').playing = true
      },
      () => {
        pointerEventsSystem.removeOnPointerDown(this.bezier.npcChild)
        this.startInteract()
      }
    )

    Transform.getMutable(this.bezier.entity).parent = this.gameController.mainInstance.s0_En_Npc1_01
    Animator.createOrReplace(this.bezier.entity, {
      states: [
        {
          clip: 'Idle',
          playing: false
        },
        {
          clip: 'Talk',
          playing: false
        },
        {
          clip: 'Hi',
          playing: false
        },
        {
          clip: 'Celebrate',
          playing: false
        },
        {
          clip: 'Bye',
          playing: false
        },
        {
          clip: 'Dance',
          playing: false
        }
      ]
    })
    this.currentEmote = ''
    this.arrows = []
    this.bezier.activateBillBoard(true)
    this.bezier.setChildScaleYAxis(3.8)
    this.bubbleTalk = new sideBubbleTalk(this.bezier.bubbleAttach)
    this.bubbleTalk.closeBubbleInTime()
    this.targeterCircle = new FloorCircleTargeter(
      Vector3.create(0, 0.1, 0),
      Vector3.create(0, 0, 0),
      Quaternion.create(0, 0, 0),
      this.bezier.entity
    )
    this.questIndicator = new QuestIndicator(this.bezier.entity)
    Transform.getMutable(this.questIndicator.icon).position = Vector3.create(0, 2.5, 0)
    this.questIndicator.hide()
    this.targeterCircle.showCircle(true)
    this.targeterCircle.setCircleScale(0.4)
    this.loadTagData()
    this.setUpTriggerHi()
  }
  loadTagData() {
    PointerEvents.createOrReplace(this.gameController.mainInstance.s0_Z3_Str_Bridge_Art_1__01, {
      pointerEvents: [
        {
          eventType: PointerEventType.PET_DOWN,
          eventInfo: {
            button: InputAction.IA_POINTER,
            showFeedback: true,
            hoverText: 'Talk to Bezier'
          }
        }
      ]
    })
    this.activeCables(false)
  }
  activeCables(bActive: boolean) {
    if (bActive === true) {
      GltfContainer.getMutable(this.gameController.mainInstance.s0_Cable_02_ON_01).src =
        'assets/scene/models/unity_assets/s0_Cable_02_ON_01.glb'
      GltfContainer.getMutable(this.gameController.mainInstance.s0_Cable_02_OFF_01).src = ''
    } else if (bActive === false) {
      GltfContainer.getMutable(this.gameController.mainInstance.s0_Cable_02_ON_01).src = ''
      GltfContainer.getMutable(this.gameController.mainInstance.s0_Cable_02_OFF_01).src =
        'assets/scene/models/unity_assets/s0_Cable_02_OFF_01.glb'
    }
  }
  setUpTriggerHi() {
    let triggerHi = engine.addEntity()
    Transform.create(triggerHi, {
      position: Transform.get(this.gameController.mainInstance.s0_En_Npc1_01).position
    })
    utils.triggers.addTrigger(
      triggerHi,
      1,
      1,
      [{ type: 'box', scale: Vector3.create(15, 5, 15) }],
      () => {
        this.npcSayHi()
        engine.removeEntity(triggerHi)
      },
      () => {
        Animator.playSingleAnimation(this.bezier.entity, 'Idle')
      }
    )
  }
  npcSayHi(){
    AudioManager.instance().playOnce('npc_1_salute', { volume: 1, parent: this.bezier.entity })
    Animator.stopAllAnimations(this.bezier.entity)
    Animator.playSingleAnimation(this.bezier.entity, 'Hi')
    utils.timers.setTimeout(() => {
      Animator.stopAllAnimations(this.bezier.entity)
      Animator.playSingleAnimation(this.bezier.entity, 'Idle')
    }, 5000)
  }

  async startInteract() {
    cameraManager.lockPlayer()
    await cameraManager.blockCamera(
      this.talkCameraPoint,
      Quaternion.fromLookAt(this.talkCameraPoint, Vector3.add(getWorldPosition(this.bezier.entity), Vector3.create(0, 1.75, 0))),
      true,
      0.5
    )
    movePlayerTo({
      newRelativePosition: this.talkPlayerPoint,
      cameraTarget: Vector3.create(Transform.get(this.bezier.entity).position.x, this.talkCameraPoint.y, Transform.get(this.bezier.entity).position.z)
    })
    sendTrak('z1_quest1_00', this.gameController.timeStamp)
    this.gameController.uiController.widgetTasks.showTick(true, 0)
    
    AudioManager.instance().playOnce('npc_1_salute', { volume: 0.6, parent: this.bezier.entity })
    openDialogWindow(this.bezier.entity, this.gameController.dialogs.bezierDialog, 0)
    Animator.stopAllAnimations(this.bezier.entity)
    Animator.getClip(this.bezier.entity, 'Talk').playing = true
    this.targeterCircle.showCircle(false)
    this.questIndicator.hide()


    await wait_ms(2000)
    this.gameController.uiController.widgetTasks.showTasks(false, TaskType.Simple)
    
  }
  async startEmoteQuest() {
    //this.gameController.uiController.popUpControls.emoteContainerVisible = true
    await wait_ms(100)
    cameraManager.forceThirdPerson()
    await wait_ms(100)
    cameraManager.freeCamera()
    await wait_ms(100)
    cameraManager.unlockPlayer()

    this.gameController.uiController.popUpControls.showEmoteLockControlsUI()
    this.gameController.uiController.widgetTasks.setText(5, 0)
    this.gameController.uiController.widgetTasks.showTick(false, 0)
    this.gameController.uiController.widgetTasks.showTasks(true, TaskType.Simple)
    this.emoteQuest()
  }
  emoteQuest() {
    console.log('emoteQuest')
    AvatarEmoteCommand.onChange(engine.PlayerEntity, (emote) => {
      if (!emote) return
      if (this.currentEmote === emote.emoteUrn) return

      cameraManager.lockPlayer()

      this.currentEmote = emote?.emoteUrn
      console.log('Emote played: ', emote.emoteUrn, emote.timestamp)
      this.emoteMoves++
      this.gameController.uiController.widgetTasks.setStepCount(this.emoteMoves)
      this.checkEmoteMoves()
    })
  }
  async checkEmoteMoves() {
    if (this.emoteMoves === 1) {
      await wait_ms(500)
      AudioManager.instance().playOnce('pop_up_close', { volume: 1, parent: engine.CameraEntity })
      
      let orbitPivotEntity = engine.addEntity()
      Transform.create(orbitPivotEntity, {
        parent: engine.PlayerEntity,
        position: Vector3.create(0, 1.25, 0)
      })
      /*await cameraManager.cameraOrbit(
        orbitPivotEntity, 
        Vector3.create(0, 0.5, -3.5), 
        30, 
        40, 
        5000
      )
      await cameraManager.blockCamera(
        this.talkCameraPoint,
        Quaternion.fromLookAt(this.talkCameraPoint, Vector3.add(getWorldPosition(this.bezier.entity), Vector3.create(0, 1.75, 0))),
        true,
        0
      )
      movePlayerTo({
        newRelativePosition: this.talkPlayerPoint,
        cameraTarget: Vector3.create(Transform.get(this.bezier.entity).position.x, this.talkCameraPoint.y, Transform.get(this.bezier.entity).position.z)
      })*/
      
      sendTrak('z1_quest1_01', this.gameController.timeStamp)
      this.bubbleTalk.openBubble(ZONE_1_EMOTE_1, true)
      this.addTicks(1)
      this.spawnParticles()

      await wait_ms(500)
      cameraManager.forceThirdPerson()
      await wait_ms(100)
      cameraManager.freeCamera()
      cameraManager.unlockPlayer()

    } else if (this.emoteMoves === 2) {
      await wait_ms(500)
      AudioManager.instance().playOnce('pop_up_close', { volume: 1, parent: engine.CameraEntity })

      let orbitPivotEntity = engine.addEntity()
      Transform.create(orbitPivotEntity, {
        parent: engine.PlayerEntity,
        position: Vector3.create(0, 1.25, 0)
      })
      /*await cameraManager.cameraOrbit(
        orbitPivotEntity, 
        Vector3.create(0, 0.5, -3.5), 
        50, 
        60, 
        5000
      )
      
      await cameraManager.blockCamera(
        this.talkCameraPoint,
        Quaternion.fromLookAt(this.talkCameraPoint, Vector3.add(getWorldPosition(this.bezier.entity), Vector3.create(0, 1.75, 0))),
        true,
        0
      )
      movePlayerTo({
        newRelativePosition: this.talkPlayerPoint,
        cameraTarget: Vector3.create(Transform.get(this.bezier.entity).position.x, this.talkCameraPoint.y, Transform.get(this.bezier.entity).position.z)
      })*/
      
      sendTrak('z1_quest1_02', this.gameController.timeStamp)
      this.bubbleTalk.closeBubbleInTime()
      this.addTicks(2)
      this.spawnParticles()
      this.bubbleTalk.openBubble(ZONE_1_EMOTE_2, true)

      await wait_ms(500)
      cameraManager.forceThirdPerson()
      await wait_ms(100)
      cameraManager.freeCamera()
      cameraManager.unlockPlayer()

    } else if (this.emoteMoves === 3) {
      await wait_ms(500)
      AudioManager.instance().playOnce('pop_up_close', { volume: 1, parent: engine.CameraEntity })
      
      let orbitPivotEntity = engine.addEntity()
      Transform.create(orbitPivotEntity, {
        parent: engine.PlayerEntity,
        position: Vector3.create(0, 1.25, 0)
      })
      /*await cameraManager.cameraOrbit(
        orbitPivotEntity, 
        Vector3.create(0, 0.5, -3.5), 
        70, 
        80, 
        5000
      )
      
      await cameraManager.blockCamera(
        this.talkCameraPoint,
        Quaternion.fromLookAt(this.talkCameraPoint, Vector3.add(getWorldPosition(this.bezier.entity), Vector3.create(0, 1.75, 0))),
        true,
        0
      )
      movePlayerTo({
        newRelativePosition: this.talkPlayerPoint,
        cameraTarget: Vector3.create(Transform.get(this.bezier.entity).position.x, this.talkCameraPoint.y, Transform.get(this.bezier.entity).position.z)
      })   */   
      
      sendTrak('z1_quest1_03', this.gameController.timeStamp)
      this.bubbleTalk.closeBubbleInTime()
      this.addTicks(3)
      this.spawnParticles()
      this.bubbleTalk.openBubble(ZONE_1_EMOTE_3, true)

      await wait_ms(1000)
      this.completeQuestDialog()
    }
  }
  addTicks(number: number) {
    if (number === 1) {
      GltfContainer.create(this.tick1, { src: 'assets/scene/models/unity_assets/s0_tick_1_01.glb' })
      Transform.create(this.tick1, {
        position: Vector3.create(157.366, 66.76084, 104.8572),
        rotation: Quaternion.create(5.825006e-17, -0.0475723, 5.825006e-17, -0.9988678),
        scale: Vector3.create(2.017242, 0.1470411, 0.06610861),
        parent: this.gameController.mainInstance.s0_Z3_Str_Dancing_Station_Art_01
      })
    } else if (number === 2) {
      GltfContainer.create(this.tick2, { src: 'assets/scene/models/unity_assets/s0_tick_2_01.glb' })
      Transform.create(this.tick2, {
        position: Vector3.create(157.5212, 66.75648, 105.5075),
        rotation: Quaternion.create(4.757887e-17, -0.2023015, 4.757888e-17, -0.9793233),
        scale: Vector3.create(2.017242, 0.1470411, 0.06610861),
        parent: this.gameController.mainInstance.s0_Z3_Str_Dancing_Station_Art_01
      })
    } else if (number === 3) {
      GltfContainer.create(this.tick3, { src: 'assets/scene/models/unity_assets/s0_tick_3_01.glb' })
      Transform.create(this.tick3, {
        position: Vector3.create(157.8082, 66.75357, 106.1788),
        rotation: Quaternion.create(4.433242e-17, -0.2454148, 4.433243e-17, -0.9694182),
        scale: Vector3.create(2.017242, 0.1470411, 0.06610861),
        parent: this.gameController.mainInstance.s0_Z3_Str_Dancing_Station_Art_01
      })
    }
  }
  async completeQuestDialog() {
    console.log('completeQuestDialog.')
    // //Block player & setup camera
    // cameraManager.lockPlayer()
    // await cameraManager.blockCamera(
    //   this.talkCameraPoint,
    //   Quaternion.fromLookAt(this.talkCameraPoint, Vector3.add(getWorldPosition(this.bezier.entity), Vector3.create(0, 1.75, 0))),
    //   true,
    //   0.5
    // )
    
    // await wait_ms(500)
    // movePlayerTo({
    //   newRelativePosition: this.talkPlayerPoint,
    //   cameraTarget: Vector3.add(Transform.get(this.gameController.mainInstance.s0_En_Npc2_01).position, Vector3.create(0,1,0))
    // })
    openDialogWindow(this.bezier.entity, this.gameController.dialogs.bezierDialog, 4)
    this.gameController.uiController.widgetTasks.showTick(true, 0)
    //this.gameController.uiController.widgetTasks.showTick(true, 1)

    this.bubbleTalk.closeBubbleInTime()
    Animator.stopAllAnimations(this.bezier.entity)
    Animator.getClip(this.bezier.entity, 'Celebrate').playing = true
    //this.gameController.uiController.popUpControls.emoteContainerVisible = false
    this.gameController.uiController.popUpControls.hideEmoteLockControlsUI()

    await wait_ms(3000)
    Animator.stopAllAnimations(this.bezier.entity)
    Animator.getClip(this.bezier.entity, 'Talk').playing = true
  }
  spawnParticles() {
    const particle = engine.addEntity()
    GltfContainer.create(particle, { src: 'assets/scene/models/glb_assets/CheckParticles_Art.glb' })
    const positionY = Transform.getMutable(this.bezier.entity).position.y + 2.5
    Transform.create(particle, {
      position: Vector3.create(
        Transform.getMutable(this.bezier.entity).position.x,
        positionY,
        Transform.getMutable(this.bezier.entity).position.z
      ),
      scale: Vector3.create(2.5, 2.5, 2.5)
    })
    utils.timers.setTimeout(() => {
      engine.removeEntity(particle)
    }, 1000)
  }

  setWalletConnection() {
    this.walletConected = this.claim.setUserData()
    console.log('wallet connected' + this.walletConected)
    if (this.walletConected === false) {
      this.gameController.uiController.popUpUI.show(POPUP_STATE.TwoButtons)
    } else {
      //this.gameController.uiController.popUpUI.show(POPUP_STATE.OneButton)
      this.giveReward()
    }
  }
  activateBridge() {
    this.getBridgeArrow()
    //PointerEvents.deleteFrom(this.gameController.mainInstance.s0_Z3_Str_Bridge_Art_1__01)
    AudioManager.instance().playBridge(this.gameController.mainInstance.s0_Z3_Str_Bridge_Art_1__01)
    Animator.getClip(this.gameController.mainInstance.s0_Z3_Str_Bridge_Art_1__01, 'Bridge On').speed = 1
    Animator.getClip(this.gameController.mainInstance.s0_Z3_Str_Bridge_Art_1__01, 'Bridge On').shouldReset = false
    Animator.getClip(this.gameController.mainInstance.s0_Z3_Str_Bridge_Art_1__01, 'Bridge On').loop = false
    Animator.getClip(this.gameController.mainInstance.s0_Z3_Str_Bridge_Art_1__01, 'Bridge On').weight = 0.3
    Animator.playSingleAnimation(this.gameController.mainInstance.s0_Z3_Str_Bridge_Art_1__01, 'Bridge On')
    Animator.getClip(this.gameController.mainInstance.s0_Z3_Str_Bridge_Art_1__01, 'Bridge Animation').speed = 3
    Animator.getClip(this.gameController.mainInstance.s0_Z3_Str_Bridge_Art_1__01, 'Bridge Animation').shouldReset =
      false
    Animator.getClip(this.gameController.mainInstance.s0_Z3_Str_Bridge_Art_1__01, 'Bridge Animation').loop = false
    Animator.playSingleAnimation(this.gameController.mainInstance.s0_Z3_Str_Bridge_Art_1__01, 'Bridge Animation')
    Animator.getClip(this.gameController.mainInstance.s0_Z3_Str_Bridge_Art_1__01, 'Bridge Animation').weight = 1
  }
  activatePilar() {
    AudioManager.instance().playTowerCharge(this.gameController.mainInstance.s0_Z3_Quest_Pillar_Art_3__01)
    Animator.getClip(this.gameController.mainInstance.s0_Z3_Quest_Pillar_Art_3__01, 'Pillar_Anim').speed = 3
    Animator.getClip(this.gameController.mainInstance.s0_Z3_Quest_Pillar_Art_3__01, 'Pillar_Anim').shouldReset = false
    Animator.getClip(this.gameController.mainInstance.s0_Z3_Quest_Pillar_Art_3__01, 'Pillar_Anim').loop = false
    Animator.playSingleAnimation(this.gameController.mainInstance.s0_Z3_Quest_Pillar_Art_3__01, 'Pillar_Anim')
    utils.timers.setTimeout(() => {
      AudioManager.instance().playTowerActivated(this.gameController.mainInstance.s0_Z3_Quest_Pillar_Art_3__01)
      activateSoundPillar2(this.gameController.mainInstance.s0_Z3_Quest_Pillar_Art_3__01)
      this.activeCables(true)
    }, 3000)
  }
  onCloseRewardUI_deprecated() {
    if (this.firstTimeClosingRewardUI) {
      openDialogWindow(this.bezier.entity, this.gameController.dialogs.bezierDialog, 6)
      this.firstTimeClosingRewardUI = false
    }
    else this.dialogQuestFinished()
  }
  async cameraAndBridgeAnim() {
    console.log('cameraAndBridgeAnim')
    PointerEvents.deleteFrom(this.gameController.mainInstance.s0_Z3_Str_Bridge_Art_1__01)
    cameraManager.lockPlayer()

    this.gameController.uiController.widgetTasks.showTasks(false, TaskType.Simple)
    
    cameraManager.requestSkip(
      this.talkCameraPoint,
      Quaternion.fromLookAt(this.talkCameraPoint, Vector3.add(getWorldPosition(this.bezier.entity), Vector3.create(0, 1.75, 0))),
      
    )

    // const cameraPoint = this.bridgeCameraPoint
    const cameraPoint = Vector3.create(170.2, 66.5, 114.4)
    const afterCameraTarget = getWorldPosition(this.gameController.questMaterial.mat.entity)

    await cameraManager.blockCamera(
      cameraPoint,
      Quaternion.fromLookAt(cameraPoint, afterCameraTarget),
      true,
      1.75
    )

    cameraManager.hideAvatar()

    this.activatePilar()
    //Bridge Turn ON
    this.activateBridge()
    this.gameController.questMaterial.questIndicator.updateStatus(IndicatorState.ARROW)
    this.gameController.questMaterial.questIndicator.showWithAnim()

    executeTask(async () => {
        await wait_ms(3500)
        if(cameraManager.isSkipDetected()) return
        if(!cameraManager.isSkipRequested()) return

        Animator.stopAllAnimations(this.gameController.questMaterial.mat.entity)
        Animator.playSingleAnimation(this.gameController.questMaterial.mat.entity, 'Hi')
    })

    const cameraPoint2 = Vector3.create(167.1,73,147.6)
    await cameraManager.blockCamera(
        cameraPoint2, 
        Quaternion.fromLookAt(cameraPoint2, afterCameraTarget),
        true, 
        6
    )

    // await cameraManager.cameraOrbit(
    //     this.gameController.questMaterial.mat.entity,
    //     Vector3.subtract(cameraPoint2, getWorldPosition(this.gameController.questMaterial.mat.entity)),
    //     0,
    //     20,
    //     3000,
    //     0
    // )

    movePlayerTo({
      newRelativePosition: this.talkPlayerPoint,
      cameraTarget: Vector3.create(Transform.get(this.bezier.entity).position.x, this.talkCameraPoint.y, Transform.get(this.bezier.entity).position.z)
    })

    await wait_ms(200)
    await cameraManager.blockCamera(
      this.talkCameraPoint,
      Quaternion.fromLookAt(this.talkCameraPoint, Vector3.add(getWorldPosition(this.bezier.entity), Vector3.create(0, 1.75, 0))),
      true,
      0
    )

    cameraManager.resetSkipRequested()

    await wait_ms(350)
    cameraManager.showAvatar()
    cameraManager.forceThirdPerson()
    await wait_ms(100)
    await cameraManager.freeCamera()
    
    Animator.stopAllAnimations(this.gameController.questMaterial.mat.entity)
    Animator.playSingleAnimation(this.gameController.questMaterial.mat.entity, 'Idle')
    
    openDialogWindow(this.bezier.entity, this.gameController.dialogs.bezierDialog, 8)

    // cameraManager.unlockPlayer()
  }
  // uncomment this for now, directly call dialogQuestFinished()
  // finishAfterRewardDialog() {
  //   freeCamera()
  //   unlockPlayer()
  //   this.dialogQuestFinished()
  // }
  getBridgeArrow() {
    let zOffset = 1.85
    let scale = 0.3
    const xOffsets = [-2.3, -0.6, 0.7, 2.3, -2.3, -0.6, 0.7, 2.3]
    const texture = Material.Texture.Common({
      src: 'assets/textures/arrow2.png'
    })
    for (let i = 0; i < 9; i++) {
      const arrow = engine.addEntity()
      MeshRenderer.setPlane(arrow)
      Transform.create(arrow, { parent: this.gameController.mainInstance.s0_Z3_Str_Bridge_Art_1__01 })
      Material.setPbrMaterial(arrow, {
        texture: texture,
        albedoColor: Color4.Yellow(),
        emissiveColor: Color4.Yellow(),
        emissiveIntensity: 5,
        emissiveTexture: texture,
        alphaTexture: texture,
        transparencyMode: MaterialTransparencyMode.MTM_ALPHA_TEST
      })
      if (i == 4) zOffset = -1.85

      if (i == 8) {
        Transform.getMutable(arrow).position = Vector3.create(7, 1.6, 0)
        Transform.getMutable(arrow).scale = Vector3.create(1, 1, 1)
        Transform.getMutable(arrow).rotation = Quaternion.create(0.5, -0.5, 0.5, 0.5)
      } else {
        Transform.getMutable(arrow).position = Vector3.create(xOffsets[i], 1.4, zOffset)
        ;(Transform.getMutable(arrow).scale = Vector3.create(scale, scale, scale)),
          (Transform.getMutable(arrow).rotation = Quaternion.create(0.5, -0.5, 0.5, 0.5))
      }
      this.arrows.push(arrow)
    }
  }
  giveReward() {
    this.claim.claimToken()
    //this.onCloseRewardUI()
  }
  setRewardTrue() {
    this.hasReward = true
    // uncomment this for now, because we go to this.onCloseRewardUI after onTheWayUI reward is closed
    // this.dialogQuestFinished()
  }
  async dialogQuestFinished() {
    this.bubbleTalk.openBubble(ZONE_1_EMOTE_4, true)
    cameraManager.unlockPlayer()
    this.gameController.uiController.widgetTasks.showTick(false, 0)
    this.gameController.uiController.widgetTasks.setText(6, 0)
    this.gameController.uiController.widgetTasks.showTasks(true, TaskType.Simple)

    pointerEventsSystem.onPointerDown(
      {
        entity: this.bezier.npcChild,
        opts: {
          button: InputAction.IA_POINTER,
          hoverText: 'Talk'
        }
      },
      () => {
        this.bubbleTalk.closeBubbleInTime()
        if (!this.hasReward) {
          this.remindPlayerOfReward()
        } else {
          this.tellPlayerToFindMat()
        }
      }
    )
  }
  remindPlayerOfReward() {
    pointerEventsSystem.removeOnPointerDown(this.bezier.npcChild)
    console.log('remind player of reward')
    openDialogWindow(this.bezier.entity, this.gameController.dialogs.bezierDialog, 11)
    this.bubbleTalk.closeBubbleInTime()
    Animator.stopAllAnimations(this.bezier.entity)
    Animator.playSingleAnimation(this.bezier.entity, 'Talk')
    utils.timers.setTimeout(() => {
      Animator.stopAllAnimations(this.bezier.entity)
      Animator.playSingleAnimation(this.bezier.entity, 'Idle')
    }, 2000)
  }
  tellPlayerToFindMat() {
    console.log('tell player to find mat')
    if (this.walletConected === true) {
      openDialogWindow(this.bezier.entity, this.gameController.dialogs.bezierDialog, 9)
    }
    PointerEvents.deleteFrom(this.bezier.npcChild)
    this.bubbleTalk.openBubble(ZONE_1_EMOTE_4, true)
    utils.timers.setTimeout(() => {
      Animator.stopAllAnimations(this.bezier.entity)
      Animator.playSingleAnimation(this.bezier.entity, 'Idle')
    }, 2000)
  }
}
