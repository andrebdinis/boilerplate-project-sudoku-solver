class SudokuSolver {
  //constructor(){
  //}

  buildRowsLettersArray(numberOfLetters) {
    const arr = [],
          startCodeChar = 65, // "A"
          endCodeChar = startCodeChar + numberOfLetters;
    for(let i = startCodeChar; i < endCodeChar; i++) { arr.push(String.fromCharCode(i)); }
    return arr;
  }
  buildColumnsNumbersArray(numberOfNumbers) {
    const arr = [];
    for(let i = 0; i < numberOfNumbers; i++) { arr.push(i+1); }
    return arr;
  }
  buildCoordinatesArray(rowsArray, columnsArray) {
    const arr = [];
    for(let row = 0; row < rowsArray.length; row++) {
      for(let column = 0; column < columnsArray.length; column++) {
        arr.push(rowsArray[row] + "" + columnsArray[column]);
      }
    }
    return arr;
  }

  printSolution(puzzleString) { return { solution: puzzleString }; }
  printValid() { return { valid: true }; }
  printError(errorType) {
    let errorObj = {};
    switch(errorType) {
      case "FIELD_MISSING":
        errorObj.error = "Required field missing"; break;
      case "81_CHARS_EXPECTED":
        errorObj.error = "Expected puzzle to be 81 characters long"; break;
      case "INVALID_CHARS":
        errorObj.error = "Invalid characters in puzzle"; break;
      case "CANNOT_BE_SOLVED":
        errorObj.error = "Puzzle cannot be solved"; break;
        
      case "FIELDS_MISSING":
        errorObj.error = "Required field(s) missing"; break;
      // case "81_CHARS_EXPECTED":
      // case "INVALID_CHARS":
      case "INVALID_VALUE":
        errorObj.error = "Invalid value"; break;
      case "INVALID_COORDINATE":
        errorObj.error = "Invalid coordinate"; break;
      
      case "CONFLICT_ROW":
        errorObj.valid = false;
        errorObj.conflict = ["row"]; break;
      case "CONFLICT_COLUMN":
        errorObj.valid = false;
        errorObj.conflict = ["column"]; break;
      case "CONFLICT_REGION":
        errorObj.valid = false;
        errorObj.conflict = ["region"]; break;
      default:
        break;
    }
    return errorObj;
  }

  validate(puzzleString) {
    const puzzleStr = "" + puzzleString;
    const regexShouldNotHave = /[^1-9.]/i;

    if(puzzleStr.length !== 81) return this.printError("81_CHARS_EXPECTED");
  
    const shouldNotHave = puzzleStr.match(regexShouldNotHave) === null;
    if(!shouldNotHave) return this.printError("INVALID_CHARS");

    return true;
  }
  checkCoordinate(coordinate) {

    // check coordinate letter
    const testRowCoordinate = coordinate.match(/^[A-Ia-i]{1}/i);
    let rowCoordinate = "";
    if(testRowCoordinate) rowCoordinate = testRowCoordinate[0].toUpperCase();
    
    // check coordinate number
    const testColumnCoordinate = coordinate.match(/(?<=^[A-Ia-i]{1})[1-9]{1}$/i);
    let columnCoordinate = 0;
    if(testColumnCoordinate) columnCoordinate = Number(testColumnCoordinate[0]);

    // verify coordinate letter and number separately
    if(!rowCoordinate || !columnCoordinate) return false;
   
    // verify coordinate in its entirety
    const fullCoordUpperedCase = rowCoordinate + "" + columnCoordinate;
    if(!coordinates.find((coord) => coord === fullCoordUpperedCase)) return false;

    return { upperedCaseRowCoordinate: rowCoordinate, columnCoordinate: columnCoordinate };
  }
  checkConflict(puzzleString, row, column, value) {
    const rowConflict = this.checkRowPlacement(puzzleString, row, column, value);
    const columnConflict = this.checkColPlacement(puzzleString, row, column, value);
    const regionConflict = this.checkRegionPlacement(puzzleString, row, column, value);
    
    let conflictObj = { valid: false, conflict: [] };
    if(rowConflict.valid !== true) conflictObj.conflict.push("row");
    if(columnConflict.valid !== true) conflictObj.conflict.push("column");
    if(regionConflict.valid !== true) conflictObj.conflict.push("region");
    
    return conflictObj.conflict.length > 0 ? conflictObj : false;
  }

  checkPlacementForDifferentCellValue(baseCell, chosenArea, puzzleCellsArray, value) {
    const fullChosenArea = filterPuzzleCellsArrayBy(chosenArea, chosenArea==="row" ? baseCell.row : chosenArea==="column" ? baseCell.column : chosenArea==="region" ? baseCell.region : 0, puzzleCellsArray);
    const fullChosenAreaValuesArray = getNumberValuesFromCellArray(fullChosenArea);
  
    const canBePlaced = !fullChosenAreaValuesArray.find((d) => d === value);

    // true - new value can be placed; false - can not be placed
    if(!canBePlaced) {
      if(chosenArea === "row") return this.printError("CONFLICT_ROW");
      if(chosenArea === "column") return this.printError("CONFLICT_COLUMN");
      if(chosenArea === "region") return this.printError("CONFLICT_REGION");
      return this.printError("CANNOT_BE_SOLVED");
    }
    return this.printValid();
  }
  checkPlacementForEqualCellValue(baseCell, puzzleCellsArray, value) {
    const fullRow = getFullRowExceptBaseCell(baseCell, puzzleCellsArray);
    const fullCol = getFullColumnExceptBaseCell(baseCell, puzzleCellsArray);
    const fullReg = getFullRegionExceptBaseCell(baseCell, puzzleCellsArray);
    
    const allAreaArray = getNumberValuesFromCellArray([].concat(fullRow, fullCol, fullReg));

    const isThereConflict = allAreaArray.find((d) => d === value);
    if(isThereConflict) return this.printError("CANNOT_BE_SOLVED");
    return this.printValid();
  }
  checkPlacement(puzzleString, row, column, value, chosenArea) {
    const puzzleStr = "" + puzzleString;
    const coordinate = row + "" + column;
    
    const puzzleCellsMap = buildPuzzleCellsMap(puzzleStr);
    const puzzleCellsArray = buildPuzzleCellsArray(puzzleCellsMap);
    const baseCell = puzzleCellsArray.find(cell => cell.coordinate === coordinate);

    // IF DIFFERENT CELL VALUE, check placements for all numbers (even for the baseCell)
    if(baseCell.value !== value) {
      return this.checkPlacementForDifferentCellValue(baseCell, chosenArea, puzzleCellsArray, value);
    }
    else {
      // IF EQUAL CELL VALUE, check placements for all numbers EXCEPT baseCell
      return this.checkPlacementForEqualCellValue(baseCell, puzzleCellsArray, value);
    }
    return this.printValid();
  }

  checkRowPlacement(puzzleString, row, column, value) {
    return this.checkPlacement(puzzleString, row, column, value, "row");
  }
  checkColPlacement(puzzleString, row, column, value) {
    return this.checkPlacement(puzzleString, row, column, value, "column");
  }
  checkRegionPlacement(puzzleString, row, column, value) {
    return this.checkPlacement(puzzleString, row, column, value, "region");
  }
  
  checkIfOnePossibilityCellExists(puzzleCellsArray) {
    const allCellsPossibilitiesArray = getAllCellsPossibilitiesArray(puzzleCellsArray);
    let foundOnePossibilityCell = allCellsPossibilitiesArray.find((reducedCell) => reducedCell.possibilities.length === 1);
    return !!foundOnePossibilityCell;
  }
  isThereAnyCellValueConflict(puzzleString, puzzleCellsArray) {
    // verify conflict in all placements
    const puzzleStr = "" + puzzleString;
    let conflictFound = puzzleCellsArray.find((cell) => {
      if(cell.value !== ".") {
        const conflict = this.checkPlacement(puzzleStr, cell.row, cell.column, cell.value, "row");
        //console.log("CONFLICT:", conflict, conflict.hasOwnProperty("error"))
        if(conflict.hasOwnProperty("error")) return this.printError("CANNOT_BE_SOLVED")
      }
    });
    return conflictFound; // a conflicting cell found or undefined
  }

  solve(puzzleString) {
    let puzzleStr = "" + puzzleString;

    // verify 81 chars and invalid chars
    //if not boolean, then is object with error message
    const validationResult = this.validate(puzzleStr);
    if(typeof validationResult !== typeof true) {
      const errorObj = cloneObject(validationResult);
      return errorObj;
    }

    // build cellsMap and CellsArray
    const puzzleCellsMap = buildPuzzleCellsMap(puzzleStr);
    const puzzleCellsArray = buildPuzzleCellsArray(puzzleCellsMap);

    // check if there is a conflict in the initial puzzle string
    if(this.isThereAnyCellValueConflict(puzzleStr, puzzleCellsArray)) return this.printError("CANNOT_BE_SOLVED");

    // while there are spaces, a.k.a. dots (.), in the puzzle
    while( isThereDotsInPuzzleCellsMap(puzzleCellsMap) === true ) {
      
      // is there a single cell with only one possibility ?
      if(!this.checkIfOnePossibilityCellExists(puzzleCellsArray)) return this.printError("CANNOT_BE_SOLVED");

      // all of the one possibility cells found are going to be filled in cellsMap
      // and from that map update CellsArray and finally puzzleString,
      // to once again test if there are any spaces left in puzzle
      updatePuzzleCellsMapInCellsOfOnePossibility(puzzleCellsMap, puzzleCellsArray);
      updatePuzzleCellsArray(puzzleCellsMap, puzzleCellsArray);
      puzzleStr = updatePuzzleString(puzzleCellsMap);
    }
    return this.printSolution(puzzleStr);
  }
}

