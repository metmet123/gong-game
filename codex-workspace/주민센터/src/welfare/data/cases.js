(function(root){"use strict";const cases=[
  {
    "contractVersion": 1,
    "status": "runtime",
    "contentVersion": 1,
    "title": "같은 주소, 다른 하루",
    "fictional": true,
    "people": [
      {
        "id": "P1",
        "name": "박정임",
        "role": "상담 당사자"
      },
      {
        "id": "P2",
        "name": "김하나",
        "role": "연락 확인 대상"
      },
      {
        "id": "P3",
        "name": "오민수",
        "role": "도움 요청 이웃"
      }
    ],
    "organizations": [
      {
        "id": "O1",
        "name": "모퉁이복지관",
        "fictional": true
      }
    ],
    "sources": [
      {
        "id": "S01",
        "title": "이웃의 도움 요청",
        "authorId": "P3",
        "recordedAt": "이번 근무",
        "effectivePeriod": "최근 며칠",
        "initiallyAvailable": true,
        "statements": [
          {
            "id": "E01",
            "text": "식사를 거르는 날이 보여 걱정된다. 사정은 당사자에게 확인해 달라.",
            "supports": [
              "concern-meal"
            ],
            "doesNotEstablish": [
              "living-alone",
              "meal-cause"
            ]
          }
        ]
      },
      {
        "id": "S02",
        "title": "이전 상담 기록",
        "authorId": "resident-center",
        "recordedAt": "3개월 전",
        "effectivePeriod": "3개월 전 당시",
        "initiallyAvailable": true,
        "statements": [
          {
            "id": "E02",
            "text": "김하나는 박정임의 딸이다.",
            "supports": [
              "daughter-of"
            ]
          },
          {
            "id": "E03",
            "text": "당시 두 사람은 같은 집에 거주했다.",
            "supports": [
              "past-cohabiting"
            ],
            "doesNotEstablish": [
              "current-cohabiting"
            ]
          }
        ]
      },
      {
        "id": "S03",
        "title": "당사자의 현재 생활",
        "authorId": "P1",
        "recordedAt": "이번 근무",
        "effectivePeriod": "현재",
        "initiallyAvailable": false,
        "statements": [
          {
            "id": "E04",
            "text": "딸은 지난달 다른 지역으로 옮겼고 현재 혼자 지낸다.",
            "supports": [
              "living-alone",
              "not-current-cohabiting"
            ]
          },
          {
            "id": "E05",
            "text": "장보기와 식사 준비가 어렵다.",
            "supports": [
              "meal-preparation-need"
            ]
          },
          {
            "id": "E06",
            "text": "딸에게 확인하고 식사 지원 상담을 연결하는 데 동의한다.",
            "supports": [
              "consent-contact-daughter",
              "consent-meal-referral"
            ]
          }
        ]
      },
      {
        "id": "S04",
        "title": "딸의 도움 범위",
        "authorId": "P2",
        "recordedAt": "이번 근무",
        "effectivePeriod": "현재",
        "initiallyAvailable": false,
        "statements": [
          {
            "id": "E07",
            "text": "다른 지역에서 살며 저녁마다 전화로 연락한다.",
            "supports": [
              "not-current-cohabiting",
              "phone-contact"
            ]
          },
          {
            "id": "E08",
            "text": "매일 방문하는 도움은 제공할 수 없다.",
            "supports": [
              "no-daily-visits"
            ]
          }
        ]
      },
      {
        "id": "S05",
        "title": "모퉁이복지관 안내",
        "authorId": "O1",
        "recordedAt": "이번 근무",
        "effectivePeriod": "현재 가상 서비스 안내",
        "initiallyAvailable": true,
        "statements": [
          {
            "id": "E09",
            "text": "동의한 주민의 식사 지원 상담을 접수한다. 제공 여부와 일정은 상담 후 기관에서 확인한다.",
            "supports": [
              "meal-consultation-route"
            ],
            "doesNotEstablish": [
              "service-approved"
            ]
          }
        ]
      }
    ],
    "questions": [
      {
        "id": "Q01",
        "label": "당사자의 현재 생활과 연결 의사를 확인한다",
        "prerequisites": [],
        "answerSourceId": "S03"
      },
      {
        "id": "Q02",
        "label": "딸에게 현재 도움의 범위를 확인한다",
        "prerequisites": [
          "question:Q01",
          "statement:E06"
        ],
        "answerSourceId": "S04"
      }
    ],
    "claimDefinitions": [
      {
        "id": "C1",
        "subjectId": "P2",
        "objectId": "P1",
        "kind": "family",
        "choices": [
          "daughter",
          "neighbor",
          "unknown"
        ],
        "acceptedValue": "daughter",
        "evidenceAnyOf": [
          [
            "E02"
          ]
        ],
        "label": "김하나와 박정임의 가족관계"
      },
      {
        "id": "C2",
        "subjectId": "P2",
        "objectId": "P1",
        "kind": "current-cohabiting",
        "choices": [
          "yes",
          "no",
          "unknown"
        ],
        "acceptedValue": "no",
        "evidenceAnyOf": [
          [
            "E04"
          ],
          [
            "E07"
          ]
        ],
        "label": "현재 두 사람은 함께 사는가"
      },
      {
        "id": "C3",
        "subjectId": "P2",
        "objectId": "P1",
        "kind": "phone-contact",
        "choices": [
          "yes",
          "no",
          "unknown"
        ],
        "acceptedValue": "yes",
        "evidenceAnyOf": [
          [
            "E07"
          ]
        ],
        "label": "전화로 연락하는가"
      },
      {
        "id": "C4",
        "subjectId": "P2",
        "objectId": "P1",
        "kind": "daily-visits",
        "choices": [
          "yes",
          "no",
          "unknown"
        ],
        "acceptedValue": "no",
        "evidenceAnyOf": [
          [
            "E08"
          ]
        ],
        "label": "매일 방문해 돕는가"
      },
      {
        "id": "C5",
        "subjectId": "P1",
        "kind": "meal-preparation-need",
        "choices": [
          "yes",
          "no",
          "unknown"
        ],
        "acceptedValue": "yes",
        "evidenceAnyOf": [
          [
            "E05"
          ]
        ],
        "label": "지금 식사 준비에 어려움이 있는가"
      }
    ],
    "completion": {
      "requiredClaims": [
        "C1",
        "C2",
        "C4",
        "C5"
      ],
      "contactRepresentationAnyOf": [
        {
          "claimId": "C3",
          "value": "yes",
          "evidenceIds": [
            "E07"
          ]
        },
        {
          "cooperationNote": {
            "personId": "P2",
            "kind": "phone-contact",
            "evidenceIds": [
              "E07"
            ]
          }
        }
      ],
      "requiredPlan": {
        "id": "P-MEAL",
        "issueClaimId": "C5",
        "organizationId": "O1",
        "action": "consultation-request",
        "consentEvidenceId": "E06",
        "routeEvidenceId": "E09",
        "status": "requested"
      },
      "requiredFollowup": {
        "ownerRole": "resident-center:counselor",
        "due": "next-shift",
        "purpose": "confirm-consultation-receipt"
      },
      "outcome": "handoff-complete",
      "serviceApprovalAllowed": false,
      "allEvidenceMustBeAccessibleAndRead": true,
      "unknownClaimsAllowedForRequiredClaims": false
    },
    "epilogue": {
      "trigger": "next-center-shift",
      "eventId": "resident-center:welfare:W01:reply",
      "text": "복지관 상담 일정이 잡혔다는 답신을 확인한다.",
      "once": true
    },
    "itemId": "resident-center:welfare:W01:note",
    "mainRewards": {
      "xp": 0,
      "points": 0
    },
    "sourceReferences": [
      "https://www.ssis.or.kr/lay1/S1T756C779/contents.do"
    ],
    "sourceScope": "상담과 지원 연계의 큰 흐름만 참고; 사건과 처리 기준은 게임용 창작",
    "shortId": "W01",
    "intro": "이웃의 걱정과 3개월 전 기록이 도착했습니다. 지금의 생활을 확인하고, 누가 어떤 도움을 줄 수 있는지 판단해 주세요.",
    "choiceLabels": {
      "daughter": "딸",
      "neighbor": "이웃",
      "unknown": "확인 필요",
      "yes": "그렇다",
      "no": "아니다"
    },
    "plans": [
      {
        "id": "P-MEAL",
        "label": "모퉁이복지관에 식사 지원 상담 의뢰",
        "organizationId": "O1",
        "action": "consultation-request",
        "status": "requested",
        "evidenceIds": [
          "E06",
          "E09"
        ],
        "consentEvidenceId": "E06",
        "routeEvidenceId": "E09"
      },
      {
        "id": "P-CLOSE",
        "label": "가족이 있으므로 상담 종결",
        "action": "close-no-need",
        "evidenceIds": []
      },
      {
        "id": "P-APPROVE",
        "label": "식사 서비스 제공을 확정",
        "action": "approve",
        "status": "approved",
        "evidenceIds": [
          "E09"
        ]
      }
    ],
    "followups": [
      {
        "id": "receipt",
        "label": "담당 직원 · 다음 근무일 · 상담 접수 여부 확인",
        "ownerRole": "resident-center:counselor",
        "due": "next-shift",
        "purpose": "confirm-consultation-receipt"
      },
      {
        "id": "daughter",
        "label": "딸에게 매일 방문을 맡기고 종결",
        "ownerRole": "P2",
        "due": "daily",
        "purpose": "daily-visits"
      }
    ],
    "acceptedPaths": [
      {
        "claims": {
          "C1": {
            "value": "daughter",
            "evidenceAnyOf": [
              [
                "E02"
              ]
            ]
          },
          "C2": {
            "value": "no",
            "evidenceAnyOf": [
              [
                "E04"
              ],
              [
                "E07"
              ]
            ]
          },
          "C3": {
            "value": "yes",
            "evidenceAnyOf": [
              [
                "E07"
              ]
            ]
          },
          "C4": {
            "value": "no",
            "evidenceAnyOf": [
              [
                "E08"
              ]
            ]
          },
          "C5": {
            "value": "yes",
            "evidenceAnyOf": [
              [
                "E05"
              ]
            ]
          }
        },
        "plans": [
          "P-MEAL"
        ],
        "followup": "receipt"
      }
    ],
    "itemName": "첫 상담 메모",
    "ending": "“어디에 이야기하면 되는지 알겠네요.” 정임의 동의를 담은 상담 의뢰가 준비되었습니다.",
    "id": "resident-center:welfare:W01"
  },
  {
    "contentVersion": 1,
    "fictional": true,
    "choiceLabels": {
      "yes": "그렇다",
      "no": "아니다",
      "unknown": "확인 필요",
      "ended": "종료됨",
      "ongoing": "진행 중",
      "temporary": "일시적 도움",
      "stable": "정기적 도움"
    },
    "mainRewards": {
      "xp": 0,
      "points": 0
    },
    "sourceReferences": [
      "https://www.ssis.or.kr/lay1/S1T756C779/contents.do"
    ],
    "sourceScope": "상담과 지원 연계의 큰 흐름만 참고; 사건과 처리 기준은 게임용 창작",
    "id": "resident-center:welfare:W02",
    "shortId": "W02",
    "title": "끝난 지원, 남아 있는 기록",
    "intro": "태호는 생활비 상담을 요청했습니다. 지난 기록에는 지원이 진행 중이라고 적혀 있어요. 기록이 언제의 상황을 말하는지 구분해 주세요.",
    "people": [
      {
        "id": "P1",
        "name": "윤태호",
        "role": "상담 당사자"
      },
      {
        "id": "P2",
        "name": "이선우",
        "role": "제공기관 연락 담당"
      },
      {
        "id": "P3",
        "name": "박정임",
        "role": "앞선 상담 주민"
      }
    ],
    "organizations": [
      {
        "id": "O1",
        "name": "생활보장과 상담 담당"
      }
    ],
    "sources": [
      {
        "id": "S01",
        "title": "오늘의 상담 요청",
        "authorId": "P1",
        "recordedAt": "이번 근무",
        "effectivePeriod": "현재",
        "initiallyAvailable": true,
        "statements": [
          {
            "id": "E01",
            "text": "최근 일거리가 줄어 생활비 상담이 필요하다."
          }
        ]
      },
      {
        "id": "S02",
        "title": "지난달 상담표",
        "authorId": "resident-center",
        "recordedAt": "지난 상담",
        "effectivePeriod": "지난달 1일 당시",
        "initiallyAvailable": true,
        "statements": [
          {
            "id": "E02",
            "text": "지난달에는 단기 식사 지원을 받고 있었다. 진행 중으로 기재되어 있다."
          }
        ]
      },
      {
        "id": "S03",
        "title": "당사자의 현재 진술",
        "authorId": "P1",
        "recordedAt": "이번 근무",
        "effectivePeriod": "현재",
        "initiallyAvailable": false,
        "statements": [
          {
            "id": "E03",
            "text": "식사 지원은 지난달 말까지 받았다. 지금은 끝난 것으로 알고 있다."
          }
        ]
      },
      {
        "id": "S04",
        "title": "제공기관 확인",
        "authorId": "P2",
        "recordedAt": "이번 근무",
        "effectivePeriod": "현재 · 적용 종료일 지난달 말",
        "initiallyAvailable": false,
        "statements": [
          {
            "id": "E04",
            "text": "단기 식사 지원은 지난달 말 종료되었다. 현재 제공 중인 지원은 없다."
          }
        ]
      },
      {
        "id": "S05",
        "title": "현재 상담 창구",
        "authorId": "O1",
        "recordedAt": "이번 근무",
        "effectivePeriod": "현재 가상 안내",
        "initiallyAvailable": true,
        "statements": [
          {
            "id": "E05",
            "text": "현재 생활비 어려움은 생활보장과 상담 담당에게 상담을 요청할 수 있다. 실제 지원 결정은 별도 확인이다."
          }
        ]
      },
      {
        "id": "S06",
        "title": "연락과 연결 동의",
        "authorId": "P1",
        "recordedAt": "이번 근무",
        "effectivePeriod": "현재",
        "initiallyAvailable": false,
        "statements": [
          {
            "id": "E06",
            "text": "제공기관의 지원 기간 확인과 생활비 상담 연결에 동의한다."
          }
        ]
      }
    ],
    "questions": [
      {
        "id": "Q01",
        "label": "당사자에게 지원 기간과 현재 생활을 묻기",
        "prerequisites": [],
        "answerSourceId": "S03"
      },
      {
        "id": "Q02",
        "label": "연락·상담 연결 의사를 확인하기",
        "prerequisites": [
          "question:Q01"
        ],
        "answerSourceId": "S06"
      },
      {
        "id": "Q03",
        "label": "제공기관에 적용 종료일을 확인하기",
        "prerequisites": [
          "statement:E06"
        ],
        "answerSourceId": "S04",
        "pendingText": "기관이 아직 기간을 확인하고 있습니다. 확인 담당과 다음 근무일을 기록하면 인계할 수 있어요."
      }
    ],
    "claimDefinitions": [
      {
        "id": "C1",
        "label": "과거에 해당 지원을 받았는가",
        "subjectId": "P1",
        "choices": [
          "yes",
          "no",
          "unknown"
        ]
      },
      {
        "id": "C2",
        "label": "해당 지원이 현재도 진행 중인가",
        "subjectId": "P1",
        "choices": [
          "ongoing",
          "ended",
          "unknown"
        ]
      },
      {
        "id": "C3",
        "label": "현재 생활비 상담이 필요한가",
        "subjectId": "P1",
        "choices": [
          "yes",
          "no",
          "unknown"
        ]
      }
    ],
    "plans": [
      {
        "id": "P-LIVING",
        "label": "생활보장과에 생활비 상담 의뢰",
        "evidenceIds": [
          "E01",
          "E05",
          "E06"
        ],
        "action": "consultation-request",
        "status": "requested"
      },
      {
        "id": "P-CHECK",
        "label": "제공기관의 종료일 확인을 이어서 맡기기",
        "evidenceIds": [
          "E03",
          "E06"
        ],
        "action": "consultation-request",
        "status": "requested"
      },
      {
        "id": "P-CLOSE",
        "label": "기존 지원 기록이 있으므로 종결",
        "evidenceIds": [
          "E02"
        ],
        "action": "consultation-request",
        "status": "requested"
      }
    ],
    "followups": [
      {
        "id": "receipt",
        "label": "담당 직원 · 다음 근무일 · 상담 접수 여부 확인"
      },
      {
        "id": "period",
        "label": "담당 직원 · 다음 근무일 · 기관 종료일 답변 확인"
      }
    ],
    "acceptedPaths": [
      {
        "claims": {
          "C1": {
            "value": "yes",
            "evidenceAnyOf": [
              [
                "E02"
              ]
            ]
          },
          "C2": {
            "value": "ended",
            "evidenceAnyOf": [
              [
                "E04"
              ]
            ]
          },
          "C3": {
            "value": "yes",
            "evidenceAnyOf": [
              [
                "E01"
              ]
            ]
          }
        },
        "plans": [
          "P-LIVING"
        ],
        "followup": "receipt"
      }
    ],
    "pendingPath": {
      "claims": {
        "C1": {
          "value": "yes",
          "evidenceAnyOf": [
            [
              "E02"
            ]
          ]
        },
        "C2": {
          "value": "unknown",
          "evidenceAnyOf": [
            [
              "E03"
            ]
          ]
        },
        "C3": {
          "value": "yes",
          "evidenceAnyOf": [
            [
              "E01"
            ]
          ]
        }
      },
      "plans": [
        "P-LIVING",
        "P-CHECK"
      ],
      "followup": "period"
    },
    "ending": "지난 기록을 지우지 않고 현재 상태를 새 이력으로 남겼습니다. 태호의 상담 요청이 다음 담당자에게 이어집니다.",
    "epilogue": {
      "eventId": "resident-center:welfare:W02:reply",
      "text": "생활비 상담 담당자가 요청을 접수했습니다. 확인 대기 경로에서는 기관의 종료일 답변도 함께 도착했습니다."
    },
    "itemId": "resident-center:welfare:W02:contacts",
    "itemName": "연결 연락처 카드"
  },
  {
    "contentVersion": 1,
    "fictional": true,
    "choiceLabels": {
      "yes": "그렇다",
      "no": "아니다",
      "unknown": "확인 필요",
      "ended": "종료됨",
      "ongoing": "진행 중",
      "temporary": "일시적 도움",
      "stable": "정기적 도움"
    },
    "mainRewards": {
      "xp": 0,
      "points": 0
    },
    "sourceReferences": [
      "https://www.ssis.or.kr/lay1/S1T756C779/contents.do"
    ],
    "sourceScope": "상담과 지원 연계의 큰 흐름만 참고; 사건과 처리 기준은 게임용 창작",
    "id": "resident-center:welfare:W03",
    "shortId": "W03",
    "title": "한 집의 두 가지 부탁",
    "intro": "지후는 생활비와 주거 문제를 함께 이야기합니다. 가족의 도움이 어디까지 가능한지 확인하고 두 상담의 우선순위를 정해 주세요.",
    "people": [
      {
        "id": "P1",
        "name": "한지후",
        "role": "상담 당사자"
      },
      {
        "id": "P2",
        "name": "한지민",
        "role": "가족"
      },
      {
        "id": "P3",
        "name": "윤태호",
        "role": "앞선 상담 주민"
      },
      {
        "id": "P4",
        "name": "정서린",
        "role": "상담 동료"
      }
    ],
    "organizations": [
      {
        "id": "O1",
        "name": "생활보장과 상담 담당"
      },
      {
        "id": "O2",
        "name": "주거 상담 담당"
      }
    ],
    "sources": [
      {
        "id": "S01",
        "title": "오늘의 두 가지 부탁",
        "authorId": "P1",
        "recordedAt": "이번 근무",
        "effectivePeriod": "현재",
        "initiallyAvailable": true,
        "statements": [
          {
            "id": "E01",
            "text": "일거리가 줄어 생활비와 주거비를 함께 상담하고 싶다."
          }
        ]
      },
      {
        "id": "S02",
        "title": "이전 상담표",
        "authorId": "resident-center",
        "recordedAt": "지난 상담",
        "effectivePeriod": "이전 상담 당시",
        "initiallyAvailable": true,
        "statements": [
          {
            "id": "E02",
            "text": "가족이 한 차례 생활비를 보태 준 기록이 있다. 정기 지원 여부는 확인되지 않았다."
          }
        ]
      },
      {
        "id": "S03",
        "title": "최근 변화와 기한",
        "authorId": "P1",
        "recordedAt": "이번 근무",
        "effectivePeriod": "현재",
        "initiallyAvailable": false,
        "statements": [
          {
            "id": "E03",
            "text": "이번 주 안에 임대인에게 상담 계획을 알려야 한다. 주거 상담을 먼저 연결해 주었으면 한다."
          }
        ]
      },
      {
        "id": "S04",
        "title": "가족이 도울 수 있는 범위",
        "authorId": "P2",
        "recordedAt": "이번 근무",
        "effectivePeriod": "현재",
        "initiallyAvailable": false,
        "statements": [
          {
            "id": "E04",
            "text": "이번 한 번은 보탤 수 있지만 정기적으로 도울 수 있을지는 아직 모른다."
          }
        ]
      },
      {
        "id": "S05",
        "title": "상담 연결 동의",
        "authorId": "P1",
        "recordedAt": "이번 근무",
        "effectivePeriod": "현재",
        "initiallyAvailable": false,
        "statements": [
          {
            "id": "E05",
            "text": "가족에게 도움 범위를 묻고 생활·주거 담당 양쪽에 상담을 연결하는 데 동의한다."
          }
        ]
      },
      {
        "id": "S06",
        "title": "생활 상담 안내",
        "authorId": "O1",
        "recordedAt": "이번 근무",
        "effectivePeriod": "현재 가상 안내",
        "initiallyAvailable": true,
        "statements": [
          {
            "id": "E06",
            "text": "생활비 어려움의 상담 요청을 접수한다. 실제 지원 가능 여부는 상담 뒤 확인한다."
          }
        ]
      },
      {
        "id": "S07",
        "title": "주거 상담 안내",
        "authorId": "O2",
        "recordedAt": "이번 근무",
        "effectivePeriod": "현재 가상 안내",
        "initiallyAvailable": true,
        "statements": [
          {
            "id": "E07",
            "text": "주거비 어려움의 상담 요청을 접수한다. 주거 지원을 자동 확정하지 않는다."
          }
        ]
      }
    ],
    "questions": [
      {
        "id": "Q01",
        "label": "최근 변화와 우선 상담을 묻기",
        "prerequisites": [],
        "answerSourceId": "S03"
      },
      {
        "id": "Q02",
        "label": "두 상담 연결과 가족 연락 동의를 확인하기",
        "prerequisites": [],
        "answerSourceId": "S05"
      },
      {
        "id": "Q03",
        "label": "가족에게 도움의 지속 범위를 묻기",
        "prerequisites": [
          "statement:E05"
        ],
        "answerSourceId": "S04"
      }
    ],
    "claimDefinitions": [
      {
        "id": "C1",
        "label": "생활비 상담이 필요한가",
        "subjectId": "P1",
        "choices": [
          "yes",
          "no",
          "unknown"
        ]
      },
      {
        "id": "C2",
        "label": "주거 상담이 필요한가",
        "subjectId": "P1",
        "choices": [
          "yes",
          "no",
          "unknown"
        ]
      },
      {
        "id": "C3",
        "label": "확인된 가족 도움의 범위",
        "subjectId": "P2",
        "choices": [
          "temporary",
          "stable",
          "unknown"
        ]
      },
      {
        "id": "C4",
        "label": "가족의 정기 도움은 확보되었는가",
        "subjectId": "P2",
        "choices": [
          "yes",
          "no",
          "unknown"
        ]
      }
    ],
    "plans": [
      {
        "id": "P-LIVING",
        "label": "생활보장과에 생활비 상담 의뢰",
        "evidenceIds": [
          "E01",
          "E05",
          "E06"
        ],
        "action": "consultation-request",
        "status": "requested"
      },
      {
        "id": "P-HOUSING",
        "label": "주거 담당에게 주거비 상담 의뢰",
        "evidenceIds": [
          "E01",
          "E05",
          "E07"
        ],
        "action": "consultation-request",
        "status": "requested"
      },
      {
        "id": "P-CLOSE",
        "label": "가족의 지원을 전제로 종결",
        "evidenceIds": [
          "E02"
        ],
        "action": "consultation-request",
        "status": "requested"
      }
    ],
    "priorities": [
      {
        "id": "housing",
        "label": "주거 상담 먼저 · 이번 주 확인 기한",
        "evidenceIds": [
          "E03"
        ]
      },
      {
        "id": "living",
        "label": "생활 상담 먼저",
        "evidenceIds": [
          "E01"
        ]
      }
    ],
    "followups": [
      {
        "id": "both",
        "label": "담당 직원 · 다음 근무일 · 양쪽 상담 접수와 가족 도움 범위 재확인"
      },
      {
        "id": "family",
        "label": "가족에게 모두 맡기고 종결"
      }
    ],
    "acceptedPaths": [
      {
        "claims": {
          "C1": {
            "value": "yes",
            "evidenceAnyOf": [
              [
                "E01"
              ]
            ]
          },
          "C2": {
            "value": "yes",
            "evidenceAnyOf": [
              [
                "E01"
              ]
            ]
          },
          "C3": {
            "value": "temporary",
            "evidenceAnyOf": [
              [
                "E04"
              ]
            ]
          },
          "C4": {
            "value": "unknown",
            "evidenceAnyOf": [
              [
                "E04"
              ]
            ]
          }
        },
        "plans": [
          "P-LIVING",
          "P-HOUSING"
        ],
        "followup": "both",
        "priority": "housing",
        "priorityEvidence": [
          "E03"
        ]
      }
    ],
    "ending": "두 가지 부탁을 각각의 상담으로 연결했습니다. 임시 도움과 계속 확인할 부분을 구분한 기록이 다음 직원에게 남았습니다.",
    "epilogue": {
      "eventId": "resident-center:welfare:W03:reply",
      "text": "주거 담당과 생활 상담 담당이 각각 요청을 접수했습니다. 주거 상담이 먼저 안내되었고, 가족의 도움 범위는 다음 확인 항목으로 남았습니다."
    },
    "itemId": "resident-center:welfare:W03:map",
    "itemName": "동네 관계 지도"
  }
 ];
Object.assign(cases[0],{difficulty:'low',topic:'식사·가족의 도움',focus:'가족관계와 실제 가능한 도움을 나눠 기록하기',opening:'“딸이 있으니 괜찮을 거라고들 해요. 그런데 매일 밥을 챙기는 건 제 몫이네요.”',hints:['자료를 읽고 필요한 문장을 보관한 다음 판단마다 근거를 연결하세요.','가족관계, 동거, 전화 연락, 매일 방문은 각각 다른 판단입니다.','이전 기록과 지금의 말을 비교하고, 상담 의사와 남은 확인을 기록하세요.']});
Object.assign(cases[1],{difficulty:'medium',topic:'생활비·지원 기간',focus:'지난 지원 기록과 현재 제공 상태 구분하기',opening:'“전에 도움받은 적은 있어요. 지금도 받는 걸로 적혀 있다니, 그 기록부터 확인해 주실래요?”',hints:['작성일과 그 자료가 설명하는 기간을 나누어 읽어 보세요.','당사자의 말과 기관의 적용 종료일을 비교할 수 있습니다.','아직 기관 답변이 없다면 현재 상태를 단정하지 않고 확인 담당과 시기를 기록하세요.']});
Object.assign(cases[2],{difficulty:'high',topic:'주거·생활비',focus:'일시적 도움과 복수 문제, 우선 상담의 근거 판단하기',opening:'“당장 지낼 곳도 걱정이고 생활비도 빠듯해요. 가족한테 한 번 도움받은 게 전부예요.”',hints:['현재 문제와 지난 도움을 구분해 보세요.','일시적 도움이 계속 가능한 도움을 뜻하지는 않습니다.','두 상담에 필요한 동의를 살피고, 기한과 당사자의 선호로 연결 순서를 판단하세요.']});
cases.push(...(typeof module!=="undefined"&&module.exports?require('./extra-cases.js'):root.WelfareExtraCases));
const levels=[{id:'low',label:'하',name:'기본 확인',description:'당사자의 현재 필요와 상담 의사를 확인합니다.'},{id:'medium',label:'중',name:'기록 비교',description:'과거 기록과 현재 생활, 실제 도움의 범위를 비교합니다.'},{id:'high',label:'상',name:'복합 판단',description:'복수 문제·동의 범위·두 근거·우선순위를 함께 판단합니다.'}];
const api={cases,levels,get:id=>typeof id==='string'?cases.find(c=>c.id===id||c.shortId===id):undefined};if(typeof module!=="undefined"&&module.exports)module.exports=api;else root.WelfareData=api;})(globalThis);
