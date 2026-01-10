var rowHeight = 80;
var columnWidth = 120;
var circleRadius = 15;
var canvasPadding = 30;
var zoomLevel = 1;
var translationOffsetX = 0;
var translationOffsetY = 0;
var overallTranslationOffsetX = 0;
var overallTranslationOffsetY = 0;
var clickLocationX = 0;
var clickLocationY = 0;
var maleColor = "#80ccff";
var femaleColor = "#ffb3d9";
var numAncestorGenerations = 1;
var originX = columnWidth + canvasPadding;
var originY = rowHeight * 2 + canvasPadding;

// Single source of truth for position calculations
function getPersonPosition(colOffset, rowOffset) {
  return {
    x: originX + (colOffset * columnWidth) + (columnWidth / 2),
    y: originY + (rowOffset * rowHeight) + (rowHeight / 2)
  };
}

var family = {
  person: {name: "你/我", gender: "Male", notes: "You"},
  siblings: [
    {
      name: "哥哥", gender: "Male", notes: "older brother",
      families: [{
        spouse: {name: "嫂子", gender: "Female", notes: "older brother's wife"},
        children: [
          {name: "侄子", gender: "Male", notes: "brother's son"},
          {name: "侄女", gender: "Female", notes: "brother's daughter"}
        ]
      }]
    },
    {
      name: "姐姐", gender: "Female", notes: "older sister",
      families: [{
        spouse: {name: "姐夫", gender: "Male", notes: "older sister's husband"},
        children: [
          {name: "外甥", gender: "Male", notes: "sister's son"},
          {name: "外甥女", gender: "Female", notes: "sister's daughter"}
        ]
      }]
    },
    {name: "弟弟", gender: "Male", notes: "younger brother",
      families: [{
        spouse: {name: "弟妇", gender: "Female", notes: "younger brother's wife"}
      }]
    },
    {name: "妹妹", gender: "Female", notes: "younger sister",
      families: [{
        spouse: {name: "妹夫", gender: "Male", notes: "younger sister's husband"}
      }]
    }
  ],
  families: [{
    spouse: {name: "妻子/老婆", gender: "Female", notes: "wife",
      father: {name: "岳父", gender: "Male", notes: "wife's father"},
      mother: {name: "岳母", gender: "Female", notes: "wife's mother"}
    },
    children: [
      {name: "儿子", gender: "Male", notes: "son"},
      {name: "女儿", gender: "Female", notes: "daughter"}
    ]
  }],
  mother: {
    name: "妈妈", gender: "Female",
    father: {name: "外公", gender: "Male"},
    mother: {name: "外婆", gender: "Female"},
    siblings: [
      {
        name: "舅舅", gender: "Male", notes: "Mom's brother",
        families: [{
          spouse: {name: "舅母", gender: "Female", notes: "Mom's brother's wife"},
          children: [
            {name: "表哥", gender: "Male", notes: "Mom's sibling's son (older)"},
            {name: "表姐", gender: "Female", notes: "Mom's sibling's daughter (older)"},
            {name: "表弟", gender: "Male", notes: "Mom's sibling's son (younger)"},
            {name: "表妹", gender: "Female", notes: "Mom's sibling's daughter (younger)"}
          ]
        }]
      },
      {
        name: "姨妈", gender: "Female", notes: "Mom's older sister",
        families: [{
          spouse: {name: "姨夫", gender: "Male", notes: "Mom's sister's husband"}
        }]
      },
      {
        name: "阿姨", gender: "Female", notes: "Mom's younger sister",
        families: [{
          spouse: {name: "姨夫", gender: "Male", notes: "Mom's sister's husband"}
        }]
      }
    ]
  },
  father: {
    name: "爸爸", gender: "Male",
    father: {name: "爷爷", gender: "Male"},
    mother: {name: "奶奶", gender: "Female"},
    siblings: [
      {
        name: "伯伯", gender: "Male", notes: "Dad's older brother",
        families: [{
          spouse: {name: "伯母", gender: "Female", notes: "Dad's older brother's wife"},
          children: [
            {name: "堂兄", gender: "Male", notes: "Dad's sibling's son (older)"},
            {name: "堂姐", gender: "Female", notes: "Dad's sibling's daughter (older)"}
          ]
        }]
      },
      {
        name: "叔叔", gender: "Male", notes: "Dad's younger brother",
        families: [{
          spouse: {name: "婶婶", gender: "Female", notes: "Dad's younger brother's wife"},
          children: [
            {name: "堂弟", gender: "Male", notes: "Dad's sibling's son (younger)"},
            {name: "堂妹", gender: "Female", notes: "Dad's sibling's daughter (younger)"}
          ]
        }]
      },
      {
        name: "姑妈", gender: "Female", notes: "Dad's older sister",
        families: [{
          spouse: {name: "姑夫", gender: "Male", notes: "Dad's sister's husband"}
        }]
      },
      {
        name: "姑姑", gender: "Female", notes: "Dad's younger sister",
        families: [{
          spouse: {name: "姑夫", gender: "Male", notes: "Dad's sister's husband"}
        }]
      }
    ]
  }
};

