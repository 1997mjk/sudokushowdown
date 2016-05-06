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
    var COLORS = [
        '#e21400', '#91580f', '#f8a700', '#f78b00',
        '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
        '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
    ];


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
        else if(e.keyCode == 8){
            $cell.find('input').val('');   
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
        var number    = $cell.find('input').val();
        socket.emit('target', [index,number]);
        $selected = $([]);
        
    }
    socket.on('incorrect', function(answerList, coloration){
        $cell = $boardCells.eq(answerList[0]);
        $cell.empty().removeClass('empty').removeClass('solved').attr('style', null);
        var cell = $cell[0];
        var animator = new Animator({duration: 750});
        //FF8888
        var animation = new ColorStyleSubject(cell, "background-color", coloration, "#FFFFFF");
        $cell.text('').addClass('empty');
        animator.addSubject(animation).play();
    });

    socket.on('correct', function(answerList){
        //a specific user should get bonuses, but for now everyone gets it
        $cell = $boardCells.eq(answerList[0]);
        $cell.empty().removeClass('empty').removeClass('solved').attr('style', null);
        $cell.text(answerList[1]).addClass('solved');
        //$selected = $([]); //user specific?
    });

    socket.on('empty', function(answerList){
        $cell = $boardCells.eq(answerList[0]);
        $cell.text('').addClass('empty');        
    });


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
            $cell.text(number).addClass(cellState);
        }
    }

    function waitForPlayers(){

    };
    waitForPlayers();

    socket.on('startGame', function(){
        initializeBoard();
    });
});

//When users join, all will be assigned to room0 (which will denote the lobby)
//This is to be done on socket.on('adduser');
//Then, when they create rooms and enter a board-page, they will switch to a new room
//This new room should have a number > 1 assigned, to which it will be the room number
//you can find the origin of socket call with io.sockets.in(socket.room).emit('updatechat', socket.username, data); I think
//see http://psitsmike.com/2011/10/node-js-and-socket-io-multiroom-chat-tutorial/
//