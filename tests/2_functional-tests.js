const chai = require("chai");
const chaiHttp = require('chai-http');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);
const Solver = require("../controllers/sudoku-solver");
let solver = new Solver();

suite('FunctionalTests', () => {

  suite('POST /api/solve:', () => {
    const apiSolvePath = "/api/solve"
    
    test('#1 Solve a puzzle with valid puzzle string', (done) => {
      const puzzle = "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
      const solution = "769235418851496372432178956174569283395842761628713549283657194516924837947381625";
      const sendObj = { puzzle: puzzle };
      chai
        .request(server)
        .post(apiSolvePath)
        .type("form")
        .send(sendObj)
        .end((err, res) => {
          if(err) return console.error(err);
          assert.equal(res.status, 200);
          assert.property(res.body, "solution", "response should have a property named solution");
          assert.equal(res.body.solution, solution);
          done();
        })
    })
    test('#2 Solve a puzzle with missing puzzle string', (done) => {
      const sendObj = { };
      const expectedError = { error: "Required field missing" };
      chai
        .request(server)
        .post(apiSolvePath)
        .type("form")
        .send(sendObj)
        .end((err, res) => {
          if(err) return console.error(err);
          assert.equal(res.status, 200);
          assert.property(res.body, "error", "Response should have a property named error");
          assert.equal(res.body.error, expectedError.error);
          done();
        })
    })
    test('#3 Solve a puzzle with invalid characters', (done) => {
      const puzzle = "..9..5.1.85.4..g.2432..a...1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
      const sendObj = { puzzle: puzzle };
      const expectedError = JSON.stringify({ error: "Invalid characters in puzzle" });
      chai
        .request(server)
        .post(apiSolvePath)
        .type("form")
        .send(sendObj)
        .end((err, res) => {
          if(err) return console.error(err);
          assert.equal(res.status, 200);
          assert.property(res.body, "error", "Response should have a property named error");
          assert.equal(JSON.stringify(res.body), expectedError);
          done();
        })
    })
    test('#4 Solve a puzzle with incorrect length', (done) => {
      const puzzle = "..9..5.1.85.4....2432.......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
      const sendObj = { puzzle: puzzle };
      const expectedError = JSON.stringify({ error: "Expected puzzle to be 81 characters long" });
      chai
        .request(server)
        .post(apiSolvePath)
        .type("form")
        .send(sendObj)
        .end((err, res) => {
          if(err) return console.error(err);
          assert.equal(res.status, 200);
          assert.property(res.body, "error", "Response should have a property named error");
          assert.equal(JSON.stringify(res.body), expectedError);
          done();
        })
    })
    test('#5 Solve a puzzle that cannot be solved', (done) => {
      const puzzle = "..9..5.1.85.4...22232......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
      const sendObj = { puzzle: puzzle };
      const expectedError = JSON.stringify({ error: "Puzzle cannot be solved" });
      chai
        .request(server)
        .post(apiSolvePath)
        .type("form")
        .send(sendObj)
        .end((err, res) => {
          if(err) return console.error(err);
          assert.equal(res.status, 200);
          assert.property(res.body, "error", "Response should have a property named error");
          assert.equal(JSON.stringify(res.body), expectedError);
          done();
        })
    })
  })

  suite('POST /api/check:', (done) => {
    const apiCheckPath = "/api/check";
    
    test('#6 Check a puzzle placement with all fields', (done) => {
      const puzzle = "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
      const coordinate = "A1";
      const value = 7;
      const sendObj = { puzzle: puzzle, coordinate: coordinate, value: value };
      chai
        .request(server)
        .post(apiCheckPath)
        .type("form")
        .send(sendObj)
        .end((err, res) => {
          if(err) return console.error(err);
          assert.equal(res.status, 200);
          assert.property(res.body, "valid", "response should have a property named valid");
          assert.equal(res.body.valid, true);
          done();
        })
    })
    test('#7 Check a puzzle placement with single placement conflict', (done) => {
      const puzzle = "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
      const coordinate = "A2";
      const value = 1;
      const sendObj = { puzzle: puzzle, coordinate: coordinate, value: value };
      chai
        .request(server)
        .post(apiCheckPath)
        .type("form")
        .send(sendObj)
        .end((err, res) => {
          if(err) return console.error(err);
          assert.equal(res.status, 200);
          assert.property(res.body, "valid", "response should have a property named valid");
          assert.property(res.body, "conflict", "response should have a property named conflict");
          assert.isArray(res.body.conflict, "Conflict property should be an array");
          assert.equal(res.body.valid, false);
          assert.equal(JSON.stringify(res.body.conflict), JSON.stringify(["row"]));
          done();
        })
    })
    test('#8 Check a puzzle placement with multiple placement conflicts', (done) => {
      const puzzle = "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
      const coordinate = "A5";
      const value = 1;
      const sendObj = { puzzle: puzzle, coordinate: coordinate, value: value };
      chai
        .request(server)
        .post(apiCheckPath)
        .type("form")
        .send(sendObj)
        .end((err, res) => {
          if(err) return console.error(err);
          assert.equal(res.status, 200);
          assert.property(res.body, "valid", "response should have a property named valid");
          assert.property(res.body, "conflict", "response should have a property named conflict");
          assert.isArray(res.body.conflict, "Conflict property should be an array");
          assert.equal(res.body.valid, false);
          assert.equal(res.body.conflict.length > 1, true);
          assert.equal(JSON.stringify(res.body.conflict), JSON.stringify(["row", "column"]));
          done();
        })
    })
    test('#9 Check a puzzle placement with all placement conflicts', (done) => {
      const puzzle = "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
      const coordinate = "D3";
      const value = 9;
      const sendObj = { puzzle: puzzle, coordinate: coordinate, value: value };
      chai
        .request(server)
        .post(apiCheckPath)
        .type("form")
        .send(sendObj)
        .end((err, res) => {
          if(err) return console.error(err);
          assert.equal(res.status, 200);
          assert.property(res.body, "valid", "response should have a property named valid");
          assert.property(res.body, "conflict", "response should have a property named conflict");
          assert.isArray(res.body.conflict, "Conflict property should be an array");
          assert.equal(res.body.valid, false);
          assert.equal(res.body.conflict.length > 2, true);
          assert.equal(JSON.stringify(res.body.conflict), JSON.stringify(["row", "column", "region"]));
          done();
        })
    })
    test('#10 Check a puzzle placement with missing required fields', (done) => {
      const puzzle = "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
      const sendObj = { puzzle: puzzle };
      chai
        .request(server)
        .post(apiCheckPath)
        .type("form")
        .send(sendObj)
        .end((err, res) => {
          if(err) return console.error(err);
          assert.equal(res.status, 200);
          assert.property(res.body, "error", "response should have a property named error");
          assert.equal(JSON.stringify(res.body), JSON.stringify({ error: "Required field(s) missing" }));
          done();
        })
    })
    test('#11 Check a puzzle placement with invalid characters', (done) => {
      const puzzle = "..9..5.1.85.4.t..2432.s....1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
      const coordinate = "A1";
      const value = 7;
      const sendObj = { puzzle: puzzle, coordinate: coordinate, value: value };
      chai
        .request(server)
        .post(apiCheckPath)
        .type("form")
        .send(sendObj)
        .end((err, res) => {
          if(err) return console.error(err);
          assert.equal(res.status, 200);
          assert.property(res.body, "error", "response should have a property named error");
          assert.equal(JSON.stringify(res.body), JSON.stringify({ error: "Invalid characters in puzzle" }));
          done();
        })
    })
    test('#12 Check a puzzle placement with incorrect length', (done) => {
      const puzzle = "..9..5.1.85.4.....2432...1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
      const coordinate = "A1";
      const value = 7;
      const sendObj = { puzzle: puzzle, coordinate: coordinate, value: value };
      chai
        .request(server)
        .post(apiCheckPath)
        .type("form")
        .send(sendObj)
        .end((err, res) => {
          if(err) return console.error(err);
          assert.equal(res.status, 200);
          assert.property(res.body, "error", "response should have a property named error");
          assert.equal(JSON.stringify(res.body), JSON.stringify({ error: "Expected puzzle to be 81 characters long" }));
          done();
        })
    })
    test('#13 Check a puzzle placement with invalid placement coordinate', (done) => {
      const puzzle = "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
      const coordinate = "1dS";
      const value = 7;
      const sendObj = { puzzle: puzzle, coordinate: coordinate, value: value };
      chai
        .request(server)
        .post(apiCheckPath)
        .type("form")
        .send(sendObj)
        .end((err, res) => {
          if(err) return console.error(err);
          assert.equal(res.status, 200);
          assert.property(res.body, "error", "response should have a property named error");
          assert.equal(JSON.stringify(res.body), JSON.stringify({ error: "Invalid coordinate" }));
          done();
        })
    })
    test('#14 Check a puzzle placement with invalid placement value', (done) => {
      const puzzle = "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
      const coordinate = "A1";
      const value = "f287";
      const sendObj = { puzzle: puzzle, coordinate: coordinate, value: value };
      chai
        .request(server)
        .post(apiCheckPath)
        .type("form")
        .send(sendObj)
        .end((err, res) => {
          if(err) return console.error(err);
          assert.equal(res.status, 200);
          assert.property(res.body, "error", "response should have a property named error");
          assert.equal(JSON.stringify(res.body), JSON.stringify({ error: "Invalid value" }));
          done();
        })
    })
  })

});

