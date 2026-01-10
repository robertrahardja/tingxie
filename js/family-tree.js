var rowHeight = 50;
var columnWidth = 80;
var boxHeight = 60;
var boxWidth = 60;
var circleRadius = 15; // 1/4 of original (was 30)
var canvasPadding = 30;
var zoomLevel = 1;
var translationOffsetX = 0;
var translationOffsetY = 0;
var overallTranslationOffsetX = 0;
var overallTranslationOffsetY = 0;
var clickLocationX = 0;
var clickLocationY = 0;
var lastTranslationX = 0;
var lastTranslationY = 0;
var maleColor = "#80ccff";
var femaleColor = "#ffb3d9";
var numAncestorGenerations = 1;
var originX = columnWidth + canvasPadding;
var originY = rowHeight * 2 + canvasPadding;

var family = {
  person: {name: "你/我", gender: "Male", notes: "You"},
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
    {name: "姑妈", gender: "Female", notes: "Dad's older sister",
      families: [{
        spouse: {name: "姑夫", gender: "Male", notes: "Dad's sister's husband"},
        children: [
          {name: "堂弟", gender: "Male", notes: "Dad's sibling's son (younger)"},
          {name: "堂妹", gender: "Female", notes: "Dad's sibling's daughter (younger)"}
        ]
      }]
    },
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
    },
    {
      name: "叔叔", gender: "Male", notes: "Dad's younger brother",
      families: [{
        spouse: {name: "婶婶", gender: "Female", notes: "Dad's younger brother's wife"}
      }]
    },
    {name: "姑姑", gender: "Female", notes: "Dad's younger sister"},
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
      name: "姨妈", gender: "Female", notes: "Mom's older sister"
    },
    {
      name: "阿姨", gender: "Female", notes: "Mom's younger sister"
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
    mother: {name: "外婆", gender: "Female"}
  },
  father: {
    name: "爸爸", gender: "Male",
    father: {name: "爷爷", gender: "Male"},
    mother: {name: "奶奶", gender: "Female"}
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

  drawChildrenConnectors(ctx);
  drawAncestors(ctx, family, 0, 0);

  family.siblings.forEach(function (sibling, i) {
    drawSiblingConnector(ctx, originX + (columnWidth / 2), originY + (rowHeight / 2), i + 1);
  });

  if (family.families[0].spouse) {
    drawSpouseConnector(ctx, originX + (columnWidth / 2), originY + (rowHeight / 2));
  }

  // person (you)
  drawPerson(ctx, originX, originY, 0, 0, "#ffd700", family.person);

  // parents
  if (family.father) {
    drawPerson(ctx, originX, originY, -1, -2, maleColor, family.father);
  }
  if (family.mother) {
    drawPerson(ctx, originX, originY, 1, -2, femaleColor, family.mother);
  }

  // siblings and their families
  family.siblings.forEach(function (sibling, i) {
    var color = (sibling.gender === "Male") ? maleColor : femaleColor;
    drawPerson(ctx, originX, originY, i + 1, 0, color, sibling);

    // Draw sibling's spouse if exists
    if (sibling.families && sibling.families[0] && sibling.families[0].spouse) {
      var spouseColor = (sibling.families[0].spouse.gender === "Male") ? maleColor : femaleColor;
      drawPerson(ctx, originX, originY, i + 1, 1, spouseColor, sibling.families[0].spouse);
      // Draw connector between sibling and spouse
      var siblingX = originX + (columnWidth / 2) + ((i + 1) * columnWidth);
      var siblingY = originY + (rowHeight / 2);
      ctx.save();
      ctx.beginPath();
      ctx.setLineDash([3, 3]);
      ctx.moveTo(siblingX, siblingY);
      ctx.lineTo(siblingX, siblingY + rowHeight);
      ctx.stroke();
      ctx.restore();

      // Draw sibling's children if exist
      if (sibling.families[0].children) {
        sibling.families[0].children.forEach(function(child, childIndex) {
          var childColor = (child.gender === "Male") ? maleColor : femaleColor;
          drawPerson(ctx, originX, originY, i + 1, 2 + childIndex, childColor, child);
          // Draw connector from spouse to child
          var spouseY = siblingY + rowHeight;
          ctx.beginPath();
          ctx.moveTo(siblingX, spouseY + (rowHeight / 2));
          ctx.lineTo(siblingX, spouseY + (rowHeight / 2) + rowHeight);
          ctx.stroke();
        });
      }
    }
  });

  // your spouse
  if (family.families[0].spouse) {
    drawPerson(ctx, originX, originY, -1, 0, femaleColor, family.families[0].spouse);

    // Draw in-laws if exist
    if (family.families[0].spouse.father) {
      drawPerson(ctx, originX, originY, -2, -2, maleColor, family.families[0].spouse.father);
    }
    if (family.families[0].spouse.mother) {
      drawPerson(ctx, originX, originY, -3, -2, femaleColor, family.families[0].spouse.mother);
    }
  }

  // your children
  drawChildren(ctx);
  ctx.restore();
}

