(function(document){
	
	console.log("Chain reaction activated ... ");	

	var gameGrid;
	var PLAYERS = 0;
	var currentPlayer;
	var splitCriteria;
	var playerChanceChecker;
	var WINNER = 0;
	var isActivePlayer;
	var hasCompletedFirstRound;
	
	var playerColors = ["#FF0022", "#FAFF00", "#66FF66", "#02A9EA", "#FF01FB", "#FF8866", "#FFFEFF", "#BB6B00", "#16F4D0", "#232ED1"];


	var getWhosChance = function* (players) {
	  	var index = 0;
	  	
	  	while(true){
	  		
	  		if(index < players.length) {		    	
		    	if(isActivePlayer[index]) {			    	
			    	yield players[index];
			    	index += 1;
		    	} else {
			    	while(index < players.length && !isActivePlayer[index]) {
			    		index += 1;
			    	}
		    	}
	  		} else {
	  			index = 0;
	  			if(isActivePlayer[index]) {			    	
			    	yield players[index];
			    	index += 1;
		    	} else {
			    	while(index < players.length && !isActivePlayer[index]) {
			    		index += 1;
			    	}
		    	}
	  		}
	  	}
	}


	var createPlayerChanceChecker = function() {
		
		var playerNumbers = new Array();
		
		isActivePlayer = new Array();
		hasCompletedFirstRound = new Array();

		for(var i = 1; i <= PLAYERS; i++) {
			playerNumbers.push(i);
			isActivePlayer.push(true);
			hasCompletedFirstRound.push(false);
		}

		playerChanceChecker = getWhosChance(playerNumbers);		

	}


	var createNewElement = function(elementName) {
		
		var element = document.createElement(elementName);
		
		var get = function() {
			return element;
		}
		var modify = function(attributes) {
			for (var key of Object.keys(attributes))
			    element.setAttribute(key, attributes[key]);
			return element;
		}
		return {
			'get': get,
			'modify': modify
		}
	}


	var clearPlayground = function() {
		WINNER = 0;
		var playground = document.querySelector("div.playground");
		playground.innerHTML = "";
	}

	var freezePlayground = function() {
		var playground = document.querySelector("div.playground");
		playground.classList.add = "freeze";
	}


	var createPlayground = function(rows, columns) {		
		var playground = document.querySelector("div.playground");
		clearPlayground();

		for(var row = 0; row < rows; row++) {
			for(var col = 0; col < columns; col++) {
				attributes = {
					"class": "box",
					"data-row": row,
					"data-column": col
				}
				var box = createNewElement("div").modify(attributes);
				playground.appendChild(box);	
			}
		}

		playground.style.width 	= ""+ (columns * 50) +"px";
		playground.style.height = ""+ (rows * 50) +"px";

	}


	var createGrid = function(rows, columns) {
		var grid = new Array();
		for(var row = 0; row < rows; row++) {
			var rowArray = new Array();
			for(var col = 0; col < columns; col++) {
				var state = {
					player: 0,
					atoms: 0
				}
				rowArray.push(state);
			}
			grid.push(rowArray);
		}
		return grid;
	}


	var setSplitCriteria = function() {

		var splitCriterias = document.querySelectorAll("input[name=split-criteria]");

		var criteria;
		for (var i = 0; i < splitCriterias.length; i++) {
	        if (splitCriterias[i].checked) {
	            splitCriteria = splitCriterias[i].value;
	            return;
	        }
	    }

	}


	var createNewGame = function() {

		var createNewGameBtn = document.querySelector("input[name=newgame]");

		createNewGameBtn.addEventListener("click", function() {
			
			var rows = document.querySelector("input[name=rows]").value;
			var columns = document.querySelector("input[name=columns]").value;
			var players = document.querySelector("input[name=players]").value;
				

			if(parseInt(players) > 10) {
				alert("Players cannot be greater than 10");
			} else if(parseInt(players) < 2) {
				alert("There should be atleast two players");	
			} else {
				
				PLAYERS = parseInt(players);
				gameGrid = createGrid(rows, columns);

				createPlayground(rows, columns);
				setSplitCriteria();
				createPlayerChanceChecker();

				document.querySelector(".whos-chance")
					.classList.remove("hide");
				startGame();				
			}

		});

	}


	var drawCell = function(row, col, atoms, player) {
		
		var box 
			= document.querySelector("div.box[data-column='"+col+"'][data-row='"+row+"']");

		box.innerHTML = "";	

		var numberInWords = {
			1: "one",
			2: "two",
			3: "three"
		}	

		attributes = {
			"class": "atom-container "+ numberInWords[parseInt(atoms)] +""
		}
		var atomContainer = createNewElement("div").modify(attributes);
		
		for (var i = 0; i < atoms; i++) {
			
			attributes = { "class": "atom "+ numberInWords[(i + 1)] +"" }
			var atom = createNewElement("div").modify(attributes);

			atom.style.background 
				= "radial-gradient(circle at 10px 10px, "+ playerColors[player - 1] +", #000)";

			atomContainer.appendChild(atom);
		}

		box.appendChild(atomContainer);

	}	


	var getCellLocation = function(rowLoc, colLoc) {
		var totalRows = gameGrid.length - 1;
		var totalCols = gameGrid[0].length - 1;

		if (rowLoc == 0 && colLoc == 0
			|| rowLoc == 0 && colLoc == totalCols
				|| rowLoc == totalRows && colLoc == 0
					|| rowLoc == totalRows && colLoc == totalCols) {
						return "corner";
					}
		else if(rowLoc == 0
				|| colLoc == 0
					|| rowLoc == totalRows
						|| colLoc == totalCols) {
							return "border"
						}
		else return "inner";						
	}


	var getNextPlayer = function() {
		
		currentPlayer = playerChanceChecker.next();	
		
		var whosChance = document.querySelector(".whos-chance");
		
		whosChance.innerText = "CHANCE: Player "+ currentPlayer.value +"";
		whosChance.style.color 
			= playerColors[currentPlayer.value - 1];
	}


	var getVisibleAdjacentCells = function(clickedRow, clickedCol) {
		
		var totalRows = gameGrid.length - 1;
		var totalCols = gameGrid[0].length - 1;

		clickedRow = parseInt(clickedRow);
		clickedCol = parseInt(clickedCol);

		var top = new Array(), right = new Array(), bottom = new Array(),
			left = new Array(),
			topRight = new Array(), topLeft = new Array(),
			bottomRight = new Array(), bottomLeft = new Array();

		if (clickedRow - 1 >= 0) {
			top.push(clickedRow - 1);
			top.push(clickedCol);
		
			if (clickedCol + 1 <= totalRows) {
				topRight.push(clickedRow - 1);
				topRight.push(clickedCol + 1);
			}
			
			if (clickedCol - 1 >= 0) {
				topLeft.push(clickedRow - 1);
				topLeft.push(clickedCol - 1);
			}
		}

		if (clickedCol + 1 <= totalRows) {
			right.push(clickedRow);
			right.push(clickedCol + 1);
		}


		if (clickedRow + 1 <= totalRows) {
			bottom.push(clickedRow + 1);
			bottom.push(clickedCol);
			
			if (clickedCol - 1 >= 0) {
				bottomLeft.push(clickedRow + 1);
				bottomLeft.push(clickedCol - 1);
			}

			if (clickedCol + 1 <= totalRows) {
				bottomRight.push(clickedRow + 1);
				bottomRight.push(clickedCol + 1);
			}
		}

		if (clickedCol - 1 >= 0) {
			left.push(clickedRow);
			left.push(clickedCol - 1);
		}


		var sides = new Array();

		switch(splitCriteria) {
			
			case "non-diagonal":
				sides.push(top);
				sides.push(right);
				sides.push(bottom);
				sides.push(left);
				break;

			case "diagonal":
				sides.push(topRight);
				sides.push(topLeft);
				sides.push(bottomRight);
				sides.push(bottomLeft);
				break;

			case "all":
				sides.push(top);
				sides.push(right);
				sides.push(bottom);
				sides.push(left);
				sides.push(topRight);
				sides.push(topLeft);
				sides.push(bottomRight);
				sides.push(bottomLeft);
				break;		
		}

		return sides;
	}		


	var clearCell = function(clickedRow, clickedCol) {
		var cellState = gameGrid[clickedRow][clickedCol];
		cellState.atoms = 0;		
		cellState.player = 0;
		var cell 
			= document.querySelector("div.box[data-column='"+clickedCol+"'][data-row='"+clickedRow+"']");
		cell.innerHTML = "";
	}	


	var startGame = function() {
		getNextPlayer();				
		initializeCells();
	}
	

	var checkGameStatus = function() {
		
		var totalRows = gameGrid.length;
		var totalCols = gameGrid[0].length;

		var checkActivePlayer = new Array();
		for(var i = 0; i < PLAYERS; i++) checkActivePlayer.push(false);		

		for(var row = 0; row < totalRows; row++) {
			for(var col = 0; col < totalCols; col++) {
				
				var cellState = gameGrid[row][col];
				var player = cellState.player;

				if(player !== 0 && !checkActivePlayer[player - 1]) {
					checkActivePlayer[player - 1] = true;
				}
			}
		}

		for(var i = 0; i < PLAYERS; i++) {
			if(!hasCompletedFirstRound[i])
				checkActivePlayer[i] = true;
		}

		for(var i = 0; i < PLAYERS; i++)
			isActivePlayer[i] = checkActivePlayer[i]

		var playersCount = 0;
		for(var i = 0; i < PLAYERS; i++) {
			if(checkActivePlayer[i]) {
				WINNER = i + 1;
				playersCount ++;
				if(playersCount > 1) {
					WINNER = 0;
					return { status: false };
				}
			}
		}

		var whosChance = document.querySelector(".whos-chance");
		whosChance.innerText = "Player "+ WINNER +" won!!";
		whosChance.style.color 
			= playerColors[WINNER - 1];
		freezePlayground();	
		return { 
			status: true
		};
	}


	var initializeCells = function() {

		var cells = document.querySelectorAll("div.box");

		for (var cell of cells) {
			cell.addEventListener("click", function(event) {

				if(WINNER <= 0) {
					var thisCell = this;
					var clickedCol = thisCell.getAttribute("data-column");
					var clickedRow = thisCell.getAttribute("data-row");
					playerPlay(clickedRow, clickedCol);
				}				
		
			});
		}

	}


	var playerPlay = function(clickedRow, clickedCol) {
		
		var player = currentPlayer.value;
		var cellState = gameGrid[clickedRow][clickedCol];

		var isMyColoredCell = (cellState.player === player);
		var isEmptyCell = (cellState.player === 0);

		if(isMyColoredCell || isEmptyCell) {

			playForThisPlayer(clickedRow, clickedCol, player);			
			hasCompletedFirstRound[player - 1] = true;
			if(WINNER <= 0)
				getNextPlayer();
		}

	}

	var playForThisPlayer = function(clickedRow, clickedCol, player) {
		
		var location = getCellLocation(clickedRow, clickedCol);		
		var cellState = gameGrid[clickedRow][clickedCol];
		var atoms = cellState.atoms;

		var checkIsGameOver = checkGameStatus();
		var isGameOver = checkIsGameOver.status;

		var isSplit = false;
		switch(location) {
			case "corner":
				if(atoms == 1) isSplit = true;
				break;
			case "border":
				if(atoms == 2) isSplit = true;
				break;
			case "inner":
				if(atoms == 3) isSplit = true;
				break;	
		}

		if(isSplit) {

			clearCell(clickedRow, clickedCol);			
			
			setTimeout(function() {
				var adjCells 
					= getVisibleAdjacentCells(clickedRow, clickedCol);
				for (var i = 0; i < adjCells.length; i++) {
					var cellPositions = adjCells[i];
					if(cellPositions.length > 0) {
						var newRow = cellPositions[0];
						var newCol = cellPositions[1];

						if(!isGameOver) {
							playForThisPlayer(newRow, newCol, player);		
						} else {
							var whosChance = document.querySelector(".whos-chance");
							whosChance.innerText = "Player "+ WINNER +" won!!";
							whosChance.style.color 
								= playerColors[WINNER - 1];
							freezePlayground();	
						}
					}
				}	
			}, 200);	

		} else {

			atoms ++;
			cellState.atoms = atoms;		
			cellState.player = player;
			drawCell(clickedRow, clickedCol, atoms, player);
		
		}

	}

	createNewGame();

})(document);
