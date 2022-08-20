var rhit = rhit || {};
rhit.loginAuthManager = null;
rhit.userProfileManager = null;
rhit.mainPageContentManager = null;
rhit.mainPageTagManager = null;
rhit.viewPageContentManager = null;
rhit.viewPageCommentManager = null;
rhit.editPageManager = null;

rhit.FB_ARTICLE_PREVIEW_COLLECTION = "article";
rhit.FB_ARTICLE_PREVIEW_KEY_TITLE = "title";
rhit.FB_ARTICLE_PREVIEW_KEY_AUTHOR = "uid";
rhit.FB_ARTICLE_PREVIEW_KEY_COVER = "coverUrl";
rhit.FB_ARTICLE_PREVIEW_KEY_DATE = "date";
rhit.FB_ARTICLE_PREVIEW_KEY_CONTENT = "preViewContent";
rhit.FB_ARTICLE_PREVIEW_KEY_TAGS = "tags";
rhit.FB_ARTICLE_PREVIEW_KEY_ISEMPTY = "isEmpty";

rhit.FB_ARTICLE_COMMENT_COLLECTION = "articleComments";
rhit.FB_ARTICLE_COMMENT_KEY_ARTICLEID = "articleId";
rhit.FB_ARTICLE_COMMENT_KEY_DATE = "date";
rhit.FB_ARTICLE_COMMENT_KEY_CONTENT = "comment";

rhit.FB_ARTICLE_CONTENT_COLLECTION = "articleMainContent";
rhit.FB_ARTICLE_CONTENT_KEY_MUSIC = "music";
rhit.FB_ARTICLE_CONTENT_KEY_CONTENT = "content";

rhit.FB_ARTICLE_TAGS_COLLECTION = "articleTags";
rhit.FB_ARTICLE_TAGS_KEY_NUMBER = "number";
rhit.FB_ARTICLE_TAGS_KEY_NAME = "tag";

rhit.FB_USER_COLLECTION = "users";
rhit.FB_USER_KEY_NAME = "name";
rhit.FB_USER_KEY_PHOTOURL = "photoUrl";
rhit.FB_USER_KEY_SLOGAN = "slogan";



rhit._monthNames = ["January", "February", "March", "April", "May", "June",
	"July", "August", "September", "October", "November", "December"
];
rhit._tagColor = [
	"#F4BFBF", "#92B4EC", "#B3E8E5", "#E8C07D", "#3AB4F2",
	"#F5F0BB", "#F7E2D6", "#FFD9C0", "#F6E3C5", "#F9CEEE", "#E78EA9",
	"#FFD36E", "#F6FFA4", "#F7E2E2", "#9ADCFF", "#C1F4C5", "#D9D7F1"
];

// From https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro
function htmlToElement(html) {
	var template = document.createElement('template');
	html = html.trim(); // Never return a text node of whitespace as the result
	template.innerHTML = html;
	return template.content.firstChild;
}

function backToTop() {
	window.scrollTo({
		top: 0,
		behavior: 'smooth'
	});

}

function shareWithOther() {

    alert("You can copy this page's url to share with others!");
}


rhit.Article = class {
	constructor(id, uid, date, title, preViewContent, coverUrl, tags) {
		this.articleID = id;
		this.uid = uid;
		this.date = date;
		this.title = title;
		this.preViewContent = preViewContent;
		this.coverUrl = coverUrl;
		this.tags = tags;
	}
}

rhit.ArticleFull = class {
	constructor(articleid, date, title, content, coverUrl, tags, author, music, preview) {
		this.articleID = articleid;
		this.date = date;
		this.title = title;
		this.content = content;
		this.coverUrl = coverUrl;
		this.tags = tags;
		this.uid = author;
		this.music = music;
		this.preView = preview;
	}
}

rhit.Comment = class {
	constructor(comment, date) {
		this.comment = comment;
		this.date = date;
	}
}

rhit.Tag = class {
	constructor(tag, number) {
		this.name = tag;
		this.number = number;
	}
}

