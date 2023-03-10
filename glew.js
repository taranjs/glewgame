var LOGGING = false;
var TOTAL_ALPHA = 35;
var score = 0;
var correctOption = -1;
var randomCorrectAlphabet = -1;
var usedAlphabetsForOptions = [10, 15, 20, 35];
var gameOver = false;
var timeLeft = 60;
var timeoutId;
var correctWords = [];
var practiceMode = true;
var freezeUntilNext = false;
$(".gameMode").click(function() {
    $(".gameMode").removeClass("selected");
    $(this).addClass("selected");
    practiceMode = $(this).prop("id") == "practice";
    if (getName()) $("#name").val(getName());
    $("#name").show();
    $("#startButton").show()
});
$("#startButton").click(function() {
    var $splash = $("#splash");
    $splash.animate({
        left: -$splash.outerWidth()
    });
    if (practiceMode) {
        $("#next").show();
        $("#timer").hide()
    } else {
        $("#next").hide();
        $("#timer").show();
        startTimer()
    }
    fillData();
    saveName()
});
gameOverFunc = function() {
    gameOver = true;
    $("#score").html("Game Over! Score: " + score + ' <span class="clickable underline">Play again!</span>');
    window.clearTimeout(timeoutId);
    correctWords = [];
    saveScore()
};
startTimer = function() {
    log("timeLeft");
    timeoutId = window.setInterval(updateTimer, 1E3)
};
updateTimer = function() {
    if (timeLeft > 0) {
        timeLeft = timeLeft - 1;
        $("#timer").text("Time left: " + timeLeft);
        log(timeLeft);
        if (timeLeft == 10) $("#timer").css({
            backgroundColor: "pink"
        });
        else if (timeLeft == 0) {
            $("#timer").css({
                backgroundColor: "red",
                color: "white"
            });
            gameOverFunc()
        }
    } else window.clearTimeout(timeoutId)
};
$("#score").click(function() {
    if (gameOver) replay()
});
$("#next").click(function() {
    if (gameOver) replay();
    else {
        freezeUntilNext = false;
        fillData()
    }
});
$(".option").click(function() {
    if (gameOver || freezeUntilNext) return;
    log("this.id" + this.id);
    log("correctOption" + correctOption);
    if (this.id == correctOption) {
        score = score + 1;
        $("#score").text("Score: " + score);
        usedAlphabetsForOptions = [10, 15, 20, 35];
        $(this).fadeIn(1500, function() {
            $(this).css({
                backgroundColor: "green",
                color: "white"
            })
        });
        if (practiceMode) {
            revealCorrectWords();
            freezeUntilNext = true
        } else fillData()
    } else {
        $(this).css({
            backgroundColor: "pink"
        });
        revealCorrectWords();
        if (practiceMode) freezeUntilNext = true;
        else gameOverFunc()
    }
});
revealCorrectWords = function() {
    log(correctWords);
    var optionContainers = $(".option");
    optionContainers.each(function(i, optionContainer) {
        var oc = $(optionContainer);
        var englishWord = oc.text();
        var gurmukhiWord = correctWords[i];
        oc.text(gurmukhiWord).hover(function() {
            oc.text(englishWord)
        }, function() {
            oc.text(gurmukhiWord)
        });
        if (i == correctOption - 1) oc.css({
            backgroundColor: "green",
            color: "white"
        })
    })
};
getAlphabetForIncorrectOption = function() {
    var notFoundLoop = 0;
    var randomAlphabet = random(TOTAL_ALPHA) + 1;
    log("randomAlphabetinternal" + randomAlphabet);
    while ($.inArray(randomAlphabet, usedAlphabetsForOptions) > -1) {
        log("not found");
        if (notFoundLoop < 100) {
            notFoundLoop = notFoundLoop + 1;
            randomAlphabet = random(TOTAL_ALPHA) + 1
        } else {
            log("Code FAIL!!!!!!!!");
            return false
        }
    }
    usedAlphabetsForOptions.push(randomAlphabet);
    log(usedAlphabetsForOptions);
    log(usedAlphabetsForOptions.length);
    log("found");
    return randomAlphabet
};
fillData = function() {
    correctWords = [];
    correctOption = random(4) + 1;
    randomCorrectAlphabet = random(TOTAL_ALPHA) + 1;
    if ([10, 15, 20, 35].indexOf(randomCorrectAlphabet) > -1) {
        log("randomCorrectAlphabet to be -1" + randomCorrectAlphabet);
        randomCorrectAlphabet = randomCorrectAlphabet - 1
    }
    usedAlphabetsForOptions.push(randomCorrectAlphabet);
    log("randomCorrectAlphabet" + randomCorrectAlphabet);
    $("#flash").text(alphabets[randomCorrectAlphabet]["gurmukhi"]);
    var optionContainers = $(".option");
    optionContainers.each(function(i, optionContainer) {
        $(optionContainer).unbind("mouseenter mouseleave");
        log("----------------------------------------");
        var randomAlphabet;
        if (i == correctOption - 1) randomAlphabet = randomCorrectAlphabet;
        else {
            randomAlphabet = getAlphabetForIncorrectOption();
            if (!randomAlphabet) return false
        }
        log("randomAlphabet" + randomAlphabet);
        log("i" + i);
        log("correctOption" + correctOption);
        var wordsList = alphabets[randomAlphabet]["words"];
        randomWordIndex = random(wordsList.length);
        $(optionContainer).text(wordsList[randomWordIndex]).css({
            backgroundColor: "#eee",
            color: "blue"
        });
        if (alphabets[randomAlphabet]["gurmukhiUnicode"]) correctWords.push(alphabets[randomAlphabet]["gurmukhiUnicode"][randomWordIndex])
    });
    return true
};
random = function(max) {
    return Math.floor(Math.random() * max)
};
replay = function() {
    score = 0;
    correctOption = -1;
    randomCorrectAlphabet = -1;
    usedAlphabetsForOptions = [10, 15, 20, 35];
    gameOver = false;
    timeLeft = 60;
    timeoutId;
    correctWords = [];
    freezeUntilNext = false;
    $("#splash").css({
        left: "0"
    });
    $("#score").text("Score: 0 ")
};
getName = function() {
    if (typeof Storage !== "undefined") return localStorage.glewPlayerName
};
saveName = function() {
    if (typeof Storage !== "undefined") {
        log($("#name").val(), true);
        localStorage.glewPlayerName = $("#name").val()
    }
};
saveScore = function() {                                      //saves players score in the score database for all the players
    var posting = $.post("http://glewscoreboard.glewgame13.appspot.com/saveScore", {
        name_data: $("#name").val(),
        score_data: score
    });
    posting.done(function(data) {
        loadScores()
    })
};
loadScores = function() {                                      //loads scoreboard for all preavious players. not working currently
    $("#scoreList").show();
    var getting = $.get("http://glewscoreboard.glewgame13.appspot.com");
    getting.done(function(data) {
        $("#scoreList #loading").hide();
        $("#scoreData").html(data);
        log("Score saved : " + data, true)
    })
};
test = function() {                                                             //Not used yet
    $("#splashContent").hide();
    tests.testWordMatch();            
    tests.testGame()
};
log = function(text, opt_test) {                                          // will log in console if text is true
    if (LOGGING || opt_test) window.console.log(text)
};
$(document).ready(function() {
    if (/\?test/i.test(window.location.href)) test()
});
