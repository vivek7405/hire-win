import { EmailTemplate } from "@prisma/client"

const factoryEmailTemplates = [
  {
    name: "Shortlisted",
    subject: "Congrats, you have been shortlisted!",
    body: {
      blocks: [
        {
          key: "e90dt",
          data: { "margin-left": "0px" },
          text: "Dear {{Candidate_Name}},",
          type: "unstyled",
          depth: 0,
          entityRanges: [],
          inlineStyleRanges: [],
        },
        {
          key: "8lctc",
          data: {},
          text: "",
          type: "unstyled",
          depth: 0,
          entityRanges: [],
          inlineStyleRanges: [],
        },
        {
          key: "d5l4c",
          data: {},
          text: "Congrats! Your application has been shortlisted for the job opening of {{Job_Title}} at our company {{Company_Name}}.",
          type: "unstyled",
          depth: 0,
          entityRanges: [],
          inlineStyleRanges: [],
        },
        {
          key: "36e2v",
          data: {},
          text: "",
          type: "unstyled",
          depth: 0,
          entityRanges: [],
          inlineStyleRanges: [],
        },
        {
          key: "4flv1",
          data: {},
          text: "Someone from our team will contact you shortly.",
          type: "unstyled",
          depth: 0,
          entityRanges: [],
          inlineStyleRanges: [],
        },
        {
          key: "bgdj9",
          data: {},
          text: "",
          type: "unstyled",
          depth: 0,
          entityRanges: [],
          inlineStyleRanges: [],
        },
        {
          key: "6ugkv",
          data: {},
          text: "All the best!",
          type: "unstyled",
          depth: 0,
          entityRanges: [],
          inlineStyleRanges: [],
        },
        {
          key: "2uhiv",
          data: {},
          text: "",
          type: "unstyled",
          depth: 0,
          entityRanges: [],
          inlineStyleRanges: [],
        },
        {
          key: "5hgvc",
          data: {},
          text: "-{{Sender_Name}}",
          type: "unstyled",
          depth: 0,
          entityRanges: [],
          inlineStyleRanges: [],
        },
      ],
      entityMap: {},
    } as any,
  } as EmailTemplate,
  {
    name: "Progressed",
    subject: "Congrats, your application has progressed!",
    body: {
      blocks: [
        {
          key: "t7ft",
          data: {},
          text: "Dear {{Candidate_Name}},",
          type: "unstyled",
          depth: 0,
          entityRanges: [],
          inlineStyleRanges: [],
        },
        {
          key: "3lh23",
          data: {},
          text: "",
          type: "unstyled",
          depth: 0,
          entityRanges: [],
          inlineStyleRanges: [],
        },
        {
          key: "5d8al",
          data: {},
          text: "Congratulations! Your application at {{Company_Name}} for the opening of {{Job_Title}} has progressed.",
          type: "unstyled",
          depth: 0,
          entityRanges: [],
          inlineStyleRanges: [],
        },
        {
          key: "7qkk1",
          data: {},
          text: "",
          type: "unstyled",
          depth: 0,
          entityRanges: [],
          inlineStyleRanges: [],
        },
        {
          key: "b2n7r",
          data: {},
          text: "You will shortly hear from us regarding the next round. We wish you the best!",
          type: "unstyled",
          depth: 0,
          entityRanges: [],
          inlineStyleRanges: [],
        },
        {
          key: "bp05p",
          data: {},
          text: "",
          type: "unstyled",
          depth: 0,
          entityRanges: [],
          inlineStyleRanges: [],
        },
        {
          key: "656cq",
          data: {},
          text: "-{{Sender_Name}}",
          type: "unstyled",
          depth: 0,
          entityRanges: [],
          inlineStyleRanges: [],
        },
      ],
      entityMap: {},
    } as any,
  } as EmailTemplate,
  {
    name: "Not selected",
    subject: "Sorry, you didn't get through!",
    body: {
      blocks: [
        {
          key: "evu5n",
          data: {},
          text: "Dear {{Candidate_Name}},",
          type: "unstyled",
          depth: 0,
          entityRanges: [],
          inlineStyleRanges: [],
        },
        {
          key: "9g9e2",
          data: {},
          text: "",
          type: "unstyled",
          depth: 0,
          entityRanges: [],
          inlineStyleRanges: [],
        },
        {
          key: "2ahd8",
          data: {},
          text: "We are sorry to inform you that you have not been selected for the application of {{Job_Title}} at {{Company_Name}}.",
          type: "unstyled",
          depth: 0,
          entityRanges: [],
          inlineStyleRanges: [],
        },
        {
          key: "3dtcj",
          data: {},
          text: "",
          type: "unstyled",
          depth: 0,
          entityRanges: [],
          inlineStyleRanges: [],
        },
        {
          key: "cau4k",
          data: {},
          text: "You may keep a watch on our careers page and apply for a role in the future.",
          type: "unstyled",
          depth: 0,
          entityRanges: [],
          inlineStyleRanges: [
            { style: "color-rgb(0,0,0)", length: 76, offset: 0 },
            { style: "bgcolor-rgb(255,255,255)", length: 76, offset: 0 },
            { style: "fontsize-medium", length: 76, offset: 0 },
            {
              style:
                'fontfamily-ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji',
              length: 76,
              offset: 0,
            },
          ],
        },
        {
          key: "edr10",
          data: {},
          text: "",
          type: "unstyled",
          depth: 0,
          entityRanges: [],
          inlineStyleRanges: [],
        },
        {
          key: "kjf4",
          data: {},
          text: "We wish you the best in your career ahead!",
          type: "unstyled",
          depth: 0,
          entityRanges: [],
          inlineStyleRanges: [],
        },
        {
          key: "2bqm2",
          data: {},
          text: "",
          type: "unstyled",
          depth: 0,
          entityRanges: [],
          inlineStyleRanges: [],
        },
        {
          key: "6jkk2",
          data: {},
          text: "-{{Sender_Name}}",
          type: "unstyled",
          depth: 0,
          entityRanges: [],
          inlineStyleRanges: [],
        },
      ],
      entityMap: {},
    } as any,
  } as EmailTemplate,
]

export default factoryEmailTemplates