rhit.MainPageController = class {
	constructor(uid) {
		this._closeBtn = document.querySelector("#closeBtn");
		this._menuBtn = document.querySelector("#menuBtn");
		this._mainPage = document.querySelector("#mainPage");
		this._hiddenPage = document.querySelector("#hiddenPage");
		this._categoryPage = document.querySelector("#categoryPage");
		this._searchPage = document.querySelector("#searchPage");
		this._searchResult = document.querySelector("#searchResult");
		this._territoryLink = document.querySelector("#territoryLink");
		this._isLogin = document.querySelector("#loginBtn");
		this._searchInput = "All";
		this._permission = false;
		this._searchMode = "title";
		this._uid = uid;
		this._cnt = 2;

		//load all tags
		rhit.mainPageTagManager.beginListening(() => { });

		rhit.editPageManager.clearEmptyArticle();

		if (rhit.loginAuthManager.isSignedIn && this._uid == rhit.loginAuthManager.uid) {
			document.querySelector("#loginBtn").checked = true;
		} else {
			document.querySelector("#loginBtn").checked = false;
		}

		document.querySelector("#territoryLink").href = `/mainPage.html?uid=${this._uid}`;

		document.querySelector("#menuBtn").onclick = () => {
			this.updateView("hiddenPage");
		};

		document.querySelector("#closeBtn").onclick = () => {
			this.updateView("mainPage");
		};

		document.querySelector("#searchBtn").onclick = () => {
			this.updateView("searchPage");
		};

		document.querySelector("#searchStartBtn").onclick = () => {
			this._searchInput = document.querySelector("#inputSearch").value;
			if (this._searchInput) {
				this._searchMode = "title";
				this.updateView("searchResult");
			}

		};

		document.querySelector("#loginBtn").onclick = () => {
			if (rhit.loginAuthManager.isSignedIn) {
				rhit.loginAuthManager.signOut();
				document.querySelector("#loginBtn").checked = false;
			} else {
				window.location.href = "/loginPage.html";
			}
		};

		document.querySelector("#showAboutUs").onclick = () => {
			window.location.href = "/";
		};

		document.querySelector("#showAllTags").onclick = () => {
			this.updateView("categoryPage");
		};

		document.querySelector("#showProfile").onclick = () => {
			if (rhit.loginAuthManager.isSignedIn && this._uid == rhit.loginAuthManager.uid)
				window.location.href = `/profilePage.html`;
			else {
				$('#loginAlert').modal('show');
			}
		};

		document.querySelector("#fab-edit").onclick = () => {
			this._searchMode = "edit";
			this.updateView("searchResult");
		};

		document.querySelector("#fab-add").onclick = () => {
			if (rhit.loginAuthManager.isSignedIn && this._uid == rhit.loginAuthManager.uid)
				window.location.href = `/editPage.html?uid=${uid}`;
			else {
				$('#loginAlert').modal('show');
			}
		};

		rhit.userProfileManager.beginListening(this._uid, this._updateProfileView.bind(this));



		this.updateView("mainPage");
	}

	updateView(cur_page) {
		this._territoryLink.style.color = "black";
		if (cur_page == "mainPage") {
			//start listening
			rhit.mainPageContentManager.beginListening(this._loadMainPageCardList.bind(this));

			this._territoryLink.style.color = "#FFFFFF";
			this._mainPage.style.display = "block";

			setTimeout(function () {
				document.querySelector("#mainPage").style.opacity = 1;
			}, 10);

			this._menuBtn.style.display = "block";
			this._closeBtn.style.display = "none";
			this._setHidden(this._hiddenPage);
			this._setHidden(this._categoryPage);
			this._setHidden(this._searchPage);
			this._setHidden(this._searchResult);

		} else if (cur_page == "hiddenPage") {
			this._setHidden(this._mainPage);
			this._menuBtn.style.display = "none";
			this._closeBtn.style.display = "block";
			this._hiddenPage.style.display = "block";

			setTimeout(function () {
				document.querySelector("#hiddenPage").style.opacity = 1;
			}, 10);

			this._setHidden(this._categoryPage);
			this._setHidden(this._searchPage);
			this._setHidden(this._searchResult);
		} else if (cur_page == "categoryPage") {

			rhit.mainPageTagManager.beginListening(this._loadCategoryTags.bind(this));

			this._setHidden(this._mainPage);
			this._menuBtn.style.display = "none";
			this._closeBtn.style.display = "block";
			this._setHidden(this._hiddenPage);
			this._categoryPage.style.display = "block";
			setTimeout(function () {
				document.querySelector("#categoryPage").style.opacity = 1;
			}, 10);

			this._setHidden(this._searchPage);
			this._setHidden(this._searchResult);


		} else if (cur_page == "searchResult") {
			this._permission = false;
			//start listening
			if (this._searchMode == "title") {
				rhit.mainPageContentManager.getArticleByTitle(this._loadSearchCards.bind(this), this._searchInput);
			}

			else if (this._searchMode == "tag") {
				rhit.mainPageContentManager.getArticleByTag(this._loadSearchCards.bind(this), this._searchInput);
			}

			else {

				if (rhit.loginAuthManager.isSignedIn && this._uid == rhit.loginAuthManager.uid) {
					this._permission = true;
					rhit.mainPageContentManager.beginListening(this._loadSearchCards.bind(this), rhit.mainPageContentManager.length);

				} else {
					$('#loginAlert').modal('show');
					// console.log("please login");
					return;
				}
			}

			this._setHidden(this._mainPage);
			this._menuBtn.style.display = "none";
			this._closeBtn.style.display = "block";
			this._setHidden(this._hiddenPage);
			this._setHidden(this._categoryPage);
			this._setHidden(this._searchPage);
			this._searchResult.style.display = "block";
			setTimeout(function () {
				document.querySelector("#searchResult").style.opacity = 1;
			}, 10);

		} else if (cur_page == "searchPage") {
			this._setHidden(this._mainPage);
			this._menuBtn.style.display = "none";
			this._closeBtn.style.display = "block";
			this._setHidden(this._hiddenPage);
			this._setHidden(this._categoryPage);
			this._searchPage.style.display = "block";
			setTimeout(function () {
				document.querySelector("#searchPage").style.opacity = 1;
			}, 10);
			this._setHidden(this._searchResult);
		}
	}

	_updateProfileView() {
		document.querySelector("#profile-Icon").src = rhit.userProfileManager.photoUrl;
		document.querySelector("#territoryLink").innerHTML = rhit.userProfileManager.name;
		document.querySelector("#slogan").innerHTML = rhit.userProfileManager.slogan;
	}

	_setHidden(element) {
		element.style.display = "none";
		element.style.opacity = 0;
	}

	_loadMainPageCardList(articles, articleNum) {
		// create introduction article for new users
		if (articles.length == 0) {
			console.log("create introduction Page for you");
			rhit.mainPageTagManager = new rhit.MainPageTagManager(this._uid);
			rhit.mainPageTagManager.addTag("Introduction");

			rhit.editPageManager = new rhit.EditPageManager(this._uid);
			rhit.editPageManager.loadIntroductionArticle();
			return;
		}
			
		this._loadCoverPage(articles[0]);

		// Make a new quoteListContainer
		const newList = htmlToElement('<div class="container page-container" id="mainPage-card-list"></div>');
		// Fill the quoteListContainer with quote cards using a loop
		for (let i = 1; i < articleNum && i < articles.length; i++) {
			const article = articles[i];
			const newCard = this._createCard(article);

			newCard.onclick = (event) => {
				window.location.href = `/viewPage.html?uid=${this._uid}&articleId=${article.articleID}`;
			};

			newList.appendChild(newCard);
			newList.appendChild(this._createVerticleLine());
		}

		if (this._cnt > articles.length) {
			newList.appendChild(this._createBackTopBtn());
		} else {
			newList.appendChild(this._createSeeMoreBtn());
		}


		const oldList = document.querySelector("#mainPage-card-list");
		oldList.removeAttribute("id");
		oldList.parentElement.appendChild(newList);
		oldList.remove();

		if (document.querySelector("#seeMoreBtn")) {
			document.querySelector("#seeMoreBtn").onclick = () => {
				this._cnt += 2;
				rhit.mainPageContentManager.beginListening(this._loadMainPageCardList.bind(this), this._cnt);
			};
		}


	}

	_loadCoverPage(article) {
		const coverArticle = article;
		let date = new Date(coverArticle.date["seconds"] * 1000);

		document.querySelector("#Index-date").innerHTML = `${rhit._monthNames[date.getMonth()]}&nbsp;${date.getDate()},${date.getFullYear()}`;
		document.querySelector("#Index-title").innerHTML = coverArticle.title;
		document.querySelector("#Index-content").innerHTML = coverArticle.preViewContent;
		document.querySelector("#cover").style.backgroundImage = `url(${coverArticle.coverUrl})`;
		document.querySelector("#Index-article").onclick = () => {
			window.location.href = `/viewPage.html?uid=${this._uid}&articleId=${coverArticle.articleID}`;
		}

	}


	_loadSearchCards(articles, cardNum) {
		document.querySelector("#searchTitle").innerHTML = this._searchInput;
		document.querySelector("#searchTitle").style.width = `${this._searchInput.length * 35}px`;

		// Make a new quoteListContainer
		const newList = htmlToElement("<div class='row' id='searchResultRow'>");
		// Fill the quoteListContainer with quote cards using a loop
		for (let i = 0; i < cardNum && i < articles.length; i++) {
			const article = articles[i];
			const newCard = this._createCard(article);

			newCard.classList.add("col-md-4", "col-lg-3", "col-xl-2");

			newCard.querySelector(".card-body").onclick = (event) => {
				window.location.href = `/viewPage.html?uid=${this._uid}&articleId=${article.articleID}`;
			};
			newList.appendChild(newCard);
		}

		const oldList = document.querySelector("#searchResultRow");
		oldList.removeAttribute("id");
		oldList.hidden = true;
		oldList.parentElement.appendChild(newList);
		oldList.remove();

		//check login
		if (this._permission && rhit.loginAuthManager.isSignedIn && this._uid == rhit.loginAuthManager.uid) {
			// console.log("changed");
			const deleteBtns = document.querySelectorAll("#searchResult .deleteBtn");
			for (let i = 0; i < deleteBtns.length; i++) {
				deleteBtns[i].style.display = "block";
				//delete article action
				if (deleteBtns.length > 1) {
					deleteBtns[i].onclick = () => {
						const article = rhit.mainPageContentManager.getIndexAt(i);
						rhit.viewPageCommentManager = new rhit.ViewPageCommentManager(article.articleID);
						rhit.viewPageContentManager = new rhit.ViewPageContentManager(article.articleID);
						

						//decrease tag num by 1
						for (let j = 0; j < article.tags.length; j++) {
							rhit.mainPageTagManager.decreaseTagNum(article.tags[j]);
						}

						//delete specific article
						rhit.mainPageContentManager.deleteArticleById(article.articleID);
						rhit.viewPageCommentManager.deleteAllArticleComments();
						rhit.viewPageContentManager.deleteArticleById(article.articleID);
						let listRef = firebase.storage().ref().child(`${this._uid}/${article.articleID}`);
						listRef.listAll()
						.then((res) => {
							res.items.forEach((itemRef) => {
							// All the items under listRef.
								itemRef.delete();
							});
						}).catch((error) => {
							// Uh-oh, an error occurred!
						});

						
						const tmpCnt = rhit.mainPageContentManager.length-1;
						//reload
						rhit.mainPageContentManager.beginListening(this._loadSearchCards.bind(this), tmpCnt);
					}
				} else {
					//make sure at least article
					deleteBtns[i].onclick = () => {
						window.alert("You have to keep one article aviliable");
					}
				}

			}

			const newCards = document.querySelectorAll("#searchResult .card-body");
			for (let i = 0; i < newCards.length; i++) {
				newCards[i].onclick = () => {
					console.log("Go to Update Page");
					window.location.href = `/editPage.html?uid=${this._uid}&articleId=${articles[i].articleID}`;
				}
			}
		}

		this._searchInput = "All";

	}

	_loadCategoryTags() {
		// Make a new quoteListContainer
		const newList = htmlToElement("<div id='categories'>");
		// Fill the quoteListContainer with quote cards using a loop
		for (let i = 0; i < rhit.mainPageTagManager.length; i++) {
			const tag = rhit.mainPageTagManager.getIndexAt(i);
			const newTag = this._createTags(tag);

			newTag.onclick = (event) => {
				this._searchInput = tag.name;
				this._searchMode = "tag";
				this.updateView("searchResult");
			};
			newList.appendChild(newTag);
		}

		const oldList = document.querySelector("#categories");
		oldList.removeAttribute("id");
		oldList.hidden = true;
		oldList.parentElement.appendChild(newList);
		oldList.remove();
	}

	_createTags(tag) {
		return htmlToElement(
			`
			<div class="col">
				<span class="tag-title">${tag.name}</span>
				<span class="tag-num">[${tag.number}]</span>
		  	</div>
			`
		);
	}

	_createCard(article) {
		// console.log(article.date);
		let date = new Date(article.date["seconds"] * 1000);

		return htmlToElement(
			`<div class="card">
			<img class="card-img-top" src="${article.coverUrl}" alt="Card image cap">
			<div class="card-body">	
			  <div class="list-Title">${article.title}</div>
			  <div class="list-Content">${article.preViewContent}</div>
			  <div style="position: relative; margin-top:15px;">`+
			this._createArticleTag(article.tags) +
			`<span class="material-icons" style="color: #8CC0DE;">calendar_today</span>
				<span class="list-Date">&nbsp;&nbsp;${rhit._monthNames[date.getMonth()]}&nbsp;${date.getDate()},${date.getFullYear()}</span>
			  </div>
			</div>
			<button type="button" class="btn bmd-btn-fab deleteBtn btn-action">
				<i class="material-icons">clear</i>
			  </button>
		  </div>`
		);
	}

	_createArticleTag(tags) {
		let tmp = "";
		for (let index = 0; index < tags.length; index++) {
			tmp += `<span style="background-color:${rhit._tagColor[this._getArticleTagIndex(tags[index]) % rhit._tagColor.length]}" class="article-tag">${tags[index]}</span>`;
		}
		return tmp;
	}

	_getArticleTagIndex(tagName) {
		let i = 0;
		for (; i < rhit.mainPageTagManager.length; i++) {
			const tmp = rhit.mainPageTagManager.getIndexAt(i);
			if (tmp.name == tagName) {
				return i;
			}
		}
		return i;
	}

	_createVerticleLine() {
		return htmlToElement(`<div class="vl"></div>`);
	}

	_createSeeMoreBtn() {
		return htmlToElement(`<button id="seeMoreBtn" type="button" class="btn btn-primary">See More</button>`);
	}

	_createBackTopBtn() {
		return htmlToElement(`<button id="backTopBtn" onclick="backToTop()" type="button" class="btn btn-primary">Back Top</button>`);
	}


}

rhit.MainPageContentManager = class {
	constructor(uid) {
		this._uid = uid;
		this._allPreviewArticles = [];
		this._ref = firebase.firestore().collection(rhit.FB_ARTICLE_PREVIEW_COLLECTION);
		this._unsubscribe = null;
	}

	beginListening(changeListener, cnt) {
		
		this._unsubscribe = this._ref.orderBy(rhit.FB_ARTICLE_PREVIEW_KEY_DATE, "desc").where(rhit.FB_ARTICLE_PREVIEW_KEY_AUTHOR, "==", this._uid).onSnapshot((querySnapshot) => {
			this._allPreviewArticles = [];
			for (let index = 0; index < querySnapshot.docs.length; index++) {
				const docSnapshot = querySnapshot.docs[index];
				const article = new rhit.Article(
					docSnapshot.id,
					docSnapshot.get(rhit.FB_ARTICLE_PREVIEW_KEY_AUTHOR),
					docSnapshot.get(rhit.FB_ARTICLE_PREVIEW_KEY_DATE),
					docSnapshot.get(rhit.FB_ARTICLE_PREVIEW_KEY_TITLE),
					docSnapshot.get(rhit.FB_ARTICLE_PREVIEW_KEY_CONTENT),
					docSnapshot.get(rhit.FB_ARTICLE_PREVIEW_KEY_COVER),
					docSnapshot.get(rhit.FB_ARTICLE_PREVIEW_KEY_TAGS),
				);


				this._allPreviewArticles.push(article);
			}


			changeListener(this._allPreviewArticles, cnt);

		});
	}


	stopListening() {
		this._unsubscribe();
	}

	getIndexAt(index) {
		return this._allPreviewArticles[index];
	}

	getArticleById(articleId) {
		return this._ref.doc(articleId).get();
	}

	getArticleByTitle(changeListener, title) {
		let articles = [];
		for (let i = 0; i < this._allPreviewArticles.length; i++) {
			let preViewArticle = this._allPreviewArticles[i];
			if (preViewArticle.title >= title && preViewArticle.title <= title + '\uf8ff') {
				articles.push(preViewArticle);
			}
		}
		changeListener(articles, articles.length);
	}

	getArticleByTag(changeListener, tag) {
		let articles = [];
		for (let i = 0; i < this._allPreviewArticles.length; i++) {
			let preViewArticle = this._allPreviewArticles[i];
			let tags = preViewArticle.tags;
			for (let j = 0; j < tags.length; j++) {
				if (tags[j] == tag) {
					articles.push(preViewArticle);
					break;
				}
			}
		}
		changeListener(articles, articles.length);
	}

	deleteArticleById(articleId) {
		this._ref.doc(articleId).delete().then(() => {
			console.log("Delete From Preview Article:" + articleId);
		});
	}

	get isListening() {
		return !!this._unsubscribe;
	}

	get length() {
		return this._allPreviewArticles.length;
	}

}

