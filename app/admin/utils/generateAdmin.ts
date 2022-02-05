import { RecipeBuilder } from "@blitzjs/installer"
import db from "db"
import { join } from "path"
import j from "jscodeshift"

const database: { [k: string]: any } = db

// Do not overwrite premade admin pages,mutations & queries
const DO_NOT_INCLUDE = ["user", "session", "token", "job", "membership", "test"]

const entities = database._dmmf.datamodel.models.reduce((arr, m) => {
  if (!DO_NOT_INCLUDE.includes(m.name.toLowerCase())) {
    arr.push({
      name: m.name.toLowerCase(),
      fields: m.fields.map((f) => f.name),
    })
  }

  return arr
}, [])

let builder = RecipeBuilder()
  .setName("hire-win Admin Panel")
  .setDescription("Generate an admin panel based on your prisma schema.")
  .setOwner("dillon@creatorsneverdie.com")
  .printMessage({
    successIcon: "⚡️",
    stepId: "1",
    stepName: "Welcome",
    message: "Lets generate your admin panel",
  })

entities.map((e, i) => {
  const fields = e.fields.map((field) => {
    if (field === "id") {
      return j.objectExpression([
        j.property(
          "init",
          j.identifier("Header"),
          j.stringLiteral(`${field.charAt(0).toUpperCase() + field.slice(1)}`)
        ),
        j.property("init", j.identifier("accessor"), j.stringLiteral(field)),
        j.property(
          "init",
          j.identifier("Cell"),
          j.arrowFunctionExpression(
            [j.identifier("props")],
            j.blockStatement([
              j.returnStatement(
                j.parenthesizedExpression(
                  j.jsxElement(
                    j.jsxOpeningElement(j.jsxIdentifier("Link"), [
                      j.jsxAttribute(
                        j.jsxIdentifier("href"),
                        j.jsxExpressionContainer(
                          j.callExpression(
                            j.identifier(
                              `Routes.Single${
                                e.name.charAt(0).toUpperCase() + e.name.slice(1)
                              }AdminPage`
                            ),
                            [
                              j.objectExpression([
                                j.property(
                                  "init",
                                  j.identifier("id"),
                                  j.identifier("props.cell.row.original.id")
                                ),
                              ]),
                            ]
                          )
                        )
                      ),
                      j.jsxAttribute(j.jsxIdentifier("passHref")),
                    ]),
                    j.jsxClosingElement(j.jsxIdentifier("Link")),
                    [
                      j.jsxElement(
                        j.jsxOpeningElement(j.jsxIdentifier("a"), [
                          j.jsxAttribute(
                            j.jsxIdentifier("className"),
                            j.literal("text-theme-600 hover:text-theme-900")
                          ),
                        ]),
                        j.jsxClosingElement(j.jsxIdentifier("a")),
                        [
                          j.jsxExpressionContainer(
                            j.callExpression(j.identifier("props.value.toString"), [])
                          ),
                        ]
                      ),
                    ]
                  )
                )
              ),
            ])
          )
        ),
      ])
    } else {
      return j.objectExpression([
        j.property(
          "init",
          j.identifier("Header"),
          j.stringLiteral(`${field.charAt(0).toUpperCase() + field.slice(1)}`)
        ),
        j.property("init", j.identifier("accessor"), j.stringLiteral(field)),
        j.property(
          "init",
          j.identifier("Cell"),
          j.arrowFunctionExpression(
            [j.identifier("props")],
            j.blockStatement([
              j.returnStatement(
                j.callExpression(j.identifier("props.value && props.value.toString"), [])
              ),
            ])
          )
        ),
      ])
    }
  })

  const formInputs = e.fields.map((field) => {
    return j.jsxElement(
      j.jsxOpeningElement(
        j.jsxIdentifier("LabeledTextField"),
        [
          j.jsxAttribute(j.jsxIdentifier("name"), j.literal(field)),
          j.jsxAttribute(j.jsxIdentifier("label"), j.literal(field)),
          j.jsxAttribute(j.jsxIdentifier("disabled")),
        ],
        true
      )
    )
  })

  // Index Page
  builder.addNewFilesStep({
    stepId: i,
    stepName: `Creating index page ${e.name}`,
    explanation: `Creating a new index page`,
    targetDirectory: `app/admin/pages/admin/${e.name}s/index.tsx`,
    templatePath: join(__dirname, "indexPageTemplate.tsx"),
    templateValues: {
      ModelName: `${e.name.charAt(0).toUpperCase() + e.name.slice(1)}`,
      modelName: e.name,
    },
  })
  builder.addTransformFilesStep({
    stepId: i,
    stepName: "Add columns to pages",
    explanation: "Add the correct fields to the table on each page",
    singleFileSearch: `./app/admin/pages/admin/${e.name}s/index.tsx`,
    transform(program) {
      program
        .find(j.VariableDeclaration, {
          declarations: [
            {
              id: {
                type: "Identifier",
                name: "columns",
              },
            },
          ],
        })
        .replaceWith(() =>
          j.variableDeclaration("const", [
            j.variableDeclarator(j.identifier("columns"), j.arrayExpression([...fields])),
          ])
        )

      program.find(j.Comment).forEach((c) => {
        if (c.value.value === " @ts-nocheck") {
          c.prune()
        }
      })
      return program
    },
  })

  // Single Page
  builder.addNewFilesStep({
    stepId: i,
    stepName: `Creating single page ${e.name}`,
    explanation: `Creating a new single page`,
    targetDirectory: `app/admin/pages/admin/${e.name}s/[id].tsx`,
    templatePath: join(__dirname, "singlePageTemplate.tsx"),
    templateValues: {
      ModelName: `${e.name.charAt(0).toUpperCase() + e.name.slice(1)}`,
      modelName: e.name,
    },
  })
  builder.addTransformFilesStep({
    stepId: i,
    stepName: "Add form inputs to page",
    explanation: "Converts fields to form inputs on single page",
    singleFileSearch: `./app/admin/pages/admin/${e.name}s/[id].tsx`,
    transform(program) {
      program.find(j.JSXElement).forEach((c) => {
        // @ts-ignore
        if (c.value.openingElement.name.name === "Form") {
          c.value.children = [...formInputs]
        }
      })

      program.find(j.Comment).forEach((c) => {
        if (c.value.value === " @ts-nocheck") {
          c.prune()
        }
      })
      return program
    },
  })

  // Update Mutation
  builder.addNewFilesStep({
    stepId: i,
    stepName: `Creating Update Mutation ${e.name}`,
    explanation: `Creating a new update mutation`,
    targetDirectory: `app/admin/mutations/admin/update${
      e.name.charAt(0).toUpperCase() + e.name.slice(1)
    }.ts`,
    templatePath: join(__dirname, "editMutationTemplate.ts"),
    templateValues: {
      ModelName: `${e.name.charAt(0).toUpperCase() + e.name.slice(1)}`,
      modelName: e.name,
    },
  })
  builder.addTransformFilesStep({
    stepId: i,
    stepName: "Remove ts nocheck for update mutation",
    explanation: "Makes typescript work",
    singleFileSearch: `./app/admin/mutations/admin/update${
      e.name.charAt(0).toUpperCase() + e.name.slice(1)
    }.ts`,
    transform(program) {
      program.find(j.Comment).forEach((c) => {
        if (c.value.value === " @ts-nocheck") {
          c.prune()
        }
      })
      return program
    },
  })

  // Query
  builder.addNewFilesStep({
    stepId: i,
    stepName: `Creating query ${e.name}`,
    explanation: `Creating a new query`,
    targetDirectory: `app/admin/queries/admin/get${
      e.name.charAt(0).toUpperCase() + e.name.slice(1)
    }s.ts`,
    templatePath: join(__dirname, "getAllQueryTemplate.ts"),
    templateValues: {
      ModelName: `${e.name.charAt(0).toUpperCase() + e.name.slice(1)}`,
      modelName: e.name,
    },
  })
  builder.addTransformFilesStep({
    stepId: i,
    stepName: "Remove ts nocheck for update mutation",
    explanation: "Makes typescript work",
    singleFileSearch: `./app/admin/queries/admin/get${
      e.name.charAt(0).toUpperCase() + e.name.slice(1)
    }s.ts`,
    transform(program) {
      program.find(j.Comment).forEach((c) => {
        if (c.value.value === " @ts-nocheck") {
          c.prune()
        }
      })
      return program
    },
  })

  // Add to router file
  builder.addTransformFilesStep({
    stepId: `add-route`,
    stepName: "Add route to admin router file",
    explanation: "Ensures the page gets added to the router",
    singleFileSearch: `./app/admin/utils/routes.ts`,
    transform(program) {
      program
        .find(j.ArrayExpression)
        .forEach((c) =>
          c.value.elements.push(
            j.objectExpression([
              j.property(
                "init",
                j.identifier("name"),
                j.stringLiteral(`${e.name.charAt(0).toUpperCase() + e.name.slice(1)}s`)
              ),
              j.property("init", j.identifier("href"), j.stringLiteral(`/admin/${e.name}s`)),
              j.property(
                "init",
                j.identifier("current"),
                j.binaryExpression(
                  "===",
                  j.memberExpression(j.identifier("router"), j.identifier("route")),
                  j.stringLiteral(`/admin/${e.name}s`)
                )
              ),
            ])
          )
        )

      return program
    },
  })

  // Add to DO_NOT_INCLUDE
  builder.addTransformFilesStep({
    stepId: `add-do-not-include`,
    stepName: "Add to do not include",
    explanation: "Add latest generator to do not include",
    singleFileSearch: `./app/admin/utils/generateAdmin.ts`,
    transform(program) {
      program
        .find(j.VariableDeclaration, {
          declarations: [
            {
              id: {
                type: "Identifier",
                name: "DO_NOT_INCLUDE",
              },
            },
          ],
        })
        .forEach((c) =>
          // @ts-ignore
          c.value.declarations[0].init.elements.push(j.stringLiteral(e.name))
        )

      return program
    },
  })
})

export default builder.build()