function adjustOriginBasedOnTreeData(numAncestorGenerations) {
  originX = columnWidth + canvasPadding;
  originY = (rowHeight * numAncestorGenerations) * 2 + canvasPadding;
  var childCount = family.families[0].children.length;
  var childrenPushingLeft = Math.floor(childCount / 2) - 1;
  var columnsToShiftNonNegative = Math.max(childrenPushingLeft, 0);
  originX += (columnsToShiftNonNegative * columnWidth);
}

function setCanvasDimensions(canvas, numAncestorGenerations) {
  var numSiblings = family.siblings.length;
  var numChildrenPerSide = Math.floor(family.families[0].children.length / 2);
  var leftSide = Math.max(numChildrenPerSide, 3); // Account for in-laws
  var rightSide = Math.max(numChildrenPerSide, numSiblings + 2);
  var totalColumns = leftSide + 1 + rightSide;
  canvas.width = totalColumns * columnWidth + canvasPadding * 2;

  // Calculate height based on maximum depth (siblings with children)
  var maxDepth = numAncestorGenerations + 4; // grandparents + parents + you/siblings + children + nieces/nephews
  canvas.height = (rowHeight * maxDepth) * 2 + canvasPadding * 2;

  canvas.width *= zoomLevel;
  canvas.height *= zoomLevel;
}

function drawChildren(ctx) {
  var childColumn = 0;
  family.families[0].children.forEach(function (child, i) {
    var color = (child.gender === "Male") ? maleColor : femaleColor;
    drawPerson(ctx, originX, originY, childColumn, 2, color, child);
    childColumn *= -1;
    if (childColumn <= 0) {
      childColumn -= 1;
    }
  });
}

function drawPerson(ctx, x, y, colOffset, rowOffset, fill, person) {
  var personName = person.name;
  var xOffset = colOffset * columnWidth + (columnWidth / 2);
  var yOffset = rowOffset * rowHeight + (rowHeight / 2);

  // Draw circle
  ctx.beginPath();
  ctx.arc(x + xOffset, y + yOffset, circleRadius, 0, Math.PI * 2, true);
  ctx.stroke();
  ctx.fillStyle = fill;
  ctx.fill();

  // Draw name below circle
  ctx.fillStyle = "white";
  ctx.font = "bold 11px Arial";
  ctx.fillText(personName, x + xOffset - ctx.measureText(personName).width / 2 + 1, y + yOffset + circleRadius + 12 + 1);
  ctx.fillStyle = "black";
  ctx.fillText(personName, x + xOffset - ctx.measureText(personName).width / 2, y + yOffset + circleRadius + 12);

  person.coordinates = {
    "X1": xOffset - circleRadius,
    "Y1": yOffset - circleRadius,
    "X2": xOffset + circleRadius,
    "Y2": yOffset + circleRadius,
  };
}

function drawChildrenConnectors(ctx) {
  var childColumn = 0;
  family.families[0].children.forEach(function (child, i) {
    drawChildConnector(ctx, originX + (boxWidth / 2), originY + boxHeight, childColumn);
    childColumn *= -1;
    if (childColumn <= 0) {
      childColumn -= 1;
    }
  });
}

function drawChildConnector(ctx, startX, startY, spacesOver) {
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  var totalColumnWidth = spacesOver * columnWidth;
  ctx.bezierCurveTo(startX, startY + rowHeight, startX + totalColumnWidth, startY, startX + totalColumnWidth, startY + rowHeight);
  ctx.stroke();
}

