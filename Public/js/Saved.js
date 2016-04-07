$(function() {
    var $game            = $('.game');
    var $menu            = $game.find('.menu');
    var $board           = $game.find('.board');
    var $legend          = $game.find('.legend');
    var $boardCells      = $board.find('.cell');
    var $legendCells     = $legend.find('.cell');
    var $selected        = $([]);
    var board            = null;
    var highlighted      = null;
    var counters         = null;
    var templates        = null;
    var gameLoaderHandle = null;
    var socket = io();

    $(document.body).bind('click', function() {
        if ($selected.length > 0) {
            closeCellInput($selected);
        }

        if ($selected.length > 0) {
            closeCellInput($selected);
        }
    });

    $board.delegate('.cell.empty', 'click', function(e){
        e.preventDefault();
        e.stopPropagation();

        if($selected.length > 0){
            closeCellInput($selected);
        }

        $selected = $(this);
        $selected.html('<input type="text"/>').find('input').focus();

        return;
    });
    
    $board.delegate('.cell.empty', 'keydown', function(e){
        var $this = $(this);
        var $cell = $this.closest('.cell');
        e.preventDefault();
        e.stopPropagation();

        // ENTER, ESC
        if (e.keyCode == 13 || e.keyCode == 27) {
            closeCellInput($cell);

            return;
        }
        // digits between 1-9
        else if (e.keyCode >= 49 && e.keyCode <= 57 ) {
            var number = e.keyCode-48;
            $cell.find('input').val(number);
        }
        else if(e.keyCode >= 97 && e.keyCode <= 105){
            var number = e.keyCode-96;
            $cell.find('input').val(number);
        }
        else if(e.keyCode >= 37 && e.keyCode <= 40){
            e.preventDefault();
            e.stopPropagation();

            if($cell.length > 0){
                closeCellInput($cell);
            }

            var index = $boardCells.index($cell);
            var newIndex;
            var $newCell;
            //LEFT ARROW
            if(e.keyCode == 37){
                //set $newCell css to normal somehow??!?!?
                newIndex = index-1;
                $newCell = $boardCells.eq(newIndex);
                solved = $newCell.hasClass('solved');
                while(solved){
                    newIndex = newIndex - 1;
                    $newCell = $boardCells.eq(newIndex);
                    solved = $newCell.hasClass('solved');
                }
                $newCell.html('<input type="text"/>').find('input').focus();
            }
            //UP ARROW
            else if(e.keyCode == 38){
                //set $newCell css to normal somehow??!?!?
                newIndex = index-9;
                $newCell = $boardCells.eq(newIndex);
                solved = $newCell.hasClass('solved');
                while(solved){
                    newIndex = newIndex -9;
                    $newCell = $boardCells.eq(newIndex);
                    solved = $newCell.hasClass('solved');
                }
                $newCell.html('<input type="text"/>').find('input').focus();
            }
            //RIGHTARROW
            else if(e.keyCode == 39){
                //set $newCell css to normal somehow??!?!?
                newIndex = index+1;
                if(newIndex==81){
                    newIndex = 0;
                }
                $newCell = $boardCells.eq(newIndex);
                solved = $newCell.hasClass('solved');
                while(solved){
                    newIndex = newIndex + 1;
                    if(newIndex==81){
                        newIndex = 0;
                    }
                    $newCell = $boardCells.eq(newIndex);
                    solved = $newCell.hasClass('solved');
                }
                $newCell.html('<input type="text"/>').find('input').focus();
            }
            //DOWN ARROW
            else{
                //set $newCell css to normal somehow??!?!?
                newIndex = index+9;
                if(newIndex > 80){
                    newIndex = newIndex-81;
                }
                $newCell = $boardCells.eq(newIndex);
                solved = $newCell.hasClass('solved');
                while(solved){
                    newIndex = newIndex+9;
                    if(newIndex > 80){
                        newIndex = newIndex-81;
                    }
                    $newCell = $boardCells.eq(newIndex);
                    solved = $newCell.hasClass('solved');
                }
                $newCell.html('<input type="text"/>').find('input').focus();
            }
            
            //MOVEACCORDING TO KEYCODE
        }
        else if(e.keyCode ==84 ){ //autofocuses on first empty cell
            //ADD THIS FEATURE LATER MAYBE

        }

        return;

    });

    function closeCellInput($cell) {
        var index     = $boardCells.index($cell);
        // var target    = findTarget(index); //SHOULD BE SERVER
        var target = 'kappa';
        socket.emit('target', [index,number]);
        socket.on('targetResult', function(data){
            console.log('data: ' + data);
            target = data;
            console.log('target: ' + target)
            var number    = $cell.find('input').val();
            var complete  = false;
            $cell.empty().removeClass('empty').removeClass('solved').attr('style', null);
            
            if (number == target) {
                $cell.text(number).addClass('solved');
                complete = true;
                //complete = checkComplete();
            }
            else if (number != '') {
                var cell      = $cell[0];
                var animator  = new Animator({duration:750});
                var animation = new ColorStyleSubject(cell, "background-color", "#FF8888", "#FFFFFF");
                $cell.text('').addClass('empty');
                animator.addSubject(animation).play();
                //$cell.html('<input type="text"/>').find('input').focus();
                //adding above line does not make the red light blinkerino
            }
            else {
                $cell.text('').addClass('empty');
            }
            $selected = $([]);

        });
        
    }
    function findTarget(index){
        // var solution = readSolutionFile();
        // var solution = "435269781682571493197834562826195347374682915951743628519326874248957136763418259";
        // return solution[index];

    }

    function initializeBoard() {
        var board = "XXX26X7X168XX7XX9X19XXX45XX82X1XXX4XXX46X29XXX5XXX3X28XX93XXX74X4XX5XX367X3X18XXX"
        // var puzzle = board.puzzle;
        
        // populate cells
        counters = {'1':0,'2':0,'3':0,'4':0,'5':0,'6':0,'7':0,'8':0,'9':0};
        for (var i = 0; i < $boardCells.length; i++) {
            var $cell      = $boardCells.eq(i);
            var number     = board[i] == 'X' ? '' : board[i];
            var cellStates = ['empty', 'solved'];
            var cellState  = number == '' ? 'empty' : 'solved';
            /*
            if (number == ''){
                cellState = 'empty';
            }
            else{
                cellState = 'solved';
            }
            */
            $cell.text(number).addClass(cellState);
            /*
            if (number != '') {
                counters[number]++;
            }*/
        }


    }
    

    initializeBoard();
});
