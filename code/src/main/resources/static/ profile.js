document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('email', document.getElementById('email').value);
    formData.append('oldPassword', document.getElementById('oldPassword').value);
    formData.append('newPassword', document.getElementById('newPassword').value);
    formData.append('file', document.getElementById('avatar').files[0]);

    try {
        const response = await fetch('/api/updateProfile', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        alert(data.message);
        if (data.avatarPath) {
            document.getElementById('avatarPreview').innerHTML = `
                <img src="${data.avatarPath}" alt="Avatar" class="avatar-preview">
            `;
        }
    } catch (err) {
        console.error('Profile update failed:', err);
    }
});