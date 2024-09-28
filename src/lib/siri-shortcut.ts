import plist from "plist";

export function createSiriShortcut(
  apiUrl: string,
  apiBody: Record<string, string>,
  shortcutName: string,
): string {
  const shortcutData: plist.PlistObject = {
    WFWorkflowActions: [
      {
        WFWorkflowActionIdentifier: "is.workflow.actions.setvariable",
        WFWorkflowActionParameters: {
          WFVariableName: "API_URL",
          WFInputValue: {
            Value: {
              string: apiUrl,
            },
            WFSerializationType: "WFTextTokenString",
          },
        },
      },
      {
        WFWorkflowActionIdentifier: "is.workflow.actions.setvariable",
        WFWorkflowActionParameters: {
          WFVariableName: "API_BODY",
          WFInputValue: {
            Value: {
              string: JSON.stringify(apiBody),
            },
            WFSerializationType: "WFTextTokenString",
          },
        },
      },
      {
        WFWorkflowActionIdentifier: "is.workflow.actions.downloadurl",
        WFWorkflowActionParameters: {
          WFURLActionURL: {
            Value: {
              VariableName: "API_URL",
            },
            WFSerializationType: "WFVariablePickerVariable",
          },
          Advanced: true,
          Method: "POST",
          Headers: {
            Value: {
              WFDictionaryFieldValueItems: [
                {
                  WFKey: {
                    Value: {
                      string: "Content-Type",
                    },
                    WFSerializationType: "WFTextTokenString",
                  },
                  WFValue: {
                    Value: {
                      string: "application/json",
                    },
                    WFSerializationType: "WFTextTokenString",
                  },
                },
              ],
            },
            WFSerializationType: "WFDictionaryFieldValue",
          },
          WFHTTPBodyType: "JSON",
          WFJSONValues: {
            Value: {
              VariableName: "API_BODY",
            },
            WFSerializationType: "WFVariablePickerVariable",
          },
        },
      },
      {
        WFWorkflowActionIdentifier: "is.workflow.actions.getvalueforkey",
        WFWorkflowActionParameters: {
          WFInput: {
            Value: {
              OutputUUID: "API_RESPONSE",
            },
            WFSerializationType: "WFVariablePickerVariable",
          },
          WFKey: {
            Value: {
              string: "message",
            },
            WFSerializationType: "WFTextTokenString",
          },
        },
      },
      {
        WFWorkflowActionIdentifier: "is.workflow.actions.speaktext",
        WFWorkflowActionParameters: {
          WFSpeakTextLanguage: "en-US",
          WFSpeakTextPitch: 1,
          WFSpeakTextRate: 0.5,
          WFSpeakTextText: {
            Value: {
              OutputUUID: "GET_VALUE_FOR_KEY",
            },
            WFSerializationType: "WFVariablePickerVariable",
          },
        },
      },
    ],
    WFWorkflowClientVersion: "1080.5",
    WFWorkflowIcon: {
      WFWorkflowIconStartColor: 4282601983,
      WFWorkflowIconGlyphNumber: 59511,
    },
    WFWorkflowImportQuestions: [],
    WFWorkflowTypes: ["NCWidget", "WatchKit"],
    WFWorkflowName: shortcutName,
  };

  const plistXml = plist.build(shortcutData);
  return plistXml;
}
