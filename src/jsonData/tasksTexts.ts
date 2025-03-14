export type Objectives = {
  text: { en: string }
  missionInfo: { en: string, steps?: number }
  fontSize: number
  vAlign: string
  completed: boolean
  callback?: Function
}
export type Tasks = {
  texts: Objectives[] //All missions of a quest
}
export const textQuests: Tasks[] = [
  {
    texts: [
      //0 Quest 0 room
      {
        text: {
          //Task 0
          en: 'Learn how to move'
        },
        missionInfo: {
          en: 'Move your avatar in \nevery direction.',
          steps: 4
        },
        fontSize: 14,
        vAlign: '0%',
        completed: false
      }
    ]
  },
  {
    texts: [
      //1 Quest 0 room
      {
        text: {
          //Task 0
          en: 'Learn how to turn the camera'
        },
        missionInfo: {
          en: 'Look around to find \nthe glowing orb'
        },
        fontSize: 14,
        vAlign: '0%',
        completed: false
      }
    ]
  },
  {
    texts: [
      //2 Quest 1 room
      {
        text: {
          //Task 0
          en: 'Follow Tobor'
        },
        missionInfo: {
          en: 'Jump the tree and follow Tobor.'
        },
        fontSize: 14,
        vAlign: '0%',
        completed: false
      }
    ]
  },
  {
    texts: [
      //3 Quest 2 room
      {
        text: {
          //Task 0
          en: 'Go to the first tower'
        },
        missionInfo: {
          en: 'Talk with Tobor at the pillar.'
        },
        fontSize: 14,
        vAlign: '0%',
        completed: false
      }
    ]
  },
  {
    texts: [
      //4 Quest 3 room
      {
        text: {
          //Task 0
          en: 'Find Bezier'
        },
        missionInfo: {
          en: 'Find Bezier at second island.'
        },
        fontSize: 14,
        vAlign: '0%',
        completed: false
      }
    ]
  },
  {
    texts: [
      //5 Quest 4 room
      {
        text: {
          //Task 0
          en: 'Help Bezier'
        },
        missionInfo: {
          en: 'Do 3 emotes by pressing: \nB + any number.',
          steps: 3
        },
        fontSize: 14,
        vAlign: '0%',
        completed: false
      }
    ]
  },
  {
    texts: [
      //6 Quest 5 room
      {
        text: {
          //Task 0
          en: 'Find Mat'
        },
        missionInfo: {
          en: 'Find Mat at third island.'
        },
        fontSize: 14,
        vAlign: '0%',
        completed: false
      }
    ]
  },
  {
    texts: [
      //7 Quest 6 room
      {
        text: {
          //Task 0
          en: 'Search components'
        },
        missionInfo: {
          en: 'Search and collect triangles \nand material boxes.',
          steps: 2
        },
        fontSize: 14,
        vAlign: '0%',
        completed: false
      }
    ]
  },
  {
    texts: [
      //8 Quest 7 room
      {
        text: {
          //Task 0
          en: 'Deliver the components'
        },
        missionInfo: {
          en: 'Come back and give \nthe components to Mat.'
        },
        fontSize: 14,
        vAlign: '0%',
        completed: false
      }
    ]
  },
  {
    texts: [
      //9 Quest 8 room
      {
        text: {
          //Task 0
          en: 'Find Kit'
        },
        missionInfo: {
          en: 'Find Kit at last island.'
        },
        fontSize: 14,
        vAlign: '0%',
        completed: false
      }
    ]
  },
  {
    texts: [
      //10 Quest 9 room
      {
        text: {
          //Task 0
          en: 'Restore the energy'
        },
        missionInfo: {
          en: 'Fix the connections \nto restore the energy.',
          steps: 3
        },
        fontSize: 14,
        vAlign: '0%',
        completed: false
      }
    ]
  },
  {
    texts: [
      //11 Quest 10 room
      {
        text: {
          //Task 0
          en: 'Help Kit'
        },
        missionInfo: {
          en: 'Report back to Kit.' //Learn about DCL events
        },
        fontSize: 14,
        vAlign: '0%',
        completed: false
      }
    ]
  },
  {
    texts: [
      //12 Quest 11 room
      {
        text: {
          en: 'Go to the portal'
        },
        missionInfo: {
          en: 'Find Tobor at portals.'
        },
        fontSize: 14,
        vAlign: '0%',
        completed: false
      }
    ]
  },
  {
    texts: [
      //13 Quest 12 room
      {
        //Task 2
        text: {
          en: 'Choose your next experience'
        },
        missionInfo: {
          en: 'Cross one of the portals \nto Decentraland.'
        },
        fontSize: 14,
        vAlign: '0%',
        completed: false
      }
    ]
  },
  {
    texts: [
      //14 Quest 13
    ]
  },
  {
    texts: [
      //15 Quest 14
      {
        text: {
          //Task 0
          en: 'Help Kit'
        },
        missionInfo: {
          en: 'Help to build the stage.'
        },
        fontSize: 14,
        vAlign: '0%',
        completed: false
      }
    ]
  },
  {
    texts: [
      //16 Quest 15
      {
        text: {
          //Task 0
          en: 'Search componets'
        },
        missionInfo: {
          en: 'Search a triangles & materials \nboxes.' //Learn about DCL builders
        },
        fontSize: 14,
        vAlign: '0%',
        completed: false
      }
    ]
  },
  {
    texts: [
      //17 Quest 16
      {
        text: {
          //Task 0
          en: 'Delivery materials'
        },
        missionInfo: {
          en: 'Come back with Mat.'
        },
        fontSize: 14,
        vAlign: '0%',
        completed: false
      }
    ]
  },
  {
    texts: [
      //18 Quest 17
      {
        text: {
          //Task 0
          en: 'Go to the party'
        },
        missionInfo: {
          en: 'Come back with Kit at the stage area.'
        },
        fontSize: 14,
        vAlign: '0%',
        completed: false
      }
    ]
  },
  {
    texts: [
      //19 Quest 18
      {
        text: {
          //Task 0
          en: 'Go to portal'
        },
        missionInfo: {
          en: 'Speak with tobor next to portal.'
        },
        fontSize: 14,
        vAlign: '0%',
        completed: false
      }
    ]
  },
  {
    texts: [
      //20 Quest 19
      {
        text: {
          //Task 0
          en: 'Help Kit'
        },
        missionInfo: {
          en: 'Help the friendly pals to build the stage.'
        },
        fontSize: 14,
        vAlign: '0%',
        completed: false
      }
    ]
  },
  {
    texts: [
      //21 Quest 20
      {
        text: {
          //Task 0
          en: 'Help Kit'
        },
        missionInfo: {
          en: 'Deploy party.'
        },
        fontSize: 14,
        vAlign: '0%',
        completed: false
      }
    ]
  }
]

export function getTaskTexts(questId: number, taskId: number): Objectives {
  if (questId < 0 || questId >= textQuests.length) {
    console.error(`Quest ID ${questId} is out of bounds`)
  }

  const quest = textQuests[questId]

  if (taskId < 0 || taskId >= quest.texts.length) {
    console.error(`Task ID ${taskId} is out of bounds`)
  }

  return quest.texts[taskId]
}
