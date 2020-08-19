// ==UserScript==
// @name          Hide youtube comments
// @namespace     https://github.com/JakubFojtik/hide-youtube-comments
// @description   Hide certain repetitive youtube comments by their content
// @author        Jakub Fojtík
// @include       https://www.youtube.com/*
// @version       0.1
// @run-at        document-end
// ==/UserScript==

//Todo:
//hide comments
//listen to mutate events too
//make rules configurable
//externalize hiding rules

try {
    (async () => {
        function startAsEvent(action) {
            window.setTimeout(action, 0);
        }
		
		var comments = null;
        var doneThreads = new Map();
		
        // The whole thing wrapped so it can be restarted on lazy-loaded content.
        async function restart() {
			//console.log('restart');
				
			let commentsId = 'comments';
			comments = document.getElementById(commentsId);
			if(!comments) return;
			let threadTag = 'ytd-comment-thread-renderer';
			let textTag = 'ytd-expander';
			let threads = comments.getElementsByTagName(threadTag);

			for (let thread of threads) {
				if (doneThreads.has(thread)) continue;
				doneThreads.set(thread, 1);
				//console.log(thread);
				let comment = thread.getElementsByTagName(textTag)[0];
				if(!comment) continue;
				let baseComment = comment = comment.children[0].children[1];
				if(!comment) continue;
				while(comment.firstChild && comment.firstChild.nodeType!=Node.TEXT_NODE) {
					comment=comment.firstChild;
				}
				console.log(comment.innerHTML);
				if(comment.innerHTML.startsWith('0%')
					|| baseComment.children.length>3 && baseComment.children[2].innerHTML.trim()=='') {
						//todo: each span is followed by an empty one unless itself empty, check 3rd row, not 3rd span
					thread.style.display='none';
					console.log('removed: ' + comment.innerHTML);
				}
			}
        }
        restart();

		//todo reduce mutations, re-pick targetNode if null at start, only handle req muts.
        function restartOnDOMMutation(restart) {
			console.log('subsc');
            //https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
            // Select the node that will be observed for mutations
            const targetNode = comments ?? document.body;
			console.log(targetNode);

            // Options for the observer (which mutations to observe)
            const config = {
                attributes: true,
                childList: true,
                subtree: true
            };

            // Callback function to execute when mutations are observed
            const callback = function(mutationsList, observer) {
                //console.log('mutant');
				startAsEvent(restart);
            };

            // Create an observer instance linked to the callback function
            const observer = new window.MutationObserver(callback);

            // Start observing the target node for configured mutations
            observer.observe(targetNode, config);

			console.log('subscend');
        }
        restartOnDOMMutation(restart);

    })();
} catch (e) {
    console.error(e);
}
