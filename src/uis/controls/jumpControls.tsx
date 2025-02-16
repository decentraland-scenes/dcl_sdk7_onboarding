import { DeepReadonlyObject, PBUiCanvasInformation } from "@dcl/sdk/ecs";
import { Color4 } from "@dcl/sdk/math";
import ReactEcs, { UiEntity, Label } from "@dcl/sdk/react-ecs";
import { KEY_TEXT_FONT_SIZE, CONTROLS_BACKGROUND_IMG, TITLE_TEXT_FONT_SIZE, CONTROLS_BACKGROUND_SLICES, KEY_UI_SCALE } from "./controlsAssetsConfig";
import { KeyControlWidget, KeyType } from "./keyControl";
import { scalePixelWidth, scalePixelHeight } from "../../utils/globalLibrary";


export class JumpControlsUI {

    jumpContainerVisible = false
    readonly keyWinJump: KeyControlWidget
    readonly keySpace: KeyControlWidget
    
    constructor() {
        this.keySpace = new KeyControlWidget(KeyType.SPACE)
        this.keyWinJump = new KeyControlWidget(KeyType.W)
        this.keySpace.setInstantKeyProgress(true)
        this.keyWinJump.enableKeyProgress(false)
        this.keyWinJump.enableAnim(false)
    }
    generateUI(canvasInfo: DeepReadonlyObject<PBUiCanvasInformation>): ReactEcs.JSX.Element | undefined {
        if(this.jumpContainerVisible == false) {
            return;
        }
        return (
            <UiEntity
            //BACKGROUND
            uiTransform={{
                flexDirection: 'column',
                width: scalePixelWidth(450, canvasInfo) * KEY_UI_SCALE,
                height: scalePixelHeight(118, canvasInfo) * KEY_UI_SCALE,
                alignSelf: 'flex-end',
                justifyContent: 'flex-start',
                positionType: 'relative',
                margin: { right: scalePixelWidth(35, canvasInfo) * KEY_UI_SCALE },
                padding: { 
                    top: scalePixelHeight(10, canvasInfo) * KEY_UI_SCALE, 
                    left: scalePixelHeight(10, canvasInfo) * KEY_UI_SCALE, 
                    right: scalePixelHeight(10, canvasInfo) * KEY_UI_SCALE, 
                    bottom: scalePixelHeight(15, canvasInfo) * KEY_UI_SCALE
                },
                display: 'flex'
            }}
            uiBackground={{
                texture: { src: CONTROLS_BACKGROUND_IMG },
                textureMode: 'nine-slices',
                textureSlices: CONTROLS_BACKGROUND_SLICES,
                color: Color4.create(22, 21, 24, 1)
            }}
            >
                <UiEntity
                //TITLE
                uiTransform={{
                    flexDirection: 'row',
                    width: '100%',
                    height: scalePixelHeight(43, canvasInfo) * KEY_UI_SCALE,
                    positionType: 'relative',
                    alignContent: 'center',
                    padding: {
                        left: scalePixelWidth(14, canvasInfo) * KEY_UI_SCALE, 
                        right: scalePixelWidth(14, canvasInfo) * KEY_UI_SCALE
                    },
                    position: { top: '0%', left: '0%' },
                    display: 'flex'
                }}
                /*uiBackground={{
                    color: Color4.create(0, 1, 0, 1)
                }}*/
                >
                    <UiEntity
                    uiTransform={{
                        positionType: 'relative',
                        alignSelf: 'center',
                        width: scalePixelWidth(24, canvasInfo) * KEY_UI_SCALE,
                        height: scalePixelHeight(24, canvasInfo) * KEY_UI_SCALE,
                        //margin: {left: '14px', right: '14px'},
                    }}
                    uiBackground={{
                        texture: { src: 'assets/ui/controls/UI_Controls_Icon.png'},
                        textureMode: 'stretch',
                        //color: Color4.create(22, 21, 24, 1)
                    }}
                    />
                    {/* Text UI */}
                    <Label
                    uiTransform={{
                        positionType: 'relative',
                        alignSelf: 'flex-start',
                        height: '95%',
                        margin: { left: scalePixelWidth(5, canvasInfo) * KEY_UI_SCALE },
                    }}
                    /*uiBackground={{
                        color: Color4.create(1, 0, 0, 1)
                    }}*/
                    textAlign='middle-left'
                    value="<b>TO JUMP</b>"
                    fontSize={scalePixelHeight(TITLE_TEXT_FONT_SIZE, canvasInfo) * KEY_UI_SCALE}
                    font="monospace"
                    color={Color4.White()}
                    />
                </UiEntity>
                <UiEntity
                //INSTRUCTIONS
                    uiTransform={{
                        flexDirection: 'row',
                        width: '100%',
                        height: scalePixelHeight(40, canvasInfo) * KEY_UI_SCALE,
                        positionType: 'relative',
                        margin: { top: scalePixelHeight(10, canvasInfo) * KEY_UI_SCALE},
                        padding: { 
                            left: scalePixelWidth(10, canvasInfo) * KEY_UI_SCALE, 
                            right: scalePixelWidth(10, canvasInfo) * KEY_UI_SCALE
                        },
                        position: { top: '0%', left: '0%' },
                        display: 'flex'
                    }}
                >
                    <Label
                        uiTransform={{
                        positionType: 'relative',
                        margin: { left: scalePixelWidth(5, canvasInfo) * KEY_UI_SCALE },
                        }}
                        value="<b>Hold</b>"
                        fontSize={scalePixelHeight(KEY_TEXT_FONT_SIZE, canvasInfo) * KEY_UI_SCALE}
                        font="sans-serif"
                        color={Color4.White()}
                    />
                    {this.keySpace.generateKeyControlUI(canvasInfo)}
                    <Label
                        uiTransform={{
                        positionType: 'relative',
                        margin: { left: scalePixelWidth(5, canvasInfo) * KEY_UI_SCALE },
                        }}
                        value="<b>And</b>"
                        fontSize={scalePixelHeight(KEY_TEXT_FONT_SIZE, canvasInfo) * KEY_UI_SCALE}
                        font="sans-serif"
                        color={Color4.White()}
                    />
                    {this.keyWinJump.generateKeyControlUI(canvasInfo)}
                    <Label
                        uiTransform={{
                        positionType: 'relative',
                        margin: { left: scalePixelWidth(5, canvasInfo) * KEY_UI_SCALE },    
                        }}
                        value="<b>To Jump Forward</b>"
                        fontSize={scalePixelHeight(KEY_TEXT_FONT_SIZE, canvasInfo) * KEY_UI_SCALE}
                        font="sans-serif"
                        color={Color4.White()}
                    />
                </UiEntity>
            </UiEntity>
        )      
    }
}