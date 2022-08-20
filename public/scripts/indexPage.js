var rhit = rhit || {};

rhit.IndexPageController = class{
    constructor(){
        document.querySelector("#JoinUs").onclick = () => {
          window.location.href = "/loginPage.html";  
        };
    }
}

rhit.main = function () {
	console.log("Ready");
	new rhit.IndexPageController();
};

rhit.main();