module.exports = SudokuSolver;
//----------------------------------------------------------------------------//
//----------------------------------------------------------------------------//

//-------------- THE FIRST SOLVE FUNCTION WORKED! -------------//
// .solvePuzzle (although without error-handling)
const sudokuSolver = new SudokuSolver();
const string = "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
//console.log(sudokuSolver.solve(string))

//----------------------------------------------------------------------------//
//----------------------------------------------------------------------------//
//----------------------- PUBLIC VARIABLES -----------------//
const rows = buildRowsLettersArray(9),
      columns = buildColumnsNumbersArray(9),
      values = build1to9ValuesArray(),
      coordinates = buildCoordinatesArray(rows, columns);

//----------------- CLONE AND CONVERT ------------------//
function cloneArray(array) {
  return JSON.parse(JSON.stringify(array));
}
function cloneObject(obj) {
  return Object.assign({}, obj);
}
function convertMapToValuesArray(map) {
  return Array.from(map.values());
}

//----------------- BUILD ------------------//
function buildRowsLettersArray(numberOfLetters) {
  const arr = [],
        startCodeChar = 65, // "A"
        endCodeChar = startCodeChar + numberOfLetters;
  for(let i = startCodeChar; i < endCodeChar; i++) { arr.push(String.fromCharCode(i)); }
  return arr;
}
function buildColumnsNumbersArray(numberOfNumbers) {
  const arr = [];
  for(let i = 0; i < numberOfNumbers; i++) { arr.push(i+1); }
  return arr;
}
function build1to9ValuesArray() {
  const arr = [];
  for(let i = 0; i < 9; i++) { arr.push(i+1); }
  return arr;
}
function buildCoordinatesArray(rowsArray, columnsArray) {
  const arr = [];
  for(let row = 0; row < rowsArray.length; row++) {
    for(let column = 0; column < columnsArray.length; column++) {
      arr.push(rowsArray[row] + "" + columnsArray[column]);
    }
  }
  return arr;
}
// '0' => '.'
function buildPuzzleIndexToValuesMap(puzzleString) {
  return new Map(puzzleString.split("").map((d, i) => [i, d]));
}
// 'A1' => { region: 1, row: 'A', column: 1 }
function buildCoordinatesToRegionsMap(puzzleString) {
  const arr = [];
  const limit = 3; //(puzzleString.length / 9) / 3;
  for(let regionsRow = 0; regionsRow < limit; regionsRow++) {
    const letterIndexBase = regionsRow * limit;
    for(let regionsCol = 0; regionsCol < limit; regionsCol++) {
      const numberIndexBase = regionsCol * limit;
      for(let row = 0; row < limit; row++) {
        const letterIndex = letterIndexBase + row;
        const letter = rows[letterIndex];
        for(let col = 0; col < limit; col++) {
          const numberIndex = numberIndexBase + col;
          const number = columns[numberIndex];

          const coordinate = letter + "" + number;
          const region = (limit * regionsRow) + regionsCol + 1;
          arr.push([ coordinate, {region: region, row: letter, column: number} ]);
        }}}}
  return new Map(arr);
}
// 'A1' => { puzzleIndex: 0, region: 1, value: 8, coordinate: 'A1', row: 'A', column: 1 }
function buildPuzzleCellsMap(puzzleString) {
  const indexToValuesMap = buildPuzzleIndexToValuesMap(puzzleString);
  const coordToRegionMap = buildCoordinatesToRegionsMap(puzzleString);
  return new Map(coordinates.map((coordinate, index , arr) => {
    const { region, row, column } = coordToRegionMap.get(coordinate),
          value = indexToValuesMap.get(index),
          valueConverted = value !== "." ? Number(value) : value,
          finalObject = Object.assign({}, { coordinate: coordinate, value: valueConverted, region: region, puzzleIndex: index, row: row, column: column});
    return [ coordinate, finalObject ];
  }));
}
function buildPuzzleCellsArray(puzzleCellsMap) {
  return Array.from(puzzleCellsMap.values());
}

