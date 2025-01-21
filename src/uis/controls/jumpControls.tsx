import { DeepReadonlyObject, PBUiCanvasInformation } from "@dcl/sdk/ecs";
import { Color4 } from "@dcl/sdk/math";
import ReactEcs, { UiEntity, Label } from "@dcl/sdk/react-ecs";
import { KEY_TEXT_FONT_SIZE, CONTROLS_BACKGROUND_IMG, TITLE_TEXT_FONT_SIZE, CONTROLS_BACKGROUND_SLICES } from "./controlsAssetsConfig";
import { KeyControlWidget, KeyType } from "./keyControl";


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
                width: '440px',
                height: '118px',
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
                        texture: { src: 'assets/ui/controls/UI_Controls_Icon.png'},
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
                    value="<b>TO JUMP</b>"
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
                >
                    <Label
                        uiTransform={{
                        positionType: 'relative',
                        margin: { left: '5px' },
                        }}
                        value="<b>Hold</b>"
                        fontSize={KEY_TEXT_FONT_SIZE}
                        font="sans-serif"
                        color={Color4.White()}
                    />
                    {this.keySpace.generateKeyControlUI()}
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
                    {this.keyWinJump.generateKeyControlUI()}
                    <Label
                        uiTransform={{
                        positionType: 'relative',
                        margin: { left: '5px' },
                        }}
                        value="<b>To Jump Forward</b>"
                        fontSize={KEY_TEXT_FONT_SIZE}
                        font="sans-serif"
                        color={Color4.White()}
                    />
                </UiEntity>
            </UiEntity>
        )      
    }
}