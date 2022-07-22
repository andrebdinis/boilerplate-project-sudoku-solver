const chai = require('chai');
const assert = chai.assert;

const Solver = require('../controllers/sudoku-solver.js');
let solver = new Solver();

suite('Unit Tests', () => {

  suite('81 characters and invalid characters:', () => {
    test('#1 Logic handles a valid puzzle string of 81 characters', () => {
      const puzzle = "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
      const input = solver.validate(puzzle);
      const expected = true;
      assert.strictEqual(input, expected);
    })
    test('#2 Logic handles a puzzle string with invalid characters (not 1-9 or .)', () => {
      const puzzle = "..9..5.!.85.4....2a32..s...1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
      const input = JSON.stringify(solver.validate(puzzle));
      const expected = JSON.stringify({ error: "Invalid characters in puzzle" });
      assert.strictEqual(input, expected);
    })
    test('#3 Logic handles a puzzle string that is not 81 characters in length', () => {
      const puzzle = "..9..5.1.85.4...2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
      const input = JSON.stringify(solver.validate(puzzle));
      const expected = JSON.stringify({ error: "Expected puzzle to be 81 characters long" });
      assert.strictEqual(input, expected);
    })
  });

  suite('Row, column, region placement:', () => {
    test('#4 Logic handles a valid row placement', () => {
      const puzzle = "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
      const input = JSON.stringify(solver.checkRowPlacement(puzzle, "A", 1, 7));
      const expected =JSON.stringify({ valid: true });
      assert.strictEqual(input, expected);
    })
    test('#5 Logic handles an invalid row placement', () => {
      const puzzle = "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
      const input = JSON.stringify(solver.checkRowPlacement(puzzle, "I", 1, 3));
      const expected =JSON.stringify({ valid: false, conflict: ["row"] });
      assert.strictEqual(input, expected);
    })
    test('#6 Logic handles a valid column placement', () => {
      const puzzle = "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
      const input = JSON.stringify(solver.checkColPlacement(puzzle, "E", 1, 3));
      const expected =JSON.stringify({ valid: true });
      assert.strictEqual(input, expected);
    })
    test('#7 Logic handles an invalid column placement', () => {
      const puzzle = "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
      const input = JSON.stringify(solver.checkColPlacement(puzzle, "G", 1, 8));
      const expected =JSON.stringify({ valid: false, conflict: ["column"] });
      assert.strictEqual(input, expected);
    })
    test('#8 Logic handles a valid region (3x3 grid) placement', () => {
      const puzzle = "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
      const input = JSON.stringify(solver.checkRegionPlacement(puzzle, "A", 9, 5));
      const expected =JSON.stringify({ valid: true });
      assert.strictEqual(input, expected);
    })
    test('#9 Logic handles an invalid region (3x3 grid) placement', () => {
      const puzzle = "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
      const input = JSON.stringify(solver.checkRegionPlacement(puzzle, "B", 8, 1));
      const expected =JSON.stringify({ valid: false, conflict: ["region"] });
      assert.strictEqual(input, expected);
    })
  });

  suite('Solve puzzle:', () => {
    test('#10 Valid puzzle strings pass the solver', () => {
      const puzzle = "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
      const input = JSON.stringify(solver.solve(puzzle));
      const expected = JSON.stringify({ error: "Cannot be solved" });
      assert.notStrictEqual(input, expected);
    })
    test('#11 Invalid puzzle strings fail the solver', () => {
      const puzzle = "..9..5.1.85444...2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
      const input = JSON.stringify(solver.solve(puzzle));
      const expected = JSON.stringify({ error: "Puzzle cannot be solved" });
      assert.strictEqual(input, expected);
    })
    test('#12 Solver returns the expected solution for an incomplete puzzle', () => {
      const puzzle = "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
      const solution = "769235418851496372432178956174569283395842761628713549283657194516924837947381625";
      const input = JSON.stringify(solver.solve(puzzle));
      const expected =JSON.stringify({ solution: solution });
      assert.strictEqual(input, expected);
    })
  });

});