rhit.MainPageTagManager = class {
	constructor(uid) {
		this._uid = uid;
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection(rhit.FB_ARTICLE_TAGS_COLLECTION);
		this._unsubscribe = null;
	}

	beginListening(changeListener) {
		let query = this._ref.orderBy(rhit.FB_ARTICLE_TAGS_KEY_NUMBER, "asc").where(rhit.FB_ARTICLE_PREVIEW_KEY_AUTHOR, "==", this._uid);
		this._unsubscribe = query.onSnapshot((querySnapshot) => {
			this._documentSnapshots = [];
			for(let i=0;i<querySnapshot.docs.length;i++){
				if(querySnapshot.docs[i].get(rhit.FB_ARTICLE_TAGS_KEY_NUMBER) >= 0){
					this._documentSnapshots.push(querySnapshot.docs[i])
				}else{
					this._ref.doc(querySnapshot.docs[i].id).delete();
				}
			}
			
			changeListener();

		});
	}


	stopListening() {
		this._unsubscribe();
	}


	getIndexAt(index) {
		const docSnapshot = this._documentSnapshots[index];
		const tag = new rhit.Tag(
			docSnapshot.get(rhit.FB_ARTICLE_TAGS_KEY_NAME),
			docSnapshot.get(rhit.FB_ARTICLE_TAGS_KEY_NUMBER)
		);

		return tag;
	}

	addTag(tagName) {
		this._ref.add({
					[rhit.FB_ARTICLE_TAGS_KEY_NAME]: tagName,
					[rhit.FB_ARTICLE_TAGS_KEY_NUMBER]: 0,
					[rhit.FB_ARTICLE_PREVIEW_KEY_AUTHOR]: this._uid,
				})
		.catch(function (error) {
			console.error("Error adding tag: ", error);
		});
	}

	increaseTagNum(tagName) {

		let query = this._ref.where(rhit.FB_ARTICLE_PREVIEW_KEY_AUTHOR, "==", this._uid).where(rhit.FB_ARTICLE_TAGS_KEY_NAME, "==", tagName);
		query.get().then((querySnapshot) => {
			querySnapshot.forEach((doc) => {
				this._ref.doc(doc.id).set({
					[rhit.FB_ARTICLE_TAGS_KEY_NAME]: tagName,
					[rhit.FB_ARTICLE_TAGS_KEY_NUMBER]: doc.get(rhit.FB_ARTICLE_TAGS_KEY_NUMBER) + 1,
					[rhit.FB_ARTICLE_PREVIEW_KEY_AUTHOR]: this._uid,
				}).catch(function (error) {
					console.error("Error increase tag num: ", error);
				});
			});
		});		
	}

	decreaseTagNum(tagName) {
		let query = this._ref.where(rhit.FB_ARTICLE_PREVIEW_KEY_AUTHOR, "==", this._uid).where(rhit.FB_ARTICLE_TAGS_KEY_NAME, "==", tagName);

		query.get().then((querySnapshot) => {
			querySnapshot.forEach((doc) => {
				this._ref.doc(doc.id).set({
					[rhit.FB_ARTICLE_TAGS_KEY_NAME]: tagName,
					[rhit.FB_ARTICLE_TAGS_KEY_NUMBER]: doc.get(rhit.FB_ARTICLE_TAGS_KEY_NUMBER) - 1,
					[rhit.FB_ARTICLE_PREVIEW_KEY_AUTHOR]: this._uid,
				}).catch(function (error) {
					console.error("Error increase tag num: ", error);
				});
			});
		});	
	}

	get length() {
		return this._documentSnapshots.length;
	}

	get isListening() {
		return !!this._unsubscribe;
	}


}

rhit.ViewPageController = class {
	constructor(uid) {
		this._showCommentBtn = document.querySelector("#show-Comment-Btn");
		this._commentArea = document.querySelector("#comment-area");
		this._commentText = document.querySelector("#comment-area textarea");
		this._showCommentBtn.onclick = () => {
			this._showCommentBtn.style.display = "none";
			this._commentArea.style.display = "block";
			setTimeout(function () {
				document.querySelector("#comment-area").style.opacity = 1;
			}, 10);
			rhit.viewPageCommentManager.beginListening(this._loadArticleComment.bind(this));

		}

		document.querySelector("#territoryLink").href = `/mainPage.html?uid=${uid}`;

		document.querySelector("#add-Comment-Btn").onclick = () => {
			if (this._commentText.value) {
				rhit.viewPageCommentManager.addComment(this._commentText.value);
				document.querySelector("#comment-area textarea").value = "";
				window.moveBy(0, 100);
			}
		}

		let music = document.querySelector("#music_file");

		let progressBar = document.querySelector(".navbar");


		document.querySelector("#music_play").onclick = () => {
			music.play();
			document.querySelector("#music_play").style.display = "none";
			document.querySelector("#music_pause").style.display = "inline-block";
		}

		document.querySelector("#music_pause").onclick = () => {
			music.pause();
			document.querySelector("#music_pause").style.display = "none";
			document.querySelector("#music_play").style.display = "inline-block";
		}

		music.ontimeupdate = () => {
			const curTime = music.currentTime;
			const musicLength = music.duration;
			progressBar.style.background = `linear-gradient(90deg, rgba(220, 220, 220, 0.9) ${100 * curTime / musicLength}%, rgba(238, 238, 238, 0.9) 0%)`;
		}


		//load all tags
		rhit.mainPageTagManager.beginListening(() => { });

		// set label
		rhit.userProfileManager.beginListening(uid, this._updateProfileView.bind(this));

		// view page start listening
		rhit.viewPageContentManager.beginListening(this.updateView.bind(this));


	}


	updateView() {
		const article = rhit.viewPageContentManager.getArticle();
		let date = new Date(article.date["seconds"] * 1000);

		document.querySelector(".article-Date").innerHTML = `&nbsp;${rhit._monthNames[date.getMonth()]}&nbsp;${date.getDate()},${date.getFullYear()}`;
		document.querySelector("#article-Cover img").src = article.coverUrl;
		document.querySelector("#article-tags").innerHTML = this._createArticleTag(article.tags);
		document.querySelector("#article-title").innerHTML = article.title;
		document.querySelector("#article-content").innerHTML = article.content;
		document.querySelector("#music_file").src = article.music;

	}

	_updateProfileView() {
		document.querySelector("#territoryLink").innerHTML = rhit.userProfileManager.name;
	}

	_createArticleTag(tags) {
		let tmp = "";
		for (let index = 0; index < tags.length; index++) {
			tmp += `<span style="background-color:${rhit._tagColor[this._getArticleTagIndex(tags[index]) % rhit._tagColor.length]}" class="article-tag">${tags[index]}</span>`;
		}
		return tmp;
	}


	_getArticleTagIndex(tagName) {
		let i = 0;
		for (; i < rhit.mainPageTagManager.length; i++) {
			const tmp = rhit.mainPageTagManager.getIndexAt(i);
			if (tmp.name == tagName) {
				return i;
			}
		}
		return i;
	}

	_loadArticleComment() {
		let tmp = "";
		for (let i = 0; i < rhit.viewPageCommentManager.length; i++) {
			let comment = rhit.viewPageCommentManager.getIndexAt(i);
			let date = new Date(comment.date["seconds"] * 1000);
			tmp += ` 
			<div class="comment">
				<span class="comment-date">${date.getMonth()},${date.getDate()},${date.getFullYear()}</span>
				<span class="comment-content">${comment.comment}</span>
			</div>`;
		}
		document.querySelector("#comments").innerHTML = tmp;
	}


}

rhit.ViewPageContentManager = class {
	constructor(articleId) {
		this._ref_content = firebase.firestore().collection(rhit.FB_ARTICLE_CONTENT_COLLECTION);
		this._content = null;
		this._articleID = articleId;
		this._previewArticle = null;
	}

	beginListening(changeListener) {

		rhit.mainPageContentManager.getArticleById(this._articleID).then((docSnapshot) => {
			this._previewArticle = docSnapshot;

			this._ref_content.doc(this._articleID).get().then((doc) => {
				if (doc.exists) {
					// console.log("Document data:", doc.data());
					this._content = doc.data();
					changeListener();
				} else {
					// doc.data() will be undefined in this case
					console.log("No such document!");
				}
			}).catch((error) => {
				console.log("Error getting document:", error);
			});

		});
	}

	getArticle() {

		return new rhit.ArticleFull(
			this._previewArticle.id,
			this._previewArticle.get(rhit.FB_ARTICLE_PREVIEW_KEY_DATE),
			this._previewArticle.get(rhit.FB_ARTICLE_PREVIEW_KEY_TITLE),
			this._content[rhit.FB_ARTICLE_CONTENT_KEY_CONTENT],
			this._previewArticle.get(rhit.FB_ARTICLE_PREVIEW_KEY_COVER),
			this._previewArticle.get(rhit.FB_ARTICLE_PREVIEW_KEY_TAGS),
			this._previewArticle.get(rhit.FB_ARTICLE_PREVIEW_KEY_AUTHOR),
			this._content[rhit.FB_ARTICLE_CONTENT_KEY_MUSIC],
			this._previewArticle.get(rhit.FB_ARTICLE_PREVIEW_KEY_CONTENT)
		);
	}

	deleteArticleById(articleId) {
		this._ref_content.doc(articleId).delete().then(() => {
			console.log("Delete From Full Article:" + articleId);
		});
	}

}

rhit.ViewPageCommentManager = class {
	constructor(articleId) {
		this._articleID = articleId;
		this._comments = [];
		this._ref = firebase.firestore().collection(rhit.FB_ARTICLE_COMMENT_COLLECTION);
		this._unsubscribe = null;
	}

	beginListening(changeListener) {
		let query = this._ref.orderBy(rhit.FB_ARTICLE_COMMENT_KEY_DATE, "desc").where(rhit.FB_ARTICLE_COMMENT_KEY_ARTICLEID, "==", this._articleID);
		this._unsubscribe = query.onSnapshot((querySnapshot) => {
			this._comments = querySnapshot.docs;
			changeListener();
		});
	}

	stopListening() {
		this._unsubscribe();
	}

	addComment(content) {
		this._ref.add({
			[rhit.FB_ARTICLE_COMMENT_KEY_ARTICLEID]: this._articleID,
			[rhit.FB_ARTICLE_COMMENT_KEY_CONTENT]: content,
			[rhit.FB_ARTICLE_COMMENT_KEY_DATE]: firebase.firestore.Timestamp.now(),
		})
			.catch((error) => {
				console.error("Error adding document: ", error);
			});
	}

	getIndexAt(index) {
		const comment = this._comments[index];
		const mq = new rhit.Comment(
			comment.get(rhit.FB_ARTICLE_COMMENT_KEY_CONTENT),
			comment.get(rhit.FB_ARTICLE_COMMENT_KEY_DATE)
		);

		return mq;
	}

	deleteAllArticleComments() {
		var tmp_query = this._ref.where(rhit.FB_ARTICLE_COMMENT_KEY_ARTICLEID, "==", this._articleID);
		tmp_query.get().then(function (querySnapshot) {
			querySnapshot.forEach(function (doc) {
				doc.ref.delete();
			});
		});
	}


	get length() {
		return this._comments.length;
	}

}

