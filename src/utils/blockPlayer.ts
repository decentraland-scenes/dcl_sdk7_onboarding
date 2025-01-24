import { InputModifier, engine } from "@dcl/sdk/ecs"


export function lockPlayer(){
    
    InputModifier.createOrReplace(engine.PlayerEntity, {
        mode: {
          $case: 'standard',
          standard: {
            disableAll: true
          }
        }
      })

}

export function unlockPlayer(){

    InputModifier.createOrReplace(engine.PlayerEntity, {
        mode: {
          $case: 'standard',
          standard: {
            disableAll: false
          }
        }
      })
    
}