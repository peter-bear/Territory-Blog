var rhit = rhit || {};

rhit.createPageManager = null;


rhit.CreatePageManager = class{
    constructor(){
        this._unsubscribe = null;
		this._ref_preView = firebase.firestore().collection("article");
        this._ref_main = firebase.firestore().collection("articleMainContent");

    }

    add(title, preView, date, content, imageUrl, tags, uid){
        console.log("add");

        this._ref_preView.add({
			["coverUrl"] : imageUrl,
			["date"] : date,
			["preViewContent"] : preView,
            ["tags"]:tags,
            ["title"]:title,
            ["uid"]:uid
		})
		.then((docRef) => {
			console.log("Document update with ID: ", docRef.id);
            this._ref_main.add({
                ["articleID"]:docRef.id,
                ["content"]:content
            }).catch(function(error){
                console.error("Error adding document: ", error);
            });
		})
		.catch(function(error){
			console.error("Error adding document: ", error);
		});
    }


}




rhit.main = function(){
    rhit.createPageManager = new rhit.CreatePageManager();
    document.querySelector("#publishBtn").onclick = (event) => {
        console.log("clicked");
        rhit.createPageManager.add(
            document.querySelector("#title").value, 
            document.querySelector("#preViewContent").value,
            new firebase.firestore.Timestamp.fromDate(new Date(document.querySelector("#date").value)),
            document.querySelector("#content").value,
            document.querySelector("#imageUrl").value,
            ["Introduction"],
            document.querySelector("#uid").value,
        );
    }

}

rhit.main();