function drawSiblingConnector(ctx, startX, startY, spacesOver) {
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  var totalColumnWidth = spacesOver * columnWidth;
  ctx.lineTo(startX + totalColumnWidth, startY);
  ctx.stroke();
}

function drawSpouseConnector(ctx, startX, startY) {
  ctx.save();
  ctx.beginPath();
  ctx.setLineDash([5, 5]);
  ctx.moveTo(startX, startY);
  var totalColumnWidth = -1 * columnWidth;
  ctx.lineTo(startX + totalColumnWidth, startY);
  ctx.stroke();
  ctx.restore();
}

function drawAncestors(ctx, objectWithParents, columnOffset, generationNumber) {
  if (objectWithParents.father) {
    drawAncestorConnector(ctx, columnOffset, generationNumber, columnOffset - 1, generationNumber - 1);
    dawLeftAncestorTree(ctx, objectWithParents.father, columnOffset - 1, generationNumber - 1);
    drawAncestorConnector(ctx, columnOffset, generationNumber, columnOffset + 1, generationNumber - 1);
    dawRightAncestorTree(ctx, objectWithParents.mother, columnOffset + 1, generationNumber - 1);
  }
}

function dawLeftAncestorTree(ctx, objectWithParents, columnOffset, generationNumber) {
  if (objectWithParents) {
    var generationFromTop = numAncestorGenerations + generationNumber;
    if (objectWithParents.father) {
      var endPoint = { column: columnOffset - generationFromTop, row: generationNumber - 2 };
      dawLeftAncestorTree(ctx, objectWithParents.father, endPoint.column, generationNumber - 1);
      drawAncestorConnector(ctx, columnOffset, generationNumber, endPoint.column, endPoint.row);
      drawPerson(ctx, originX, originY, endPoint.column, 2 * (endPoint.row + 1), maleColor, objectWithParents.father);
    }
    if (objectWithParents.mother) {
      var endPoint = { column: columnOffset, row: generationNumber - 1 };
      drawAncestorConnector(ctx, columnOffset, generationNumber, endPoint.column, endPoint.row);
      drawPerson(ctx, originX, originY, endPoint.column, 2 * endPoint.row, femaleColor, objectWithParents.mother);
      dawLeftAncestorTree(ctx, objectWithParents.mother, endPoint.column, generationNumber - 1);
    }
  }
}

function dawRightAncestorTree(ctx, objectWithParents, columnOffset, generationNumber) {
  if (objectWithParents) {
    var generationFromTop = numAncestorGenerations + generationNumber;
    if (objectWithParents.father) {
      var endPoint = { column: columnOffset, row: generationNumber - 1 };
      drawAncestorConnector(ctx, columnOffset, generationNumber, endPoint.column, endPoint.row);
      drawPerson(ctx, originX, originY, endPoint.column, 2 * endPoint.row, maleColor, objectWithParents.father);
      dawRightAncestorTree(ctx, objectWithParents.father, endPoint.column, generationNumber - 1);
    }
    if (objectWithParents.mother) {
      var endPoint = { column: columnOffset + generationFromTop, row: generationNumber - 1 };
      drawAncestorConnector(ctx, columnOffset, generationNumber, endPoint.column, endPoint.row);
      drawPerson(ctx, originX, originY, endPoint.column, 2 * endPoint.row, femaleColor, objectWithParents.mother);
      dawRightAncestorTree(ctx, objectWithParents.mother, endPoint.column, generationNumber - 1);
    }
  }
}

function drawAncestorConnector(ctx, startColumn, startRow, endColumn, endRow) {
  var startX = originX + (boxWidth / 2) + (startColumn * columnWidth);
  var startY = originY + (startRow * (rowHeight + boxHeight));
  var endX = originX + (boxWidth / 2) + (endColumn * columnWidth);
  var endY = startY - rowHeight;
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  var spacesOver = endColumn - startColumn;
  var totalColumnWidth = spacesOver * columnWidth;
  ctx.bezierCurveTo(startX, startY - rowHeight, startX + totalColumnWidth, startY, endX, endY);
  ctx.stroke();
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
