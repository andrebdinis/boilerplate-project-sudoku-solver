'use strict';
const SudokuSolver = require('../controllers/sudoku-solver.js');
function sendResponse(object, res) {
  console.log(object);
  return res.json(object);
}

module.exports = function (app) {
  
  let solver = new SudokuSolver();
  // fields: puzzle, coordinate, value

  app.route('/api/check')
    .post((req, res) => {
      const { puzzle, coordinate, value } = req.body;

      // verify if any of the required fields is missing
      if(!puzzle || !coordinate || !value) {
        const errorObj = solver.printError("FIELDS_MISSING");
        return sendResponse(errorObj, res);
      }

      // verify 81 chars and invalid chars
      const validationResult = solver.validate(puzzle);
      if(typeof validationResult !== typeof true) {
        const errorObj = validationResult;
        return sendResponse(errorObj, res);
      }

      // verify value field
      if(!value.match(/^[1-9]{1}$/i)) {
        const errorObj = solver.printError("INVALID_VALUE");
        return sendResponse(errorObj, res);
      }
      const valueNumber = Number(value);

      // verify coordinate
      const coordinateCheckResult = solver.checkCoordinate(coordinate);
      if(!coordinateCheckResult) {
        const errorObj = solver.printError("INVALID_COORDINATE");
        return sendResponse(errorObj, res);
      }
      const rowCoordinate = coordinateCheckResult.upperedCaseRowCoordinate;
      const columnCoordinate = coordinateCheckResult.columnCoordinate;

      // verify conflict in all placements
      const checkConflictResult = solver.checkConflict(puzzle, rowCoordinate, columnCoordinate, valueNumber);
      if(checkConflictResult) {
        const conflictObj = Object.assign({}, checkConflictResult);
        return sendResponse(conflictObj, res);
      }

      // return valid
      const validObj = solver.printValid();
      return sendResponse(validObj, res);
    });

  
  app.route('/api/solve')
    .post((req, res) => {
      const { puzzle } = req.body;

      // verify if puzzle field is missing
      if(!puzzle) {
        const errorObj = solver.printError("FIELD_MISSING");
        return sendResponse(errorObj, res);
      }

      // verify 81 chars and invalid chars
      const validationResult = solver.validate(puzzle);
      if(typeof validationResult !== typeof true){
        const errorObj = validationResult;
        return sendResponse(errorObj, res);
      }

      // try to solve puzzle and verify if there is error
      const resultObj = solver.solve(puzzle);
      if(resultObj.hasOwnProperty("error")) {
        return sendResponse(resultObj, res);
      }

      // return solution
      const solutionObj = JSON.parse(JSON.stringify(resultObj));
      return sendResponse(solutionObj, res);
    });
};
