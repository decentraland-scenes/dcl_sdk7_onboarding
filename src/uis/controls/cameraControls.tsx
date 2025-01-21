import { DeepReadonlyObject, PBUiCanvasInformation } from "@dcl/sdk/ecs";
import { Color4 } from "@dcl/sdk/math";
import ReactEcs, { UiEntity, Label } from "@dcl/sdk/react-ecs";
import { KEY_TEXT_FONT_SIZE, CONTROLS_BACKGROUND_IMG, TITLE_TEXT_FONT_SIZE, CONTROLS_BACKGROUND_SLICES } from "./controlsAssetsConfig";
import { KeyControlWidget, KeyType } from "./keyControl";


export class CameraControlsUI {

    cameraContainerVisible = false
    readonly keyV: KeyControlWidget
    
    constructor() {
        this.keyV = new KeyControlWidget(KeyType.V)
        this.keyV.enableKeyProgress(false)
        this.keyV.enableAnim(false)
    }
    generateUI(canvasInfo: DeepReadonlyObject<PBUiCanvasInformation>): ReactEcs.JSX.Element | undefined {
        if(this.cameraContainerVisible == false) {
            return;
        }
        return (
            <UiEntity
            //BACKGROUND
            uiTransform={{
                flexDirection: 'column',
                width: '374px',
                height: '186px',
                alignSelf: 'flex-end',
                justifyContent: 'flex-start',
                positionType: 'relative',
                margin: { right: '35px' },
                padding: { top: '10px', left: '10px', right: '10px', bottom: '15px'},
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
                    height: '43px',
                    positionType: 'relative',
                    alignContent: 'center',
                    padding: {left: '14px', right: '14px'},
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
                        width: '24px',
                        height: '24px',
                        //margin: {left: '14px', right: '14px'},
                    }}
                    uiBackground={{
                        texture: { src: 'assets/ui/controls/UI_Camera_Icon.png'},
                        textureMode: 'center',
                        //color: Color4.create(22, 21, 24, 1)
                    }}
                    />
                    {/* Text UI */}
                    <Label
                    uiTransform={{
                        positionType: 'relative',
                        alignSelf: 'flex-start',
                        height: '95%',
                        margin: { left: '5px' },
                    }}
                    /*uiBackground={{
                        color: Color4.create(1, 0, 0, 1)
                    }}*/
                    textAlign='middle-left'
                    value="<b>CHANGE CAMERA</b>"
                    fontSize={TITLE_TEXT_FONT_SIZE}
                    font="monospace"
                    color={Color4.White()}
                    />
                </UiEntity>
                <UiEntity
                //INSTRUCTION LINE
                    uiTransform={{
                        flexDirection: 'row',
                        width: '100%',
                        height: '40px',
                        positionType: 'relative',
                        margin: { top: '10px'},
                        padding: { left: '10px', right: '10px'},
                        position: { top: '0%', left: '0%' },
                        display: 'flex'
                    }}
                >
                    <Label
                        uiTransform={{
                        positionType: 'relative',
                        margin: { left: '5px' },
                        }}
                        value="<b>Press</b>"
                        fontSize={KEY_TEXT_FONT_SIZE}
                        font="sans-serif"
                        color={Color4.White()}
                    />
                    {this.keyV.generateKeyControlUI()}
                    <Label
                        uiTransform={{
                        positionType: 'relative',
                        margin: { left: '5px' },
                        }}
                        value="<b>to switch between camera modes</b>"
                        fontSize={KEY_TEXT_FONT_SIZE}
                        font="sans-serif"
                        color={Color4.White()}
                    />
                </UiEntity>
                <UiEntity
                //INSTRUCTION LINE
                    uiTransform={{
                        flexDirection: 'row',
                        width: '100%',
                        height: '40px',
                        positionType: 'relative',
                        margin: { top: '10px'},
                        padding: { left: '10px', right: '10px'},
                        position: { top: '0%', left: '0%' },
                        display: 'flex'
                    }}
                >
                    <Label
                        uiTransform={{
                        positionType: 'relative',
                        margin: { left: '5px' },
                        }}
                        value="<b>Scroll</b>"
                        fontSize={KEY_TEXT_FONT_SIZE}
                        font="sans-serif"
                        color={Color4.White()}
                    />
                    <UiEntity
                    //Icon Img
                        uiTransform={{
                        positionType: 'relative',
                        alignSelf: 'center',
                        width: '23px',
                        height: '23px',
                        }}
                        uiBackground={{
                            texture: { src: 'assets/ui/controls/UI_Wheel_Orange_Icon.png'},
                            textureMode: 'center',
                            //color: Color4.create(22, 21, 24, 1)
                        }}
                    />
                    <Label
                        uiTransform={{
                        positionType: 'relative',
                        margin: { left: '5px' },
                        }}
                        value="<b>Up To Use 1st Person Camera</b>"
                        fontSize={KEY_TEXT_FONT_SIZE}
                        font="sans-serif"
                        color={Color4.White()}
                    />
                </UiEntity>
                <UiEntity
                //INSTRUCTION LINE
                    uiTransform={{
                        flexDirection: 'row',
                        width: '100%',
                        height: '40px',
                        positionType: 'relative',
                        margin: { top: '10px'},
                        padding: { left: '10px', right: '10px'},
                        position: { top: '0%', left: '0%' },
                        display: 'flex'
                    }}
                >
                    <Label
                        uiTransform={{
                        positionType: 'relative',
                        margin: { left: '5px' },
                        }}
                        value="<b>Scroll</b>"
                        fontSize={KEY_TEXT_FONT_SIZE}
                        font="sans-serif"
                        color={Color4.White()}
                    />
                    <UiEntity
                    //Icon Img
                        uiTransform={{
                        positionType: 'relative',
                        alignSelf: 'center',
                        width: '23px',
                        height: '23px',
                        }}
                        uiBackground={{
                            texture: { src: 'assets/ui/controls/UI_Wheel_Orange_Icon.png'},
                            textureMode: 'center',
                            //color: Color4.create(22, 21, 24, 1)
                        }}
                    />
                    <Label
                        uiTransform={{
                        positionType: 'relative',
                        margin: { left: '5px' },
                        }}
                        value="<b>Down To Use Drone View</b>"
                        fontSize={KEY_TEXT_FONT_SIZE}
                        font="sans-serif"
                        color={Color4.White()}
                    />
                </UiEntity>
            </UiEntity>
        )      
    }
}