//----------------- FILTER ROW, COLUMN, REGION, VALUES ------------------//
function filterPuzzleCellsArrayBy(parameter, value, puzzleCellsArray) {
    return puzzleCellsArray.filter((d) => d[parameter] === value);  
}
function getFullRowExceptBaseCell(baseCell, puzzleCellsArray) {
  const fullRow = filterPuzzleCellsArrayBy("row", baseCell.row, puzzleCellsArray);
  return fullRow.filter((cell) => baseCell.column !== cell.column);
}
function getFullColumnExceptBaseCell(baseCell, puzzleCellsArray) {
  const fullColumn = filterPuzzleCellsArrayBy("column", baseCell.column, puzzleCellsArray);
  return fullColumn.filter((cell) => baseCell.row !== cell.row);
}
function getFullRegionExceptBaseCell(baseCell, puzzleCellsArray) {
  const fullRegion = filterPuzzleCellsArrayBy("region", baseCell.region, puzzleCellsArray);
  return fullRegion.filter((cell) => baseCell.coordinate !== cell.coordinate);
}
function getNumberValuesFromCellArray(cellArray) {
  const cellArrayWithOnlyValidValues = cellArray.filter((cell) => cell.value !== ".");
  return cellArrayWithOnlyValidValues.map((d) => d.value);
}

