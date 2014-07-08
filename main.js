"use strict";

var tasks = JSON.parse(localStorage.getItem("tasks")),
    workingId = -1;

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
    console.log("ASD", id, ii);
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

$(function() {

  populateTable();

  $('#myModal').on('hidden.bs.modal', function() {
      clearModal();
      workingId = -1;
  });

  $("#btn-add-task").click(function() {
    console.log("add-task");
    var taskName = $("#input-task").val();
    var taskDescription = $("#input-description").val();
    var taskDate = $("#input-date").val();
    var taskStarred = $("#input-checkbox").prop("checked") ? "Starred" : "Not Starred";

    var arr = localStorage.getItem("tasks") ?
                JSON.parse(localStorage.getItem("tasks")) : [];

    var task;

    if(workingId == -1) {
      task = {
        "id" : Date.now(),
        "name" : taskName,
        "description" : taskDescription,
        "date" : taskDate,
        "starred" : taskStarred
      };
      arr.push(task);
    }
    else {
      task = arr[workingId];
      task.name = taskName;
      task.description = taskDescription;
      task.date = taskDate;
      task.starred = taskStarred;
    }

    tasks = arr;
    localStorage.setItem("tasks", JSON.stringify(tasks));
    populateTable();
  });
});
