"use strict";

var tasks = JSON.parse(localStorage.getItem("tasks")) || [],
    workingId = -1,
    settings = JSON.parse(localStorage.getItem("settings"))
                || {  "name" : "Unnamed",
                      "avatar" : null,
                      "bgcolor" : "#ffffff" };

function applySettings() {
  $("#username").text(settings.name);
  $("body").css({"background" : settings.bgcolor});
  $("#bgcolor").val(settings.bgcolor);
  $("#input-username").val(settings.name);
  if(settings.avatar) {
    setSettingsAvatar(settings.avatar);
    $("#avatar").attr("src", settings.avatar);
  }
}

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("Text", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("Text");
    ev.target.parentNode.parentNode.insertBefore(document.getElementById(data),
      ev.target.parentNode);
    var id1 = ev.target.parentNode.id;
    var id2 = data;
    var index1 = getTaskById(id1);
    var index2 = getTaskById(id2);
    var t = tasks[index1];
    tasks[index1] = tasks[index2];
    tasks[index2] = t;
    console.log(id1, id2, index1, index2, JSON.stringify(tasks))
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function getTaskById(id) {
  var num = -1;

  tasks.forEach(function(el, index) {
    if(el.id == id) {
      num = index;
      return;
    }
  });

  return num;
}

function populateTable() {
  if(tasks) {
    var list = '<% _.forEach(tasks, function(el, index) { %><tr id=<%- el.id %> draggable=\"true\" ondragstart=\"drag(event)\"><td><%- el.name %></td><td><%- el.date %></td><td><%- el.starred %></td><td><button type="button" class=\"btn btn-primary btn-more-info\" data-toggle=\"modal\" data-id=<%- el.id %> data-target=\"#myModal\">info</button> <button type="button" data-id=<%- el.id %> class=\"btn btn-primary btn-done\">done</button></td></tr><% }); %>';
    var html = _.template(list, { 'tasks': tasks });
    $(".table tbody").html(html);
  }

  $(".btn-done").click(function() {
    var id = $(this).data("id");
    var ii = getTaskById(id);
    tasks.splice(ii, 1);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    populateTable();
  });

  $(".btn-more-info").click(function() {
    var id = $(this).data("id");
    var taskId = getTaskById(id);
    workingId = taskId;
    populateModal(tasks[taskId]);
  });
}

function populateModal(task) {
  $("#input-task").val(task.name);
  $("#input-description").val(task.description);
  $("#input-date").val(task.date);
  $("#input-checkbox").prop("checked", (task.starred === "Starred"));
}

function clearModal() {
  $("#input-task").val("");
  $("#input-description").val("");
  $("#input-date").val("");
  $("#input-checkbox").prop("checked", false);
}

function setSettingsAvatar(data) {
  document.getElementById('drop_zone').innerHTML = ['<img class="thumb" src="',
    data, '">'].join('');
  $("#drop_zone").removeClass("drop-spot");
}

function handleFileSelect(evt) {
  evt.stopPropagation();
  evt.preventDefault();

  var files = evt.dataTransfer.files; // FileList object.

  for (var i = 0, f; f = files[i]; i++) {

    // Only process image files.
    if (!f.type.match('image.*')) {
      continue;
    }

    var reader = new FileReader();
    // Closure to capture the file information.
    reader.onload = (function(theFile) {
      return function(e) {
        setSettingsAvatar(e.target.result);
      };
    })(f);

    reader.readAsDataURL(f);
  }
}

function handleDragOver(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}

// Setup the dnd listeners.
var dropZone = document.getElementById('drop_zone');
dropZone.addEventListener('dragover', handleDragOver, false);
dropZone.addEventListener('drop', handleFileSelect, false);

$(function() {
  applySettings();
  populateTable();

  $('#myModal').on('hidden.bs.modal', function() {
      clearModal();
      workingId = -1;
  });

  $("#btn-save-settings").click(function() {

    var username = $("#input-username").val();
    settings.name = username;

    var color = $("#bgcolor").val();
    settings.bgcolor = color;
    $("body").css({ "background" : color });

    var avatarData = $(".thumb").first().attr("src");
    settings.avatar = avatarData;

    applySettings();
    localStorage.setItem("settings", JSON.stringify(settings));
  });

  $("#btn-add-task").click(function() {
    var taskName = $("#input-task").val();
    var taskDescription = $("#input-description").val();
    var taskDate = $("#input-date").val();
    var taskStarred = $("#input-checkbox").prop("checked") ? "Starred" : "Not Starred";
    var task;

    if(workingId == -1) {
      task = {
        "id" : Date.now(),
        "name" : taskName,
        "description" : taskDescription,
        "date" : taskDate,
        "starred" : taskStarred
      };
      tasks.push(task);
    }
    else {
      task = tasks[workingId];
      task.name = taskName;
      task.description = taskDescription;
      task.date = taskDate;
      task.starred = taskStarred;
    }

    localStorage.setItem("tasks", JSON.stringify(tasks));
    populateTable();
  });
});