function drawTree() {
  numAncestorGenerations = getTreeDepth(family, 0);
  adjustOriginBasedOnTreeData(numAncestorGenerations);

  var canvas = document.getElementById('familyTreeCanvas');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');
  setCanvasDimensions(canvas, numAncestorGenerations);

  ctx.save();
  ctx.scale(zoomLevel, zoomLevel);
  var x = overallTranslationOffsetX + translationOffsetX;
  var y = overallTranslationOffsetY + translationOffsetY;
  ctx.translate(x/zoomLevel, y/zoomLevel);
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#555555";

  // Draw grandparents
  if (family.father && family.father.father) {
    drawPerson(ctx, -1, -4, maleColor, family.father.father);
  }
  if (family.father && family.father.mother) {
    drawPerson(ctx, -1, -3, femaleColor, family.father.mother);
  }
  if (family.mother && family.mother.father) {
    drawPerson(ctx, 1, -4, maleColor, family.mother.father);
  }
  if (family.mother && family.mother.mother) {
    drawPerson(ctx, 1, -3, femaleColor, family.mother.mother);
  }

  // Draw connectors from grandparents to parents
  if (family.father) {
    var fatherPos = getPersonPosition(-1, -2);
    var patGrandpaPos = getPersonPosition(-1, -4);
    var patGrandmaPos = getPersonPosition(-1, -3);
    drawVerticalConnector(ctx, patGrandpaPos, patGrandmaPos);
    drawVerticalConnector(ctx, patGrandmaPos, fatherPos);
  }
  if (family.mother) {
    var motherPos = getPersonPosition(1, -2);
    var matGrandpaPos = getPersonPosition(1, -4);
    var matGrandmaPos = getPersonPosition(1, -3);
    drawVerticalConnector(ctx, matGrandpaPos, matGrandmaPos);
    drawVerticalConnector(ctx, matGrandmaPos, motherPos);
  }

  // Draw parents
  if (family.father) {
    drawPerson(ctx, -1, -2, maleColor, family.father);
  }
  if (family.mother) {
    drawPerson(ctx, 1, -2, femaleColor, family.mother);
  }

  // Draw connector from parents to you
  if (family.father && family.mother) {
    var fatherPos = getPersonPosition(-1, -2);
    var motherPos = getPersonPosition(1, -2);
    var youPos = getPersonPosition(0, 0);

    // Horizontal line between parents
    drawHorizontalConnector(ctx, fatherPos, motherPos);

    // Vertical line from midpoint to you
    var midParentX = (fatherPos.x + motherPos.x) / 2;
    ctx.beginPath();
    ctx.moveTo(midParentX, fatherPos.y);
    ctx.lineTo(midParentX, youPos.y);
    ctx.stroke();
  }

  // FATHER'S siblings (uncles and aunts on father's side)
  if (family.father && family.father.siblings) {
    family.father.siblings.forEach(function (uncle, i) {
      var uncleColumn = -2 - i;
      var color = (uncle.gender === "Male") ? maleColor : femaleColor;
      drawPerson(ctx, uncleColumn, -2, color, uncle);

      // Draw horizontal connector at parent level
      var fatherPos = getPersonPosition(-1, -2);
      var unclePos = getPersonPosition(uncleColumn, -2);
      drawHorizontalConnector(ctx, fatherPos, unclePos);

      // Draw uncle's/aunt's spouse if exists
      if (uncle.families && uncle.families[0] && uncle.families[0].spouse) {
        var spouseColor = (uncle.families[0].spouse.gender === "Male") ? maleColor : femaleColor;
        drawPerson(ctx, uncleColumn, -1, spouseColor, uncle.families[0].spouse);
        drawSpouseConnector(ctx, getPersonPosition(uncleColumn, -2), getPersonPosition(uncleColumn, -1));

        // Draw uncle's/aunt's children (堂 cousins) if exist
        if (uncle.families[0].children) {
          var spousePos = getPersonPosition(uncleColumn, -1);
          uncle.families[0].children.forEach(function(cousin, cousinIndex) {
            var cousinColor = (cousin.gender === "Male") ? maleColor : femaleColor;
            drawPerson(ctx, uncleColumn, cousinIndex, cousinColor, cousin);

            // Connector from spouse to child
            var cousinPos = getPersonPosition(uncleColumn, cousinIndex);
            drawVerticalConnector(ctx, spousePos, cousinPos);
          });
        }
      }
    });
  }

  // MOTHER'S siblings (uncles and aunts on mother's side)
  if (family.mother && family.mother.siblings) {
    family.mother.siblings.forEach(function (aunt, i) {
      var auntColumn = 2 + i;
      var color = (aunt.gender === "Male") ? maleColor : femaleColor;
      drawPerson(ctx, auntColumn, -2, color, aunt);

      // Draw horizontal connector at parent level
      var motherPos = getPersonPosition(1, -2);
      var auntPos = getPersonPosition(auntColumn, -2);
      drawHorizontalConnector(ctx, motherPos, auntPos);

      // Draw aunt's/uncle's spouse if exists
      if (aunt.families && aunt.families[0] && aunt.families[0].spouse) {
        var spouseColor = (aunt.families[0].spouse.gender === "Male") ? maleColor : femaleColor;
        drawPerson(ctx, auntColumn, -1, spouseColor, aunt.families[0].spouse);
        drawSpouseConnector(ctx, getPersonPosition(auntColumn, -2), getPersonPosition(auntColumn, -1));

        // Draw aunt's/uncle's children (表 cousins) if exist
        if (aunt.families[0].children) {
          var spousePos = getPersonPosition(auntColumn, -1);
          aunt.families[0].children.forEach(function(cousin, cousinIndex) {
            var cousinColor = (cousin.gender === "Male") ? maleColor : femaleColor;
            drawPerson(ctx, auntColumn, cousinIndex, cousinColor, cousin);

            // Connector from spouse to child
            var cousinPos = getPersonPosition(auntColumn, cousinIndex);
            drawVerticalConnector(ctx, spousePos, cousinPos);
          });
        }
      }
    });
  }

  // person (you)
  drawPerson(ctx, 0, 0, "#ffd700", family.person);

  // your spouse
  if (family.families[0].spouse) {
    drawPerson(ctx, -1, 0, femaleColor, family.families[0].spouse);
    drawSpouseConnector(ctx, getPersonPosition(0, 0), getPersonPosition(-1, 0));

    // Draw in-laws if exist
    if (family.families[0].spouse.father) {
      drawPerson(ctx, -2, -2, maleColor, family.families[0].spouse.father);
    }
    if (family.families[0].spouse.mother) {
      drawPerson(ctx, -3, -2, femaleColor, family.families[0].spouse.mother);
    }
  }

  // YOUR siblings and their families
  family.siblings.forEach(function (sibling, i) {
    var siblingColumn = i + 1;
    var color = (sibling.gender === "Male") ? maleColor : femaleColor;
    drawPerson(ctx, siblingColumn, 0, color, sibling);

    // Horizontal connector to you
    var youPos = getPersonPosition(0, 0);
    var siblingPos = getPersonPosition(siblingColumn, 0);
    drawHorizontalConnector(ctx, youPos, siblingPos);

    // Draw sibling's spouse if exists
    if (sibling.families && sibling.families[0] && sibling.families[0].spouse) {
      var spouseColor = (sibling.families[0].spouse.gender === "Male") ? maleColor : femaleColor;
      drawPerson(ctx, siblingColumn, 1, spouseColor, sibling.families[0].spouse);
      drawSpouseConnector(ctx, siblingPos, getPersonPosition(siblingColumn, 1));

      // Draw sibling's children if exist
      if (sibling.families[0].children) {
        var spousePos = getPersonPosition(siblingColumn, 1);
        sibling.families[0].children.forEach(function(child, childIndex) {
          var childColor = (child.gender === "Male") ? maleColor : femaleColor;
          var childRow = 2 + childIndex;
          drawPerson(ctx, siblingColumn, childRow, childColor, child);

          // Connector from spouse to child
          var childPos = getPersonPosition(siblingColumn, childRow);
          drawVerticalConnector(ctx, spousePos, childPos);
        });
      }
    }
  });

  // your children
  if (family.families[0].children) {
    var youPos = getPersonPosition(0, 0);
    family.families[0].children.forEach(function (child, i) {
      var color = (child.gender === "Male") ? maleColor : femaleColor;
      var childRow = 2 + i;
      drawPerson(ctx, 0, childRow, color, child);

      // Connector from you to child
      var childPos = getPersonPosition(0, childRow);
      drawVerticalConnector(ctx, youPos, childPos);
    });
  }

  ctx.restore();
}

