var rowHeight = 60;
var columnWidth = 100;
var boxHeight = 60;
var boxWidth = 60;
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
    {name: "哥哥", gender: "Male", notes: "older brother"},
    {name: "姐姐", gender: "Female", notes: "older sister"},
    {name: "弟弟", gender: "Male", notes: "younger brother"},
    {name: "妹妹", gender: "Female", notes: "younger sister"}
  ],
  families: [{
    spouse: {name: "妻子", gender: "Female", notes: "wife"},
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
    drawSiblingConnector(ctx, originX + (boxWidth / 2), originY + (boxHeight / 2), i + 1);
  });

  if (family.families[0].spouse) {
    drawSpouseConnector(ctx, originX + (boxWidth / 2), originY + (boxHeight / 2));
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

  // siblings
  family.siblings.forEach(function (sibling, i) {
    var color = (sibling.gender === "Male") ? maleColor : femaleColor;
    drawPerson(ctx, originX, originY, i + 1, 0, color, sibling);
  });

  // spouse
  if (family.families[0].spouse) {
    drawPerson(ctx, originX, originY, -1, 0, femaleColor, family.families[0].spouse);
  }

  // children
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
  var leftSide = Math.max(numChildrenPerSide, 1);
  var rightSide = Math.max(numChildrenPerSide, numSiblings);
  var totalColumns = leftSide + 1 + rightSide;
  canvas.width = totalColumns * columnWidth + canvasPadding;
  canvas.height = (rowHeight * (numAncestorGenerations + 2)) * 2 + canvasPadding;
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
  var xOffset = colOffset * columnWidth + (columnWidth / 4) + 5;
  var yOffset = rowOffset * rowHeight + (rowHeight / 2);

  ctx.beginPath();
  ctx.arc(x + xOffset, y + yOffset, rowHeight / 2, 0, Math.PI * 2, true);
  ctx.stroke();
  ctx.fillStyle = fill;
  ctx.fill();

  ctx.fillStyle = "white";
  ctx.font = "bold 14px Arial";
  ctx.fillText(personName, x + xOffset - ctx.measureText(personName).width / 2 + 1, y + yOffset + (rowHeight / 2 + 14) + 1);
  ctx.fillStyle = "black";
  ctx.fillText(personName, x + xOffset - ctx.measureText(personName).width / 2, y + yOffset + (rowHeight / 2 + 14));

  person.coordinates = {
    "X1": xOffset - rowHeight,
    "Y1": yOffset - rowHeight,
    "X2": xOffset + rowHeight,
    "Y2": yOffset + rowHeight,
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
