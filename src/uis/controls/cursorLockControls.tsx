import { DeepReadonlyObject, PBUiCanvasInformation } from "@dcl/sdk/ecs";
import { Color4 } from "@dcl/sdk/math";
import ReactEcs, { UiEntity, Label } from "@dcl/sdk/react-ecs";
import { KEY_TEXT_FONT_SIZE, CONTROLS_BACKGROUND_IMG, TITLE_TEXT_FONT_SIZE, CONTROLS_BACKGROUND_SLICES } from "./controlsAssetsConfig";
import { KeyControlWidget, KeyType } from "./keyControl";


export class CursorLockControlsUI {

    cursorLockContainerVisible = false

    constructor() {}
    generateUI(canvasInfo: DeepReadonlyObject<PBUiCanvasInformation>): ReactEcs.JSX.Element | undefined {
            if(this.cursorLockContainerVisible == false) {
                return;
            }
            return (
                <UiEntity
                //BACKGROUND
                uiTransform={{
                    flexDirection: 'column',
                    width: '366px',
                    height: '230px',
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
                            texture: { src: 'assets/ui/controls/UI_Cursor_Icon.png'},
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
                        value="<b>CURSOR LOCKED</b>"
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
                        /*uiBackground={{
                            color: Color4.create(1, 0, 0, 1)
                        }}*/
                    >
                        <Label
                            uiTransform={{
                                positionType: 'relative',
                            }}
                            value="<b>Tip:</b> While the cursor is locked, you can move the camera freely holding the mouse, but you cannot interact with the interface."
                            fontSize={KEY_TEXT_FONT_SIZE}
                            textAlign="middle-left"
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
                        /*uiBackground={{
                            color: Color4.create(1, 0, 0, 1)
                        }}*/
                    >
                        <Label
                            uiTransform={{
                            positionType: 'relative',
                            }}
                            value="<b>Move</b>"
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
                            texture: { src: 'assets/ui/controls/UI_Mouse_Icon.png'},
                            textureMode: 'center',
                            //color: Color4.create(22, 21, 24, 1)
                            }}
                        />
                        <Label
                            uiTransform={{
                            positionType: 'relative',
                            margin: { left: '5px' },
                            }}
                            value="<b>To Look Around</b>"
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
                        /*uiBackground={{
                            color: Color4.create(1, 0, 0, 1)
                        }}*/
                    >
                        <UiEntity
                        //Icon Img
                            uiTransform={{
                            positionType: 'relative',
                            alignSelf: 'center',
                            width: '23px',
                            height: '23px',
                            }}
                            uiBackground={{
                            texture: { src: 'assets/ui/controls/UI_RightClick_Orange_Icon.png'},
                            textureMode: 'center',
                            //color: Color4.create(22, 21, 24, 1)
                            }}
                        />
                        <Label
                            uiTransform={{
                            positionType: 'relative',
                            margin: { left: '5px' },
                            }}
                            value="<b>Or</b>"
                            fontSize={KEY_TEXT_FONT_SIZE}
                            font="sans-serif"
                            color={Color4.White()}
                        />
                        <UiEntity
                        //Icon Img
                            uiTransform={{
                            positionType: 'relative',
                            alignSelf: 'center',
                            width: '40px',
                            height: '23px',
                            }}
                            uiBackground={{
                            texture: { src: 'assets/ui/controls/UI_Key_Esc.png'},
                            textureMode: 'center',
                            //color: Color4.create(22, 21, 24, 1)
                            }}
                        />
                        <Label
                            uiTransform={{
                            positionType: 'relative',
                            margin: { left: '5px' },
                            }}
                            value="<b>To Unlock</b>"
                            fontSize={KEY_TEXT_FONT_SIZE}
                            font="sans-serif"
                            color={Color4.White()}
                        />
                    
                    </UiEntity>
                </UiEntity>
            )      
        }
    }