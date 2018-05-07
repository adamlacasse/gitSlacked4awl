$(document).ready(function() {

  var modal = document.getElementById("myModal");
  var btn = document.getElementById("myBtn");
  var span = document.getElementsByClassName("close")[0];
  btn.onclick = function() {
      modal.style.display = "block";
  }

  span.onclick = function() {
      modal.style.display = "none";
  }

  window.onclick = function(event) {
      if (event.target == modal) {
          modal.style.display = "none";
      }
  }

let MyParentCardObj = {};
const ui = new UI();
const gitconnect = new GitConnect;
const gitUserUI = document.getElementById('git-user');
const repoNameUI = document.getElementById('repo-name');
const branchUI = document.getElementById('branch-ui');
const submitBtn = document.getElementById('btn-input');
const clearInputForm = document.getElementById('clear-results');

const config = {
  apiKey: "AIzaSyDqM96DQL3V6Hc94P1uBAGyWiML-moreWM",
  authDomain: "gitslacked2.firebaseapp.com",
  databaseURL: "https://gitslacked2.firebaseio.com",
  projectId: "gitslacked2",
  storageBucket: "gitslacked2.appspot.com",
  messagingSenderId: "515555071574"
};
firebase.initializeApp(config);

const database = firebase.database();

database.ref().on("child_added", function (childSnapshot) {
  const user = childSnapshot.val().user,
  repo = childSnapshot.val().repo,
  branch = childSnapshot.val().branch;
  firebasechildkey = childSnapshot.key;
  console.dir(firebasechildkey);

  let cardObjName = "card" + firebasechildkey;

  var userRepoBranchCard = new UserRepoBranchCard(user, repo, branch, cardObjName);

  gitconnect.getUserRepoBranch(user, repo, branch)
    .then(data => {
      if(data.profile.message === 'Not Found'){
        
        ui.showAlert('User not found', 'alert alert-danger');

      } else {
       
        MyParentCardObj[cardObjName] = userRepoBranchCard;
        MyParentCardObj[cardObjName].avatar_url = data.profile.avatar_url;
        MyParentCardObj[cardObjName].firebasekey = firebasechildkey;
        MyParentCardObj[cardObjName].name = data.profile.name;
        MyParentCardObj[cardObjName].bio = data.profile.bio;
        var profileEncodedUrl = encodeURI(data.profile.html_url);
        MyParentCardObj[cardObjName].repolink = profileEncodedUrl;
        MyParentCardObj[cardObjName].sha = data.profileRepoSha.object.sha;
        var shaSpecific1 = MyParentCardObj[cardObjName].sha.value;
        gitconnect.getRepoDetailedInfo(user, repo, branch, MyParentCardObj[cardObjName].sha)
        .then(data => {
          if(data.userRepoDetailWithComments === 'Not Found'){
            ui.showAlert('Details not found', 'alert alert-danger');
          } else {
            
            MyParentCardObj[cardObjName].message = data.userRepoDetailWithComments.commit.message;
              const cardSection = document.getElementById('card-space');
              const card = document.createElement('div');
              card.innerHTML = `
              <div class="card" id="${cardObjName}"style="width: 18rem;">
              <img class="card-img-top" src="${MyParentCardObj[cardObjName].avatar_url }" alt="Card image cap">
              <div class="card-body">
                <h5 class="card-title">${MyParentCardObj[cardObjName].name}</h5>
                <p class="card-text">${MyParentCardObj[cardObjName].bio}</p>
              </div>
              <ul class="list-group list-group-flush">
                <li class="list-group-item">For ${MyParentCardObj[cardObjName].repo} </li>
                <li class="list-group-item">Most recent commit</li>
                <li class="list-group-item text-success">${MyParentCardObj[cardObjName].message}</li>
                <div class="input-group mt-3 p-1">
                <div class="input-group-prepend">
                  <span class="input-group-text slack-${cardObjName}" id="input-slack-msg">Message</span>
                </div>
                <input type="text" class="form-control" id="slack-msg-text" aria-label="Default" aria-describedby="input slack message">
              </div>
                  <a href="#" class="btn btn-primary m-3 slack">Send Slack Notification</a>
                  <a href="#" class="btn btn-light m-3 delete">Delete Card</a>
                </ul>
                <div class="card-body">
                  <a href="${MyParentCardObj[cardObjName].repolink}" class="card-link">${MyParentCardObj[cardObjName].repolink}</a>
                </div>
              </div>
              `
              cardSection.append(card);
            }
        })
        const objKeys = Object.keys(MyParentCardObj);
      }
    })

}, function (errorObject) {
  console.log("Errors handled: " + errorObject.code);
})


function UserRepoBranchCard(user, repo, branch) {
  this.user = user;
  this.repo = repo;
  this.branch = branch;
};


UserRepoBranchCard.prototype.pushToFirebase = function(userRepoBranchCardUI) {
  var newSnap = database.ref().push({
    user: userRepoBranchCardUI.user,
    repo: userRepoBranchCardUI.repo,
    branch: userRepoBranchCardUI.branch
  })

  var firebasekeyNewSnap = newSnap.name();
  userRepoBranchCardUI.firebasekey = firebasekeyNewSnap; 

  let cardObjName = "card" + firebasekeyNewSnap;

  gitconnect.getUserRepoBranch(user, repo, branch)
    .then(data => {
      if(data.profile.message === 'Not Found'){
        ui.showAlert('User not found', 'alert alert-danger');
      } else {
        MyParentCardObj[cardObjName] = userRepoBranchCardUI;
        MyParentCardObj[cardObjName].avatar_url = data.profile.avatar_url;
        MyParentCardObj[cardObjName].firebasekey = firebasechildkey;
        MyParentCardObj[cardObjName].name = data.profile.name;
        MyParentCardObj[cardObjName].bio = data.profile.bio;
        MyParentCardObj[cardObjName].repolink = data.profile.html_url;
        MyParentCardObj[cardObjName].sha = data.profileRepoSha.object.sha;
        var shaSpecific1 = MyParentCardObj[cardObjName].sha.value;
        gitconnect.getRepoDetailedInfo(user, repo, branch, MyParentCardObj[cardObjName].sha)
        .then(data => {
          if(data.userRepoDetailWithComments === 'Not Found'){
            ui.showAlert('Details not found', 'alert alert-danger');
          } else {
            
            MyParentCardObj[cardObjName].message = data.userRepoDetailWithComments.commit.message;
              const cardSection = document.getElementById('card-space');
              const card = document.createElement('div');
                    card.innerHTML = `
                    <div class="card" id="${cardObjName}"style="width: 18rem;">
                    <img class="card-img-top" src="${MyParentCardObj[cardObjName].avatar_url }" alt="Card image cap">
                    <div class="card-body">
                      <h5 class="card-title">${MyParentCardObj[cardObjName].name}</h5>
                      <p class="card-text">${MyParentCardObj[cardObjName].bio}</p>
                    </div>
                    <ul class="list-group list-group-flush">
                      <li class="list-group-item">For ${MyParentCardObj[cardObjName].repo} </li>
                      <li class="list-group-item">Most recent commit</li>
                      <li class="list-group-item text-success">${MyParentCardObj[cardObjName].message}</li>
                      <div class="input-group mt-3 p-1">
                      <div class="input-group-prepend">
                        <span class="input-group-text slack-${cardObjName}" id="input-slack-msg">Message</span>
                      </div>
                      <input type="text" class="form-control" id="slack-msg-text" aria-label="Default" aria-describedby="input slack message">
                    </div>
                        <a href="#" class="btn btn-primary m-3 slack">Send Slack Notification</a>
                        <a href="#" class="btn btn-light m-3 delete">Delete Card</a>
                      </ul>
                      <div class="card-body">
                        <a href="${MyParentCardObj[cardObjName].repolink}" class="card-link">${MyParentCardObj[cardObjName].repolink}</a>
                      </div>
                    </div>
                    `
              cardSection.append(card);
            }
        })
        console.dir(cardObjName);
        console.dir(userRepoBranchCard);
        const objKeys = Object.keys(MyParentCardObj);
        console.log("objkeys: ", objKeys);
      }
    })
}, function (errorObject) {
  console.log("Errors handled: " + errorObject.code);
};

function UI() {};

UI.prototype.clearInputFromForm = function() {
  document.getElementById('git-user').value = '';
  document.getElementById('repo-name').value = '';
  document.getElementById('branch-ui').value = '';
}

UI.prototype.deleteCard = function(target){
  let cardObjID2 = target.parentElement.parentElement.id;
  
  if(target.className === 'btn btn-light m-3 delete'){
   var fbkey = MyParentCardObj[cardObjID2].firebasekey;
   delete MyParentCardObj[cardObjID2];

   database.ref().child(fbkey).remove();
  
    target.parentElement.parentElement.remove();

  } else if(target.className === 'card-link'){
    var win = window.open(url, '_blank');
    win.focus();
  } else if(target.className === 'btn btn-primary m-3 slack'){
  
     var slackMsg = target.parentElement.children[3].children[1].value;
     console.log(slackMsg);
     var queryURL = "https://hooks.slack.com/services/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";
     $.ajax({
      data: 'payload=' + JSON.stringify({
      "text": slackMsg
      }),
      processData: false,
      type: "POST",
      url: queryURL
  });

  } 
}

UI.prototype.showAlert = function(message, className) {
  const div = document.createElement('div');
  div.className = `alert ${className}`;
  div.appendChild(document.createTextNode(message));
  const container = document.querySelector('.container2');
  const form = document.querySelector('#repo-input');
  container.insertBefore(div, form);
  setTimeout(function(){
    document.querySelector('.alert').remove();
  }, 3000);
}

document.getElementById('btn-input').addEventListener('click', function(e){
  e.preventDefault();
  var ui = new UI();
  const gitUser = gitUserUI.value;
  const gitRepo = repoNameUI.value;
  const gitBranch = branchUI.value;
  ui.clearInputFromForm();
 
  if(gitUser === '' || gitRepo === '' || gitBranch === '') {
    ui.showAlert('Please fill in all fields', 'error');
  } else {
    const userRepoBranchCardUI = new UserRepoBranchCard(gitUser, gitRepo, gitBranch);
    userRepoBranchCardUI.pushToFirebase(userRepoBranchCardUI);  
    ui.showAlert('Repo Added!', 'success');
    ui.clearInputFromForm();
  }  
    e.preventDefault();
  });

document.getElementById('card-space').addEventListener('click', function(e){
  const ui = new UI();
  ui.deleteCard(e.target);
  e.preventDefault();
})

document.getElementById('clear-results').addEventListener('click', function(e){
  e.preventDefault();
  ui.clearInputFromForm();
});

});