//----------------- GET CELL POSSIBLE SOLUTIONS ------------------//
function getCellPossibilities(baseCell, puzzleCellsArray) {
  // get row, column and region cells
  const row = getFullRowExceptBaseCell(baseCell, puzzleCellsArray);
  const col = getFullColumnExceptBaseCell(baseCell, puzzleCellsArray);
  const region = getFullRegionExceptBaseCell(baseCell, puzzleCellsArray);

  // get row, column and region cell values
  const rowValues = getNumberValuesFromCellArray(row);
  const colValues = getNumberValuesFromCellArray(col);
  const regionValues = getNumberValuesFromCellArray(region);

  // get possible numbers to solve the cell
  const allValuesToExclude = Array.from(new Set(cloneArray([].concat(rowValues, colValues, regionValues)).sort((a, b) => a - b)));
  const allValuesPossibilities = cloneArray(values.filter((n) => allValuesToExclude.indexOf(n) === -1));

  return allValuesPossibilities;
}
function getAllCellsPossibilitiesArray(puzzleCellsArray) {
  return puzzleCellsArray.map((cell, index) => {
    return {coordinate: cell.coordinate, possibilities: getCellPossibilities(cell, puzzleCellsArray)};
  }).sort((a, b) => a.possibilities.length - b.possibilities.length);
}
// [ { coordinate: 'A1', possibilities: [ 7 ] } ]
function getCellsWithOnePossibilityArray(puzzleCellsArray) {
  return getAllCellsPossibilitiesArray(puzzleCellsArray).filter((reducedCell, i) => reducedCell.possibilities.length === 1);
}