rhit.EditPageController = class {
	constructor(uid, articleId = "") {
		this._uid = uid;
		this._articleId = articleId;
		this._uploadedFiles = [];
		this._isNewArticle = true;

		let viewMusicUploaded = false;
		let coverImageUploaded = false;


		rhit.mainPageTagManager.beginListening(this.updateTagView.bind(this));

		if (this._articleId) {
			this._isNewArticle = false;
			rhit.viewPageContentManager.beginListening(this.updateView.bind(this));
			viewMusicUploaded = true;
			coverImageUploaded = true;

		} else {
			rhit.editPageManager.getNewArticleId().then((docRef) => {
				this._articleId = docRef.id;
			});
			// this._articleId = "PoUWt47pl3BGMAxtTXDg";
		}

		document.querySelector("#set_blod").onclick = (e) => {
			document.execCommand("bold", false, null)
		}

		document.querySelector("#set_italic").onclick = (e) => {
			document.execCommand("italic", false, null)
		}

		document.querySelector("#set_underline").onclick = (e) => {
			document.execCommand("underline", false, null)
		}

		let set_font_size = document.querySelector("#set_font_size");
		set_font_size.onchange = (e) => {
			document.execCommand("fontsize", false, set_font_size.value);
			set_font_size.value = "null";
		}

		let set_font_name = document.querySelector("#set_font_name");
		set_font_name.onchange = (e) => {
			document.execCommand("fontname", false, set_font_name.value);
			set_font_name.value = "null";
		}

		let set_font_color = document.querySelector("#set_font_color");
			set_font_color.onchange = (e) => {
			document.execCommand('styleWithCSS', false, true);
    		document.execCommand('foreColor', false, set_font_color.value);
			set_font_color.value = "null";
		}

		document.querySelector("#text_center").onclick = (e) => {
			document.execCommand("JustifyCenter", false, null)
		}

		document.querySelector("#text_left").onclick = (e) => {
			document.execCommand("JustifyLeft", false, null)
		}

		document.querySelector("#text_right").onclick = (e) => {
			document.execCommand("JustifyRight", false, null)
		}

		document.querySelector("#addNewCodeBlock").onclick = () => {
		
			document.querySelector("#territoryEditor").innerHTML += 
			`<br>
			<pre>
				<code class="mx-auto ${document.querySelector("#newCodeModal input").value}">${document.querySelector("#newCodeModal code").innerText}</code>
			</pre>
			<br>`;
			
			hljs.highlightAll();

		}
	

		document.querySelector("#uploadImageBtn").onclick = () => {
			document.querySelector("#uploadImage").click();
		}

		let file = null;
		document.querySelector("#uploadImage").addEventListener("change", (event) => {
			file = event.target.files[0];
			if (file && file.size > 4194304) {
				alert("File is too big! File should be less than 4M!");
				file = null;
				return;
			};

			if(file){
				rhit.editPageManager.uploadImageToServer(this._articleId, file).then((snapshot) => {
					snapshot.ref.getDownloadURL().then((fileUrl) => {
						document.querySelector("#territoryEditor").innerHTML += `<img src="${fileUrl}">`;
						this._uploadedFiles.push(file.name);
					
					});
				});
			}
			
		});

		document.querySelector("#uploadMusicBtn").onclick = () => {
			document.querySelector("#uploadMusic").click();
		}
		

		document.querySelector("#uploadMusic").addEventListener("change", (event) => {
			file = event.target.files[0];
			if (file && file.size > 16777216) {
				alert("File is too big! File should be less than 16M!");
				file = null;
				return;
			};

			if(file){
				rhit.editPageManager.uploadImageToServer(this._articleId, file, 'viewMusic.'+file.type.split("/")[1]).then((snapshot) => {
					snapshot.ref.getDownloadURL().then((fileUrl) => {
						document.querySelector("#viewMusic").src = fileUrl;
						this._uploadedFiles.push('viewMusic.'+file.type.split("/")[1]);
						viewMusicUploaded = true;
					});
				});
			}
			
		});

		document.querySelector("#uploadCoverBtn").onclick = () => {
			document.querySelector("#uploadCover").click();
		}


		document.querySelector("#uploadCover").addEventListener("change", (event) => {
			file = event.target.files[0];
			if (file && file.size > 4194304) {
				alert("File is too big! File should be less than 4M!");
				file = null;
				return;
			};

			if(file){
				rhit.editPageManager.uploadImageToServer(this._articleId, file, 'coverImage.'+file.type.split("/")[1]).then((snapshot) => {
					snapshot.ref.getDownloadURL().then((fileUrl) => {
						document.querySelector("#cover_container img").src = fileUrl;
						document.querySelector("#cover_container img").removeAttribute("hidden");
						this._uploadedFiles.push('coverImage.'+file.type.split("/")[1]);
						coverImageUploaded = true;
					});
				});
			}
		});
		

		document.querySelector("#saveArticleBtn").onclick = () => {

			let tags = this._getCheckedTags();
			let  musicSrc = document.querySelector("#viewMusic").src;
			let coverImg = document.querySelector("#cover_container img").src;

			if(!viewMusicUploaded){
				musicSrc = "./music/水谷広実 - 優しい風.flac";
			}

			if(!coverImageUploaded){
				coverImg = "./images/Main-index-default.jpg";
			}


			if(tags.length == 0
			|| document.querySelector("#territoryTitle").value.trim().length == 0 
			|| document.querySelector("#territoryPreviewContent").value.trim().length == 0 
			|| document.querySelector("#territoryEditor").innerHTML.trim().length == 0){
				alert("Title, Preview Content, Main Content, and Tags cannot be NULL!!");
				return;
			}

			rhit.editPageManager.updateArticle(
				this._articleId,
				document.querySelector("#territoryTitle").value, 
				document.querySelector("#territoryPreviewContent").value,
				document.querySelector("#inputDate").value,
				document.querySelector("#territoryEditor").innerHTML,
				coverImg,
				tags,
				musicSrc
			)
			.then((params) => {
				window.alert("Article is Uploading");
				setTimeout(function() {
					window.location.href = `/mainPage.html?uid=${rhit.loginAuthManager.uid}`;
				}, 2000);
			});
		}

		document.querySelector("#submitNewTagName").onclick =() => {

			rhit.mainPageTagManager.addTag(document.querySelector("#newTagName").value);
		}

		document.querySelector("#cancelCreateBtn").onclick = () => {
			this._clearAll();
		}

		const date = new Date();
		const month = date.getMonth()+1;
		const day = date.getDate();
		let tmp = date.getFullYear()+"-";
		if(month < 10){
			tmp += "0"+month;
		}
		else{
			tmp += month;
		}

		tmp += "-";

		if(day < 10){
			tmp += "0"+day;
		}
		else{
			tmp += day;
		}

		document.querySelector("#inputDate").value = tmp;

		$("#newCodeModal").on("show.bs.modal", function (event) {
			//pre animation
			document.querySelector("#newCodeModal code").innerHTML = "put code here";
			document.querySelector("#newCodeModal input").value = "";
		});
		
		$("#newCodeModal").on("shown.bs.modal", function (event) {
			//post animation
			document.querySelector("#newCodeModal input").focus();
		});

		$("#newTagModal").on("show.bs.modal", function (event) {
			//pre animation
			document.querySelector("#newTagName").value = "";
		});
		
		$("#newTagModal").on("shown.bs.modal", function (event) {
			//post animation
			document.querySelector("#newTagName").focus();
		});
	}

	updateTagView(){
		let tmp ="";
		for(let i=0;i<rhit.mainPageTagManager.length;i++){
			tmp += `<div class="checkTag">
			<input type="checkbox" class="btn-check" id="${rhit.mainPageTagManager.getIndexAt(i).name}"/>
			<label for="${rhit.mainPageTagManager.getIndexAt(i).name}" style="margin-right: 5px;">${rhit.mainPageTagManager.getIndexAt(i).name}</label>
		  	</div>`;
		}

		document.querySelector("#tags").innerHTML = tmp;

	}

	updateView() {
		const article = rhit.viewPageContentManager.getArticle();
		document.querySelector("#territoryTitle").value = article.title;
		document.querySelector("#territoryPreviewContent").value = article.preView;
		document.querySelector("#territoryEditor").innerHTML = article.content;
		document.querySelector("#viewMusic").src = article.music;
		document.querySelector("#cover_container img").src = article.coverUrl;
		document.querySelector("#cover_container img").removeAttribute("hidden");
		const date = new Date(article.date["seconds"] * 1000);
		const month = date.getMonth()+1;
		const day = date.getDate();
		let tmp = date.getFullYear()+"-";
		if(month < 10){
			tmp += "0"+month;
		}
		else{
			tmp += month;
		}

		tmp += "-";

		if(day < 10){
			tmp += "0"+day;
		}
		else{
			tmp += day;
		}

		document.querySelector("#inputDate").value = tmp;


		for(let i=0;i<article.tags.length;i++){
			document.querySelector(`#${article.tags[i]}`).checked = true;
		}

	}

	_clearAll(){
		for(let i=0;i<this._uploadedFiles.length;i++){
			rhit.editPageManager.clearFilesInServer(this._articleId, this._uploadedFiles[i]).catch((error) => {
				console.log(error);
			});;
		}

		if(this._isNewArticle)
			rhit.mainPageContentManager.deleteArticleById(this._articleId);
		
		window.location.href = `/mainPage.html?uid=${this._uid}`;
	}

	_getCheckedTags(){
		let checkedTags = [];
		let checkBtns = document.querySelectorAll('.btn-check');
		for(let i=0;i<checkBtns.length;i++){
			if(checkBtns[i].checked){
				checkedTags.push(checkBtns[i].id);
			}
		}
		return checkedTags;
	}

	
}

