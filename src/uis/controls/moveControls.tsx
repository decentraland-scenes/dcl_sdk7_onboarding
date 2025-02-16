import { DeepReadonlyObject, PBUiCanvasInformation } from "@dcl/sdk/ecs";
import { Color4 } from "@dcl/sdk/math";
import ReactEcs, { UiEntity, Label } from "@dcl/sdk/react-ecs";
import { KEY_TEXT_FONT_SIZE, CONTROLS_BACKGROUND_IMG, TITLE_TEXT_FONT_SIZE, CONTROLS_BACKGROUND_SLICES, KEY_UI_SCALE } from "./controlsAssetsConfig";
import { KeyControlWidget, KeyType } from "./keyControl";
import { scalePixelHeight, scalePixelHeightOnlyUp, scalePixelWidth, scalePixelWidthOnlyUp } from "../../utils/globalLibrary";


export class MoveControlsUI {

    moveContainerVisible = false
    readonly keyW: KeyControlWidget
    readonly keyS: KeyControlWidget
    readonly keyA: KeyControlWidget
    readonly keyD: KeyControlWidget
    constructor() {
        this.keyW = new KeyControlWidget(KeyType.W)
        this.keyS = new KeyControlWidget(KeyType.S)
        this.keyA = new KeyControlWidget(KeyType.A)
        this.keyD = new KeyControlWidget(KeyType.D)
    }
    generateUI(canvasInfo: DeepReadonlyObject<PBUiCanvasInformation>): ReactEcs.JSX.Element | undefined {
        if(this.moveContainerVisible == false) {
            return;
        }
        return (
        
            <UiEntity
            //BACKGROUND
            uiTransform={{
                flexDirection: 'column',
                //width: '257px',
                //height: '268px',
                width: scalePixelWidth(257, canvasInfo) * KEY_UI_SCALE, //257px on 1920p
                height: scalePixelHeight(268, canvasInfo) * KEY_UI_SCALE, //268px on 1080p
                alignSelf: 'flex-end',
                justifyContent: 'flex-start',
                positionType: 'relative',
                //margin: { right: '35px' },
                margin: { right: scalePixelWidth(35, canvasInfo) * KEY_UI_SCALE }, //35px on 1920p
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
                    padding: {left: scalePixelWidth(14, canvasInfo) * KEY_UI_SCALE, right: scalePixelWidth(14, canvasInfo) * KEY_UI_SCALE},
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
                        //width: 24,
                        //height: 24,
                        width: scalePixelWidthOnlyUp(24, canvasInfo) * KEY_UI_SCALE,
                        height: scalePixelHeightOnlyUp(24, canvasInfo) * KEY_UI_SCALE,
                        //margin: {left: '14px', right: '14px'},
                    }}
                    uiBackground={{
                        texture: { src: 'assets/ui/controls/UI_Controls_Icon.png'},
                        //textureMode: 'center',
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
                    value="<b>MOVE</b>"
                    fontSize={scalePixelHeight(TITLE_TEXT_FONT_SIZE, canvasInfo) * KEY_UI_SCALE}
                    font="monospace"
                    color={Color4.White()}
                    />
                </UiEntity>
                <UiEntity
                //KEY W
                uiTransform={{
                    flexDirection: 'row',
                    width: '100%',
                    height: scalePixelHeight(40, canvasInfo) * KEY_UI_SCALE,
                    positionType: 'relative',
                    margin: { top: scalePixelHeight(10, canvasInfo) * KEY_UI_SCALE},
                    padding: { left: scalePixelWidth(10, canvasInfo) * KEY_UI_SCALE, right: scalePixelWidth(10, canvasInfo) * KEY_UI_SCALE},
                    position: { top: '0%', left: '0%' },
                    display: 'flex'
                }}
                >
                {this.keyW.generateKeyControlUI(canvasInfo)}
                {/* Text UI */}
                <Label
                    uiTransform={{
                    positionType: 'relative',
                    margin: { left: scalePixelWidth(5, canvasInfo) * KEY_UI_SCALE },
                    }}
                    value="<b>to move Forward</b>"
                    fontSize={scalePixelHeight(KEY_TEXT_FONT_SIZE, canvasInfo) * KEY_UI_SCALE}
                    font="sans-serif"
                    color={Color4.White()}
                />
                </UiEntity>
                <UiEntity
                //KEY S
                uiTransform={{
                    flexDirection: 'row',
                    width: '100%',
                    height: scalePixelHeight(40, canvasInfo) * KEY_UI_SCALE,
                    positionType: 'relative',
                    margin: { top: scalePixelHeight(10, canvasInfo) * KEY_UI_SCALE},
                    padding: { left: scalePixelWidth(10, canvasInfo) * KEY_UI_SCALE, right: scalePixelWidth(10, canvasInfo) * KEY_UI_SCALE},
                    position: { top: '0%', left: '0%' },
                    display: 'flex'
                }}
                >
                {this.keyS.generateKeyControlUI(canvasInfo)}
                {/* Text UI */}
                <Label
                    uiTransform={{
                    positionType: 'relative',
                    margin: { left: scalePixelWidth(5, canvasInfo) * KEY_UI_SCALE },
                    }}
                    value="<b>to move Backward</b>"
                    fontSize={scalePixelHeight(KEY_TEXT_FONT_SIZE, canvasInfo) * KEY_UI_SCALE}
                    font="sans-serif"
                    color={Color4.White()}
                />
                </UiEntity>
                <UiEntity
                //KEY A
                uiTransform={{
                    flexDirection: 'row',
                    width: '100%',
                    height: scalePixelHeight(40, canvasInfo) * KEY_UI_SCALE,
                    positionType: 'relative',
                    margin: { top: scalePixelHeight(10, canvasInfo) * KEY_UI_SCALE},
                    padding: { left: scalePixelWidth(10, canvasInfo) * KEY_UI_SCALE, right: scalePixelWidth(10, canvasInfo) * KEY_UI_SCALE},
                    position: { top: '0%', left: '0%' },
                    display: 'flex'
                }}
                >
                {this.keyA.generateKeyControlUI(canvasInfo)}
                {/* Text UI */}
                <Label
                    uiTransform={{
                    positionType: 'relative',
                    margin: { left: scalePixelWidth(5, canvasInfo) * KEY_UI_SCALE },
                    }}
                    value="<b>to move Left</b>"
                    fontSize={scalePixelHeight(KEY_TEXT_FONT_SIZE, canvasInfo) * KEY_UI_SCALE}
                    font="sans-serif"
                    color={Color4.White()}
                />
                </UiEntity>
                <UiEntity
                //KEY D
                uiTransform={{
                    flexDirection: 'row',
                    width: '100%',
                    height: scalePixelHeight(40, canvasInfo) * KEY_UI_SCALE,
                    positionType: 'relative',
                    margin: { top: scalePixelHeight(10, canvasInfo) * KEY_UI_SCALE},
                    padding: { left: scalePixelWidth(10, canvasInfo) * KEY_UI_SCALE, right: scalePixelWidth(10, canvasInfo) * KEY_UI_SCALE},
                    position: { top: '0%', left: '0%' },
                    display: 'flex'
                }}
                >
                {this.keyD.generateKeyControlUI(canvasInfo)}
                {/* Text UI */}
                <Label
                    uiTransform={{
                    positionType: 'relative',
                    margin: { left: scalePixelWidth(5, canvasInfo) * KEY_UI_SCALE },
                    }}
                    value="<b>to move Right</b>"
                    fontSize={scalePixelHeight(KEY_TEXT_FONT_SIZE, canvasInfo) * KEY_UI_SCALE}
                    font="sans-serif"
                    color={Color4.White()}
                />
                </UiEntity>
            </UiEntity>
        )
    }
}