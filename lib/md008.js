// @ts-check

"use strict";

const { addErrorDetailIf, indentFor, orderedListItemMarkerRe } =
  require("../helpers");
const { flattenedLists } = require("./cache");

module.exports = {
  "names": [ "MD008", "ol-indent" ],
  "description": "Ordered list indentation",
  "tags": [ "ol", "indentation" ],
  "function": function MD008(params, onError) {
    const indent = Number(params.config.indent || 2);
    const startIndented = !!params.config.start_indented;
    flattenedLists().forEach((list) => {
      if (list.ordered && list.parentsOrdered) {
        list.items.forEach((item) => {
          const { lineNumber, line } = item;
          // Ordered list items with single-digits are allowed to have a space
          // before the list item number, so get the number of digits so we
          // can test for this case before failing with wrong indent level.
          const orderedListItemNumber = parseInt(item.line, 10);
          const actualIndent = indentFor(item);
          const expectedNesting = list.nesting + (startIndented ? 1 : 0);
          const match = line.match(orderedListItemMarkerRe);
          const expectedIndent = (expectedNesting * indent);
          let range = null;
          let editColumn = 1;
          // If item number is a single digit, allow for the extra space
          // as a factor in determing correct indentation level.
          if (orderedListItemNumber) {
            // TODO: Finish it.
            // const orderedListItemNumberDigitCount = orderedListItemNumber
            //   .toString();
            // expectedIndent = expectedIndent +
            // orderedListItemNumberDigitCount.length === 1 ?
            //   1 :
            //   0;
          }
          if (match) {
            range = [ 1, match[0].length ];
            editColumn += match[1].length >= actualIndent ?
              match[1].length - actualIndent :
              actualIndent;
          }
          if (params.name === "test/list-item-prefix-alignment.md") {
            // eslint-disable-next-line
            console.log(orderedListItemNumber, expectedIndent, actualIndent);
          }
          addErrorDetailIf(
            onError,
            lineNumber,
            expectedIndent,
            actualIndent,
            null,
            null,
            range,
            {
              editColumn,
              "deleteCount": actualIndent,
              "insertText": "".padEnd(expectedIndent)
            }
          );
        });
      }
    });
  }
};
