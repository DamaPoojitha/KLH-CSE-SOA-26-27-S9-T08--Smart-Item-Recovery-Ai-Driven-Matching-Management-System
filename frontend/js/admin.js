document.addEventListener('DOMContentLoaded', () => {
  const items = fetch("http://localhost:8080/api/...").then(response => response.json()).catch(() => []) || [];
  
  document.getElementById('totalItems').innerText = 'Total: ' + items.length;
  
  const floorCount = {};
  const keywordCount = {};
  
  items.forEach(it => {
    floorCount[it.floor] = (floorCount[it.floor] || 0) + 1;
    
    it.title.toLowerCase().split(' ').forEach(w => {
      if (w.length > 2) {
        keywordCount[w] = (keywordCount[w] || 0) + 1;
      }
    });
  });
  
  const topFloor = Object.entries(floorCount).sort((a, b) => b[1] - a[1])[0];
  document.getElementById('topFloor').innerText = topFloor ? 'Top Floor: ' + topFloor[0] : 'Top Floor: -';
  
  const common = Object.entries(keywordCount).sort((a, b) => b[1] - a[1])[0];
  document.getElementById('commonKeyword').innerText = common ? 'Common: ' + common[0] : 'Common: -';
});