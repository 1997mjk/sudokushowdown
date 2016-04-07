$(function() {
    var undefined;
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

    $(document.body).bind('click', function() {
        if ($selected.length > 0) {
            closeCellInput($selected);
        }

        if ($selected.length > 0) {
            closeCellInput($selected);
        }
    });

    $board.delegate('.cell.empty', 'click', function(e) {
        if ($game.hasClass('running') == false) {
            return false;
        }

        e.preventDefault();
        e.stopPropagation();

        if ($selected.length > 0) {
            closeCellInput($selected);
        }

        $selected = $(this);
        $selected.html('<input type="text"/>').find('input').focus();

        highlightCells(null);
        
        return;
    });

    $board.delegate('.cell.empty', 'keydown', function(e) {
        if ($game.hasClass('running') == false) {
            return false;
        }

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
        else if (e.keyCode >= 49 && e.keyCode <= 57) {
            var number = e.keyCode-48;
            $cell.find('input').val(number);
        }

        return;
    });
    
    $board.delegate('.cell.solved', 'click', handleHighlightTrigger);
    $legend.delegate('.cell', 'click', handleHighlightTrigger);    


    function handleHighlightTrigger(e) {
        if ($game.hasClass('running') == false) {
            return false;
        }

        e.preventDefault();

        if ($selected.length > 0) {
            closeCellInput($selected);
        }

        var $this  = $(this);
        var number = $this.text();

        $selected.empty();
        $selected = $([]);

        highlightCells(number);

        return;
    }

    function closeCellInput($cell) {
        var index     = $boardCells.index($cell);
        var target    = board.solution[index]+1;
        var number    = $cell.find('input').val();
        var complete  = false;

        $cell.empty().removeClass('empty').removeClass('solved').attr('style', null);

        if (number == target) {
            $cell.text(number).addClass('solved');
            counters[number]++;
            highlightCells(number);
            udpateLegend();

            complete = checkComplete();
        }
        else if (number != '') {
            var cell      = $cell[0];
            var animator  = new Animator({duration:750});
            var animation = new ColorStyleSubject(cell, "background-color", "#FF8888", "#FFFFFF");

            $cell.text('').addClass('empty');
            animator.addSubject(animation).play();
        }
        else {
            $cell.text('').addClass('empty');
        }

        $selected = $([]);

        if (complete) {
            highlightCells(null);
            setGameStateClass('complete');

           
        }
    }

    function highlightCells(number) {
        for (var i = 0; i < $boardCells.length; i++) {
            var $cell = $boardCells.eq(i);

            if (number && $cell.text() == number) {
                $cell.addClass('highlighted');
            }
            else {
                $cell.removeClass('highlighted');
            }
        }

        highlighted = number;
    }

    function udpateLegend() {
        $legendCells.each(function(idx, cell) {
            var $cell  = $(cell);
            var number = idx+1;

            if (counters[number] < 9) {
                $cell.removeClass('disabled');
            }
            else {
                $cell.addClass('disabled');
            }
        });
    }

    function checkComplete() {
        for (var i = 0; i < board.solution.length; i++) {
            var target = board.solution[i]+1;
            var number = $boardCells.eq(i).text();

            if (number != target) {
                return false;
            }
        }

        return true;
    }

    function setGameStateClass(classes) {
        var gameStates = ['clean', 'complete', 'paused', 'running'];

        $game.
            removeClass(gameStates.join(' ')).
            addClass(classes);
    }

    function setGameConfigClasses(classes) {
        var configStates = ['singleplayer', 'multiplayer', 'easy', 'medium', 'hard'];

        $game.
            removeClass(configStates.join(' ')).
            addClass(classes);
    }

    function parseTemplates() {
        var templates = {};

        $('script.template').each(function(idx, el) {
            var $this = $(el);
            var text  = $this.text();
            var id    = $this.attr('id');

            templates[id] = _.template(text);
        });

        return templates;
    }

    function populateSelectors(defaults, values) {
        var result = [];

        for (var i = 0; i < defaults.length; i++) {
            var original = defaults[i];
            var clone    = _.clone(original);
            var value    = clone.value;

            clone.selected = !!values[value];

            result.push(clone);
        }

        return result;
    }

    var startLoadingPuzzleWithDelay = _.debounce(function() {
        var config = $menu.data('config');

        if (config.player_mode && config.player_mode.multiplayer == true && config.difficulty) {
            alert('not yet');
            //startLoadingPuzzle(config);
        }
    }, 3000); 

    function cancelLoadingPuzzle() {
        gameLoaderHandle && gameLoaderHandle.abort();
        gameLoaderHandle = null;
        $game.removeClass('loading');
    }

    function startLoadingPuzzle(config) {
        $game.addClass('loading');
        
        var difficulty = _.keys(config.difficulty)[0];
        var mode       = _.keys(config.player_mode)[0];
        
        gameLoaderHandle = $.ajax({
            url: '/sudoku/api/v1/board',
            type: 'GET',
            success: function(data, status, ajax) {
                gameLoaderHandle = null;
                
                // TODO: implemente error handling
                if (!data || !data.payload) {
                    console.log('ahtung, ahtung, grave error1');
                    return;
                }
                
                board = data.payload;
                
                $game.removeClass('loading');
                setGameStateClass('running');
                setGameConfigClasses([mode, difficulty].join(' '));
                initializeBoard(board);
                
                console.log(difficulty, mode, board.difficulty);
            },
            error: function() {
                gameLoaderHandle = null;
                
                // TODO: implement
                console.log('ahtung, ahtung, grave error2');
            }
        });
    }
    
    function initializeBoard(board) {
        var puzzle = board.puzzle;

        $game.removeClass('complete');

        // populate cells
        counters = {'1':0,'2':0,'3':0,'4':0,'5':0,'6':0,'7':0,'8':0,'9':0};
        for (var i = 0; i < $boardCells.length; i++) {
            var $cell      = $boardCells.eq(i);
            var number     = puzzle[i] == null ? '' : puzzle[i]+1;
            var cellStates = ['empty', 'solved', 'highlighted'];
            var cellState  = number == '' ? 'empty' : 'solved';
            
            $cell.text(number).removeClass(cellStates.join(' ')).addClass(cellState);

            if (number != '') {
                counters[number]++;
            }
        }

        // highlight the first number
        highlighted = null;
        for (var i = 0; i < $boardCells.length; i++) {
            var $cell = $boardCells.eq(i);
            var text  = $cell.text();

            if (text != '') {
                $cell.click();
                break;
            }
        }

        udpateLegend();
    }

    function initializeApp() {
        $legendCells.each(function(idx, cell) {
            var $cell  = $(cell);

            $cell.addClass('disabled');
        });
        
        templates = parseTemplates();

        setGameStateClass('clean');

        $menu.data('config', {});
        $menu.data('state', 'normal');
        $menu.data('salutation', 'wecome');
        showMenu();
    }

    initializeApp();
});