rhit.EditPageManager = class {
	constructor(uid) {
		this._unsubscribe = null;
		this._uid = uid;
		this._ref_preView = firebase.firestore().collection(rhit.FB_ARTICLE_PREVIEW_COLLECTION);
		this._ref_main = firebase.firestore().collection(rhit.FB_ARTICLE_CONTENT_COLLECTION);
	}

	getNewArticleId(){
		return this._ref_preView.add({
			[rhit.FB_ARTICLE_PREVIEW_KEY_AUTHOR]:this._uid,
			[rhit.FB_ARTICLE_PREVIEW_KEY_ISEMPTY]:true
		});
	}

	updateArticle(articleId, title, preView, rawdate, content, imageUrl, tags, music) {
		let date = new firebase.firestore.Timestamp.fromDate(new Date(rawdate));
		date["seconds"] += + 60 * 60 * 24;
		return this._ref_preView.doc(articleId).set({
			[rhit.FB_ARTICLE_PREVIEW_KEY_COVER]: imageUrl,
			[rhit.FB_ARTICLE_PREVIEW_KEY_DATE]: date,
			[rhit.FB_ARTICLE_PREVIEW_KEY_CONTENT]: preView,
			[rhit.FB_ARTICLE_PREVIEW_KEY_TAGS]: tags,
			[rhit.FB_ARTICLE_PREVIEW_KEY_TITLE]: title,
			[rhit.FB_ARTICLE_PREVIEW_KEY_AUTHOR]:this._uid
		}).then((params) => {
			this._ref_main.doc(articleId).set({
				[rhit.FB_ARTICLE_CONTENT_KEY_CONTENT]: content,
				[rhit.FB_ARTICLE_CONTENT_KEY_MUSIC]: music
			});
			for (let i = 0; i < tags.length; i++) {
				rhit.mainPageTagManager.increaseTagNum(tags[i]);
			}

		})
		.then((params) => {
			console.log("update article successfully");
		})
		.catch(function (error) {
			console.error("Error update document: ", error);
		});
	}

	uploadImageToServer(articleId, file, fileName="") {
		let name = fileName || file.name;
		const storageRef = firebase.storage().ref().child(`${this._uid}/${articleId}/${name}`);
		return storageRef.put(file);
	}

	clearEmptyArticle(){
		this._ref_preView.where(rhit.FB_ARTICLE_PREVIEW_KEY_AUTHOR, "==", this._uid).get().then((querySnapshot) => {
			querySnapshot.forEach((doc) => {
				if(doc.get(rhit.FB_ARTICLE_PREVIEW_KEY_ISEMPTY)){
					this._ref_preView.doc(doc.id).delete()
					.then(() => {
						let listRef = firebase.storage().ref().child(`${this._uid}/${doc.id}`);
						listRef.listAll()
						.then((res) => {
							res.items.forEach((itemRef) => {
							// All the items under listRef.
								itemRef.delete();
							});
						}).catch((error) => {
							// Uh-oh, an error occurred!
						});
					})
					.catch(function (error) {
						console.error("Error delete: ", error);
					});
				}
			});
		});		
	}

	clearFilesInServer(articleId, fileName){
		const storageRef = firebase.storage().ref().child(`${this._uid}/${articleId}/${fileName}`);
		return storageRef.delete();
	}

	loadIntroductionArticle(){
		this.getNewArticleId().then((doc) => {
			this.updateArticle(doc.id, "Instruction Article", 
			"Welcome to Territory Blog! This article will explain how to use this website. ꉂ೭(˵¯̴͒ꇴ¯̴͒˵) ” ", 
			"2022-8-10",
			`<!doctype html>
			<html>
			<head>
			<meta charset='UTF-8'><meta name='viewport' content='width=device-width initial-scale=1'>
			<title>Project Instruction Article</title><style type='text/css'>html {overflow-x: initial !important;}:root { --bg-color:#ffffff; --text-color:#333333; --select-text-bg-color:#B5D6FC; --select-text-font-color:auto; --monospace:"Lucida Console",Consolas,"Courier",monospace; --title-bar-height:20px; }
			.mac-os-11 { --title-bar-height:28px; }
			html { font-size: 14px; background-color: var(--bg-color); color: var(--text-color); font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
			body { margin: 0px; padding: 0px; height: auto; bottom: 0px; top: 0px; left: 0px; right: 0px; font-size: 1rem; line-height: 1.42857; overflow-x: hidden; background: inherit; tab-size: 4; }
			iframe { margin: auto; }
			a.url { word-break: break-all; }
			a:active, a:hover { outline: 0px; }
			.in-text-selection, ::selection { text-shadow: none; background: var(--select-text-bg-color); color: var(--select-text-font-color); }
			#write { margin: 0px auto; height: auto; width: inherit; word-break: normal; overflow-wrap: break-word; position: relative; white-space: normal; overflow-x: visible; padding-top: 36px; }
			#write.first-line-indent p { text-indent: 2em; }
			#write.first-line-indent li p, #write.first-line-indent p * { text-indent: 0px; }
			#write.first-line-indent li { margin-left: 2em; }
			.for-image #write { padding-left: 8px; padding-right: 8px; }
			body.typora-export { padding-left: 30px; padding-right: 30px; }
			.typora-export .footnote-line, .typora-export li, .typora-export p { white-space: pre-wrap; }
			.typora-export .task-list-item input { pointer-events: none; }
			@media screen and (max-width: 500px) {
			  body.typora-export { padding-left: 0px; padding-right: 0px; }
			  #write { padding-left: 20px; padding-right: 20px; }
			  .CodeMirror-sizer { margin-left: 0px !important; }
			  .CodeMirror-gutters { display: none !important; }
			}
			#write li > figure:last-child { margin-bottom: 0.5rem; }
			#write ol, #write ul { position: relative; }
			img { max-width: 100%; vertical-align: middle; image-orientation: from-image; }
			button, input, select, textarea { color: inherit; font: inherit; }
			input[type="checkbox"], input[type="radio"] { line-height: normal; padding: 0px; }
			*, ::after, ::before { box-sizing: border-box; }
			#write h1, #write h2, #write h3, #write h4, #write h5, #write h6, #write p, #write pre { width: inherit; }
			#write h1, #write h2, #write h3, #write h4, #write h5, #write h6, #write p { position: relative; }
			p { line-height: inherit; }
			h1, h2, h3, h4, h5, h6 { break-after: avoid-page; break-inside: avoid; orphans: 4; }
			p { orphans: 4; }
			h1 { font-size: 2rem; }
			h2 { font-size: 1.8rem; }
			h3 { font-size: 1.6rem; }
			h4 { font-size: 1.4rem; }
			h5 { font-size: 1.2rem; }
			h6 { font-size: 1rem; }
			.md-math-block, .md-rawblock, h1, h2, h3, h4, h5, h6, p { margin-top: 1rem; margin-bottom: 1rem; }
			.hidden { display: none; }
			.md-blockmeta { color: rgb(204, 204, 204); font-weight: 700; font-style: italic; }
			a { cursor: pointer; }
			sup.md-footnote { padding: 2px 4px; background-color: rgba(238, 238, 238, 0.7); color: rgb(85, 85, 85); border-radius: 4px; cursor: pointer; }
			sup.md-footnote a, sup.md-footnote a:hover { color: inherit; text-transform: inherit; text-decoration: inherit; }
			#write input[type="checkbox"] { cursor: pointer; width: inherit; height: inherit; }
			figure { overflow-x: auto; margin: 1.2em 0px; max-width: calc(100% + 16px); padding: 0px; }
			figure > table { margin: 0px; }
			tr { break-inside: avoid; break-after: auto; }
			thead { display: table-header-group; }
			table { border-collapse: collapse; border-spacing: 0px; width: 100%; overflow: auto; break-inside: auto; text-align: left; }
			table.md-table td { min-width: 32px; }
			.CodeMirror-gutters { border-right: 0px; background-color: inherit; }
			.CodeMirror-linenumber { user-select: none; }
			.CodeMirror { text-align: left; }
			.CodeMirror-placeholder { opacity: 0.3; }
			.CodeMirror pre { padding: 0px 4px; }
			.CodeMirror-lines { padding: 0px; }
			div.hr:focus { cursor: none; }
			#write pre { white-space: pre-wrap; }
			#write.fences-no-line-wrapping pre { white-space: pre; }
			#write pre.ty-contain-cm { white-space: normal; }
			.CodeMirror-gutters { margin-right: 4px; }
			.md-fences { font-size: 0.9rem; display: block; break-inside: avoid; text-align: left; overflow: visible; white-space: pre; background: inherit; position: relative !important; }
			.md-diagram-panel { width: 100%; margin-top: 10px; text-align: center; padding-top: 0px; padding-bottom: 8px; overflow-x: auto; }
			#write .md-fences.mock-cm { white-space: pre-wrap; }
			.md-fences.md-fences-with-lineno { padding-left: 0px; }
			#write.fences-no-line-wrapping .md-fences.mock-cm { white-space: pre; overflow-x: auto; }
			.md-fences.mock-cm.md-fences-with-lineno { padding-left: 8px; }
			.CodeMirror-line, twitterwidget { break-inside: avoid; }
			.footnotes { opacity: 0.8; font-size: 0.9rem; margin-top: 1em; margin-bottom: 1em; }
			.footnotes + .footnotes { margin-top: 0px; }
			.md-reset { margin: 0px; padding: 0px; border: 0px; outline: 0px; vertical-align: top; background: 0px 0px; text-decoration: none; text-shadow: none; float: none; position: static; width: auto; height: auto; white-space: nowrap; cursor: inherit; -webkit-tap-highlight-color: transparent; line-height: normal; font-weight: 400; text-align: left; box-sizing: content-box; direction: ltr; }
			li div { padding-top: 0px; }
			blockquote { margin: 1rem 0px; }
			li .mathjax-block, li p { margin: 0.5rem 0px; }
			li blockquote { margin: 1rem 0px; }
			li { margin: 0px; position: relative; }
			blockquote > :last-child { margin-bottom: 0px; }
			blockquote > :first-child, li > :first-child { margin-top: 0px; }
			.footnotes-area { color: rgb(136, 136, 136); margin-top: 0.714rem; padding-bottom: 0.143rem; white-space: normal; }
			#write .footnote-line { white-space: pre-wrap; }
			@media print {
			  body, html { border: 1px solid transparent; height: 99%; break-after: avoid; break-before: avoid; font-variant-ligatures: no-common-ligatures; }
			  #write { margin-top: 0px; padding-top: 0px; border-color: transparent !important; }
			  .typora-export * { -webkit-print-color-adjust: exact; }
			  .typora-export #write { break-after: avoid; }
			  .typora-export #write::after { height: 0px; }
			  .is-mac table { break-inside: avoid; }
			}
			.footnote-line { margin-top: 0.714em; font-size: 0.7em; }
			a img, img a { cursor: pointer; }
			pre.md-meta-block { font-size: 0.8rem; min-height: 0.8rem; white-space: pre-wrap; background: rgb(204, 204, 204); display: block; overflow-x: hidden; }
			p > .md-image:only-child:not(.md-img-error) img, p > img:only-child { display: block; margin: auto; }
			#write.first-line-indent p > .md-image:only-child:not(.md-img-error) img { left: -2em; position: relative; }
			p > .md-image:only-child { display: inline-block; width: 100%; }
			#write .MathJax_Display { margin: 0.8em 0px 0px; }
			.md-math-block { width: 100%; }
			.md-math-block:not(:empty)::after { display: none; }
			.MathJax_ref { fill: currentcolor; }
			[contenteditable="true"]:active, [contenteditable="true"]:focus, [contenteditable="false"]:active, [contenteditable="false"]:focus { outline: 0px; box-shadow: none; }
			.md-task-list-item { position: relative; list-style-type: none; }
			.task-list-item.md-task-list-item { padding-left: 0px; }
			.md-task-list-item > input { position: absolute; top: 0px; left: 0px; margin-left: -1.2em; margin-top: calc(1em - 10px); border: none; }
			.math { font-size: 1rem; }
			.md-toc { min-height: 3.58rem; position: relative; font-size: 0.9rem; border-radius: 10px; }
			.md-toc-content { position: relative; margin-left: 0px; }
			.md-toc-content::after, .md-toc::after { display: none; }
			.md-toc-item { display: block; color: rgb(65, 131, 196); }
			.md-toc-item a { text-decoration: none; }
			.md-toc-inner:hover { text-decoration: underline; }
			.md-toc-inner { display: inline-block; cursor: pointer; }
			.md-toc-h1 .md-toc-inner { margin-left: 0px; font-weight: 700; }
			.md-toc-h2 .md-toc-inner { margin-left: 2em; }
			.md-toc-h3 .md-toc-inner { margin-left: 4em; }
			.md-toc-h4 .md-toc-inner { margin-left: 6em; }
			.md-toc-h5 .md-toc-inner { margin-left: 8em; }
			.md-toc-h6 .md-toc-inner { margin-left: 10em; }
			@media screen and (max-width: 48em) {
			  .md-toc-h3 .md-toc-inner { margin-left: 3.5em; }
			  .md-toc-h4 .md-toc-inner { margin-left: 5em; }
			  .md-toc-h5 .md-toc-inner { margin-left: 6.5em; }
			  .md-toc-h6 .md-toc-inner { margin-left: 8em; }
			}
			a.md-toc-inner { font-size: inherit; font-style: inherit; font-weight: inherit; line-height: inherit; }
			.footnote-line a:not(.reversefootnote) { color: inherit; }
			.md-attr { display: none; }
			.md-fn-count::after { content: "."; }
			code, pre, samp, tt { font-family: var(--monospace); }
			kbd { margin: 0px 0.1em; padding: 0.1em 0.6em; font-size: 0.8em; color: rgb(36, 39, 41); background: rgb(255, 255, 255); border: 1px solid rgb(173, 179, 185); border-radius: 3px; box-shadow: rgba(12, 13, 14, 0.2) 0px 1px 0px, rgb(255, 255, 255) 0px 0px 0px 2px inset; white-space: nowrap; vertical-align: middle; }
			.md-comment { color: rgb(162, 127, 3); opacity: 0.8; font-family: var(--monospace); }
			code { text-align: left; vertical-align: initial; }
			a.md-print-anchor { white-space: pre !important; border-width: initial !important; border-style: none !important; border-color: initial !important; display: inline-block !important; position: absolute !important; width: 1px !important; right: 0px !important; outline: 0px !important; background: 0px 0px !important; text-decoration: initial !important; text-shadow: initial !important; }
			.md-inline-math .MathJax_SVG .noError { display: none !important; }
			.html-for-mac .inline-math-svg .MathJax_SVG { vertical-align: 0.2px; }
			.md-math-block .MathJax_SVG_Display { text-align: center; margin: 0px; position: relative; text-indent: 0px; max-width: none; max-height: none; min-height: 0px; min-width: 100%; width: auto; overflow-y: hidden; display: block !important; }
			.MathJax_SVG_Display, .md-inline-math .MathJax_SVG_Display { width: auto; margin: inherit; display: inline-block !important; }
			.MathJax_SVG .MJX-monospace { font-family: var(--monospace); }
			.MathJax_SVG .MJX-sans-serif { font-family: sans-serif; }
			.MathJax_SVG { display: inline; font-style: normal; font-weight: 400; line-height: normal; zoom: 90%; text-indent: 0px; text-align: left; text-transform: none; letter-spacing: normal; word-spacing: normal; overflow-wrap: normal; white-space: nowrap; float: none; direction: ltr; max-width: none; max-height: none; min-width: 0px; min-height: 0px; border: 0px; padding: 0px; margin: 0px; }
			.MathJax_SVG * { transition: none 0s ease 0s; }
			.MathJax_SVG_Display svg { vertical-align: middle !important; margin-bottom: 0px !important; margin-top: 0px !important; }
			.os-windows.monocolor-emoji .md-emoji { font-family: "Segoe UI Symbol", sans-serif; }
			.md-diagram-panel > svg { max-width: 100%; }
			[lang="flow"] svg, [lang="mermaid"] svg { max-width: 100%; height: auto; }
			[lang="mermaid"] .node text { font-size: 1rem; }
			table tr th { border-bottom: 0px; }
			video { max-width: 100%; display: block; margin: 0px auto; }
			iframe { max-width: 100%; width: 100%; border: none; }
			.highlight td, .highlight tr { border: 0px; }
			mark { background: rgb(255, 255, 0); color: rgb(0, 0, 0); }
			.md-html-inline .md-plain, .md-html-inline strong, mark .md-inline-math, mark strong { color: inherit; }
			mark .md-meta { color: rgb(0, 0, 0); opacity: 0.3 !important; }
			@media print {
			  .typora-export h1, .typora-export h2, .typora-export h3, .typora-export h4, .typora-export h5, .typora-export h6 { break-inside: avoid; }
			}
			.md-diagram-panel .messageText { stroke: none !important; }
			.md-diagram-panel .start-state { fill: var(--node-fill); }
			.md-diagram-panel .edgeLabel rect { opacity: 1 !important; }
			.md-require-zoom-fix foreignobject { font-size: var(--mermaid-font-zoom); }
			
			
			:root {
			  --title-color: #8064a9;
			  --text-color: #444444;
			  --light-text-color: #666666;
			  --lighter-text-color: #888888;
			  --link-color: #2aa899;
			  --code-color: #745fb5;
			
			  --shadow-color: #eee;
			  --border-quote: rgba(116, 95, 181, 0.2);
			  --border: #e7e7e7;
			  --link-bottom: #bbb;
			  --shadow: 3px 3px 10px var(--shadow-color);
			  --inline-code-bg: #f4f2f9;
			
			  --header-weight: normal;
			
			  --side-bar-bg-color: #fafafa;
			  --control-text-color: var(var(--light-text-color));
			  --active-file-text-color: var(--title-color);
			  --active-file-bg-color: var(--shadow-color);
			  --item-hover-bg-color: var(--shadow-color);
			  --active-file-border-color: var(var(--title-color));
			
			  --base-font: "Helvetica Neue", -apple-system, Ubuntu,
				"Microsoft YaHei", Helvetica, "Nimbus Sans L", Arial, "Liberation Sans",
				"Noto Sans CJK SC", "PingFang SC", "Hiragino Sans GB", "Source Han Sans SC",
				"Source Han Sans CN", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti",
				SimHei, "WenQuanYi Zen Hei Sharp", "Source Sans Pro", sans-serif;
			  --title-font: "EB Garamond", Georgia, "Noto Serif", "Noto Serif CJK SC",
				"Nimbus Roman No9 L", "Songti SC", "Source Han Serif SC",
				"Source Han Serif CN", STSong, "AR PL New Sung", "AR PL SungtiL GB", NSimSun,
				SimSun, "TW\-Sung", "WenQuanYi Bitmap Song", "AR PL UMing CN",
				"AR PL UMing HK", "AR PL UMing TW", "AR PL UMing TW MBE", PMingLiU, MingLiU,
				"Ubuntu", "Source Sans Pro", serif;
			  --monospace: "JetBrains Mono", "Fira Code", "Cascadia Code", "Sarasa Term SC",
				Monaco, "Deja Vu Sans Mono", Consolas, "Lucida Console", "Andale Mono",
				"Roboto Mono", Courier, Monospace !important;
			}
			
			/* 打印 */
			@media print {
			  html {
				font-size: 0.9rem;
			  }
			
			  table,
			  pre {
				page-break-inside: avoid;
			  }
			
			  pre {
				word-wrap: break-word;
			  }
			  #write {
				max-width: 100%;
			  }
			  @page {
				size: A3; /* PDF output size */
				margin-left: 0;
				margin-right: 0;
			  }
			}
			
			html {
			  font-size: 16px;
			  -webkit-text-size-adjust: 100%;
			  -ms-text-size-adjust: 100%;
			  text-rendering: optimizelegibility;
			  -webkit-font-smoothing: initial;
			}
			
			body {
			  color: var(--text-color);
			  -webkit-font-smoothing: antialiased;
			  line-height: 1.6rem;
			  letter-spacing: 0;
			  overflow-x: hidden;
			}
			
			/* 页边距 和 页面大小 */
			#write {
			  font-family: var(--base-font);
			  /* max-width: 914px; */
			  margin: 0 auto;
			  padding: 1rem 4rem;
			  padding-bottom: 100px;
			}
			
			#write p {
			  line-height: 1.6rem;
			  word-spacing: 0.05rem;
			}
			
			body > *:first-child {
			  margin-top: 0 !important;
			}
			
			body > *:last-child {
			  margin-bottom: 0 !important;
			}
			
			/* Link 链接 */
			a {
			  color: var(--link-color);
			  text-decoration: none;
			}
			#write a {
			  border-bottom: 1px solid var(--link-bottom);
			}
			#write a:hover {
			  border-bottom: 1px solid var(--link-color);
			  /*   color: var(--link-color);
				text-decoration: none; */
			}
			
			.md-content {
			  color: var(--light-text-color);
			}
			
			h1,
			h2,
			h3,
			h4,
			h5,
			h6 {
			  position: relative;
			  margin-top: 2rem;
			  margin-bottom: 1rem;
			  font-weight: var(--header-weight);
			  line-height: 1.3;
			  cursor: text;
			  color: var(--title-color);
			  font-family: var(--title-font);
			}
			
			h1 {
			  text-align: center;
			  font-size: 2.25em;
			  margin-bottom: 2rem;
			}
			h1:after {
			  content: "";
			  display: block;
			  margin: 0.2em auto 0;
			  width: 6rem;
			  height: 2px;
			  border-bottom: 2px solid var(--title-color);
			}
			
			h2 {
			  padding-left: 0.4em;
			  font-size: 1.75em;
			  border-left: 0.4em solid var(--title-color);
			  border-bottom: 1px solid var(--title-color);
			}
			h3 {
			  font-size: 1.5em;
			}
			h4 {
			  font-size: 1.3em;
			}
			h5 {
			  font-size: 1.2em;
			}
			h6 {
			  font-size: 1.1em;
			}
			
			p,
			blockquote,
			ul,
			ol,
			dl,
			table {
			  margin: 0.8em 0;
			}
			
			/* horizontal rule */
			hr {
			  margin: 1.5em auto;
			  border-top: 1px solid var(--border);
			}
			
			/* 列表 */
			li > ol,
			li > ul {
			  margin: 0 0;
			}
			
			li p.first {
			  display: inline-block;
			}
			
			ul,
			ol {
			  padding-left: 2rem;
			}
			
			ul:first-child,
			ol:first-child {
			  margin-top: 0;
			}
			
			ul:last-child,
			ol:last-child {
			  margin-bottom: 0;
			}
			
			#write ol li,
			ul li {
			  padding-left: 0.1rem;
			}
			
			/* 引用 */
			blockquote {
			  border-left: 0.3rem solid var(--border-quote);
			  padding-left: 1em;
			  color: var(--light-text-color);
			  font-family: var(--base-font);
			}
			
			/* 表格 */
			table {
			  margin-bottom: 1.25rem;
			}
			table th,
			table td {
			  padding: 8px;
			  line-height: 1.25rem;
			  vertical-align: middle;
			  border: 1px solid #ddd;
			}
			table th {
			  font-weight: bold;
			}
			table thead th {
			  vertical-align: middle;
			}
			table tr:nth-child(2n),
			thead {
			  background-color: #fcfcfc;
			}
			
			/* 粗体 */
			#write strong {
			  padding: 0 2px;
			  font-weight: bold;
			}
			
			/* inline code */
			#write code,
			tt {
			  padding: 2px 4px;
			  border-radius: 0.3rem;
			  font-family: var(--monospace);
			  font-size: 0.9rem;
			  color: var(--code-color);
			  background-color: var(--inline-code-bg);
			  margin: 0 2px;
			}
			
			#write .md-footnote {
			  color: var(--code-color);
			  background-color: var(--inline-code-bg);
			}
			
			/* highlight. */
			#write mark {
			  background: rgb(255, 255, 196);
			}
			
			#write del {
			  padding: 1px 2px;
			}
			
			.md-task-list-item > input {
			  margin-left: -1.3em;
			}
			
			#write pre.md-meta-block {
			  padding: 1rem;
			  font-size: 85%;
			  line-height: 1.45;
			  background-color: #f7f7f7;
			  border: 0;
			  border-radius: 3px;
			  color: #777777;
			  margin-top: 0 !important;
			}
			
			.mathjax-block > .code-tooltip {
			  bottom: 0.375rem;
			}
			
			/* 图片 */
			.md-image > .md-meta {
			  border-radius: 3px;
			  font-family: var(--monospace);
			  padding: 2px 0 0 4px;
			  font-size: 0.9em;
			  color: inherit;
			}
			/* 图片靠左显示 */
			/* p .md-image:only-child {
			  width: auto;
			  text-align: left;
			  margin-left: 2rem;
			} */
			
			/* 写![shadow-...]() 显示图片阴影 */
			img[alt|="shadow"] {
			  box-shadow: var(--shadow);
			}
			
			/* TOC: 加粗h2 */
			#write a.md-toc-inner {
			  line-height: 1.6;
			  white-space: pre-line;
			  border-bottom: none;
			  color: var(--lighter-text-color);
			  font-size: 0.9rem;
			}
			/* .md-toc-h1 {
			  display: none;
			} */
			.md-toc-h2 .md-toc-inner {
			  font-weight: bold;
			}
			
			header,
			.context-menu,
			.megamenu-content,
			footer {
			  font-family: var(--base-font);
			}
			
			.file-node-content:hover .file-node-icon,
			.file-node-content:hover .file-node-open-state {
			  visibility: visible;
			}
			
			.md-lang {
			  color: #b4654d;
			}
			
			.html-for-mac .context-menu {
			  --item-hover-bg-color: #e6f0fe;
			}
			
			/* Code fences */
			
			/* border, bg, font */
			.md-fences {
			  border: 1px solid var(--border);
			  border-radius: 5px;
			  background: #fdfdfd !important;
			  font-size: 0.9rem;
			}
			/* 代码框阴影 */
			#write pre.md-fences {
			  display: block;
			  -webkit-overflow-scrolling: touch;
			  box-shadow: var(--shadow);
			}
			
			.cm-s-inner {
			  padding: 0.25rem;
			  border-radius: 0.25rem;
			}
			
			.cm-s-inner.CodeMirror,
			.cm-s-inner .CodeMirror-gutters {
			  color: #3a3432 !important;
			  border: none;
			}
			
			.cm-s-inner .CodeMirror-gutters {
			  color: #6d8a88;
			}
			
			.cm-s-inner .CodeMirror-linenumber {
			  padding: 0 0.1rem 0 0.3rem;
			  color: #b8b5b4;
			}
			
			.cm-s-inner .CodeMirror-matchingbracket {
			  text-decoration: underline;
			  color: #a34e8f !important;
			}
			
			#fences-auto-suggest .active {
			  background: #ddd;
			}
			
			.cm-s-inner span.cm-comment {
			  color: #9daab6;
			}
			.cm-s-inner span.cm-builtin {
			  color: #0451a5;
			}
			
			/* language tip */
			#write .code-tooltip {
			  border: 1px solid var(--border);
			}
			
			.auto-suggest-container {
			  border-color: #b4b4b4;
			}
			
			.auto-suggest-container .autoComplt-hint.active {
			  background: #b4b4b4;
			  color: inherit;
			}
			
			/* task list */
			#write .md-task-list-item > input {
			  -webkit-appearance: initial;
			  display: block;
			  position: absolute;
			  border: 1px solid #b4b4b4;
			  border-radius: 0.2rem;
			  margin-top: 0.3rem;
			  height: 1rem;
			  width: 1rem;
			  transition: background 0.3s;
			}
			
			#write .md-task-list-item > input:focus {
			  outline: none;
			  box-shadow: none;
			}
			
			#write .md-task-list-item > input:hover {
			  background: #ddd;
			}
			
			#write .md-task-list-item > input[checked]::before {
			  content: "";
			  position: absolute;
			  top: 20%;
			  left: 50%;
			  height: 60%;
			  width: 2px;
			  transform: rotate(40deg);
			  background: #333;
			}
			
			#write .md-task-list-item > input[checked]::after {
			  content: "";
			  position: absolute;
			  top: 46%;
			  left: 25%;
			  height: 30%;
			  width: 2px;
			  transform: rotate(-40deg);
			  background: #333;
			}
			
			#write .md-task-list-item > p {
			  transition: color 0.3s, opacity 0.3s;
			}
			
			#write .md-task-list-item.task-list-done > p {
			  color: #b4b4b4;
			  text-decoration: line-through;
			}
			
			#write .md-task-list-item.task-list-done > p > .md-emoji {
			  opacity: 0.5;
			}
			
			#write .md-task-list-item.task-list-done > p > .md-link > a {
			  opacity: 0.6;
			}
			
			/* sidebar */
			#typora-sidebar,
			.typora-node #typora-sidebar {
			  box-shadow: 3px 0px 10px var(--shadow-color);
			}
			.sidebar-content-content {
			  font-size: 0.9rem;
			}
			
			
			
			</style>
			</head>
			<body class='typora-export os-windows'>
			<div id='write'  class=''><h1><a name="instruction-article" class="md-header-anchor"></a><span>Instruction Article</span></h1><p><span>Welcome to Territory Blog! This article will explain how to use this website. ꉂ೭(˵¯̴͒ꇴ¯̴͒˵) ” </span></p><p><span>Every article can be shared with others through our URL.</span></p><h3><a name="welcome-page" class="md-header-anchor"></a><span>Welcome Page</span></h3><p><span>This is our welcome page, which is also an entry for new users to sign in this website. To register or login, you can click on button &quot;LOG IN&quot;.</span></p><p><img src="https://firebasestorage.googleapis.com/v0/b/territory-blog.appspot.com/o/image-20220819211459069.png?alt=media&amp;token=f7ab60e9-8bac-46ca-9306-8ec0a7404e50" referrerpolicy="no-referrer" alt="image-20220819211459069"></p><p>&nbsp;</p><p>&nbsp;</p><h3><a name="login-page" class="md-header-anchor"></a><span>Login Page</span></h3><p><span>This is our login page. At here, you can sign in with Google, email, phone, and Rose-Hulam Fire. If you have never signed up before, after logging, you will be redirected to the profile setting page, which will be shown below.</span></p><p><img src="https://firebasestorage.googleapis.com/v0/b/territory-blog.appspot.com/o/image-20220819211744038.png?alt=media&amp;token=d15caae8-bbf2-4a12-a6b1-7f742d46fbd3" referrerpolicy="no-referrer" alt="image-20220819211744038"></p><p>&nbsp;</p><p>&nbsp;</p><h3><a name="profile-page" class="md-header-anchor"></a><span>Profile Page</span></h3><p><span>This is the profile page. You can set icon, username, and slogan for your personal blog. Clicking on the pencil button can help you update the data. After everything is done, you can click on save.</span></p><p><img src="https://firebasestorage.googleapis.com/v0/b/territory-blog.appspot.com/o/image-20220819212121436.png?alt=media&amp;token=2d2c8cf7-5bef-4ad5-954c-7386b9c58890" referrerpolicy="no-referrer" alt="image-20220819212121436"></p><p>&nbsp;</p><p>&nbsp;</p><h3><a name="main-page" class="md-header-anchor"></a><span>Main Page</span></h3><p><span>This is the main page. All of your articles will be shown at here. If you want to see additional functions, click on the right top hamburger button, which will bring you to the hidden page.</span></p><p><img src="https://firebasestorage.googleapis.com/v0/b/territory-blog.appspot.com/o/image-20220819212308754.png?alt=media&token=b335a663-01c3-41cd-a43e-0e3da69c58b1" alt="image-20220819212308754" style="zoom:50%;" /></p><p>&nbsp;</p><h3><a name="view-page" class="md-header-anchor"></a><span>View Page</span></h3><p><span>This is our view page. This place will show full content of your article. You can click on the top left button to play music. What&#39;s more, you can post comments under each article.</span></p><p><img src="https://firebasestorage.googleapis.com/v0/b/territory-blog.appspot.com/o/image-20220819214041024.png?alt=media&amp;token=a1d9b0b8-c4d5-4206-8b94-3a8a8c348604" referrerpolicy="no-referrer" alt="image-20220819214041024"></p><p>&nbsp;</p><h3><a name="hidden-page" class="md-header-anchor"></a><span>Hidden Page</span></h3><p><span>This is the hidden page. You can search your articles by Tags by clicking on Tag button. If you want to update your profile, which is the username, icon, and slogan, you can click on settings button. </span></p><p><strong><span>Notice</span></strong><span>: You much be in Login Status if you want to change profile (Settings), delete articles (pencil button), and create new articles (plus button).  </span></p><p><img src="https://firebasestorage.googleapis.com/v0/b/territory-blog.appspot.com/o/image-20220819212545917.png?alt=media&amp;token=16666648-fcf4-48cb-a153-60b392013a5a" referrerpolicy="no-referrer" alt="image-20220819212545917"></p><p>&nbsp;</p><h3><a name="create-page" class="md-header-anchor"></a><span>Create Page</span></h3><p><span>This is the create page. You can publish your articles at here. Tag, Title, preview,and main content are required for this article. If you finish writing, you can click on SAVE button in the end of this create page.</span></p><p><img src="https://firebasestorage.googleapis.com/v0/b/territory-blog.appspot.com/o/image-20220819213050229.png?alt=media&amp;token=5f264a34-5d19-4bdf-b71f-33ae476f51ca" referrerpolicy="no-referrer" alt="image-20220819213050229"></p><p>&nbsp;</p><h3><a name="edit-page" class="md-header-anchor"></a><span>Edit Page</span></h3><p><span>If you click on the pencil button, it will bring you to our edit page. At here, you can delete specific article. If you want to update the content of this article, you can click on this article card. It will bring you to create page to edit the content again. </span></p><p><strong><span>Notice</span></strong><span>: You much keep at least one article available.</span></p><p><img src="https://firebasestorage.googleapis.com/v0/b/territory-blog.appspot.com/o/image-20220819213320839.png?alt=media&amp;token=96f346d2-65c5-4e7e-8386-2a2c6a6cba88" referrerpolicy="no-referrer" alt="image-20220819213320839"></p><p>&nbsp;</p><h3><a name="search-page" class="md-header-anchor"></a><span>Search Page</span></h3><p><span>If you notice the button on the top, clicking on it will bring you to our search page. At here, you can search articles by title.</span></p><p><img src="https://firebasestorage.googleapis.com/v0/b/territory-blog.appspot.com/o/image-20220819213812996.png?alt=media&amp;token=af94e0e8-7393-47c2-828f-75916d41dc59" referrerpolicy="no-referrer" alt="image-20220819213812996"></p><p>&nbsp;</p><p>&nbsp;</p><h3><a name="to-see-more-try-our-website-" class="md-header-anchor"></a><span>To See More? Try our website !</span></h3><p>&nbsp;</p></div>
			</body>
			</html>`,
			"./images/Main-index-default.jpg",
			["Introduction"],
			"./music/水谷広実 - 優しい風.flac");
		});
	}
}

