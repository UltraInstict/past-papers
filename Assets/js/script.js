async function loadPapers() {
    const response = await fetch("papers.json");
    const data = await response.json();
  
    const container = document.getElementById("papers-container");
    container.innerHTML = "";
  
    for (const grade in data) {
      const gradeDiv = document.createElement("div");
      gradeDiv.innerHTML = `<h2>${grade}</h2>`;
  
      for (const subject in data[grade]) {
        const subjectDiv = document.createElement("div");
        subjectDiv.innerHTML = `<h3>${subject}</h3>`;
  
        const list = document.createElement("ul");
        data[grade][subject].forEach(entry => {
          const item = document.createElement("li");
          item.innerHTML = `${entry.year}: 
            <a href="${entry.paper}" target="_blank">Paper</a>
            ${entry.memo ? ` | <a href="${entry.memo}" target="_blank">Memo</a>` : ""}`;
          list.appendChild(item);
        });
  
        subjectDiv.appendChild(list);
        gradeDiv.appendChild(subjectDiv);
      }
      container.appendChild(gradeDiv);
    }
  }
  
  document.addEventListener("DOMContentLoaded", loadPapers);
  
  // 🔍 Search filter
  document.getElementById("search").addEventListener("input", function () {
    const query = this.value.toLowerCase();
    document.querySelectorAll("#papers-container li").forEach(item => {
      item.style.display = item.textContent.toLowerCase().includes(query) ? "" : "none";
    });
  });
  