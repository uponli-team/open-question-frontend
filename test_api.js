const url = "https://open-question-backend.onrender.com/api/open_questions?category=Computer%20Science&limit=5";

fetch(url)
  .then(res => res.json())
  .then(data => {
    console.log("Total:", data.total_count || data.count || data.total);
    console.log("Results count:", data.results?.length);
    if(data.results?.length > 0) {
      console.log("First result category:", data.results[0].category);
    }
  })
  .catch(console.error);