rhit.ProfilePageController = class {
	constructor(isNewUser) {
		rhit.userProfileManager.beginListening(rhit.loginAuthManager.uid, this.updateView.bind(this));
		if (isNewUser) {
			$('#newUserAlert').modal('show');
		}

		this._init = true;

		this._name = "";
		this._photoUrl = "";
		this._slogan = "";

		document.querySelector("#uploadImageBtn").onclick = (event) => {
			document.querySelector("#inputProfileIconFile").click();
		}

		let file = null;
		document.querySelector("#inputProfileIconFile").addEventListener("change", (event) => {
			file = event.target.files[0];
			if (file && file.size > 4194304) {
				alert("File is too big! File should be less than 4M!");
				file = null;
				return;
			};
		});

		document.querySelector("#saveProfileIcon").onclick = (event) => {
			const storageRef = firebase.storage().ref().child(rhit.loginAuthManager.uid + '/' + rhit.loginAuthManager.uid);
			if(file){
				storageRef.put(file).then((UploadTaskSnapshot) => {
					console.log("File uploaded");
	
					// save download url
					storageRef.getDownloadURL().then((result) => {
						this._photoUrl = result;
						this.updateView();
					});
	
				});
			}
		}

		document.querySelector("#saveProfileUsername").onclick = (event) => {
			this._name = document.querySelector("#inputProfileUsername").value;
			this.updateView();
		}

		document.querySelector("#saveProfileSlogan").onclick = (event) => {
			this._slogan = document.querySelector("#inputProfileSlogan").value;
			this.updateView();
		}

		document.querySelector("#submitProfilePage").onclick = (params) => {
			rhit.userProfileManager.updateAll(this._name, this._photoUrl, this._slogan)
				.then(() => {
					window.location.href = `/mainPage.html?uid=${rhit.loginAuthManager.uid}`;
				});
		}


	}

	updateView() {
		if (rhit.userProfileManager.photoUrl) {
			document.querySelector("#profile-Icon").src = this._photoUrl || rhit.userProfileManager.photoUrl;
		}

		if (rhit.userProfileManager.name) {
			document.querySelector("#profileUsername").innerHTML = this._name || rhit.userProfileManager.name;
			document.querySelector("#inputProfileUsername").value = this._name || rhit.userProfileManager.name;
		}

		if (rhit.userProfileManager.slogan) {
			document.querySelector("#profileSlogan").innerHTML = this._slogan || rhit.userProfileManager.slogan;
			document.querySelector("#inputProfileSlogan").value = this._slogan || rhit.userProfileManager.slogan;
		}

		if (this._init) {
			this._name = rhit.userProfileManager.name;
			this._slogan = rhit.userProfileManager.slogan;
			this._photoUrl = rhit.userProfileManager.photoUrl;
			this._init = false;
		}

	}
}

