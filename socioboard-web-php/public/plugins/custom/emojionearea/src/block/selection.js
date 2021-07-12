define([], function() {
    var saveSelection, restoreSelection;
    if (window.getSelection && document.createRange) {
        saveSelection = function(el) {
            var range = window.getSelection().getRangeAt(0);
            var preSelectionRange = range.cloneRange();
            preSelectionRange.selectNodeContents(el);
            preSelectionRange.setEnd(range.startContainer, range.startOffset);
            return preSelectionRange.toString().length;
        };

        restoreSelection = function(el, sel) {
            var charIndex = 0, range = document.createRange();
            range.setStart(el, 0);
            range.collapse(true);
            var nodeStack = [el], node, foundStart = false, stop = false;

            while (!stop && (node = nodeStack.pop())) {
                if (node.nodeType == 3) {
                    var nextCharIndex = charIndex + node.length;
                    if (!foundStart && sel >= charIndex && sel <= nextCharIndex) {
                        range.setStart(node, sel - charIndex);
                        range.setEnd(node, sel - charIndex);
                        stop = true;
                    }
                    charIndex = nextCharIndex;
                } else {
                    var i = node.childNodes.length;
                    while (i--) {
                        nodeStack.push(node.childNodes[i]);
                    }
                }
            }

            sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        }
    } else if (document.selection && document.body.createTextRange) {
        saveSelection = function(el) {
            var selectedTextRange = document.selection.createRange(),
                preSelectionTextRange = document.body.createTextRange();
            preSelectionTextRange.moveToElementText(el);
            preSelectionTextRange.setEndPoint("EndToStart", selectedTextRange);
            var start = preSelectionTextRange.text.length;
            return start + selectedTextRange.text.length;
        };

        restoreSelection = function(el, sel) {
            var textRange = document.body.createTextRange();
            textRange.moveToElementText(el);
            textRange.collapse(true);
            textRange.moveEnd("character", sel);
            textRange.moveStart("character", sel);
            textRange.select();
        };
    }
});