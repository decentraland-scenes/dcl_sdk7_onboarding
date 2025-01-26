import { DeepReadonlyObject, PBUiCanvasInformation } from "@dcl/sdk/ecs";
import { Color4 } from "@dcl/sdk/math";
import ReactEcs, { UiEntity, Label } from "@dcl/sdk/react-ecs";
import { KEY_TEXT_FONT_SIZE, CONTROLS_BACKGROUND_IMG, TITLE_TEXT_FONT_SIZE, CONTROLS_BACKGROUND_SLICES } from "./controlsAssetsConfig";
import { KeyControlWidget, KeyType } from "./keyControl";


export class EmoteControlsUI {

    emoteContainerVisible = false

    readonly keyB: KeyControlWidget
    readonly keyB2: KeyControlWidget
    readonly keyNumber: KeyControlWidget

    constructor() {
        this.keyB = new KeyControlWidget(KeyType.B)
        this.keyB2 = new KeyControlWidget(KeyType.B)
        this.keyNumber = new KeyControlWidget(KeyType.NUMBER)
        this.keyB.enableKeyProgress(false)
        this.keyB.enableAnim(false)
        this.keyB.pressedProgress = 1
        this.keyNumber.enableKeyProgress(false)
        this.keyNumber.enableAnim(false)
        this.keyB2.enableKeyProgress(false)
        this.keyB2.enableAnim(false)
    }
    generateUI(canvasInfo: DeepReadonlyObject<PBUiCanvasInformation>): ReactEcs.JSX.Element | undefined {
            if(this.emoteContainerVisible == false) {
                return;
            }
            return (
                <UiEntity
                //BACKGROUND
                uiTransform={{
                    flexDirection: 'column',
                    width: '423px',
                    height: '168px',
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
                            texture: { src: 'assets/ui/controls/UI_Emotes_Icon.png'},
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
                        value="<b>PLAY EMOTES</b>"
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
                            margin: { left: '5px' },
                            }}
                            value="<b>Press</b>"
                            fontSize={KEY_TEXT_FONT_SIZE}
                            font="sans-serif"
                            color={Color4.White()}
                        />
                        {this.keyB.generateKeyControlUI()}
                        <Label
                            uiTransform={{
                            positionType: 'relative',
                            margin: { left: '5px' },
                            }}
                            value="<b>To Open The Emote Wheel</b>"
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
                        {this.keyB2.generateKeyControlUI()}
                        <Label
                            uiTransform={{
                            positionType: 'relative',
                            margin: { left: '5px' },
                            }}
                            value="<b>And</b>"
                            fontSize={KEY_TEXT_FONT_SIZE}
                            font="sans-serif"
                            color={Color4.White()}
                        />
                        {this.keyNumber.generateKeyControlUI()}
                        <Label
                            uiTransform={{
                            positionType: 'relative',
                            margin: { left: '5px' },
                            }}
                            value="<b>As A Emote Shortcut</b>"
                            fontSize={KEY_TEXT_FONT_SIZE}
                            font="sans-serif"
                            color={Color4.White()}
                        />
                    
                    </UiEntity>
                </UiEntity>
            )      
        }
    }