rhit.UserProfileManager = class {
	constructor() {
		this._collectoinRef = firebase.firestore().collection(rhit.FB_USER_COLLECTION);
		this._document = null;
		this._unsubscribe = null;
		// console.log("Created User Manager");
	}

	addNewUserMaybe(uid, name, photoUrl, slogan) {
		// must return a promise
		const userRef = this._collectoinRef.doc(uid);

		return userRef.get().then((doc) => {
			if (doc.exists) {
				console.log("Document data:", doc.data());
				return false;
			} else {
				// doc.data() will be undefined in this case
				console.log("No such document!");
				return userRef.set({
					[rhit.FB_USER_KEY_NAME]: name,
					[rhit.FB_USER_KEY_PHOTOURL]: photoUrl,
					[rhit.FB_USER_KEY_SLOGAN]: slogan
				})
					.then(() => {
						console.log("Document successfully written!");
						return true;
					})
					.catch((error) => {
						console.error("Error writing document: ", error);
					});

			}
		}).catch((error) => {
			console.log("Error getting document:", error);
		});
	}

	beginListening(uid, changeListener) {
		const userRef = this._collectoinRef.doc(uid);

		this._unsubscribe = userRef.onSnapshot((doc) => {
			if (doc.exists) {
				this._document = doc;
				// console.log("Document data:", doc.data());
				changeListener();
			} else {

				console.log("No user! That's bad!");

			}
		});
	}

	stopListening() {
		this._unsubscribe();
	}

	updateAll(name, photoUrl, slogan) {
		const userRef = this._collectoinRef.doc(rhit.loginAuthManager.uid);
		return userRef.update({
			[rhit.FB_USER_KEY_NAME]: name,
			[rhit.FB_USER_KEY_PHOTOURL]: photoUrl,
			[rhit.FB_USER_KEY_SLOGAN]: slogan
		})
			.catch(function (error) {
				console.error("Error adding document: ", error);
			});
	}


	get isListening() { return !!this._unsubscribe; }
	get name() { return this._document.get(rhit.FB_USER_KEY_NAME); }
	get photoUrl() { return this._document.get(rhit.FB_USER_KEY_PHOTOURL); }
	get slogan() { return this._document.get(rhit.FB_USER_KEY_SLOGAN); }

}

