import { type Dialog } from 'dcl-npc-toolkit'
import { GameController } from '../controllers/gameController'
import { CLICKME } from './textsTutorialBubble'
import {
  IdleTrebor,
  Racoon2Talking,
  happyBezier,
  happyMat,
  happyTrebor,
  idleBezier,
  idleMat,
  racoon2Idle,
  racoon2Sourprised,
  surprisedBezier,
  surprisedMat,
  talkingBezier,
  talkingTrebor
} from './npcData'
import {
  PORTAL_ISLAND_0,
  PORTAL_ISLAND_1,
  PORTAL_ISLAND_2,
  PORTAL_ISLAND_3,
  PORTAL_ISLAND_4,
  PORTAL_ISLAND_5,
  FOURTH_ISLAND_0,
  FOURTH_ISLAND_1,
  FOURTH_ISLAND_2,
  FOURTH_ISLAND_3,
  FOURTH_ISLAND_4,
  FOURTH_ISLAND_5,
  FOURTH_ISLAND_6,
  SECOND_ISLAND_0,
  SECOND_ISLAND_1,
  SECOND_ISLAND_2,
  SECOND_ISLAND_3,
  SECOND_ISLAND_4,
  SECOND_ISLAND_5,
  SECOND_ISLAND_6,
  SECOND_ISLAND_7,
  SECOND_ISLAND_8,
  START_ISLAND_0,
  START_ISLAND_1,
  START_ISLAND_2,
  START_ISLAND_3,
  START_ISLAND_4,
  START_ISLAND_5,
  THIRD_ISLAND_0,
  THIRD_ISLAND_1,
  THIRD_ISLAND_10,
  THIRD_ISLAND_11,
  THIRD_ISLAND_12,
  THIRD_ISLAND_2,
  THIRD_ISLAND_3,
  THIRD_ISLAND_4,
  THIRD_ISLAND_5,
  THIRD_ISLAND_6,
  THIRD_ISLAND_7,
  THIRD_ISLAND_8,
  THIRD_ISLAND_9,
  SECOND_ISLAND_9,
  SECOND_ISLAND_11,
  SECOND_ISLAND_10,
  START_ISLAND_CINEMATIC_0,
  START_ISLAND_CINEMATIC_1,
  START_ISLAND_CINEMATIC_2,
  START_ISLAND_CINEMATIC_3,
  START_ISLAND_MOVEMENT_0,
  START_ISLAND_CAMERA_0,
  START_ISLAND_CAMERA_1,
  START_ISLAND_CAMERA_2,
  START_ISLAND_JUMP_0,
  START_ISLAND_JUMP_1,
  START_ISLAND_JUMP_2,
  FOURTH_ISLAND_7,
  FOURTH_ISLAND_8
} from './textsTutorialPopups'
import { POPUP_STATE } from '../uis/popupUI'