//------------- UPDATE PUZZLE CELLS (ARRAY, MAP, AND STRING) ------------//
function isThereDotsInPuzzleCellsMap(puzzleCellsMap) {
  let thereAreDots = 0;
  const arr = buildPuzzleCellsArray(puzzleCellsMap);
  for(let i = 0; i < arr.length; i++)
    if(arr[i].value === ".") return true;
  return false;
}
function updatePuzzleCellsMapInCellsOfOnePossibility(puzzleCellsMap, puzzleCellsArray) {
  const onePossibilityArray = getCellsWithOnePossibilityArray(puzzleCellsArray);
  for(let reducedCell of onePossibilityArray){
    const coordinate = reducedCell.coordinate;
    const possibility = Number(reducedCell.possibilities[0]);
    const targetCell = puzzleCellsMap.get(coordinate);
    const finalObj = Object.assign( {}, targetCell, {value: possibility} );
    if(targetCell.value === ".") {
      puzzleCellsMap.set(coordinate, finalObj);
      //console.log(`${coordinate}: was assigned ${possibility}`)
    }
  }
}
function updatePuzzleCellsArray(puzzleCellsMap, puzzleCellsArray) {
  for(let i = 0; i < puzzleCellsArray.length; i++) {
    const coordinate = puzzleCellsArray[i].coordinate;
    puzzleCellsArray[i] = cloneObject(puzzleCellsMap.get(coordinate));
  }
}
function updatePuzzleString(puzzleCellsMap) {
  let puzzleString = "";
  puzzleCellsMap.forEach((cell, coordinate) => puzzleString += cell.value);
  return puzzleString;
}

//------------- SOLVE PUZZLE ------------//
function solvePuzzle(puzzleString) {
  const puzzleCellsMap = buildPuzzleCellsMap(puzzleString);
  let puzzleCellsArray = buildPuzzleCellsArray(puzzleCellsMap);
  
  while(isThereDotsInPuzzleCellsMap(puzzleCellsMap) === true) {
    updatePuzzleCellsMapInCellsOfOnePossibility(puzzleCellsMap, puzzleCellsArray);
    updatePuzzleCellsArray(puzzleCellsMap, puzzleCellsArray);
    puzzleString = updatePuzzleString(puzzleCellsMap);
  }
  return puzzleString;
}

//-------------- TESTS ----------------//
const PuzzleStrings = require("./puzzle-strings");
function runPuzzleStringsFCCtests() {
  // Test if all FCC tests of sudoku puzzle solutions match mine
  const limit = PuzzleStrings.puzzlesAndSolutions.length;
  for(let i=0; i < 1; i++){
    const puzzleString = PuzzleStrings.puzzlesAndSolutions[i][0];
    console.log("Puzzle:", puzzleString);
    
    const solvedPuzzleString = solvePuzzle(puzzleString);
    console.log("Solution:", solvedPuzzleString);
    
    console.log(PuzzleStrings.puzzlesAndSolutions[i][1] === solvedPuzzleString);
  }
}
function runOriginalPuzzleSolution() {
  // ORIGINAL:
  const puzzleString = '..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..';
  console.log("Puzzle:", puzzleString);
  const solution = solvePuzzle(puzzleString);
  console.log("Solution:", solution);
}

//-------------- RUN TESTS ----------------//
//runPuzzleStringsFCCtests();
//runOriginalPuzzleSolution();
//----------------------------------------------------------------------------//