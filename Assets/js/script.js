async function loadPapers() {
  const response = await fetch("papers.json");
  if (!response.ok) {
    console.error("Failed to load papers.json");
    return;
  }

  const data = await response.json();
  const container = document.getElementById("papers-container");
  container.innerHTML = "";

  for (const grade in data) {
    // Grade header
    const gradeDiv = document.createElement("div");
    const gradeHeader = document.createElement("h2");
    gradeHeader.textContent = grade;
    gradeHeader.classList.add("grade-header");
    gradeDiv.appendChild(gradeHeader);

    const subjectsDiv = document.createElement("div");
    subjectsDiv.classList.add("subject-list");

    for (const subject in data[grade]) {
      const subjectDiv = document.createElement("div");
      const subjectHeader = document.createElement("h3");
      subjectHeader.textContent = subject;
      subjectHeader.classList.add("subject-header");
      subjectDiv.appendChild(subjectHeader);

      const list = document.createElement("ul");
      list.classList.add("papers-list");

      data[grade][subject].forEach(entry => {
        const item = document.createElement("li");
        item.innerHTML = `${entry.year}: 
          <a href="${entry.paper}" target="_blank">Paper</a>
          ${entry.memo ? ` | <a href="${entry.memo}" target="_blank">Memo</a>` : ""}`;
        list.appendChild(item);
      });

      subjectDiv.appendChild(list);
      subjectsDiv.appendChild(subjectDiv);

      // Toggle papers
      subjectHeader.addEventListener("click", () => {
        list.style.display = list.style.display === "block" ? "none" : "block";
      });
    }

    gradeDiv.appendChild(subjectsDiv);
    container.appendChild(gradeDiv);

    // Toggle subjects
    gradeHeader.addEventListener("click", () => {
      subjectsDiv.style.display = subjectsDiv.style.display === "block" ? "none" : "block";
    });
  }
}

document.addEventListener("DOMContentLoaded", loadPapers);

// Search filter
document.getElementById("search").addEventListener("input", function () {
  const query = this.value.toLowerCase();
  document.querySelectorAll("#papers-container li").forEach(item => {
    item.style.display = item.textContent.toLowerCase().includes(query) ? "" : "none";
  });
});