rhit.LoginController = class {
	constructor() {
		document.querySelector("#RoseFire").onclick = (event) => {
			rhit.loginAuthManager.signIn();

		};
		rhit.loginAuthManager.startFirebaseUI();
	}

}

rhit.LoginAuthManager = class {
	constructor() {
		this._user = null;
	}

	beginListening(changeListener) {
		firebase.auth().onAuthStateChanged((user) => {
			this._user = user;
			changeListener();
		});
	}

	signIn() {
		// Please note this needs to be the result of a user interaction
		// (like a button click) otherwise it will get blocked as a popup
		Rosefire.signIn("c442af33-6c08-47db-a457-8ae9ae0c053d", (err, rfUser) => {
			if (err) {
				console.log("Rosefire error!", err);
				return;
			}
			console.log("Rosefire success!", rfUser);

			var tmp = rfUser.username;
			// TODO: Use the rfUser.token with your server.
			firebase.auth().signInWithCustomToken(rfUser.token).then(() => {
				// console.log(tmp);

				window.location.href = `/mainPage.html?uid=${tmp}`;
			}).catch((error) => {
				const errorCode = error.code;
				const errorMessage = error.message;
				console.error("Customer auth error", errorCode, errorMessage);
			});
		});



	}

	signOut() {
		firebase.auth().signOut().catch((error) => {
			// An error happened.
			console.log("Sign out error");
		});
	}

	startFirebaseUI() {
		// FirebaseUI config.
		var uiConfig = {
			// signInSuccessUrl: `/mainPage.html`,
			// signInFlow: 'popup',
			signInOptions: [
				// Leave the lines as is for the providers you want to offer your users.
				firebase.auth.GoogleAuthProvider.PROVIDER_ID,
				firebase.auth.EmailAuthProvider.PROVIDER_ID,
				firebase.auth.PhoneAuthProvider.PROVIDER_ID,

			],
			callbacks: {
				signInSuccessWithAuthResult: () => {
					window.location.href = `/mainPage.html?uid=${rhit.loginAuthManager.uid}`;
				}
			}

		};
		// Initialize the FirebaseUI Widget using Firebase.
		var ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(firebase.auth());

		// The start method will wait until the DOM is loaded.
		ui.start('#firebaseui-auth-container', uiConfig);

	}

	get isSignedIn() {
		return !!this._user;
	}

	get uid() {
		return this._user.uid;
	}
}

rhit.initController = function () {

	let url = new URLSearchParams(window.location.search);
	if (document.querySelector("#loginPage")) {

		new rhit.LoginController();
	} else if (document.querySelector("#profilePage")) {
		let isNew = url.get("isNew") == "true";
		new rhit.ProfilePageController(isNew);

	} else if (document.querySelector("#viewPage")) {
		let uid = url.get("uid");
		let articleID = url.get("articleId");

		if (!articleID) {
			window.history.go(-1);
		}

		if (!uid) {
			window.history.go(-1);
		}

		rhit.mainPageTagManager = new rhit.MainPageTagManager(uid);
		rhit.mainPageContentManager = new rhit.MainPageContentManager(uid);
		rhit.viewPageCommentManager = new rhit.ViewPageCommentManager(articleID);
		rhit.viewPageContentManager = new rhit.ViewPageContentManager(articleID);

		new rhit.ViewPageController(uid);



	} else if (document.querySelector("#mainPage")) {
		let uid = url.get("uid");
		if (!uid) {
			window.alert("you should put uid after the link, such as : www.territory-blog.web.app/mainPage.html?uid=xiongy");
			window.location.href = "/";
		} else {

			rhit.editPageManager = new rhit.EditPageManager(uid);
			rhit.mainPageContentManager = new rhit.MainPageContentManager(uid);
			rhit.mainPageTagManager = new rhit.MainPageTagManager(uid);
			new rhit.MainPageController(uid);
		}

	} else if (document.querySelector("#editPage")) {
		let uid = url.get("uid");
		let articleID = url.get("articleId");

		if (!uid) {
			window.history.go(-1);
		}

		if (rhit.loginAuthManager.isSignedIn && uid == rhit.loginAuthManager.uid) {
			rhit.mainPageContentManager = new rhit.MainPageContentManager(rhit.loginAuthManager.uid);
			rhit.editPageManager = new rhit.EditPageManager(rhit.loginAuthManager.uid);
			rhit.mainPageTagManager = new rhit.MainPageTagManager(rhit.loginAuthManager.uid);
			if (articleID) {
				rhit.viewPageContentManager = new rhit.ViewPageContentManager(articleID);
			}

			new rhit.EditPageController(rhit.loginAuthManager.uid, articleID);
		} else {
			window.alert("please login first");
			window.location.href = "/loginPage.html";
		}

	}


}

rhit.createUserObjectIfNeeded = function () {
	return new Promise((resolve, reject) => {
		// Check If a user might be new
		if (!rhit.loginAuthManager.isSignedIn) {
			resolve();
			return;
		}

		if (!document.querySelector("#loginPage")) {
			resolve();
			return;
		}

		console.log("add new user");
		// Call addNewUserMaybe
		rhit.userProfileManager.addNewUserMaybe(
			rhit.loginAuthManager.uid,
			"Territory",
			"./images/Default_Profile_Icon.webp",
			"Veni, vidi, vici ----Julius Caesar"
		).then((isUserNew) => {
			resolve(isUserNew);
		});

	});
}


/** function and class syntax examples */
rhit.main = function () {
	console.log("Ready");
	rhit.userProfileManager = new rhit.UserProfileManager();
	rhit.loginAuthManager = new rhit.LoginAuthManager();
	rhit.loginAuthManager.beginListening(() => {
		//check if a new user is needed
		rhit.createUserObjectIfNeeded().then((isUserNew) => {

			if (isUserNew) {
				window.location.href = "/profilePage.html?isNew=true";
				return;
			}

			rhit.initController();
		});

	});

};

rhit.main();
