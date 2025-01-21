import { DeepReadonlyObject, PBUiCanvasInformation } from "@dcl/sdk/ecs";
import { Color4 } from "@dcl/sdk/math";
import ReactEcs, { UiEntity, Label } from "@dcl/sdk/react-ecs";
import { KEY_TEXT_FONT_SIZE, CONTROLS_BACKGROUND_IMG, TITLE_TEXT_FONT_SIZE, CONTROLS_BACKGROUND_SLICES } from "./controlsAssetsConfig";
import { KeyControlWidget, KeyType } from "./keyControl";


export class LookControlsUI {

    lookContainerVisible = false

    constructor() {}
    generateUI(canvasInfo: DeepReadonlyObject<PBUiCanvasInformation>): ReactEcs.JSX.Element | undefined {
            if(this.lookContainerVisible == false) {
                return;
            }
            return (
                <UiEntity
                //BACKGROUND
                uiTransform={{
                    flexDirection: 'column',
                    width: '366px',
                    height: '169px',
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
                            texture: { src: 'assets/ui/controls/UI_Preview_Icon.png'},
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
                        value="<b>LOOK AROUND</b>"
                        fontSize={TITLE_TEXT_FONT_SIZE}
                        font="monospace"
                        color={Color4.White()}
                        />
                    </UiEntity>
                    <UiEntity
                    //INSTRUCTIONS
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
                            texture: { src: 'assets/ui/controls/UI_LeftClick_Orange_Icon.png'},
                            textureMode: 'center',
                            //color: Color4.create(22, 21, 24, 1)
                            }}
                        />
                        <Label
                            uiTransform={{
                            positionType: 'relative',
                            margin: { left: '5px' },
                            }}
                            value="<b>And Drag To Look Around</b>"
                            fontSize={KEY_TEXT_FONT_SIZE}
                            font="sans-serif"
                            color={Color4.White()}
                        />
                    
                    </UiEntity>
                    <UiEntity
                    //INSTRUCTIONS
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
                            value="<b>To Lock The Cursor</b>"
                            fontSize={KEY_TEXT_FONT_SIZE}
                            font="sans-serif"
                            color={Color4.White()}
                        />
                    
                    </UiEntity>
                </UiEntity>
            )      
        }
    }