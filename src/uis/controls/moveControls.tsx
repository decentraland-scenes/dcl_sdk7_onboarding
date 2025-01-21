import { DeepReadonlyObject, PBUiCanvasInformation } from "@dcl/sdk/ecs";
import { Color4 } from "@dcl/sdk/math";
import ReactEcs, { UiEntity, Label } from "@dcl/sdk/react-ecs";
import { KEY_TEXT_FONT_SIZE, CONTROLS_BACKGROUND_IMG, TITLE_TEXT_FONT_SIZE, CONTROLS_BACKGROUND_SLICES } from "./controlsAssetsConfig";
import { KeyControlWidget, KeyType } from "./keyControl";


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
                width: '257px',
                height: '268px',
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
                    value="<b>MOVE</b>"
                    fontSize={TITLE_TEXT_FONT_SIZE}
                    font="monospace"
                    color={Color4.White()}
                    />
                </UiEntity>
                <UiEntity
                //KEY W
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
                {this.keyW.generateKeyControlUI()}
                {/* Text UI */}
                <Label
                    uiTransform={{
                    positionType: 'relative',
                    margin: { left: '5px' },
                    }}
                    value="<b>to move Forward</b>"
                    fontSize={KEY_TEXT_FONT_SIZE}
                    font="sans-serif"
                    color={Color4.White()}
                />
                </UiEntity>
                <UiEntity
                //KEY S
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
                {this.keyS.generateKeyControlUI()}
                {/* Text UI */}
                <Label
                    uiTransform={{
                    positionType: 'relative',
                    margin: { left: '5px' },
                    }}
                    value="<b>to move Backward</b>"
                    fontSize={KEY_TEXT_FONT_SIZE}
                    font="sans-serif"
                    color={Color4.White()}
                />
                </UiEntity>
                <UiEntity
                //KEY A
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
                {this.keyA.generateKeyControlUI()}
                {/* Text UI */}
                <Label
                    uiTransform={{
                    positionType: 'relative',
                    margin: { left: '5px' },
                    }}
                    value="<b>to move Left</b>"
                    fontSize={KEY_TEXT_FONT_SIZE}
                    font="sans-serif"
                    color={Color4.White()}
                />
                </UiEntity>
                <UiEntity
                //KEY D
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
                {this.keyD.generateKeyControlUI()}
                {/* Text UI */}
                <Label
                    uiTransform={{
                    positionType: 'relative',
                    margin: { left: '5px' },
                    }}
                    value="<b>to move Right</b>"
                    fontSize={KEY_TEXT_FONT_SIZE}
                    font="sans-serif"
                    color={Color4.White()}
                />
                </UiEntity>
            </UiEntity>
        )
    }
}