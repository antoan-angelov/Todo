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

    ev.originalEvent.dataTransfer.setData("Text", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();

    var data = ev.originalEvent.dataTransfer.getData("Text"),
      id1 = ev.target.parentNode.id,
      id2 = data,
      index1 = getTaskById(id1),
      index2 = getTaskById(id2),
      t = tasks[index1];

    if($("#"+data).prop("tagName") != "TR")
      return;

    tasks[index1] = tasks[index2];
    tasks[index2] = t;

    $("#"+data).insertBefore($(ev.target).parent());

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
    var source   = $("#row-template").html();
    var template = Handlebars.compile(source);
    var context = {"tasks" : tasks};
    var html    = template(context);
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

  $('#table-cont table tbody tr').on('dragstart', function(evt) {
    drag(evt);
  });

  $('#table-cont table tbody').on('drop', function(evt) {
    drop(evt);
  });

  $('#table-cont table tbody').on('dragover', function(evt) {
    allowDrop(evt);
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

function clearSettingsModal() {
  $("#input-username").val("");
  $("#bgcolor").val("");
  var $image = $("#drop_zone img");
  if($image.length) {
    $image.attr("src", "");
    var $drop_zone = $("#drop_zone");
    $drop_zone.addClass("drop-spot");
    $drop_zone.text("Drop avatar here");
  }
}

function setSettingsAvatar(data) {
  var $drop_zone = $("#drop_zone");
  $drop_zone.html(['<img class="thumb" src="',
    data, '">'].join(''));
  $drop_zone.removeClass("drop-spot");
}

function handleFileSelect(evt) {
  evt.stopPropagation();
  evt.preventDefault();

  var files = evt.originalEvent.dataTransfer.files; // FileList object.

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
  evt.originalEvent.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}

// Setup the dnd listeners.
var $dropZone = $('#drop_zone');
$dropZone.on('dragover', handleDragOver);
$dropZone.on('drop', handleFileSelect);

$(function() {
  applySettings();
  populateTable();

  $('#myModal').on('hidden.bs.modal', function() {
      clearModal();
      workingId = -1;
  });

  $('#settingsModal').on('hidden.bs.modal', function() {
      clearSettingsModal();
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
    var taskName = $("#input-task").val(),
        taskDescription = $("#input-description").val(),
        taskDate = $("#input-date").val(),
        taskStarred = $("#input-checkbox").prop("checked") ? "Starred" : "Not Starred",
        task;

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