function drawPerson(ctx, colOffset, rowOffset, fill, person) {
  var pos = getPersonPosition(colOffset, rowOffset);
  var personName = person.name;

  // Draw circle
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, circleRadius, 0, Math.PI * 2, true);
  ctx.stroke();
  ctx.fillStyle = fill;
  ctx.fill();

  // Draw name below circle
  ctx.fillStyle = "white";
  ctx.font = "bold 11px Arial";
  ctx.fillText(personName, pos.x - ctx.measureText(personName).width / 2 + 1, pos.y + circleRadius + 12 + 1);
  ctx.fillStyle = "black";
  ctx.fillText(personName, pos.x - ctx.measureText(personName).width / 2, pos.y + circleRadius + 12);

  person.coordinates = {
    x: pos.x,
    y: pos.y,
    radius: circleRadius
  };
}

function drawHorizontalConnector(ctx, startPos, endPos) {
  ctx.beginPath();
  ctx.moveTo(startPos.x, startPos.y);
  ctx.lineTo(endPos.x, endPos.y);
  ctx.stroke();
}

function drawVerticalConnector(ctx, startPos, endPos) {
  ctx.beginPath();
  ctx.moveTo(startPos.x, startPos.y);
  ctx.lineTo(endPos.x, endPos.y);
  ctx.stroke();
}

