// selecting element by id and classname
const listElement = document.querySelector(".lists");
const chapterTemplate = document.getElementById("single-chapter");
let fetchedChapters = [];

// making an XMLHttpRequest object for chapter list api
const xhr = new XMLHttpRequest();
xhr.open("GET", "http://localhost:3000/api/book/maths");
xhr.responseType = "json";
// defining what to do onload of this api
xhr.onload = function () {
  // assigning list of chapters to a variable
  const listOfChapters = xhr.response.response;

  // sorting listOfChapter on the basis of sequence number
  listOfChapters.sort((a, b) =>
    a.sequenceNO < b.sequenceNO ? -1 : a.sequenceNO > b.sequenceNO ? 1 : 0
  );
  // iterating over the listofchapters to render the list of chapters on the screen
  for (const chapter of listOfChapters) {
    // creating the copy of chapterTemplate for each chapter
    const chapterEl = document.importNode(chapterTemplate.content, true);
    // assigning the value of title id and status , sequence number in the chapterTemplate for each chapter
    chapterEl.querySelector("button").innerHTML = ` ${chapter.sequenceNO}. ${chapter.title.toUpperCase()} 
                                                    <span class="completion-status">
                                                        ( ${chapter.completeCount ? chapter.completeCount : 0 } 
                                                        completed out of ${chapter.childrenCount} lessons)
                                                    </span>`;
    chapterEl.querySelector(
      "div"
    ).innerHTML = `<p class="loader">Loading......<p>`;
    chapterEl.querySelector("button").id = chapter.id;
    chapterEl.querySelector("button").name = chapter.sequenceNO;
    // appending the list of chapters on the screens to listElement
    listElement.append(chapterEl);
  }
  // getting list of all the collapsible on the screens with the help of getelementbyclassname and save inside collapsible array
  var collapsibleColumns = document.getElementsByClassName("collapsible");

  // iterating over the collapsibleColumns array to add the event listeners on that to add the collapsible functionality on click
  for (var i = 0; i < collapsibleColumns.length; i++) {
    collapsibleColumns[i].addEventListener(
      "click",
      // adding the callback functionon click event
      function (event) {
        // assigning the value of id nad name into the variables to fetch list of lessons
        const id = event.target.id
          ? event.target.id
          : event.target.parentElement.id;
        const name = event.target.name
          ? event.target.name
          : event.target.parentElement.name;
        // fetching lessons for particular id
        fetchLessons(id, name);
        // toggling active class on click for smooth transition on open and close
        this.parentElement.classList.toggle("expanded");
        this.classList.toggle("active");
        var content = this.nextElementSibling;
        if (content.style.display === "block") {
          content.style.visibility = "hidden";
          content.style.opacity = "0";
          content.style.display = "none";
        } else {
          content.style.display = "block";
          content.style.visibility = "visible";
          content.style.opacity = "1";
        }
      }
    );
  }
};
// sending the http request to fetch Chapters
xhr.send();

// fetch lessons for particular id
function fetchLessons(id, name) {
  // checking the id if it is inside fetched chapters array to reduce the network call
  if (fetchedChapters.includes(id)) {
    return;
  } else {
    // checking the id if it is not inside fetchedchapters pushing the id into the array 
    fetchedChapters.push(id);
    // making api call to fetch lessons
    const xhr1 = new XMLHttpRequest();
    xhr1.open("GET", `http://localhost:3000/api/book/maths/section/${id}`);
    xhr1.responseType = "json";
    xhr1.onload = function () {
      // assigning response to ist of lessons variable
      const listOfLessons = xhr1.response.response[id];
      const lessonTemplate = document.getElementById(id);
      // clearing the loading text before assigning the new value to the list of chapters
      lessonTemplate.nextElementSibling.innerHTML = "";
      let lessonString;
      // checking if api fails then shwing the error message on the screen else rendering the list of lessons
      if (xhr1.response.status !== "OK") {
        lessonString = ` <li class="chapters">${xhr1.response.response.message}<li>`;
        lessonTemplate.nextElementSibling.innerHTML += lessonString;
      } else {
        listOfLessons.sort((a, b) =>
          a.sequenceNO < b.sequenceNO ? -1 : a.sequenceNO > b.sequenceNO ? 1 : 0
        );
        for (const lesson of listOfLessons) {
          lessonString = `<li class="chapters">
                        ${name}.${lesson.sequenceNO} &nbsp;&nbsp;${lesson.title}
                        <span class="status">
                            ${
                              lesson.status === "IN_PROGRESS"
                                ? " (In Progress)"
                                : ""
                            }  
                            ${
                              lesson.status === "NOT_STARTED"
                                ? "(Yet To Complete)"
                                : ""
                            }
                            ${lesson.status === "COMPLETE" ? "(Completed)" : ""}
                        </span>
                    <li>`;
          lessonTemplate.nextElementSibling.innerHTML += lessonString;
        }
      }
    };
    // sending the http request for getting the list of lessons
    xhr1.send();
  }
}
