  function convertFileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = (error) => reject(error);
    });
  }
  
  async function uploadPhoto() {
    var apigClient = new apigClientFactory.newClient({
        apiKey: "37bvoCJtSyk5VmEYAEye3v9oltzSlt1joh5SVAe0",
        region: 'us-east-1'
      });
    const fileInput = document.getElementById('fileInput');
    const customLabels = document.getElementById('customLabels').value.split(',').map(label => label.trim());
    
    if (fileInput.files.length === 0) {
      alert('Please select a file to upload.');
      return;
    }
  
    const file = fileInput.files[0];
    try {
      const imageBase64 = await convertFileToBase64(file);
  
      const result = await apigClient.uploadPut(
        {}, 
        {
          image: imageBase64,
          bucket: 'searchingforphotos',
          object: file.name,
          customLabels: customLabels
        },
        { headers: { 'Content-Type': 'application/json' } }
      );
  
      console.log(`Successfully uploaded ${file.name}`);
      alert('Photo uploaded successfully!');
      fileInput.value = '';
      document.getElementById('customLabels').value = '';
    } catch (error) {
      console.error(`Failed to upload ${file.name}`, error);
      alert('Photo upload failed.');
    }
  }
  
  async function searchPhotos() {
    var apigClient = new apigClientFactory.newClient({
        apiKey: "37bvoCJtSyk5VmEYAEye3v9oltzSlt1joh5SVAe0",
        region: 'us-east-1'
      });
    const query = document.getElementById('searchQuery').value;
  
    if (!query) {
      alert('Please enter a search query.');
      return;
    }
  
    try {
      const result = await apigClient.searchGet(
        { "q": query }, 
        {}, 
        { headers: { 
            'Content-Type': 'application/json',
            'x-api-key': '37bvoCJtSyk5VmEYAEye3v9oltzSlt1joh5SVAe0',
            'Access-Control-Allow-Origin': '*' } }
      );
      console.log(`Successfully searched for ${query}`);
      console.log(result);
      const imageUrls = result.data.URLS; 
      displayPhotos(imageUrls);
    } catch (error) {
      console.error(`Failed to search for ${query}`, error);
      alert('Search failed.');
    }
  }

function displayPhotos(imageData) {
  const gallery = document.getElementById('photoGallery');
  gallery.innerHTML = '';

  imageData.forEach(data => {
    const container = document.createElement('div');
    container.classList.add('photo-container'); 

    
    const img = document.createElement('img');
    img.src = data.imageURL; 
    img.alt = 'Photo';
    img.classList.add('gallery-image'); 

    const name = document.createElement('p');
    name.textContent = `Name: ${data.title || 'Unknown'}`;

    const labels = document.createElement('p');
    const labelsToShow = data.labels.slice(0, 2).join(', '); 
    labels.textContent = `Labels: ${labelsToShow || 'No labels'}`;

    container.appendChild(img);
    container.appendChild(name);
    container.appendChild(labels);

    gallery.appendChild(container);
  });
}