export class Dialogs {
  public toborDialog: Dialog[]
  public toborCinematicDialog: Dialog[]
  public toborMovementDialog: Dialog[]
  public toborCameraDialog: Dialog[]
  public toborJumpDialog: Dialog[]
  public bezierDialog: Dialog[]
  public matDialog: Dialog[]
  public toborBubbles: Dialog[]
  public toborEndDialog: Dialog[]
  public kitDialog: Dialog[]
  typeSpeed: number = 45
  gameController: GameController
  constructor(gameController: GameController) {
    this.gameController = gameController
    this.toborCinematicDialog = [
      {
        text: START_ISLAND_CINEMATIC_0,
        fontSize: 18,
        portrait: IdleTrebor,
        typeSpeed: this.typeSpeed
      },
      {
        text: START_ISLAND_CINEMATIC_1,
        fontSize: 18,
        portrait: IdleTrebor,
        typeSpeed: this.typeSpeed,
        triggeredByNext: () => {
          //Camera change
          this.gameController.spawnIsland.introductionMiddleChangeCamera()
        }
      },
      {
        text: START_ISLAND_CINEMATIC_2,
        fontSize: 18,
        portrait: IdleTrebor,
        typeSpeed: this.typeSpeed
      },
      {
        text: START_ISLAND_CINEMATIC_3,
        fontSize: 18,
        portrait: IdleTrebor,
        typeSpeed: this.typeSpeed,
        isEndOfDialog: true,
        triggeredByNext: () => {
          this.gameController.spawnIsland.finishedIntroDialog()
        }
      },
    ]
    this.toborMovementDialog = [
      {
        text: START_ISLAND_MOVEMENT_0,
        fontSize: 18,
        portrait: IdleTrebor,
        typeSpeed: this.typeSpeed,
        isEndOfDialog: true,
        triggeredByNext: () => {
          this.gameController.spawnIsland.startMovementQuest()
        }
      },
    ]
    this.toborCameraDialog = [
      {
        text: START_ISLAND_CAMERA_0,
        fontSize: 18,
        portrait: IdleTrebor,
        typeSpeed: this.typeSpeed,
      },
      {
        text: START_ISLAND_CAMERA_1,
        fontSize: 18,
        portrait: IdleTrebor,
        typeSpeed: this.typeSpeed,
      },
      {
        text: START_ISLAND_CAMERA_2,
        fontSize: 18,
        portrait: IdleTrebor,
        typeSpeed: this.typeSpeed,
        isEndOfDialog: true,
        triggeredByNext: () => {
          this.gameController.spawnIsland.startCameraQuest()
        }
      },
    ]
    this.toborJumpDialog = [
      {
        text: START_ISLAND_JUMP_0,
        fontSize: 18,
        portrait: IdleTrebor,
        typeSpeed: this.typeSpeed,
      },
      {
        text: START_ISLAND_JUMP_1,
        fontSize: 18,
        portrait: IdleTrebor,
        typeSpeed: this.typeSpeed,
        triggeredByNext: () => {
          this.gameController.spawnIsland.lookAtLog()
        }
      },
      {
        text: START_ISLAND_JUMP_2,
        fontSize: 18,
        portrait: IdleTrebor,
        typeSpeed: this.typeSpeed,
        isEndOfDialog: true,
        triggeredByNext: () => {
          this.gameController.spawnIsland.startJumpQuest()
        }
      },
    ]
    this.toborDialog = [
      {
        text: START_ISLAND_0,
        fontSize: 18,
        portrait: IdleTrebor,
        typeSpeed: this.typeSpeed
      },
      {
        text: START_ISLAND_1,
        portrait: IdleTrebor,
        typeSpeed: this.typeSpeed
      },
      {
        text: START_ISLAND_2,
        portrait: talkingTrebor,
        typeSpeed: this.typeSpeed,
        isEndOfDialog: true,
        triggeredByNext: () => {
          this.gameController.spawnIsland.startMoveForwardJumpQuest()
        }
      },

      {
        text: START_ISLAND_3,
        portrait: talkingTrebor,
        typeSpeed: this.typeSpeed
      },
      {
        text: START_ISLAND_4,
        portrait: talkingTrebor,
        typeSpeed: this.typeSpeed,
        triggeredByNext: () => {
          this.gameController.spawnIsland.lookTowardBridge()
        }
      },
      {
        text: START_ISLAND_5,
        portrait: happyTrebor,
        isEndOfDialog: true,
        typeSpeed: this.typeSpeed,
        triggeredByNext: () => {
          //this.gameController.uiController.popUpUI.show(POPUP_STATE.Tasks)
          this.gameController.spawnIsland.onFinishCompleteQuestDialog()
        }
      }
    ]
    this.toborBubbles = [
      {
        text: CLICKME
      }
    ]
    this.bezierDialog = [
      { //0
        text: SECOND_ISLAND_0,
        portrait: idleBezier,
        typeSpeed: this.typeSpeed

      },
      { //1
        text: SECOND_ISLAND_1,
        portrait: talkingBezier,
        typeSpeed: this.typeSpeed
      },
      { //2
        text: SECOND_ISLAND_2,
        typeSpeed: this.typeSpeed,
        portrait: surprisedBezier
      },
      { //3
        text: SECOND_ISLAND_3,
        typeSpeed: this.typeSpeed,
        portrait: surprisedBezier,
        isEndOfDialog: true,
        triggeredByNext: () => {

          this.gameController.questEmote.startEmoteQuest()
        }
      },
      { //4
        text: SECOND_ISLAND_4,
        portrait: surprisedBezier,
        typeSpeed: this.typeSpeed
      },
      { //5
        text: SECOND_ISLAND_5,
        portrait: happyBezier,
        typeSpeed: this.typeSpeed,
        //isEndOfDialog: true,
        triggeredByNext: () => {

          this.gameController.questEmote.setWalletConnection()
        },
      },
      { //6
        text: SECOND_ISLAND_6,
        portrait: happyBezier,
        typeSpeed: this.typeSpeed
      },
      { //7
        text: SECOND_ISLAND_7,
        portrait: happyBezier,
        typeSpeed: this.typeSpeed,
        isEndOfDialog: true,
        triggeredByNext: () => {

          this.gameController.questEmote.cameraAndBridgeAnim()
        },
      },
      { //8
        text: SECOND_ISLAND_8,
        portrait: talkingBezier,
        isEndOfDialog: true,
        triggeredByNext: () => {

          // this.gameController.questEmote.finishAfterRewardDialog()
          this.gameController.questEmote.dialogQuestFinished()
        },
        typeSpeed: this.typeSpeed
      },
      { //9
        text: SECOND_ISLAND_9,
        portrait: talkingBezier,
        isEndOfDialog: true,
        typeSpeed: this.typeSpeed
      },

      { //10
        text: SECOND_ISLAND_10,
        portrait: talkingBezier,
        typeSpeed: this.typeSpeed
      },
      { //11
        text: SECOND_ISLAND_11,
        portrait: talkingBezier,
        isEndOfDialog: true,
        triggeredByNext: () => {

          this.gameController.questEmote.setWalletConnection()
        },
        typeSpeed: this.typeSpeed
      }
    ]
    this.matDialog = [
      { //0
        text: THIRD_ISLAND_0,
        portrait: idleMat,
        typeSpeed: this.typeSpeed
      },
      { //1
        text: THIRD_ISLAND_1,
        portrait: happyMat,
        typeSpeed: this.typeSpeed
      },

      { //2
        text: THIRD_ISLAND_2,
        portrait: surprisedMat,
        typeSpeed: this.typeSpeed
      },

      { //3
        text: THIRD_ISLAND_3,
        portrait: happyMat,
        isEndOfDialog: true,
        triggeredByNext: () => {

          this.gameController.questMaterial.cameraTargetsMaterialsObjectives()
        },
        typeSpeed: this.typeSpeed
      },
      { //4
        text: THIRD_ISLAND_4,
        portrait: idleMat,
        triggeredByNext: () => {

          this.gameController.questMaterial.showQuestBubbleAndTargeters()
        },
        isEndOfDialog: true,
        typeSpeed: this.typeSpeed
      },
      { //5
        text: THIRD_ISLAND_5,
        portrait: idleMat,
        isEndOfDialog: true,
        typeSpeed: this.typeSpeed
      },

      { //6
        text: THIRD_ISLAND_6,
        portrait: idleMat,
        typeSpeed: this.typeSpeed
      },

      { //7
        text: THIRD_ISLAND_9,
        portrait: idleMat,
        triggeredByNext: () => {

          this.gameController.questMaterial.setWalletConnection()
        },
        //isEndOfDialog: true,
        typeSpeed: this.typeSpeed
      },
      { //8
        text: THIRD_ISLAND_7,
        portrait: idleMat,
        isEndOfDialog: true,
        triggeredByNext: () => {

          this.gameController.questMaterial.lookAtNextQuest()
        },
        typeSpeed: this.typeSpeed
      },
      { //9
        text: THIRD_ISLAND_8,
        portrait: idleMat,
        triggeredByNext: () => {

          this.gameController.questMaterial.questFinished()
        },
        isEndOfDialog: true,
        typeSpeed: this.typeSpeed
      },
      
      { //10
        text: THIRD_ISLAND_10,
        portrait: idleMat,
        typeSpeed: this.typeSpeed
      },

      { //11
        text: THIRD_ISLAND_11,
        portrait: idleMat,
        isEndOfDialog: true,
        typeSpeed: this.typeSpeed
      },
      { //12
        text: THIRD_ISLAND_12,
        portrait: idleMat,
        isEndOfDialog: true,
        typeSpeed: this.typeSpeed,
        triggeredByNext: () => {

          this.gameController.questMaterial.giveReward()
        }
      }
    ]
    this.toborEndDialog = [
      { //0
        text: PORTAL_ISLAND_0,
        fontSize: 18,
        portrait: IdleTrebor,
        typeSpeed: 30

      },
      { //1
        text: PORTAL_ISLAND_1,
        portrait: talkingTrebor,
        typeSpeed: 30,
        isEndOfDialog: true,
        triggeredByNext: () => {
          this.gameController.questPortal.setWalletConnection()
        },
      },

      { //2
        text: PORTAL_ISLAND_2,
        portrait: IdleTrebor,
        typeSpeed: 30,
        triggeredByNext: () => {

          this.gameController.questPortal.setWalletConnection()
        },
        isEndOfDialog: true
      },

      { //3
        text: PORTAL_ISLAND_3,
        portrait: talkingTrebor,
        typeSpeed: 30,
        isEndOfDialog: true,
        triggeredByNext: () => {

          this.gameController.questPortal.setupFinalDialog()
        },
      },

      { //4
        text: PORTAL_ISLAND_4,
        portrait: talkingTrebor,
        typeSpeed: 30,
        triggeredByNext: () => {

          this.gameController.questPortal.giveReward()
        },
        //isEndOfDialog: true
      },

      { //5
        text: PORTAL_ISLAND_5,
        portrait: happyTrebor,
        isEndOfDialog: true,
        typeSpeed: 30,
        triggeredByNext: () => {

          this.gameController.questPortal.finishedToborPortalEndDialog()
        },
      }

    ]
    this.kitDialog = [
      { //0
        text: FOURTH_ISLAND_0,
        portrait: racoon2Idle,
        isEndOfDialog: false,
        typeSpeed: this.typeSpeed

      },
      { //1
        text: FOURTH_ISLAND_1,
        portrait: racoon2Sourprised,
        isEndOfDialog: false,
        typeSpeed: this.typeSpeed
      },

      { //2
        text: FOURTH_ISLAND_2,
        portrait: Racoon2Talking,
        isEndOfDialog: true,
        typeSpeed: this.typeSpeed,
        triggeredByNext: () => {

          this.gameController.questPuzzle.cameraLooksAtPortals()
        }
      },
      { //3
        text: FOURTH_ISLAND_3,
        portrait: Racoon2Talking,
        isEndOfDialog: true,
        typeSpeed: this.typeSpeed,
        triggeredByNext: () => {

          this.gameController.questPuzzle.cameraLooksAtPuzzle()
        }
      },
      { //4
        text: FOURTH_ISLAND_4,
        portrait: Racoon2Talking,
        isEndOfDialog: true,
        typeSpeed: this.typeSpeed,
        triggeredByNext: () => {

          this.gameController.questPuzzle.accetpQuest()
          this.gameController.questPuzzle.cameraModeAngleCheck()
        }
      },
      { //5
        text: FOURTH_ISLAND_5,
        portrait: Racoon2Talking,
        isEndOfDialog: true,
        typeSpeed: this.typeSpeed
      },

      { //6
        text: FOURTH_ISLAND_6,
        portrait: racoon2Sourprised,
        isEndOfDialog: true,
        typeSpeed: this.typeSpeed
      },

      { //7
        text: FOURTH_ISLAND_7,
        portrait: racoon2Sourprised,
        isEndOfDialog: false,
        typeSpeed: this.typeSpeed
      },
      { //8
        text: FOURTH_ISLAND_8,
        portrait: racoon2Sourprised,
        isEndOfDialog: true,
        typeSpeed: this.typeSpeed,
        triggeredByNext: () => {

          this.gameController.questPuzzle.dialogQuestFinished()
        }
      },

      /*{ //9
        text: FOURTH_ISLAND_9,
        portrait: Racoon2Talking,
        isEndOfDialog: true,
        typeSpeed: this.typeSpeed,
        triggeredByNext: () => {

          this.gameController.questPuzzle.dialogQuestFinished()
        }
      }*/
    ]
  }
}