function drawSpouseConnector(ctx, pos1, pos2) {
  ctx.save();
  ctx.beginPath();
  ctx.setLineDash([5, 5]);
  ctx.moveTo(pos1.x, pos1.y);
  ctx.lineTo(pos2.x, pos2.y);
  ctx.stroke();
  ctx.restore();
}

function adjustOriginBasedOnTreeData(numAncestorGenerations) {
  originX = columnWidth + canvasPadding;
  originY = (rowHeight * 4) + canvasPadding; // Space for grandparents

  // Account for father's siblings on the left
  var fatherSiblings = family.father && family.father.siblings ? family.father.siblings.length : 0;
  originX += (fatherSiblings * columnWidth);
}

function setCanvasDimensions(canvas, numAncestorGenerations) {
  var numSiblings = family.siblings.length;

  // Count father's and mother's siblings
  var fatherSiblings = family.father && family.father.siblings ? family.father.siblings.length : 0;
  var motherSiblings = family.mother && family.mother.siblings ? family.mother.siblings.length : 0;

  var leftSide = Math.max(3, fatherSiblings + 2);
  var rightSide = Math.max(numSiblings + 2, motherSiblings + 2);
  var totalColumns = leftSide + 1 + rightSide;
  canvas.width = totalColumns * columnWidth + canvasPadding * 2;

  // Height: grandparents + parents/uncles + you/cousins + spouse + children
  var maxDepth = 10;
  canvas.height = (rowHeight * maxDepth) + canvasPadding * 2;

  canvas.width *= zoomLevel;
  canvas.height *= zoomLevel;
}

function getTreeDepth(objectWithParents, depth) {
  let leftDepth = depth;
  let rightDepth = depth;
  if (objectWithParents.father) {
    leftDepth = getTreeDepth(objectWithParents.father, depth + 1);
  }
  if (objectWithParents.mother) {
    rightDepth = getTreeDepth(objectWithParents.mother, depth + 1);
  }
  return Math.max(leftDepth, rightDepth);
}

function zoomIn() {
  zoomLevel += 0.1;
  zoomLevel = Math.min(2, zoomLevel);
  drawTree();
}

function zoomOut() {
  zoomLevel -= 0.1;
  zoomLevel = Math.max(0.1, zoomLevel);
  drawTree();
}

function resetZoom() {
  zoomLevel = 1;
  overallTranslationOffsetX = 0;
  overallTranslationOffsetY = 0;
  translationOffsetX = 0;
  translationOffsetY = 0;
  drawTree();
}

function handleMouseDown(event) {
  clickLocationX = event.clientX;
  clickLocationY = event.clientY;
}

function handleMouseMove(event) {
  if (event.buttons == 1) {
    translationOffsetX = event.clientX - clickLocationX;
    translationOffsetY = event.clientY - clickLocationY;
    drawTree();
  }
}

function handleMouseUp(event) {
  overallTranslationOffsetX += translationOffsetX;
  overallTranslationOffsetY += translationOffsetY;
}

// Touch support for mobile
var touchStartX = 0;
var touchStartY = 0;

function handleTouchStart(event) {
  if (event.touches.length === 1) {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
  }
}

function handleTouchMove(event) {
  if (event.touches.length === 1) {
    event.preventDefault();
    translationOffsetX = event.touches[0].clientX - touchStartX;
    translationOffsetY = event.touches[0].clientY - touchStartY;
    drawTree();
  }
}

function handleTouchEnd(event) {
  overallTranslationOffsetX += translationOffsetX;
  overallTranslationOffsetY += translationOffsetY;
}
