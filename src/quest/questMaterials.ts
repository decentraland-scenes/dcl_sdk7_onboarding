import { Color4, Quaternion, Vector3 } from '@dcl/sdk/math'
import { ClaimEmoteTokenRequest } from '../claim/claimEmote'
import { configVest } from '../claim/config'
import { GameController } from '../controllers/gameController'
import {
  Animator,
  Entity,
  GltfContainer,
  InputAction,
  Material,
  MeshCollider,
  MeshRenderer,
  PointerEvents,
  Transform,
  engine,
  executeTask,
  pointerEventsSystem
} from '@dcl/sdk/ecs'
import { AudioManager } from '../imports/components/audio/audio.manager'
import * as utils from '@dcl-sdk/utils'
import { closeDialogWindow, openDialogWindow } from 'dcl-npc-toolkit'
import { IndicatorState, QuestIndicator } from '../imports/components/questIndicator'
import { ArrowTargeter, FloorCircleTargeter } from '../imports/components/targeter'
import { sideBubbleTalk } from '../imports/bubble'
import { HELP_KIT, ZONE_3_COLLECT_0 } from '../jsonData/textsTutorialBubble'
import { closeDialog } from 'dcl-npc-toolkit/dist/dialog'
import { ClaimWearableRequest } from '../claim/claimWearable'
import { POPUP_STATE } from '../uis/popupUI'
import { TaskType } from '../uis/widgetTask'
import { sendTrak } from '../utils/segment'
import { NPC } from '../imports/components/npc.class'
import { lockPlayer, unlockPlayer } from '../utils/blockPlayer'
import { movePlayerTo } from '~system/RestrictedActions'
import { cameraManager, getWorldPosition, wait_ms } from '../cinematic/cameraManager'
export class QuestMaterials {
  gameController: GameController
  mat: NPC
  targeterCircle: FloorCircleTargeter
  questIndicator: QuestIndicator
  bubbleTalk: sideBubbleTalk
  quest3Started: boolean = false
  materialsCollected: number = 0
  walletConected: boolean = false
  claim: ClaimWearableRequest
  firstTimeClosingRewardUI: boolean = true
  hasReward: boolean = false
  blocker: Entity
  arrow1: ArrowTargeter
  arrow2: ArrowTargeter
  pilarActivate: boolean = false
  // private readonly talkMatPoint: Vector3 = Vector3.create(169.26,68.78,154.41)
  private readonly talkMatPoint: Vector3 = Vector3.create(169,68.78,155.7)
  private readonly lookNextQuestPoint: Vector3 = Vector3.create(169.26,68.78,154.41)
  constructor(gameController: GameController) {
    this.gameController = gameController
    this.blocker = engine.addEntity()
    this.claim = new ClaimWearableRequest(
      this.gameController,
      configVest,
      configVest.campaign_key,
      configVest.claimServer
    )
    this.mat = new NPC(
      Vector3.create(0, -0.91, 0),
      Vector3.create(2.213552, 1.280694, 2.213552),
      Quaternion.create(0, 0.6327581, 0, -0.7743495),
      'assets/scene/models/unity_assets/s0_NPC_Raccoon_Art_01.glb',
      14,
      () => {
        console.log('npc activated')
        Animator.getClip(this.mat.entity, 'Idle').playing = true
      },
      () => {
        pointerEventsSystem.removeOnPointerDown(this.mat.npcChild)
        this.startQuest()
      }
    )

    Transform.getMutable(this.mat.entity).parent = this.gameController.mainInstance.s0_En_Npc2_01
    Animator.createOrReplace(this.mat.entity, {
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
        }
      ]
    })
    this.mat.activateBillBoard(true)
    this.mat.setChildScaleYAxis(3.1)
    this.questIndicator = new QuestIndicator(this.mat.entity)
    this.questIndicator.hide()
    this.bubbleTalk = new sideBubbleTalk(this.mat.bubbleAttach)
    this.bubbleTalk.closeBubbleInTime()
    this.targeterCircle = new FloorCircleTargeter(
      Vector3.create(0, 0, 0),
      Vector3.create(0, 0, 0),
      Quaternion.create(0, 0, 0),
      this.mat.entity
    )
    this.targeterCircle.showCircle(true)
    this.targeterCircle.setCircleScale(0.4)
    this.arrow1 = new ArrowTargeter(
      Vector3.create(0, 0, 0),
      Vector3.create(4, 4, 4),
      Quaternion.create(0, 0, 0),
      this.gameController.mainInstance.s0_Z3_Quest_BoxMat_art_3__01
    )
    this.arrow1.showArrow(false)
    this.arrow1.setArrowHeight(2)
    this.arrow2 = new ArrowTargeter(
      Vector3.create(0, 0, 0),
      Vector3.create(4, 4, 4),
      Quaternion.create(0, 0, 0),
      this.gameController.mainInstance.s0_Z3_Quest_BoxTri_art_3__01
    )
    this.arrow2.showArrow(false)
    this.arrow2.setArrowHeight(2)
    this.setUpTriggerHi()
    this.loadTagData()
    this.walletConected = this.claim.setUserData()
  }
  loadTagData() {
    this.spawnBlockToNextIsalnd()
    this.activeCables(false)
  }
  async startQuest() {
    // -- Camera --
    //Camera talk with Mat
    cameraManager.lockPlayer()

    // const talkPlayerPoint = Vector3.add(this.talkMatPoint, Vector3.create(0, 0.75, 0))
    let talkPlayerPoint = Vector3.add(Transform.get(engine.PlayerEntity).position, Vector3.create(0, 1.5, 0))
    const cameraTarget = Vector3.add(getWorldPosition(this.mat.entity), Vector3.create(0, 0.75, 0))

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
    
    await cameraManager.blockCamera(
      talkPlayerPoint,
      Quaternion.fromLookAt(talkPlayerPoint, cameraTarget),
      true,
      0.5
    )
    cameraManager.hideAvatar()
    // movePlayerTo({
    //   newRelativePosition: this.talkMatPoint,
    //   cameraTarget: Transform.get(this.gameController.mainInstance.s0_En_Npc2_01).position
    // })


    this.setQuestStartDialog()
    sendTrak('z2_quest2_00', this.gameController.timeStamp)
    this.gameController.uiController.popUpControls.hideAllControlsUI()
    
  }
  spawnBlockToNextIsalnd() {
    Transform.createOrReplace(this.blocker, {
      position: Vector3.create(149.93, 72.45, 156.78),
      scale: Vector3.create(3, 5, 9)
    })
    MeshCollider.setBox(this.blocker)
    pointerEventsSystem.onPointerDown(
      {
        entity: this.blocker,
        opts: {
          button: InputAction.IA_POINTER,
          hoverText: 'Talk to Mat'
        }
      },
      () => {}
    )
  }
  setQuestStartDialog() {
    AudioManager.instance().playOnce('npc_2_salute', { volume: 0.6, parent: this.mat.entity })
    this.gameController.uiController.widgetTasks.showTick(true, 0)

    openDialogWindow(this.mat.entity, this.gameController.dialogs.matDialog, 0)
    Animator.stopAllAnimations(this.mat.entity)
    Animator.getClip(this.mat.entity, 'Talk').playing = true
    this.targeterCircle.showCircle(false)
    this.questIndicator.hide()
  }
  async cameraTargetsMaterialsObjectives() {

    this.gameController.uiController.widgetTasks.showTick(false, 0)
    this.gameController.uiController.widgetTasks.setText(7, 0)
    this.gameController.uiController.widgetTasks.showTasks(true, TaskType.Simple)
    this.gameController.uiController.popUpControls.showInteractLockControlsUI()
    // -- Camera --
    // Camera shots at both boxes on each side for a couple of seconds. Then goes back to mat
    
    const talkPlayerPoint = Vector3.add(this.talkMatPoint, Vector3.create(0, 0.75, 0))
    const cameraTarget = Vector3.add(getWorldPosition(this.mat.entity), Vector3.create(0, 0.75, 0))

    await cameraManager.cameraOrbit(
      this.gameController.mainInstance.s0_Z3_Quest_BoxMat_art_3__01,
      Vector3.create(0, 1.5, 5),
      0 - 90,
      -45 - 90,
      3000,
      0,
      undefined
    )
    
    movePlayerTo({
        newRelativePosition: talkPlayerPoint,
        cameraTarget: Transform.get(this.gameController.mainInstance.s0_En_Npc2_01).position
    })
    
    await cameraManager.cameraOrbit(
      this.gameController.mainInstance.s0_Z3_Quest_BoxTri_art_3__01,
      Vector3.create(0, 1.5, 5),
      0 + 135,
      45 + 135,
      3000,
      0,
      undefined
    )

    await cameraManager.blockCamera(
      talkPlayerPoint,
      Quaternion.fromLookAt(talkPlayerPoint, cameraTarget),
      true,
      0
    )
    
    cameraManager.showAvatar()
    cameraManager.forceThirdPerson()
    await wait_ms(100)
    cameraManager.freeCamera()
    cameraManager.unlockPlayer()

    utils.timers.setTimeout(()=>{
      this.startQuestCollectMaterials()
    }, 1000)
  }
  deleteBlocker() {
    engine.removeEntity(this.blocker)
    engine.removeEntity(this.gameController.mainInstance.s0_Fence_Art_01)
  }
  setUpTriggerHi() {
    let triggerHi = engine.addEntity()
    Transform.create(triggerHi, {
      position: Transform.get(this.gameController.mainInstance.s0_En_Npc2_01).position
    })
    utils.triggers.addTrigger(
      triggerHi,
      1,
      1,
      [{ type: 'box', scale: Vector3.create(15, 5, 15) }],
      () => {
        AudioManager.instance().playOnce('npc_2_salute', {
          volume: 1,
          parent: this.gameController.mainInstance.s0_En_Npc2_01
        })
        Animator.stopAllAnimations(this.mat.entity)
        Animator.playSingleAnimation(this.mat.entity, 'Hi')
        utils.timers.setTimeout(() => {
          Animator.stopAllAnimations(this.mat.entity)
          Animator.playSingleAnimation(this.mat.entity, 'Idle')
        }, 5000)
        engine.removeEntity(triggerHi)
      },
      () => {
        Animator.playSingleAnimation(this.mat.entity, 'Idle')
      }
    )
  }
  showQuestBubbleAndTargeters() {
    this.bubbleTalk.openBubble(ZONE_3_COLLECT_0, true)
    Animator.stopAllAnimations(this.mat.entity)
    Animator.getClip(this.mat.entity, 'Idle').playing = true
    this.arrow1.showArrow(true)
    this.arrow2.showArrow(true)
  }
  startQuestCollectMaterials() { 
    this.showQuestBubbleAndTargeters()
    unlockPlayer()
    if (this.quest3Started == false) {
      this.quest3Started = true

      this.onclickMaterial()
      this.onclickTriangles()

      // -- Camera --
      //Restore camera to player
    }
  }
  onclickMaterial() {
    const collider = engine.addEntity()
    Transform.create(collider, {
      scale: Vector3.create(8, 8, 8),
      position: Vector3.create(0, -1, 0),
      parent: this.gameController.mainInstance.s0_Z3_Quest_BoxMat_art_3__01
    })

    MeshCollider.setBox(collider)

    pointerEventsSystem.onPointerDown(
      {
        entity: collider,
        opts: {
          button: InputAction.IA_POINTER,
          hoverText: 'Grab',
          showFeedback: true
        }
      },
      async () => {
        console.log('clicked entity')
        this.materialsCollected++
        this.gameController.uiController.widgetTasks.setStepCount(this.materialsCollected)
        if (this.materialsCollected == 2) {
          this.gameController.uiController.widgetTasks.showTick(true, 0)
        }
        AudioManager.instance().playOnce('pickup_box', {
          volume: 0.8,
          parent: this.gameController.mainInstance.s0_Z3_Quest_BoxMat_art_3__01
        })
        Animator.playSingleAnimation(this.gameController.mainInstance.s0_Z3_Quest_BoxMat_art_3__01, 'Box_02_Anim')
        engine.removeEntity(collider)

        cameraManager.lockPlayer()
        // let cameraPoint = Vector3.add(Transform.get(engine.PlayerEntity).position, Vector3.create(0, 0.75, 0))
        const cameraPoint = Vector3.create(Transform.get(engine.PlayerEntity).position.x, 70.5, Transform.get(engine.PlayerEntity).position.z)
        const cameraTarget = Vector3.add(getWorldPosition(this.gameController.mainInstance.s0_Z3_Quest_BoxMat_art_3__01), Vector3.create(0, -0.5, 0))
        
        await cameraManager.blockCamera(
          cameraPoint,
          Quaternion.fromLookAt(cameraPoint, cameraTarget),
          true,
          0.5
        )
        
        await wait_ms(2000)
        this.pickPiece()

        await wait_ms(500)
        cameraManager.forceThirdPerson()
        await wait_ms(100)
        cameraManager.freeCamera()
        cameraManager.unlockPlayer()

        await wait_ms(500)
        engine.removeEntity(this.gameController.mainInstance.s0_Z3_Quest_BoxMat_art_3__01)
      }
    )
  }
  onclickTriangles() {
    console.log('triangles')

    const collider = engine.addEntity()
    Transform.create(collider, {
      scale: Vector3.create(8, 8, 8),
      position: Vector3.create(0, -1, 0),
      parent: this.gameController.mainInstance.s0_Z3_Quest_BoxTri_art_3__01
    })

    MeshCollider.setBox(collider)

    pointerEventsSystem.onPointerDown(
      {
        entity: collider,
        opts: {
          button: InputAction.IA_POINTER,
          hoverText: 'Grab',
          showFeedback: true
        }
      },
      async () => {
        console.log('clicked entity')
        this.materialsCollected++
        this.gameController.uiController.widgetTasks.setStepCount(this.materialsCollected)
        if (this.materialsCollected == 2) {
          this.gameController.uiController.widgetTasks.showTick(true, 0)
        }
        AudioManager.instance().playOnce('pickup_box', {

          volume: 0.8,
          parent: this.gameController.mainInstance.s0_Z3_Quest_BoxTri_art_3__01
        })
        Animator.playSingleAnimation(this.gameController.mainInstance.s0_Z3_Quest_BoxTri_art_3__01, 'Box_01_Anim')
        engine.removeEntity(collider)

        
        cameraManager.lockPlayer()
        // let cameraPoint = Vector3.add(Transform.get(engine.PlayerEntity).position, Vector3.create(0, 0.75, 0))
        const cameraPoint = Vector3.create(Transform.get(engine.PlayerEntity).position.x, 70.5, Transform.get(engine.PlayerEntity).position.z)
        const cameraTarget = Vector3.add(getWorldPosition(this.gameController.mainInstance.s0_Z3_Quest_BoxTri_art_3__01), Vector3.create(0, -0.5, 0))
        
        await cameraManager.blockCamera(
          cameraPoint,
          Quaternion.fromLookAt(cameraPoint, cameraTarget),
          true,
          0.5
        )
        await wait_ms(2000)
        this.pickPiece()

        await wait_ms(500)
        cameraManager.forceThirdPerson()
        await wait_ms(100)
        cameraManager.freeCamera()
        cameraManager.unlockPlayer()

        await wait_ms(500)
        engine.removeEntity(this.gameController.mainInstance.s0_Z3_Quest_BoxTri_art_3__01)
      }
    )
  }
  pickPiece() {

    if (this.materialsCollected == 2) {
      this.pickedAllPieces()
      this.bubbleTalk.closeBubbleInTime()
      sendTrak('z2_quest2_02', this.gameController.timeStamp)
    } else {
      openDialogWindow(this.mat.entity, this.gameController.dialogs.matDialog, 4)
      sendTrak('z2_quest2_01', this.gameController.timeStamp)
      utils.timers.setTimeout(() => {
        closeDialog(this.mat.entity)
      }, 3000)
    }
  }
  pickedAllPieces() {
    
    utils.timers.setTimeout(() => {
      this.gameController.uiController.widgetTasks.showTick(false, 0)
      this.gameController.uiController.widgetTasks.setText(8, 0)
      this.gameController.uiController.widgetTasks.showTasks(true, TaskType.Simple)
    }, 2000)
    openDialogWindow(this.mat.entity, this.gameController.dialogs.matDialog, 5)
    utils.timers.setTimeout(() => {
      closeDialog(this.mat.entity)
      this.deliverAllPiecesClick()
    }, 3000)
    this.questIndicator.updateStatus(IndicatorState.ARROW)
    this.questIndicator.showWithAnim()
  }

  spawnparticles() {
    const particle = engine.addEntity()
    GltfContainer.create(particle, { src: 'assets/scene/models/glb_assets/CheckParticles_Art.glb' })
    const positionY = Transform.getMutable(this.mat.entity).position.y + 2.5
    Transform.create(particle, {
      position: Vector3.create(
        Transform.getMutable(this.mat.entity).position.x,
        positionY,
        Transform.getMutable(this.mat.entity).position.z
      ),
      scale: Vector3.create(2.5, 2.5, 2.5)
    })
    utils.timers.setTimeout(() => {
      engine.removeEntity(particle)
    }, 1000)
  }
  deliverAllPiecesClick() {
    pointerEventsSystem.onPointerDown(
      {
        entity: this.mat.npcChild,
        opts: {
          button: InputAction.IA_POINTER,
          hoverText: 'Talk'
        }
      },
      () => {
        console.log('deliverAllPiecesClick')

        this.questIndicator.hide()
        this.talkNpcCompleteQuest()
        pointerEventsSystem.removeOnPointerDown(this.mat.npcChild)
      }
    )
  }
  async talkNpcCompleteQuest() {

    this.gameController.uiController.widgetTasks.showTick(true, 0)
    //this.gameController.uiController.widgetTasks.showTick(true, 2)
 

    // -- Camera --
    //Camera talk with Mat
    
    cameraManager.lockPlayer()

    // const talkPlayerPoint = Vector3.add(this.talkMatPoint, Vector3.create(0, 0.75, 0))
    let talkPlayerPoint = Vector3.add(Transform.get(engine.PlayerEntity).position, Vector3.create(0, 1.5, 0))
    const cameraTarget = Vector3.add(getWorldPosition(this.mat.entity), Vector3.create(0, 0.75, 0))
    
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

    await cameraManager.blockCamera(
      talkPlayerPoint,
      Quaternion.fromLookAt(talkPlayerPoint, cameraTarget),
      true,
      0.5
    )
    cameraManager.hideAvatar()
    // movePlayerTo({
    //   newRelativePosition: this.talkMatPoint,
    //   cameraTarget: Transform.get(this.gameController.mainInstance.s0_En_Npc2_01).position
    // })

    this.spawnparticles()
    Animator.stopAllAnimations(this.mat.entity)
    Animator.playSingleAnimation(this.mat.entity, 'Celebrate')
    sendTrak('z2_quest2_03', this.gameController.timeStamp)
    openDialogWindow(this.mat.entity, this.gameController.dialogs.matDialog, 6)
    utils.timers.setTimeout(() => {
      Animator.stopAllAnimations(this.mat.entity)
      Animator.getClip(this.mat.entity, 'Idle').playing = true
    }, 1500)
    this.gameController.questPuzzle.questIndicator.updateStatus(IndicatorState.ARROW)
    this.gameController.questPuzzle.questIndicator.showWithAnim()
    this.gameController.uiController.popUpControls.hideInteractControlsUI()
    
  }

  setWalletConnection() {
    /*console.log('wallet connected:' + this.walletConected)
    if (this.walletConected === false) {
      utils.timers.setTimeout(() => {
        openDialogWindow(this.mat.entity, this.gameController.dialogs.matDialog, 8)
      }, 200)
      this.activatePilar()
    } else {
      utils.timers.setTimeout(() => {
        openDialogWindow(this.mat.entity, this.gameController.dialogs.matDialog, 9)
      }, 200)
    }*/

    this.walletConected = this.claim.setUserData()
    console.log('wallet connected' + this.walletConected)
    if (this.walletConected === false) {
      utils.timers.setTimeout(() => {
        this.onCloseRewardUI_deprecated()
      }, 200)
    } else {
      this.giveReward()
    }
  }

  setRewardTrue() {
    this.hasReward = true
    // uncomment this for now, because we go to this.onCloseRewardUI after onTheWayUI reward is closed
    // this.afterEndQuestClick()
  }

  giveReward() {
    this.claim.claimToken()
  }
  onCloseRewardUI_deprecated() {
    if (this.firstTimeClosingRewardUI) {
      openDialogWindow(this.mat.entity, this.gameController.dialogs.matDialog, 8)
      this.firstTimeClosingRewardUI = false
    }
    else this.afterEndQuestClick()
  }
  async lookAtNextQuest() {
    this.gameController.uiController.widgetTasks.showTasks(false, TaskType.Simple)
    executeTask(async () => {
      this.gameController.questPuzzle.questIndicator.updateStatus(IndicatorState.ARROW)
      this.gameController.questPuzzle.questIndicator.showWithAnim()
  
      await wait_ms(1000)
      this.activatePilar()
      await wait_ms(8000)
      if(cameraManager.isSkipDetected()) return
      if(!cameraManager.isSkipRequested()) return
      
      Animator.stopAllAnimations(this.gameController.questPuzzle.kit.entity)
      Animator.playSingleAnimation(this.gameController.questPuzzle.kit.entity, 'Hi')
    })
    // -- Camera --
    //Camera pans to show the stair case traveling until it reaches Kit, waving at the camera
    
    cameraManager.lockPlayer()
    
    const talkPlayerPoint = Vector3.add(this.talkMatPoint, Vector3.create(0, 0.75, 0))
    const cameraTarget = Vector3.add(getWorldPosition(this.mat.entity), Vector3.create(0, 0.75, 0))

    cameraManager.requestSkip(talkPlayerPoint, Quaternion.fromLookAt(talkPlayerPoint, cameraTarget))

    let path = [
      { 
        position: Vector3.create(163, 68 + 1, 159.6), 
        rotation: Quaternion.fromLookAt(Vector3.create(163, 68 + 1, 159.6), Vector3.create(144.4, 71.5 + 4, 156.8))
      },
      {
        position: Vector3.create(144.4, 71.5 + 4, 156.8), 
        rotation: Quaternion.fromLookAt(Vector3.create(144.4, 71.5 + 4, 156.8), Vector3.create(120.3, 73.3 + 4, 143.9))
      },
      {
        position: Vector3.create(120, 73.3 + 8, 144), 
        rotation: Quaternion.fromLookAt(Vector3.create(120, 73.3 + 8, 144), getWorldPosition(this.gameController.questPuzzle.kit.entity))
      }
    ]

    for(let i = 0; i < path.length; i++) {
      let debugBox = engine.addEntity()
      Transform.create(debugBox, {
        position: path[i].position,
        scale: Vector3.scale(Vector3.One(), 0.4)
      })
      MeshCollider.setBox(debugBox)
      Material.setPbrMaterial(debugBox, {albedoColor: Color4.create(1, 0, 0, 1)})
    }

    await cameraManager.startPathTrack(
      path, 
      11000, 
      5, 
      false, 
      0, 
      1.5
    )
    
    // await cameraManager.cameraOrbit(
    //   this.gameController.questPuzzle.kit.entity,
    //   Vector3.subtract(path[path.length - 1].position, getWorldPosition(this.gameController.questPuzzle.kit.entity)),
    //   0,
    //   40,
    //   4000,
    //   0,
    //   undefined
    // )

    movePlayerTo({
      newRelativePosition: this.talkMatPoint,
      cameraTarget: Transform.get(this.gameController.mainInstance.s0_En_Npc2_01).position
    })

    await wait_ms(200)
    await cameraManager.blockCamera(
      talkPlayerPoint,
      Quaternion.fromLookAt(talkPlayerPoint, cameraTarget),
      true,
      0
    )
    cameraManager.resetSkipRequested()

    await wait_ms(350)
    cameraManager.showAvatar()
    cameraManager.forceThirdPerson()
    await wait_ms(100)
    cameraManager.freeCamera()

    Animator.stopAllAnimations(this.gameController.questPuzzle.kit.entity)
    Animator.playSingleAnimation(this.gameController.questPuzzle.kit.entity, 'Idle')

    openDialogWindow(this.mat.entity, this.gameController.dialogs.matDialog, 9)
  }
  activatePilar() {
    if (this.pilarActivate === true){
      return
    }
    this.pilarActivate = true
    AudioManager.instance().playTowerCharge(this.gameController.mainInstance.s0_Z3_Quest_Pillar_Art_1__01)
    Animator.getClip(this.gameController.mainInstance.s0_Z3_Quest_Pillar_Art_1__01, 'Pillar_Anim').speed = 3
    Animator.getClip(this.gameController.mainInstance.s0_Z3_Quest_Pillar_Art_1__01, 'Pillar_Anim').shouldReset = false
    Animator.getClip(this.gameController.mainInstance.s0_Z3_Quest_Pillar_Art_1__01, 'Pillar_Anim').loop = false
    Animator.playSingleAnimation(this.gameController.mainInstance.s0_Z3_Quest_Pillar_Art_1__01, 'Pillar_Anim')
    this.deleteBlocker()
    utils.timers.setTimeout(() => {
      AudioManager.instance().playTowerActivated(this.gameController.mainInstance.s0_Z3_Quest_Pillar_Art_1__01)
      this.activeCables(true)
    }, 3000)
  }
  activeCables(bActive: boolean) {
    if (bActive === true) {
      GltfContainer.getMutable(this.gameController.mainInstance.s0_Cable_03_ON_01).src =
        'assets/scene/models/unity_assets/s0_Cable_03_ON_01.glb'
      GltfContainer.getMutable(this.gameController.mainInstance.s0_Cable_03_OFF_01).src = ''
    } else if (bActive === false) {
      GltfContainer.getMutable(this.gameController.mainInstance.s0_Cable_03_ON_01).src = ''
      GltfContainer.getMutable(this.gameController.mainInstance.s0_Cable_03_OFF_01).src =
        'assets/scene/models/unity_assets/s0_Cable_03_OFF_01.glb'
    }
  }
  async questFinished() {
    this.gameController.uiController.widgetTasks.showTick(false, 0)
    this.gameController.uiController.widgetTasks.setText(9, 0)
    this.gameController.uiController.widgetTasks.showTasks(true, TaskType.Simple)
    this.gameController.uiController.popUpControls.showRunLockControlsUI()
    // -- Camera --
    //Restore camera to player

    cameraManager.unlockPlayer()
    // await wait_ms(100)
    // cameraManager.forceThirdPerson()
    // await wait_ms(100)
    // cameraManager.freeCamera()

    this.afterEndQuestClick()
  }
  afterEndQuestClick() {
    console.log('QuestEnd')
    this.bubbleTalk.openBubble(HELP_KIT, true)
    pointerEventsSystem.onPointerDown(
      {
        entity: this.mat.npcChild,
        opts: {
          button: InputAction.IA_POINTER,
          hoverText: 'Talk'
        }
      },
      () => {
        console.log(this.walletConected, ' this   ', this.hasReward)
        if (!this.walletConected) {
          this.dialogEndQuest()
        }
        if (this.walletConected && !this.hasReward) {
          console.log('Case Wallet connected but no collect the reward not reward')
          this.playerForgotRewardDialog()
          this.bubbleTalk.closeBubbleInTime()
        } else if (this.walletConected && this.hasReward) {
          console.log('Case Wallet connected and reward connected  ')
          this.dialogEndQuest()
        }
      }
    )
  }
  playerForgotRewardDialog() {
    pointerEventsSystem.removeOnPointerDown(this.mat.npcChild)
    openDialogWindow(this.mat.entity, this.gameController.dialogs.matDialog, 12)
  }
  dialogEndQuest() {
    this.bubbleTalk.closeBubbleInTime()
    Animator.stopAllAnimations(this.mat.entity)
    Animator.getClip(this.mat.entity, 'Idle').playing = true
    openDialogWindow(this.mat.entity, this.gameController.dialogs.matDialog, 11)
    PointerEvents.deleteFrom(this.mat.npcChild)

  }
}
