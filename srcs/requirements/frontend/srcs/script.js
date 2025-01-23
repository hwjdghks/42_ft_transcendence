// 데이터 조회 버튼 이벤트 리스너
document.getElementById('fetchData').addEventListener('click', async () => {
  try {
    const response = await fetch('/api/get-test-data/');
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    const data = await response.json();
    const dataList = document.getElementById('dataList');
    dataList.innerHTML = ''; // 기존 데이터 제거
    data.forEach(item => {
      const li = document.createElement('li');
      li.textContent = `Name: ${item.name}, Description: ${item.description}`;
      dataList.appendChild(li);
    });
  } catch (error) {
    alert(`Failed to fetch data: ${error.message}`);
  }
});

// 데이터 삽입 폼 제출 이벤트 리스너
document.getElementById('dataForm').addEventListener('submit', async (e) => {
  e.preventDefault(); // 폼 기본 동작 방지
  const name = document.getElementById('name').value;
  const description = document.getElementById('description').value;

  try {
    const response = await fetch('/api/add-test-data/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, description }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const result = await response.json();
    document.getElementById('insertResponse').textContent = result.message;
    document.getElementById('dataForm').reset(); // 폼 초기화
  } catch (error) {
    document.getElementById('insertResponse').textContent = `Failed to add data: ${error.message}`;
  }
});
